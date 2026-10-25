const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const PRICES = require('./catalog');
admin.initializeApp();

const KEY_ID = defineSecret('RAZORPAY_KEY_ID');
const KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET');
// Keep these the same as js/payments.js. Confirm the percentages in your Razorpay dashboard.
const CFG = { feeDomestic: 2, feeInternational: 3, gst: 18, passFee: true, freeFrom: 499, shipping: 49 };
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];
const ALLOWED_ORIGINS = ['https://YOUR-SITE.example']; // <-- your website address(es)

async function liveRate(cur) {
  if (cur === 'INR') return 1;
  const r = await fetch('https://open.er-api.com/v6/latest/INR');
  const d = await r.json();
  const rate = Number(d && d.rates && d.rates[cur]);
  if (d.result !== 'success' || !(rate > 0)) throw new Error('Exchange rate unavailable. Try again shortly.');
  return rate;
}

exports.api = onRequest({ secrets: [KEY_ID, KEY_SECRET], cors: ALLOWED_ORIGINS, region: 'us-central1' }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() });
  try {
    if (req.path === '/createOrder') {
      const { items, currency, country, customer, orderRef } = req.body || {};
      if (!Array.isArray(items) || !items.length || items.length > 50) return res.status(400).json({ error: 'Your cart is empty.' });
      if (!CURRENCIES.includes(currency)) return res.status(400).json({ error: 'Unsupported currency.' });
      let subtotal = 0;
      for (const it of items) {
        const price = PRICES[it.id], qty = Math.floor(Number(it.qty));
        if (!price || !(qty >= 1 && qty <= 20)) return res.status(400).json({ error: 'Unknown item or quantity: ' + String(it.id).slice(0, 40) });
        subtotal += price * qty;
      }
      const shipping = subtotal >= CFG.freeFrom ? 0 : CFG.shipping;
      const base = subtotal + shipping;
      const pct = country && country !== 'IN' ? CFG.feeInternational : CFG.feeDomestic;
      const eff = (pct / 100) * (1 + CFG.gst / 100);
      const totalINR = CFG.passFee ? base / (1 - eff) : base;
      const rate = await liveRate(currency);
      const amount = Math.round(totalINR * rate * 100); // minor units (all 8 currencies use 2 decimals)
      const order = await rz.orders.create({ amount, currency, receipt: String(orderRef || '').slice(0, 40),
        notes: { country: String(country || ''), email: String((customer && customer.email) || '').slice(0, 80) } });
      await admin.database().ref('orders/' + (orderRef || order.id)).update({
        razorpayOrderId: order.id, status: 'created', currency, rate, baseINR: base, totalINR: Math.round(totalINR * 100) / 100, amountMinor: amount,
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
