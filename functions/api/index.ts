// Supabase Edge Function (Deno): Razorpay printable-PDF payments for Kiddie Bloom.
// Port of functions/index.js. Keeps Firebase Auth (login) and Firebase Realtime Database (data).
// Routes: POST /createPrintableOrder, POST /verifyPrintablePayment, POST /download, GET /downloadOnce?token=...
import { SignJWT, importPKCS8, jwtVerify, createRemoteJWKSet } from "npm:jose@5.9.6";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;

const KEY_ID = () => env("RAZORPAY_KEY_ID");
const KEY_SECRET = () => env("RAZORPAY_KEY_SECRET");
const FIREBASE_PROJECT_ID = () => env("FIREBASE_PROJECT_ID");
const FIREBASE_DB_URL = () => env("FIREBASE_DB_URL").replace(/\/$/, "");
const DB_ROOT = () => env("DB_ROOT", "bookstore").replace(/^\/|\/$/g, "");
const ADMIN_EMAILS = () => env("ADMIN_EMAILS").split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
const ALLOWED_ORIGINS = env(
  "ALLOWED_ORIGINS",
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,https://kiddiebloom.in,https://www.kiddiebloom.in,https://chandangara97-cmyk.github.io",
).split(",").map((v) => v.trim()).filter(Boolean);

// Keep in sync with the Firebase version / website.
const CFG = { feeDomestic: 2, feeInternational: 3, gst: 18, passFee: true };
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"];

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

// ---------- helpers ----------
const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer | Uint8Array) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256Hex = async (s: string) => toHex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const randomHex = (bytes: number) => toHex(crypto.getRandomValues(new Uint8Array(bytes)));
async function hmacHex(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// ---------- Google service-account access tokens (Firebase DB + Drive) ----------
const tokenCache = new Map<string, { token: string; exp: number }>();
async function googleAccessToken(saJson: string, scope: string): Promise<string> {
  const cacheKey = scope;
  const hit = tokenCache.get(cacheKey);
  if (hit && hit.exp > Date.now() + 60_000) return hit.token;
  let sa: any;
  try { sa = JSON.parse(saJson); } catch { throw new HttpError(500, "Server credentials are not configured correctly."); }
  const key = await importPKCS8(String(sa.private_key), "RS256");
  const assertion = await new SignJWT({ scope })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email).setSubject(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt().setExpirationTime("50m").sign(key);
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) { console.error("Google token error", r.status, JSON.stringify(d)); throw new HttpError(500, "Could not authenticate with Google. Check the service-account secrets."); }
  tokenCache.set(cacheKey, { token: d.access_token, exp: Date.now() + (Number(d.expires_in) || 3600) * 1000 });
  return d.access_token;
}
const dbToken = () => googleAccessToken(env("FIREBASE_SA_KEY"), "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email");
const driveToken = () => googleAccessToken(env("DRIVE_SA_KEY"), "https://www.googleapis.com/auth/drive.readonly");

