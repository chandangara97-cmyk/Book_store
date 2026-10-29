const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { GoogleAuth } = require('google-auth-library');
const Razorpay = require('razorpay');
const PRICES = require('./catalog');
const GIFT_THRESHOLDS = PRICES.GIFTS || {};
delete PRICES.GIFTS;
admin.initializeApp();

const KEY_ID = defineSecret('RAZORPAY_KEY_ID');
const KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET');
// Google service-account JSON key (as a secret). The Drive folder holding the PDFs must be shared with its client_email.
const DRIVE_SA_KEY = defineSecret('DRIVE_SA_KEY');
// Must match VITE_FIREBASE_DB_ROOT in the website (default 'bookstore').
const DB_ROOT = defineString('DB_ROOT', { default: 'bookstore' });
// Comma-separated admin emails (same as VITE_FIREBASE_ADMIN_EMAILS). Admins can download any printable for checking.
const ADMIN_EMAILS = defineString('ADMIN_EMAILS', { default: '' });
// Keep these the same as js/payments.js. Confirm the percentages in your Razorpay dashboard.
const CFG = { feeDomestic: 2, feeInternational: 3, gst: 18, passFee: true, freeFrom: 499, shipping: 49 };
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];
const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://kiddiebloom.in', 'https://www.kiddiebloom.in', 'https://chandangara97-cmyk.github.io']; // Replace with your exact GitHub Pages/custom-domain origins

async function liveRate(cur) {
  if (cur === 'INR') return 1;
  const r = await fetch('https://open.er-api.com/v6/latest/INR');
  const d = await r.json();
  const rate = Number(d && d.rates && d.rates[cur]);
  if (d.result !== 'success' || !(rate > 0)) throw new Error('Exchange rate unavailable. Try again shortly.');
  return rate;
}

async function calculateCheckout(items, currency, country) {
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error('Your cart is empty.');
  if (!CURRENCIES.includes(currency)) throw new Error('Unsupported currency.');
  let subtotal = 0;
  const requestedGifts = [];
  for (const it of items) {
    const qty = Math.floor(Number(it.qty));
    if (!(qty >= 1 && qty <= 20)) throw new Error('Invalid item quantity.');
    if (Object.prototype.hasOwnProperty.call(GIFT_THRESHOLDS, it.id)) {
      if (qty !== 1) throw new Error('A complimentary gift can only be selected once.');
      requestedGifts.push(it.id);
      continue;
    }
    const price = PRICES[it.id];
    if (price === undefined) throw new Error('Unknown item: ' + String(it.id).slice(0, 40));
    subtotal += price * qty;
  }
  for (const giftId of requestedGifts) {
    if (subtotal < GIFT_THRESHOLDS[giftId]) throw new Error('Your cart does not qualify for the selected complimentary gift.');
  }
  const shipping = subtotal >= CFG.freeFrom ? 0 : CFG.shipping;
  const base = subtotal + shipping;
  const pct = country && country !== 'IN' ? CFG.feeInternational : CFG.feeDomestic;
  const eff = (pct / 100) * (1 + CFG.gst / 100);
  const totalINR = CFG.passFee ? base / (1 - eff) : base;
  const rate = await liveRate(currency);
  const amount = Math.round(totalINR * rate * 100) / 100;
  return { subtotal, shipping, base, totalINR: Math.round(totalINR * 100) / 100, rate, amount: amount.toFixed(2), currency };
}


