const Module = require('module');
const path = require('path');
const assert = require('assert');

// ---- in-memory Realtime Database ----
let tree = {};
const segs = p => p.split('/').filter(Boolean);
const getAt = p => segs(p).reduce((n, k) => (n == null ? undefined : n[k]), tree);
const setAt = (p, v) => { const s = segs(p); let n = tree; s.slice(0, -1).forEach(k => { n[k] = n[k] && typeof n[k] === 'object' ? n[k] : {}; n = n[k]; }); if (v === null) delete n[s[s.length - 1]]; else n[s[s.length - 1]] = v; };
const TS = { '.sv': 'timestamp' };
const resolve = v => (v === TS ? 1700000000000 : Array.isArray(v) ? v.map(resolve) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x)])) : v);
const refOf = p => ({
  key: segs(p).pop(),
  once: async () => { const v = getAt(p); return { val: () => (v === undefined ? null : JSON.parse(JSON.stringify(v))), exists: () => v !== undefined }; },
  set: async v => setAt(p, resolve(v)),
  update: async u => { for (const [k, v] of Object.entries(u)) setAt(p + '/' + k, resolve(v)); },
  transaction: async updater => { const current = getAt(p); const next = updater(current === undefined ? null : JSON.parse(JSON.stringify(current))); if (next === undefined) return { committed: false, snapshot: { val: () => current ?? null } }; setAt(p, resolve(next)); return { committed: true, snapshot: { val: () => JSON.parse(JSON.stringify(getAt(p))) } }; },
});
const tokens = { 'tok-alice': { uid: 'alice', email: 'alice@x.com' }, 'tok-bob': { uid: 'bob', email: 'bob@x.com' }, 'tok-admin': { uid: 'adm', email: 'admin@x.com' } };
const admin = { initializeApp() {}, database: Object.assign(() => ({ ref: refOf }), { ServerValue: { TIMESTAMP: TS } }), auth: () => ({ verifyIdToken: async t => { if (!tokens[t]) throw new Error('bad'); return tokens[t]; } }) };

// ---- PayPal / FX / Drive fake network ----
const calls = []; let paypalOrders = {}; let nextAmountOverride = null;
global.fetch = async (url, opts = {}) => {
  calls.push(url);
  const J = (b, ok = true, status = 200) => ({ ok, status, json: async () => b, text: async () => JSON.stringify(b), arrayBuffer: async () => new TextEncoder().encode('%PDF-FAKE').buffer });
  if (url.includes('er-api')) return J({ result: 'success', rates: { USD: 0.012, EUR: 0.011 } });
  if (url.includes('/v1/oauth2/token')) return J({ access_token: 'pp-token' });
  if (url.endsWith('/v2/checkout/orders')) { const b = JSON.parse(opts.body); const id = 'PP' + Object.keys(paypalOrders).length; paypalOrders[id] = { amount: b.purchase_units[0].amount, captured: false }; return J({ id }); }
  if (url.includes('/capture')) { const id = url.split('/orders/')[1].split('/')[0]; const o = paypalOrders[id]; if (o.captured) return J({ name: 'ORDER_ALREADY_CAPTURED' }, false, 422); if (o.declined) return J({ status: 'DECLINED' }, false, 422); o.captured = true; return J({ status: 'COMPLETED', purchase_units: [{ payments: { captures: [{ id: 'CAP-' + id, status: 'COMPLETED', amount: nextAmountOverride || o.amount }] } }] }); }
  if (url.includes('/v2/checkout/orders/')) { const id = url.split('/orders/')[1]; const o = paypalOrders[id]; return J({ status: o.captured ? 'COMPLETED' : 'CREATED', purchase_units: [{ payments: { captures: o.captured ? [{ id: 'CAP-' + id, status: 'COMPLETED', amount: o.amount }] : [] } }] }); }
  if (url.includes('googleapis.com/drive')) { if (url.includes('BADFILE')) return J({ error: 'notFound' }, false, 404); return J({}); }
  throw new Error('unmocked fetch ' + url);
};

