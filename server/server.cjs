// Runs the same payment API as functions/index.js on a normal Node server (no Firebase Blaze plan needed).
// Start: npm run api   (from the project root)
const path = require('path');
const Module = require('module');
require('fs').readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n').forEach(l => { const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); });

const need = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_DATABASE_URL', 'FIREBASE_PROJECT_ID'];
const missing = need.filter(k => !process.env[k]);
if (missing.length) { console.error('Missing in .env: ' + missing.join(', ')); process.exit(1); }
if (!process.env.DRIVE_SA_KEY) { try { process.env.DRIVE_SA_KEY = require('fs').readFileSync(path.resolve(path.join(__dirname, '..'), process.env.GOOGLE_APPLICATION_CREDENTIALS), 'utf8'); } catch (e) { process.env.DRIVE_SA_KEY = '{}'; } }
process.env.FIREBASE_CONFIG = JSON.stringify({ databaseURL: process.env.FIREBASE_DATABASE_URL, projectId: process.env.FIREBASE_PROJECT_ID });
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(path.join(__dirname, '..'), process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Replace the firebase-functions helpers with plain environment-variable versions.
let handler, allowed = [];
const shim = {
  'firebase-functions/v2/https': { onRequest: (opts, fn) => { handler = fn; allowed = (opts && opts.cors) || []; return fn; } },
  'firebase-functions/params': {
    defineSecret: n => ({ value: () => process.env[n] }),
    defineString: (n, o) => ({ value: () => (process.env[n] !== undefined ? process.env[n] : (o && o.default) || '') })
  }
};
const orig = Module._load;
Module._load = function (request, ...rest) { return shim[request] || orig.call(this, request, ...rest); };
const fnDir = path.join(__dirname, '..', 'functions');
module.paths.unshift(path.join(fnDir, 'node_modules'));
require(path.join(fnDir, 'index.js'));
Module._load = orig;

const express = require(path.join(fnDir, 'node_modules', 'express'));
const app = express();
app.use('/api', (req, res, next) => {
  const o = req.headers.origin;
  if (o && allowed.includes(o)) { res.set('Access-Control-Allow-Origin', o); res.set('Vary', 'Origin'); }
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}, express.json({ limit: '1mb' }), (req, res) => handler(req, res));
app.get('/', (_q, r) => r.send('Payment API running. Use /api/...'));
const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Payment API on http://localhost:' + port + '/api'));