// ---------- Printable PDFs: paid downloads from Google Drive ----------
const root = () => DB_ROOT.value().replace(/^\/|\/$/g, '');
const db = (path) => admin.database().ref(root() + '/' + path);
async function createRzOrder(rz, params) {
  if (!Number.isFinite(params.amount) || params.amount < 100) throw httpErr(400, 'Amount is below the minimum (1 unit / 100 paise).');
  try { return await rz.orders.create(params); }
  catch (e) {
    console.error('Razorpay order error', e && e.statusCode, e && e.error && e.error.description);
    if (e && e.statusCode === 401) throw httpErr(401, 'Payment gateway authentication failed. Check Razorpay keys.');
    throw httpErr(500, 'Could not create the payment order. Please try again.');
  }
}
function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }
async function authUser(req) {
  const m = (req.get('Authorization') || '').match(/^Bearer (.+)$/);
  if (!m) throw httpErr(401, 'Please sign in first.');
  try { return await admin.auth().verifyIdToken(m[1]); } catch (e) { throw httpErr(401, 'Your session expired. Please sign in again.'); }
}
const isAdminEmail = (email) => !!email && ADMIN_EMAILS.value().split(',').map(v => v.trim().toLowerCase()).filter(Boolean).includes(String(email).toLowerCase());
async function loadPrintables(ids) {
  if (!Array.isArray(ids) || !ids.length || ids.length > 20) throw httpErr(400, 'No printables selected.');
  const uniq = [...new Set(ids.map(String))];
  const out = [];
  for (const id of uniq) {
    if (!/^[a-z0-9-]{1,80}$/.test(id)) throw httpErr(400, 'Invalid printable.');
    const r = (await db('learningResources/' + id).once('value')).val();
    if (!r || r.active === false) throw httpErr(404, 'This printable is no longer available.');
    const priv = (await db('learningPrivate/' + id + '/driveFileId').once('value')).val();
    out.push({ id, title: String(r.title || id).slice(0, 100), price: Math.max(0, Number(r.price) || 0), hasFile: !!priv });
  }
  return out;
}
async function calculatePrintables(items, currency) {
  if (!CURRENCIES.includes(currency)) throw httpErr(400, 'Unsupported currency.');
  const subtotal = items.reduce((t, i) => t + i.price, 0);
  if (!(subtotal > 0)) throw httpErr(400, 'Free printables do not need payment.');
  const eff = ((currency === 'INR' ? CFG.feeDomestic : CFG.feeInternational) / 100) * (1 + CFG.gst / 100); // no shipping: digital goods
  const totalINR = CFG.passFee ? subtotal / (1 - eff) : subtotal;
  const rate = await liveRate(currency);
  const amount = (Math.round(totalINR * rate * 100) / 100).toFixed(2);
  return { subtotal, totalINR: Math.round(totalINR * 100) / 100, rate, amount, currency };
}
async function driveFile(fileId) {
  // Local test mode: file ID "local_<name>" reads private-pdfs/<name>.pdf from this machine (no Google Drive needed).
  if (String(fileId).startsWith('local_')) {
    const nm = String(fileId).slice(6).replace(/[^A-Za-z0-9_-]/g, '');
    const p = require('path').join(process.env.PDF_DIR || require('path').join(__dirname, '..', 'private-pdfs'), nm + '.pdf');
    try { return require('fs').readFileSync(p); } catch (e) { throw httpErr(404, 'Local PDF not found: private-pdfs/' + nm + '.pdf'); }
  }
  const auth = new GoogleAuth({ credentials: JSON.parse(DRIVE_SA_KEY.value()), scopes: ['https://www.googleapis.com/auth/drive.readonly'] });
  const { token } = await (await auth.getClient()).getAccessToken();
  const r = await fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media&supportsAllDrives=true', { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) { console.error('Drive error', r.status, await r.text().catch(() => '')); throw httpErr(502, 'The file could not be fetched from Google Drive. Check the file ID and that the folder is shared with the service account.'); }
  return Buffer.from(await r.arrayBuffer());
}

async function makeDownloadTokens(orderRef, uid, items) {
  const tokens = {};
  const now = Date.now();
  for (const item of items) {
    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    tokens[item.id] = raw;
    // The token is a bearer secret. Only its hash is stored in the database.
    await db('downloadTokens/' + tokenHash).set({ resourceId: item.id, uid, orderRef, createdAt: now, expiresAt: now + 24 * 60 * 60 * 1000, used: false });
  }
  return tokens;
}

