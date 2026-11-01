import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuration & Secrets
const KEY_ID = () => process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = () => process.env.RAZORPAY_KEY_SECRET || '';
const hasRazorpayKeys = () => Boolean(KEY_ID() && KEY_SECRET());

// In-memory data store for orders & download tokens
interface SavedOrder {
  orderId: string;
  razorpayOrderId: string;
  orderRef: string;
  status: 'created' | 'paid';
  currency: string;
  rate: number;
  subtotalINR: number;
  shippingINR: number;
  baseINR: number;
  totalINR: number;
  amountMinor: number;
  items: Array<{ id: string; qty: number; title?: string }>;
  country: string;
  customer: { name?: string; email?: string; contact?: string };
  paymentId?: string;
  createdAt: number;
  paidAt?: number;
}

interface PrintableOrder {
  orderRef: string;
  razorpayOrderId: string;
  status: 'created' | 'paid';
  currency: string;
  rate: number;
  totalINR: number;
  amount: string;
  amountMinor: number;
  items: Array<{ id: string; title: string; priceINR: number }>;
  downloadTokens?: Record<string, string>;
  paymentId?: string;
  createdAt: number;
  paidAt?: number;
}

interface DownloadToken {
  resourceId: string;
  orderRef: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
  usedAt?: number;
}

const ordersStore = new Map<string, SavedOrder>();
const printableOrdersStore = new Map<string, PrintableOrder>();
const downloadTokensStore = new Map<string, DownloadToken>();

// Catalogue pricing
const CATALOG_PRICES: Record<string, number> = {
  'alchemist': 299,
  'art-kit': 249,
  'atomic': 499,
  'atomic-habits': 499,
  'becoming': 599,
  'caterpillar': 299,
  'deep-work': 449,
  'explore-the-world': 429,
  'explore-the-world-digital': 219,
  'goodnight-moon': 299,
  'gruffalo': 299,
  'harry-potter-1': 499,
  'hate-u-give': 399,
  'hp1': 499,
  'imagine-set': 599,
  'learn-and-play-4-7': 399,
  'learn-and-play-4-7-digital': 199,
  'little-hands-big-ideas': 349,
  'little-hands-big-ideas-digital': 179,
  'little-women': 349,
  'my-first-words': 299,
  'my-first-words-digital': 149,
  'percy-jackson': 399,
  'pride': 249,
  'pride-and-prejudice': 249,
  'reading-steps': 379,
  'reading-steps-digital': 189,
  'skills-for-tomorrow': 479,
  'skills-for-tomorrow-digital': 239,
  'storytime-toy': 499,
  'study-smart': 499,
  'study-smart-digital': 249,
  'the-alchemist': 299,
  'the-book-thief': 429,
  'the-fault-in-our-stars': 379,
  'the-gruffalo': 299,
  'the-hate-u-give': 399,
  'the-lean-startup': 499,
  'the-night-circus': 429,
  'the-silent-patient': 399,
  'the-very-hungry-caterpillar': 299,
  'think-and-solve': 449,
  'think-and-solve-digital': 229,
  'thinker-puzzle': 399,
  'thinking-fast-and-slow': 549,
  'where-the-crawdads-sing': 399,
  'where-the-wild-things-are': 349,
  'wild-things': 349,
};

const GIFT_THRESHOLDS: Record<string, number> = {
  'gift-colouring-kit': 999,
  'gift-mini-toy': 1499,
};

const CFG = { feeDomestic: 2, feeInternational: 3, gst: 18, passFee: true, freeFrom: 499, shipping: 49 };
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];

// Fallback rates
const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.0118,
  EUR: 0.0109,
  GBP: 0.0094,
  AED: 0.0435,
  SGD: 0.0159,
  AUD: 0.0182,
  CAD: 0.0163,
};

async function getLiveRate(cur: string): Promise<number> {
  if (cur === 'INR') return 1;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data?.rates?.[cur]);
      if (rate > 0) return rate;
    }
  } catch (err) {
    console.warn(`[Exchange Rate] Failed to fetch live rate for ${cur}, using fallback:`, err);
  }
  return FALLBACK_RATES[cur] || 1;
}

function getCatalogPrice(id: string): number | undefined {
  if (Object.prototype.hasOwnProperty.call(CATALOG_PRICES, id)) {
    return CATALOG_PRICES[id];
  }
  // Try without -digital
  if (id.endsWith('-digital')) {
    const base = id.slice(0, -8);
    if (CATALOG_PRICES[base]) {
      return Math.round(CATALOG_PRICES[base] * 0.5);
    }
  }
  return 299; // Standard book fallback price
}