// ---------- Firebase Realtime Database (REST) ----------
const dbUrl = (path: string) => `${FIREBASE_DB_URL()}/${DB_ROOT()}/${path}.json`;
async function dbGet(path: string): Promise<any> {
  const r = await fetch(dbUrl(path), { headers: { Authorization: `Bearer ${await dbToken()}` } });
  if (!r.ok) { console.error("DB get", path, r.status, await r.text().catch(() => "")); throw new HttpError(500, "Database error."); }
  return await r.json();
}
async function dbSet(path: string, value: unknown) {
  const r = await fetch(dbUrl(path), { method: "PUT", headers: { Authorization: `Bearer ${await dbToken()}`, "Content-Type": "application/json" }, body: JSON.stringify(value) });
  if (!r.ok) { console.error("DB set", path, r.status, await r.text().catch(() => "")); throw new HttpError(500, "Database error."); }
}
async function dbPatchRoot(updates: Record<string, unknown>) {
  const r = await fetch(`${FIREBASE_DB_URL()}/${DB_ROOT()}.json`, { method: "PATCH", headers: { Authorization: `Bearer ${await dbToken()}`, "Content-Type": "application/json" }, body: JSON.stringify(updates) });
  if (!r.ok) { console.error("DB patch", r.status, await r.text().catch(() => "")); throw new HttpError(500, "Database error."); }
}
/** Marks a one-time token as used. Returns the grant, or null if missing/used/expired or lost a race. */
async function claimToken(tokenHash: string): Promise<any | null> {
  const url = dbUrl("downloadTokens/" + tokenHash);
  const headers = { Authorization: `Bearer ${await dbToken()}` };
  const g = await fetch(url, { headers: { ...headers, "X-Firebase-ETag": "true" } });
  const etag = g.headers.get("ETag");
  const cur = await g.json();
  if (!cur || cur.used || Number(cur.expiresAt) < Date.now() || !etag) return null;
  const next = { ...cur, used: true, usedAt: Date.now() };
  const p = await fetch(url, { method: "PUT", headers: { ...headers, "Content-Type": "application/json", "if-match": etag }, body: JSON.stringify(next) });
  if (p.status === 412) return null; // someone else claimed it first
  if (!p.ok) throw new HttpError(500, "Database error.");
  return cur;
}
const releaseToken = (tokenHash: string) => dbPatchRoot({ [`downloadTokens/${tokenHash}/used`]: false, [`downloadTokens/${tokenHash}/usedAt`]: null }).catch(() => {});

// ---------- Firebase Auth: verify the user's ID token ----------
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
async function authUser(req: Request): Promise<{ uid: string; email: string }> {
  const m = (req.headers.get("Authorization") || "").match(/^Bearer (.+)$/);
  if (!m) throw new HttpError(401, "Please sign in first.");
  try {
    const pid = FIREBASE_PROJECT_ID();
    const { payload } = await jwtVerify(m[1], JWKS, { issuer: `https://securetoken.google.com/${pid}`, audience: pid });
    if (!payload.sub) throw new Error("no sub");
    return { uid: String(payload.sub), email: String((payload as any).email || "") };
  } catch (e) {
    console.error("Token verify failed", e instanceof Error ? e.message : e);
    throw new HttpError(401, "Your session expired. Please sign in again.");
  }
}
const isAdminEmail = (email: string) => !!email && ADMIN_EMAILS().includes(email.toLowerCase());

// ---------- Razorpay (REST) ----------
async function createRzOrder(params: { amount: number; currency: string; receipt: string; notes: Record<string, string> }) {
  if (!Number.isFinite(params.amount) || params.amount < 100) throw new HttpError(400, "Amount is below the minimum (1 unit / 100 paise).");
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + btoa(`${KEY_ID()}:${KEY_SECRET()}`) },
    body: JSON.stringify(params),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("Razorpay order error", r.status, d?.error?.description);
    if (r.status === 401) throw new HttpError(401, "Payment gateway authentication failed. Check Razorpay keys.");
    throw new HttpError(500, "Could not create the payment order. Please try again.");
  }
  return d as { id: string };
}

async function liveRate(cur: string): Promise<number> {
  if (cur === "INR") return 1;
  const r = await fetch("https://open.er-api.com/v6/latest/INR");
  const d = await r.json().catch(() => ({}));
  const rate = Number(d?.rates?.[cur]);
  if (d?.result !== "success" || !(rate > 0)) throw new HttpError(503, "Exchange rate unavailable. Try again shortly.");
  return rate;
}

