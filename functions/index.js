const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const PRICES = require('./catalog');
const GIFT_THRESHOLDS = PRICES.GIFTS || {};
delete PRICES.GIFTS;
admin.initializeApp();

const KEY_ID = defineSecret('RAZORPAY_KEY_ID');
const KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET');
const PAYPAL_CLIENT_ID = defineSecret('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = defineSecret('PAYPAL_CLIENT_SECRET');
const PAYPAL_ENVIRONMENT = defineString('PAYPAL_ENVIRONMENT', { default: 'sandbox' });
// Keep these the same as js/payments.js. Confirm the percentages in your Razorpay dashboard.
const CFG = { feeDomestic: 2, feeInternational: 3, gst: 18, passFee: true, freeFrom: 499, shipping: 49 };
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];
const ALLOWED_ORIGINS = ['https://YOUR-SITE.example']; // Replace with your exact GitHub Pages/custom-domain origins

async function liveRate(cur) {
  if (cur === 'INR') return 1;
  const r = await fetch('https://open.er-api.com/v6/latest/INR');
  const d = await r.json();
  const rate = Number(d && d.rates && d.rates[cur]);
  if (d.result !== 'success' || !(rate > 0)) throw new Error('Exchange rate unavailable. Try again shortly.');
  return rate;
}

function paypalBase() {
  return PAYPAL_ENVIRONMENT.value() === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}
async function paypalToken() {
  const credentials = Buffer.from(PAYPAL_CLIENT_ID.value() + ':' + PAYPAL_CLIENT_SECRET.value()).toString('base64');
  const r = await fetch(paypalBase() + '/v1/oauth2/token', {
    method: 'POST', headers: { Authorization: 'Basic ' + credentials, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials'
  });
  const d = await r.json();
  if (!r.ok || !d.access_token) throw new Error('PayPal authentication failed. Check PayPal API credentials and mode.');
  return d.access_token;
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

exports.api = onRequest({ secrets: [KEY_ID, KEY_SECRET, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET], cors: ALLOWED_ORIGINS, region: 'us-central1' }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    if (req.path === '/paypalConfig') {
      return res.json({ clientId: PAYPAL_CLIENT_ID.value(), environment: PAYPAL_ENVIRONMENT.value() });
    }
    if (req.path === '/createPayPalOrder') {
      const { items, currency, country, customer, orderRef } = req.body || {};
      if (currency === 'INR') return res.status(400).json({ error: 'PayPal checkout requires a supported international currency. Please select USD, EUR, GBP, AED, SGD, AUD or CAD.' });
      const calc = await calculateCheckout(items, currency, country);
      const token = await paypalToken();
      const safeRef = String(orderRef || ('RN-' + Date.now())).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
      const pr = await fetch(paypalBase() + '/v2/checkout/orders', {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'PayPal-Request-Id': safeRef },
        body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ reference_id: safeRef, custom_id: safeRef, description: 'Kiddie Bloom book order', amount: { currency_code: currency, value: calc.amount } }], application_context: { brand_name: 'Kiddie Bloom', user_action: 'PAY_NOW', shipping_preference: 'NO_SHIPPING' } })
      });
      const pd = await pr.json();
      if (!pr.ok || !pd.id) throw new Error((pd && pd.message) || 'Could not create PayPal order.');
      await admin.database().ref('orders/' + safeRef).update({ paypalOrderId: pd.id, status: 'created', paymentMethod: 'PayPal', currency, rate: calc.rate, baseINR: calc.base, totalINR: calc.totalINR, amount: calc.amount, items, country: country || '', customerEmail: String((customer && customer.email) || '').slice(0, 100), createdAt: admin.database.ServerValue.TIMESTAMP });
      return res.json({ id: pd.id, clientId: PAYPAL_CLIENT_ID.value(), environment: PAYPAL_ENVIRONMENT.value(), currency, amount: calc.amount });
    }
    if (req.path === '/capturePayPalOrder') {
      const paypalOrderId = String((req.body || {}).paypalOrderId || '');
      if (!paypalOrderId) return res.status(400).json({ error: 'Missing PayPal order ID.' });
      const snap = await admin.database().ref('orders').orderByChild('paypalOrderId').equalTo(paypalOrderId).once('value');
      let orderRef = null, orderData = null;
      snap.forEach(c => { orderRef = c.ref; orderData = c.val(); });
      if (!orderRef || !orderData) return res.status(404).json({ error: 'Order not found.' });
      if (orderData.status === 'paid') return res.json({ ok: true, orderId: orderRef.key, captureId: orderData.paymentId, amount: orderData.amount, currency: orderData.currency });
      const token = await paypalToken();
      const cr = await fetch(paypalBase() + '/v2/checkout/orders/' + encodeURIComponent(paypalOrderId) + '/capture', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } });
      const cd = await cr.json();
      const capture = cd && cd.purchase_units && cd.purchase_units[0] && cd.purchase_units[0].payments && cd.purchase_units[0].payments.captures && cd.purchase_units[0].payments.captures[0];
      if (!cr.ok || cd.status !== 'COMPLETED' || !capture || capture.status !== 'COMPLETED' || capture.amount.currency_code !== orderData.currency || Number(capture.amount.value) !== Number(orderData.amount)) return res.status(400).json({ error: 'PayPal payment could not be confirmed.' });
      await orderRef.update({ status: 'paid', paymentId: capture.id, paidAt: admin.database.ServerValue.TIMESTAMP });
      return res.json({ ok: true, orderId: orderRef.key, captureId: capture.id, amount: orderData.amount, currency: orderData.currency });
    }
    if (req.path === '/createOrder') {
      const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() });
      const { items, currency, country, customer, orderRef } = req.body || {};
      let calc;
      try { calc = await calculateCheckout(items, currency, country); } catch (e) { return res.status(400).json({ error: e.message }); }
      const amount = Math.round(Number(calc.amount) * 100);
      const safeRef = String(orderRef || ('RN-' + Date.now())).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
      const order = await rz.orders.create({ amount, currency, receipt: safeRef,
        notes: { country: String(country || ''), email: String((customer && customer.email) || '').slice(0, 80) } });
      await admin.database().ref('orders/' + safeRef).update({
        razorpayOrderId: order.id, status: 'created', currency, rate: calc.rate, baseINR: calc.base, totalINR: calc.totalINR, amountMinor: amount,
        items, country: country || '', createdAt: admin.database.ServerValue.TIMESTAMP });
      return res.json({ orderId: order.id, amount, currency, keyId: KEY_ID.value() });
    }
    if (req.path === '/verifyPayment') {
      const { razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: s } = req.body || {};
      const expected = crypto.createHmac('sha256', KEY_SECRET.value()).update(o + '|' + p).digest('hex');
      const ok = s && expected.length === s.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(s));
      if (!ok) return res.status(400).json({ error: 'Payment could not be verified.' });
      const snap = await admin.database().ref('orders').orderByChild('razorpayOrderId').equalTo(o).once('value');
      snap.forEach(c => c.ref.update({ status: 'paid', paymentId: p, paidAt: admin.database.ServerValue.TIMESTAMP }));
      return res.json({ ok: true });
    }
    res.status(404).json({ error: 'Not found' });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message || 'Server error' }); }
});