async function calculateCheckout(items: Array<{ id: string; qty: number }>, currency: string, country: string) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error('Your cart is empty.');
  }
  const cur = CURRENCIES.includes(currency) ? currency : 'INR';
  let subtotal = 0;
  const requestedGifts: string[] = [];

  for (const it of items) {
    const qty = Math.max(1, Math.floor(Number(it.qty) || 1));
    if (Object.prototype.hasOwnProperty.call(GIFT_THRESHOLDS, it.id)) {
      requestedGifts.push(it.id);
      continue;
    }
    const price = getCatalogPrice(it.id) ?? 299;
    subtotal += price * qty;
  }

  for (const giftId of requestedGifts) {
    if (subtotal < GIFT_THRESHOLDS[giftId]) {
      throw new Error('Your cart does not qualify for the selected complimentary gift.');
    }
  }

  const shipping = subtotal >= CFG.freeFrom || subtotal === 0 ? 0 : CFG.shipping;
  const base = subtotal + shipping;
  const pct = country && country !== 'IN' ? CFG.feeInternational : CFG.feeDomestic;
  const eff = (pct / 100) * (1 + CFG.gst / 100);
  const totalINR = CFG.passFee ? base / (1 - eff) : base;
  const rate = await getLiveRate(cur);
  const amount = Math.round(totalINR * rate * 100) / 100;

  return {
    subtotal,
    shipping,
    base,
    totalINR: Math.round(totalINR * 100) / 100,
    rate,
    amount: amount.toFixed(2),
    currency: cur,
  };
}

// Generate valid standard PDF 1.4 document
function generatePrintablePdf(title: string, resourceId: string): Buffer {
  const safeTitle = title.replace(/[^\w\s-]/g, '').trim() || 'Kiddie Bloom Learning Worksheet';
  
  const contentStream = [
    'BT',
    '/F1 24 Tf',
    '50 780 Td',
    '(Kiddie Bloom Learning Studio) Tj',
    '0 -32 Td',
    '/F1 18 Tf',
    `(${safeTitle}) Tj`,
    '0 -24 Td',
    '/F2 12 Tf',
    '(Age-appropriate learning worksheet and creative exploration pack) Tj',
    '0 -20 Td',
    '(============================================================) Tj',
    '0 -30 Td',
    '/F1 14 Tf',
    '(Instructions for Little Learners:) Tj',
    '0 -22 Td',
    '/F2 12 Tf',
    '(1. Grab your favourite coloured pencils, crayons or markers.) Tj',
    '0 -18 Td',
    '(2. Read each question carefully with a parent, teacher or friend.) Tj',
    '0 -18 Td',
    '(3. Complete each exercise and colour the stars below when finished!) Tj',
    '0 -36 Td',
    '/F1 14 Tf',
    '(Activity 1: Word & Pattern Discovery) Tj',
    '0 -24 Td',
    '/F2 11 Tf',
    '(Connect the matching items, trace the letters, and discover fun facts.) Tj',
    '0 -40 Td',
    '/F1 14 Tf',
    '(Activity 2: Creative Drawing & Thought Corner) Tj',
    '0 -24 Td',
    '/F2 11 Tf',
    '(Draw your favourite memory from this story in the space provided!) Tj',
    '0 -60 Td',
    '/F1 12 Tf',
    '(Star Reward Tracker:  [ * ]  [ * ]  [ * ]  [ * ]  [ * ]) Tj',
    '0 -24 Td',
    '/F2 10 Tf',
    '(Super Job! You have completed this official Kiddie Bloom activity.) Tj',
    '0 -40 Td',
    '/F2 9 Tf',
    `([ID: ${resourceId} - Verified Instant Digital Download - https://kiddiebloom.in]) Tj`,
    'ET',
  ].join('\n');

  const streamLength = Buffer.byteLength(contentStream);

  const objects: string[] = [];
  objects[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  objects[2] = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  objects[3] = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n';
  objects[4] = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';
  objects[5] = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  objects[6] = `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

  let offset = 0;
  const header = '%PDF-1.4\n';
  offset += Buffer.byteLength(header);

  const xrefEntries = ['0000000000 65535 f \n'];
  const bodyChunks: Buffer[] = [Buffer.from(header)];

  for (let i = 1; i <= 6; i++) {
    const chunk = Buffer.from(objects[i]);
    xrefEntries.push(String(offset).padStart(10, '0') + ' 00000 n \n');
    offset += chunk.length;
    bodyChunks.push(chunk);
  }

  const startXref = offset;
  const xref = `xref\n0 7\n${xrefEntries.join('')}trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
  bodyChunks.push(Buffer.from(xref));

  return Buffer.concat(bodyChunks);
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
const healthHandler = (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'kiddie-bloom-api',
    configured: {
      razorpay: hasRazorpayKeys(),
      mode: hasRazorpayKeys() ? 'live' : 'test_simulator',
      keyId: KEY_ID() || 'rzp_test_kiddiebloom',
    },
  });
};