// ---------- Printables ----------
async function loadPrintables(ids: unknown) {
  if (!Array.isArray(ids) || !ids.length || ids.length > 20) throw new HttpError(400, "No printables selected.");
  const uniq = [...new Set(ids.map(String))];
  const out: { id: string; title: string; price: number; hasFile: boolean }[] = [];
  for (const id of uniq) {
    if (!/^[a-z0-9-]{1,80}$/.test(id)) throw new HttpError(400, "Invalid printable.");
    const r = await dbGet("learningResources/" + id);
    if (!r || r.active === false) throw new HttpError(404, "This printable is no longer available.");
    const priv = await dbGet("learningPrivate/" + id + "/driveFileId");
    out.push({ id, title: String(r.title || id).slice(0, 100), price: Math.max(0, Number(r.price) || 0), hasFile: !!priv });
  }
  return out;
}
async function calculatePrintables(items: { price: number }[], currency: string) {
  if (!CURRENCIES.includes(currency)) throw new HttpError(400, "Unsupported currency.");
  const subtotal = items.reduce((t, i) => t + i.price, 0);
  if (!(subtotal > 0)) throw new HttpError(400, "Free printables do not need payment.");
  const eff = ((currency === "INR" ? CFG.feeDomestic : CFG.feeInternational) / 100) * (1 + CFG.gst / 100);
  const totalINR = CFG.passFee ? subtotal / (1 - eff) : subtotal;
  const rate = await liveRate(currency);
  const amount = (Math.round(totalINR * rate * 100) / 100).toFixed(2);
  return { subtotal, totalINR: Math.round(totalINR * 100) / 100, rate, amount, currency };
}
async function driveFile(fileId: string): Promise<Uint8Array> {
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`, { headers: { Authorization: `Bearer ${await driveToken()}` } });
  if (!r.ok) { console.error("Drive error", r.status, await r.text().catch(() => "")); throw new HttpError(502, "The file could not be fetched from Google Drive. Check the file ID and that the folder is shared with the service account."); }
  const pdf = new Uint8Array(await r.arrayBuffer());
  if (pdf.length > 30 * 1024 * 1024) throw new HttpError(413, "File is too large to deliver. Keep PDFs under 30 MB.");
  return pdf;
}
async function makeDownloadTokens(orderRef: string, uid: string, items: { id: string }[]) {
  const tokens: Record<string, string> = {};
  const now = Date.now();
  for (const item of items) {
    const raw = randomHex(32);
    tokens[item.id] = raw;
    // Bearer secret: only its hash is stored.
    await dbSet("downloadTokens/" + (await sha256Hex(raw)), { resourceId: item.id, uid, orderRef, createdAt: now, expiresAt: now + 24 * 60 * 60 * 1000, used: false });
  }
  return tokens;
}
const pdfResponse = (pdf: Uint8Array, title: string, id: string, cors: Record<string, string>) =>
  new Response(pdf as unknown as BodyInit, { headers: { ...cors, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${title.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || id}.pdf"`, "Cache-Control": "private, no-store" } });