exports.api = onRequest({ secrets: [KEY_ID, KEY_SECRET, DRIVE_SA_KEY], cors: ALLOWED_ORIGINS, region: 'us-central1' }, async (req, res) => {
  try {
    // One-time links are bearer links, so they deliberately do not require a signed-in session.
    // A database transaction makes each token single-use even for simultaneous requests.
    if (req.method === 'GET' && req.path === '/downloadOnce') {
      const raw = String((req.query && req.query.token) || '');
      if (!/^[a-f0-9]{64}$/.test(raw)) throw httpErr(400, 'Invalid download link.');
      const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
      const tokenRef = db('downloadTokens/' + tokenHash);
      const tx = await tokenRef.transaction(current => {
        if (!current || current.used || Number(current.expiresAt) < Date.now()) return;
        return { ...current, used: true, usedAt: Date.now() };
      });
      if (!tx.committed || !tx.snapshot || !tx.snapshot.val()) throw httpErr(410, 'This download link has expired or has already been used.');
      const grant = tx.snapshot.val();
      try {
      const [item] = await loadPrintables([grant.resourceId]);
      const fileId = (await db('learningPrivate/' + item.id + '/driveFileId').once('value')).val();
      if (!fileId) throw httpErr(404, 'This printable has no file yet.');
      const pdf = await driveFile(String(fileId));
      if (pdf.length > 30 * 1024 * 1024) throw httpErr(413, 'File is too large to deliver. Keep PDFs under 30 MB.');
      res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="' + (item.title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || item.id) + '.pdf"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
      return res.send(pdf);
      } catch (e) { await tokenRef.update({ used: false, usedAt: null }); throw e; }
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    if (req.path === '/createOrder') {
      const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() });
      const { items, currency, country, customer, orderRef } = req.body || {};
      let calc;
      try { calc = await calculateCheckout(items, currency, country); } catch (e) { return res.status(400).json({ error: e.message }); }
      const amount = Math.round(Number(calc.amount) * 100);
      const safeRef = String(orderRef || ('RN-' + Date.now())).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
      const order = await createRzOrder(rz, { amount, currency, receipt: safeRef,
        notes: { country: String(country || ''), email: String((customer && customer.email) || '').slice(0, 80) } });
      await admin.database().ref('orders/' + safeRef).update({
        razorpayOrderId: order.id, status: 'created', currency, rate: calc.rate, baseINR: calc.base, totalINR: calc.totalINR, amountMinor: amount,
        items, country: country || '', createdAt: admin.database.ServerValue.TIMESTAMP });
      return res.json({ orderId: order.id, amount, currency, keyId: KEY_ID.value() });
    }
    if (req.path === '/verifyPayment') {
      const { razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: s } = req.body || {};
      if (!o || !p || !s || [o, p, s].some(v => typeof v !== 'string')) return res.status(400).json({ error: 'Missing payment fields.' });
      const expected = crypto.createHmac('sha256', KEY_SECRET.value()).update(o + '|' + p).digest('hex');
      const ok = expected.length === s.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(s));
      if (!ok) return res.status(400).json({ error: 'Payment could not be verified.' });
      const snap = await admin.database().ref('orders').orderByChild('razorpayOrderId').equalTo(o).once('value');
      if (!snap.exists()) return res.status(404).json({ error: 'Order not found.' });
      snap.forEach(c => { c.ref.update({ status: 'paid', paymentId: p, paidAt: admin.database.ServerValue.TIMESTAMP }); });
      return res.json({ ok: true });
    }

    if (req.path === '/createPrintableOrder') {
      const user = await authUser(req);
      const { resourceIds, currency } = req.body || {};
      const items = await loadPrintables(resourceIds);
      for (const it of items) {
        if (!it.hasFile) throw httpErr(400, '"' + it.title + '" is not ready for sale yet.');
        if (it.price > 0 && (await db('entitlements/' + user.uid + '/' + it.id).once('value')).exists()) throw httpErr(400, 'You already own "' + it.title + '".');
      }
      const paid = items.filter(i => i.price > 0);
      const calc = await calculatePrintables(paid, currency);
      const ref = 'PR-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex');
      const amountMinor = Math.round(Number(calc.amount) * 100);
      const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() });
      const order = await createRzOrder(rz, { amount: amountMinor, currency, receipt: ref, notes: { uid: user.uid, type: 'printable' } });
      await db('printableOrders/' + ref).set({ uid: user.uid, email: user.email || '', razorpayOrderId: order.id, status: 'created', currency, rate: calc.rate, totalINR: calc.totalINR, amount: calc.amount, amountMinor, items: paid.map(i => ({ id: i.id, title: i.title, priceINR: i.price })), createdAt: admin.database.ServerValue.TIMESTAMP });
      return res.json({ orderId: order.id, orderRef: ref, amount: amountMinor, currency, keyId: KEY_ID.value() });
    }
    if (req.path === '/verifyPrintablePayment') {
      const user = await authUser(req);
      const { orderRef, razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: s } = req.body || {};
      if (!/^PR-[a-zA-Z0-9-]{1,40}$/.test(String(orderRef || ''))) throw httpErr(400, 'Invalid order.');
      if (!o || !p || !s || [o, p, s].some(v => typeof v !== 'string')) throw httpErr(400, 'Missing payment fields.');
      const oref = db('printableOrders/' + orderRef);
      const order = (await oref.once('value')).val();
      if (!order || order.uid !== user.uid || order.razorpayOrderId !== o) throw httpErr(404, 'Order not found.');
      const ids = order.items.map(i => i.id);
      if (order.status === 'paid') return res.json({ ok: true, resourceIds: ids, downloadTokens: order.downloadTokens || {} });
      const expected = crypto.createHmac('sha256', KEY_SECRET.value()).update(o + '|' + p).digest('hex');
      const ok = expected.length === s.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(s));
      if (!ok) throw httpErr(400, 'Payment could not be verified.');
      const downloadTokens = await makeDownloadTokens(orderRef, user.uid, order.items);
      const updates = { ['printableOrders/' + orderRef + '/status']: 'paid', ['printableOrders/' + orderRef + '/paymentId']: p, ['printableOrders/' + orderRef + '/paidAt']: admin.database.ServerValue.TIMESTAMP, ['printableOrders/' + orderRef + '/downloadTokens']: downloadTokens };
      ids.forEach(id => { updates['entitlements/' + user.uid + '/' + id] = { orderRef, paidAt: admin.database.ServerValue.TIMESTAMP, downloadLimit: 1 }; });
      await admin.database().ref(root()).update(updates);
      return res.json({ ok: true, resourceIds: ids, downloadTokens });
    }
    if (req.path === '/download') {
      const user = await authUser(req);
      const { resourceId } = req.body || {};
      const [item] = await loadPrintables([resourceId]);
      if (item.price > 0 && !isAdminEmail(user.email)) {
        const entitlement = await db('entitlements/' + user.uid + '/' + item.id).once('value');
        if (!entitlement.exists()) throw httpErr(403, 'Please purchase this printable to download it.');
        throw httpErr(403, 'Paid PDFs use a one-time download link. Open the link provided after payment; this direct download route cannot be reused.');
      }
      const fileId = (await db('learningPrivate/' + item.id + '/driveFileId').once('value')).val();
      if (!fileId) throw httpErr(404, 'This printable has no file yet.');
      const pdf = await driveFile(String(fileId));
      if (pdf.length > 30 * 1024 * 1024) throw httpErr(413, 'File is too large to deliver. Keep PDFs under 30 MB.');
      res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="' + (item.title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || item.id) + '.pdf"', 'Cache-Control': 'private, no-store' });
      return res.send(pdf);
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e) { console.error(e); res.status(e.status || 500).json({ error: e.message || 'Server error' }); }
});