// ---- module mocks ----
let handler;
const mocks = {
  'firebase-functions/v2/https': { onRequest: (_o, h) => { handler = h; return h; } },
  'firebase-functions/params': { defineSecret: n => ({ value: () => (n === 'DRIVE_SA_KEY' ? '{"client_email":"sa@x","private_key":"k"}' : 'secret') }), defineString: (n, o) => ({ value: () => ({ ADMIN_EMAILS: 'admin@x.com', DB_ROOT: 'bookstore', PAYPAL_ENVIRONMENT: 'sandbox' })[n] ?? o.default }) },
  'firebase-admin': admin,
  razorpay: function () {},
  'google-auth-library': { GoogleAuth: function () { return { getClient: async () => ({ getAccessToken: async () => ({ token: 'drive-token' }) }) }; } },
};
const orig = Module._load;
Module._load = function (req, ...a) { return mocks[req] || orig.call(this, req, ...a); };
require(require('path').join(__dirname, '..', 'index.js'));

// ---- harness ----
async function call(p, body, token) {
  const req = { method: p === '/downloadOnce' ? 'GET' : 'POST', path: p, query: body || {}, body, get: h => (h === 'Authorization' && token ? 'Bearer ' + token : '') };
  const res = { code: 200, headers: {}, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, send(b) { this.body = b; return this; }, set(h) { Object.assign(this.headers, h); return this; } };
  await handler(req, res); return res;
}
const seed = () => { tree = { bookstore: {
  learningResources: { 'abc-tracing': { id: 'abc-tracing', title: 'ABC Tracing', price: 100, active: true }, 'free-colors': { id: 'free-colors', title: 'Free Colors', price: 0, active: true }, 'hidden': { id: 'hidden', title: 'Hidden', price: 50, active: false }, 'nofile': { id: 'nofile', title: 'No File', price: 80, active: true }, 'badfile': { id: 'badfile', title: 'Bad', price: 60, active: true } },
  learningPrivate: { 'abc-tracing': { driveFileId: 'FILE123' }, 'free-colors': { driveFileId: 'FILE456' }, hidden: { driveFileId: 'F' }, badfile: { driveFileId: 'BADFILE' } } } }; paypalOrders = {}; nextAmountOverride = null; };

console.error = () => {};
let pass = 0, fail = 0;
async function t(name, fn) { seed(); try { await fn(); pass++; console.log('PASS', name); } catch (e) { fail++; console.log('FAIL', name, '->', e.message); } }