// ---------- HTTP ----------
function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const h: Record<string, string> = { Vary: "Origin", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info", "Access-Control-Max-Age": "3600" };
  if (ALLOWED_ORIGINS.includes(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}
const json = (body: unknown, status: number, cors: Record<string, string>) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const url = new URL(req.url);
  const path = (url.pathname.match(/\/api(\/.*)?$/)?.[1] || "/").replace(/\/$/, "") || "/";
  try {
    // One-time links are bearer links, so they deliberately do not require a signed-in session.
    if (req.method === "GET" && path === "/downloadOnce") {
      const raw = String(url.searchParams.get("token") || "");
      if (!/^[a-f0-9]{64}$/.test(raw)) throw new HttpError(400, "Invalid download link.");
      const tokenHash = await sha256Hex(raw);
      const grant = await claimToken(tokenHash);
      if (!grant) throw new HttpError(410, "This download link has expired or has already been used.");
      try {
        const [item] = await loadPrintables([grant.resourceId]);
        const fileId = await dbGet("learningPrivate/" + item.id + "/driveFileId");
        if (!fileId) throw new HttpError(404, "This printable has no file yet.");
        return pdfResponse(await driveFile(String(fileId)), item.title, item.id, cors);
      } catch (e) { await releaseToken(tokenHash); throw e; }
    }
    if (req.method === "GET" && path === "/") return json({ ok: true, service: "kiddie-bloom-api" }, 200, cors);
    if (req.method !== "POST") return json({ error: "POST only" }, 405, cors);
    const body = await req.json().catch(() => ({}));

    if (path === "/createPrintableOrder") {
      const user = await authUser(req);
      const { resourceIds, currency } = body;
      const items = await loadPrintables(resourceIds);
      for (const it of items) {
        if (!it.hasFile) throw new HttpError(400, `"${it.title}" is not ready for sale yet.`);
        if (it.price > 0 && (await dbGet(`entitlements/${user.uid}/${it.id}`)) !== null) throw new HttpError(400, `You already own "${it.title}".`);
      }
      const paid = items.filter((i) => i.price > 0);
      const calc = await calculatePrintables(paid, String(currency));
      const ref = "PR-" + Date.now() + "-" + randomHex(3);
      const amountMinor = Math.round(Number(calc.amount) * 100);
      const order = await createRzOrder({ amount: amountMinor, currency: calc.currency, receipt: ref, notes: { uid: user.uid, type: "printable" } });
      await dbSet("printableOrders/" + ref, { uid: user.uid, email: user.email, razorpayOrderId: order.id, status: "created", currency: calc.currency, rate: calc.rate, totalINR: calc.totalINR, amount: calc.amount, amountMinor, items: paid.map((i) => ({ id: i.id, title: i.title, priceINR: i.price })), createdAt: Date.now() });
      return json({ orderId: order.id, orderRef: ref, amount: amountMinor, currency: calc.currency, keyId: KEY_ID() }, 200, cors);
    }

    if (path === "/verifyPrintablePayment") {
      const user = await authUser(req);
      const { orderRef, razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: s } = body;
      if (!/^PR-[a-zA-Z0-9-]{1,40}$/.test(String(orderRef || ""))) throw new HttpError(400, "Invalid order.");
      if (!o || !p || !s || [o, p, s].some((v) => typeof v !== "string")) throw new HttpError(400, "Missing payment fields.");
      const order = await dbGet("printableOrders/" + orderRef);
      if (!order || order.uid !== user.uid || order.razorpayOrderId !== o) throw new HttpError(404, "Order not found.");
      const ids: string[] = order.items.map((i: { id: string }) => i.id);
      if (order.status === "paid") return json({ ok: true, resourceIds: ids, downloadTokens: order.downloadTokens || {} }, 200, cors);
      if (!safeEqual(await hmacHex(KEY_SECRET(), o + "|" + p), s)) throw new HttpError(400, "Payment could not be verified.");
      const downloadTokens = await makeDownloadTokens(orderRef, user.uid, order.items);
      const now = Date.now();
      const updates: Record<string, unknown> = {
        [`printableOrders/${orderRef}/status`]: "paid",
        [`printableOrders/${orderRef}/paymentId`]: p,
        [`printableOrders/${orderRef}/paidAt`]: now,
        [`printableOrders/${orderRef}/downloadTokens`]: downloadTokens,
      };
      ids.forEach((id) => { updates[`entitlements/${user.uid}/${id}`] = { orderRef, paidAt: now, downloadLimit: 1 }; });
      await dbPatchRoot(updates);
      return json({ ok: true, resourceIds: ids, downloadTokens }, 200, cors);
    }

    if (path === "/download") {
      const user = await authUser(req);
      const [item] = await loadPrintables([body.resourceId]);
      if (item.price > 0 && !isAdminEmail(user.email)) {
        if ((await dbGet(`entitlements/${user.uid}/${item.id}`)) === null) throw new HttpError(403, "Please purchase this printable to download it.");
        throw new HttpError(403, "Paid PDFs use a one-time download link. Open the link provided after payment; this direct download route cannot be reused.");
      }
      const fileId = await dbGet("learningPrivate/" + item.id + "/driveFileId");
      if (!fileId) throw new HttpError(404, "This printable has no file yet.");
      return pdfResponse(await driveFile(String(fileId)), item.title, item.id, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  } catch (e) {
    console.error(e);
    const status = e instanceof HttpError ? e.status : 500;
    return json({ error: e instanceof Error ? e.message : "Server error" }, status, cors);
  }
});