app.get('/api', healthHandler);
app.get('/api/health', healthHandler);

// Create Order (Books & Toys)
const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { items, currency, country, customer, orderRef } = req.body || {};
    const calc = await calculateCheckout(items || [], String(currency || 'INR'), String(country || 'IN'));
    const amountMinor = Math.round(Number(calc.amount) * 100);
    const safeRef = String(orderRef || `RN-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 40);

    let orderId: string;
    let keyId: string;
    let isTest = false;

    if (hasRazorpayKeys()) {
      // Real Razorpay API
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from(`${KEY_ID()}:${KEY_SECRET()}`).toString('base64'),
        },
        body: JSON.stringify({
          amount: amountMinor,
          currency: calc.currency,
          receipt: safeRef,
          notes: {
            country: String(country || ''),
            email: String(customer?.email || '').slice(0, 80),
            type: 'bookstore',
          },
        }),
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        throw new Error(rzpData?.error?.description || 'Could not create order with Razorpay.');
      }
      orderId = rzpData.id;
      keyId = KEY_ID();
    } else {
      // Test / Sandbox mode: create an order ID
      orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      keyId = 'rzp_test_kiddiebloom';
      isTest = true;
    }

    const savedOrder: SavedOrder = {
      orderId,
      razorpayOrderId: orderId,
      orderRef: safeRef,
      status: 'created',
      currency: calc.currency,
      rate: calc.rate,
      subtotalINR: calc.subtotal,
      shippingINR: calc.shipping,
      baseINR: calc.base,
      totalINR: calc.totalINR,
      amountMinor,
      items: (items || []).map((it: any) => ({ id: String(it.id), qty: Number(it.qty) || 1 })),
      country: String(country || ''),
      customer: {
        name: customer?.name || '',
        email: customer?.email || '',
        contact: customer?.phone || customer?.contact || '',
      },
      createdAt: Date.now(),
    };

    ordersStore.set(safeRef, savedOrder);
    ordersStore.set(orderId, savedOrder);

    res.json({
      orderId,
      orderRef: safeRef,
      amount: amountMinor,
      currency: calc.currency,
      keyId,
      isTest,
    });
  } catch (err: any) {
    console.error('[createOrder error]', err);
    res.status(400).json({ error: err.message || 'Failed to create order.' });
  }
};

app.post('/api/createOrder', createOrderHandler);
app.post('/createOrder', createOrderHandler);

// Verify Payment (Books & Toys)
const verifyPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing payment fields.' });
    }

    if (hasRazorpayKeys()) {
      const expected = crypto
        .createHmac('sha256', KEY_SECRET())
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment signature could not be verified.' });
      }
    }

    // Update order status
    const existing = ordersStore.get(razorpay_order_id);
    if (existing) {
      existing.status = 'paid';
      existing.paymentId = razorpay_payment_id;
      existing.paidAt = Date.now();
    }

    res.json({ ok: true, isPaid: true });
  } catch (err: any) {
    console.error('[verifyPayment error]', err);
    res.status(500).json({ error: err.message || 'Payment verification failed.' });
  }
};

app.post('/api/verifyPayment', verifyPaymentHandler);
app.post('/verifyPayment', verifyPaymentHandler);

// Create Printable Order
const createPrintableOrderHandler = async (req: Request, res: Response) => {
  try {
    const { resourceIds, currency } = req.body || {};
    if (!Array.isArray(resourceIds) || !resourceIds.length) {
      return res.status(400).json({ error: 'No printables selected.' });
    }

    const cur = CURRENCIES.includes(currency) ? currency : 'INR';
    // Price standard ₹49 per printable if not custom
    const items = resourceIds.map((id: string) => ({
      id,
      title: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      priceINR: 49,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.priceINR, 0);
    const eff = ((cur === 'INR' ? CFG.feeDomestic : CFG.feeInternational) / 100) * (1 + CFG.gst / 100);
    const totalINR = CFG.passFee ? subtotal / (1 - eff) : subtotal;
    const rate = await getLiveRate(cur);
    const amountStr = (Math.round(totalINR * rate * 100) / 100).toFixed(2);
    const amountMinor = Math.round(Number(amountStr) * 100);
    const orderRef = `PR-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    let orderId: string;
    let keyId: string;
    let isTest = false;

    if (hasRazorpayKeys()) {
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from(`${KEY_ID()}:${KEY_SECRET()}`).toString('base64'),
        },
        body: JSON.stringify({
          amount: amountMinor,
          currency: cur,
          receipt: orderRef,
          notes: { type: 'printable' },
        }),
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        throw new Error(rzpData?.error?.description || 'Could not create printable order.');
      }
      orderId = rzpData.id;
      keyId = KEY_ID();
    } else {
      orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      keyId = 'rzp_test_kiddiebloom';
      isTest = true;
    }

    const prOrder: PrintableOrder = {
      orderRef,
      razorpayOrderId: orderId,
      status: 'created',
      currency: cur,
      rate,
      totalINR: Math.round(totalINR * 100) / 100,
      amount: amountStr,
      amountMinor,
      items,
      createdAt: Date.now(),
    };

    printableOrdersStore.set(orderRef, prOrder);
    printableOrdersStore.set(orderId, prOrder);

    res.json({
      orderId,
      orderRef,
      amount: amountMinor,
      currency: cur,
      keyId,
      isTest,
    });
  } catch (err: any) {
    console.error('[createPrintableOrder error]', err);
    res.status(400).json({ error: err.message || 'Could not create printable order.' });
  }
};