(async () => {
  await t('create order requires sign-in', async () => { const r = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }); assert.equal(r.code, 401); });
  await t('create order rejects forged token', async () => { const r = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'nope'); assert.equal(r.code, 401); });
  await t('server prices from DB, ignores client price, no shipping', async () => {
    const r = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD', price: 1, items: [{ price: 1 }] }, 'tok-alice');
    assert.equal(r.code, 200, JSON.stringify(r.body));
    const eff = 0.03 * 1.18, inr = 100 / (1 - eff), usd = (Math.round(inr * 0.012 * 100) / 100).toFixed(2);
    assert.equal(r.body.amount, usd);
    assert.equal(tree.bookstore.printableOrders[r.body.orderRef].items[0].priceINR, 100);
  });
  await t('INR rejected for PayPal', async () => { const r = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'INR' }, 'tok-alice'); assert.equal(r.code, 400); });
  await t('inactive printable rejected', async () => { const r = await call('/createPrintableOrder', { resourceIds: ['hidden'], currency: 'USD' }, 'tok-alice'); assert.equal(r.code, 404); });
  await t('printable without Drive file not sellable', async () => { const r = await call('/createPrintableOrder', { resourceIds: ['nofile'], currency: 'USD' }, 'tok-alice'); assert.equal(r.code, 400); });
  await t('free-only order refused as payment', async () => { const r = await call('/createPrintableOrder', { resourceIds: ['free-colors'], currency: 'USD' }, 'tok-alice'); assert.equal(r.code, 400); });
  await t('bad id format rejected', async () => { const r = await call('/createPrintableOrder', { resourceIds: ['../x'], currency: 'USD' }, 'tok-alice'); assert.equal(r.code, 400); });
  await t('download blocked before payment', async () => { const r = await call('/download', { resourceId: 'abc-tracing' }, 'tok-alice'); assert.equal(r.code, 403); });
  await t('download requires sign-in', async () => { const r = await call('/download', { resourceId: 'abc-tracing' }); assert.equal(r.code, 401); });
  await t('full purchase then download works', async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    const c = await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-alice');
    assert.equal(c.code, 200, JSON.stringify(c.body)); assert.deepEqual(c.body.resourceIds, ['abc-tracing']);
    assert.ok(tree.bookstore.entitlements.alice['abc-tracing']);
    assert.equal(tree.bookstore.printableOrders[o.body.orderRef].status, 'paid');
    const d = await call('/download', { resourceId: 'abc-tracing' }, 'tok-alice');
    assert.equal(d.code, 403);
    const raw = c.body.downloadTokens['abc-tracing'];
    const once = await call('/downloadOnce', { token: raw });
    assert.equal(once.code, 200); assert.equal(once.headers['Content-Type'], 'application/pdf'); assert.match(once.headers['Content-Disposition'], /ABC Tracing\.pdf/); assert.match(once.headers['Cache-Control'], /no-store/);
    assert.ok(Buffer.isBuffer(once.body) && once.body.toString().startsWith('%PDF'));
    assert.equal((await call('/downloadOnce', { token: raw })).code, 410);
  });
  await t("other customer cannot download alice's purchase", async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-alice');
    assert.equal((await call('/download', { resourceId: 'abc-tracing' }, 'tok-bob')).code, 403);
  });
  await t("other customer cannot capture alice's order", async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    assert.equal((await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-bob')).code, 404);
  });
  await t('capture with mismatched PayPal order id refused', async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    assert.equal((await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: 'PPother' }, 'tok-alice')).code, 404);
  });
  await t('underpaid capture does NOT grant access', async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    nextAmountOverride = { currency_code: 'USD', value: '0.10' };
    const c = await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-alice');
    assert.equal(c.code, 400); assert.ok(!(tree.bookstore.entitlements || {}).alice);
    assert.equal((await call('/download', { resourceId: 'abc-tracing' }, 'tok-alice')).code, 403);
  });
  await t('declined payment does NOT grant access', async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    paypalOrders[o.body.id].declined = true;
    assert.equal((await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-alice')).code, 400);
    assert.ok(!(tree.bookstore.entitlements || {}).alice);
  });
  await t('capture is idempotent (double call / retry)', async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    const a = await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-alice');
    const b = await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-alice');
    assert.equal(a.code, 200); assert.equal(b.code, 200);
  });
  await t('recovers when PayPal captured but our DB update was lost', async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    paypalOrders[o.body.id].captured = true; // PayPal says already captured
    const c = await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-alice');
    assert.equal(c.code, 200, JSON.stringify(c.body)); assert.ok(tree.bookstore.entitlements.alice['abc-tracing']);
  });
  await t('cannot buy the same printable twice', async () => {
    const o = await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice');
    await call('/capturePrintableOrder', { orderRef: o.body.orderRef, paypalOrderId: o.body.id }, 'tok-alice');
    assert.equal((await call('/createPrintableOrder', { resourceIds: ['abc-tracing'], currency: 'USD' }, 'tok-alice')).code, 400);
  });
  await t('free printable downloads for signed-in user', async () => { assert.equal((await call('/download', { resourceId: 'free-colors' }, 'tok-bob')).code, 200); });
  await t('admin can download paid file for checking', async () => { assert.equal((await call('/download', { resourceId: 'abc-tracing' }, 'tok-admin')).code, 200); });
  await t('Drive failure gives a clear 502, no crash', async () => { const r = await call('/download', { resourceId: 'badfile' }, 'tok-admin'); assert.equal(r.code, 502); assert.match(r.body.error, /Google Drive/); });
  await t('Drive URL never returned to the client', async () => { const r = await call('/download', { resourceId: 'abc-tracing' }, 'tok-admin'); assert.ok(!JSON.stringify(r.headers).includes('FILE123')); });
  await t('one-time link rejects invalid token', async () => { assert.equal((await call('/downloadOnce', { token: 'bad' })).code, 400); });
  await t('non-POST rejected', async () => { const res = { code: 0, status(c) { this.code = c; return this; }, json() { return this; } }; await handler({ method: 'GET', path: '/download', get: () => '' }, res); assert.equal(res.code, 405); });
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