app.post('/api/createPrintableOrder', createPrintableOrderHandler);
app.post('/createPrintableOrder', createPrintableOrderHandler);

// Verify Printable Payment
const verifyPrintablePaymentHandler = async (req: Request, res: Response) => {
  try {
    const { orderRef, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!orderRef || !razorpay_order_id) {
      return res.status(400).json({ error: 'Missing payment fields.' });
    }

    if (hasRazorpayKeys() && razorpay_signature) {
      const expected = crypto
        .createHmac('sha256', KEY_SECRET())
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment could not be verified.' });
      }
    }

    const order = printableOrdersStore.get(orderRef) || printableOrdersStore.get(razorpay_order_id);
    const ids = order ? order.items.map((i) => i.id) : ['printable'];
    const downloadTokens: Record<string, string> = {};
    const now = Date.now();

    for (const id of ids) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      downloadTokens[id] = rawToken;
      downloadTokensStore.set(rawToken, {
        resourceId: id,
        orderRef: orderRef || 'PR-DEFAULT',
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
        used: false,
      });
    }

    if (order) {
      order.status = 'paid';
      order.paymentId = razorpay_payment_id;
      order.paidAt = now;
      order.downloadTokens = downloadTokens;
    }

    res.json({
      ok: true,
      resourceIds: ids,
      downloadTokens,
    });
  } catch (err: any) {
    console.error('[verifyPrintablePayment error]', err);
    res.status(500).json({ error: err.message || 'Could not verify printable payment.' });
  }
};

app.post('/api/verifyPrintablePayment', verifyPrintablePaymentHandler);
app.post('/verifyPrintablePayment', verifyPrintablePaymentHandler);

// One-time download link (GET)
const downloadOnceHandler = async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) {
      return res.status(400).send('Invalid download token.');
    }

    const grant = downloadTokensStore.get(token);
    if (!grant) {
      return res.status(410).send('This download link has expired or has already been used.');
    }

    if (grant.used || Date.now() > grant.expiresAt) {
      return res.status(410).send('This download link has expired or has already been used.');
    }

    grant.used = true;
    grant.usedAt = Date.now();

    const pdfBuffer = generatePrintablePdf(grant.resourceId, grant.resourceId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${grant.resourceId}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[downloadOnce error]', err);
    res.status(500).send('Error delivering PDF download.');
  }
};

app.get('/api/downloadOnce', downloadOnceHandler);
app.get('/downloadOnce', downloadOnceHandler);

// Direct download route
const downloadHandler = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body || {};
    const id = String(resourceId || 'worksheet').trim();
    const pdfBuffer = generatePrintablePdf(id, id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[download error]', err);
    res.status(500).json({ error: 'Download failed.' });
  }
};

app.post('/api/download', downloadHandler);
app.post('/download', downloadHandler);

// ----------------------------------------------------
// FRONTEND SERVING (Vite in dev, static in prod)
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kiddie Bloom] Full-stack application ready at http://0.0.0.0:${PORT}`);
    console.log(`[Kiddie Bloom] Payments API status: ${hasRazorpayKeys() ? 'Razorpay Live' : 'Test/Demo Sandbox Mode Active'}`);
  });
}

startServer();
