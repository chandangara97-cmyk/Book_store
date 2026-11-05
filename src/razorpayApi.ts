import { API_URL, apiConfigured, createPrintableOrder, verifyPrintablePayment } from './printablesApi';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

let scriptPromise: Promise<void> | null = null;
/** Preload Razorpay while the customer reviews the basket. */
export function preloadRazorpay(): void { void loadCheckoutScript().catch(() => {}); }

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Payment checkout is only available in a browser.'));
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = () => {
        if (window.Razorpay) resolve();
        else {
          scriptPromise = null;
          reject(new Error('Razorpay checkout loaded but is unavailable. Please refresh and try again.'));
        }
      };
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Unable to load secure Razorpay checkout. Check your internet connection and try again.'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  if (API_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${API_URL}${normalizedPath.slice(4)}`;
  }
  return `${API_URL}${normalizedPath}`;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (!apiConfigured) {
    throw new Error('Payment API is not configured. Add VITE_API_URL in GitHub Actions Variables (your Render API URL ending in /api).');
  }
  const url = buildUrl(path);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d && d.error) || `Request failed (${r.status})`);
  return d as T;
}

/**
 * Creates the order on the server, opens the Razorpay modal, verifies the signature on the server.
 * Resolves with the payment id on success; rejects with an Error (message "cancelled" if dismissed).
 */
export async function payWithRazorpay(opts: {
  items: { id: string; qty: number }[];
  currency: string;
  country: string;
  customer: RazorpayPrefill & { email?: string };
  orderRef: string;
}): Promise<{ paymentId: string; orderId: string }> {
  const order = await postJson<{
    orderId: string; amount: number; currency: string; keyId: string;
    isTest?: boolean; orderRef?: string;
  }>('/createOrder', {
    items: opts.items, currency: opts.currency, country: opts.country,
    customer: opts.customer, orderRef: opts.orderRef,
  });

  if (!order.keyId || !order.keyId.startsWith('rzp_')) {
    throw new Error('Razorpay is not configured on the payment server. Please try again later.');
  }
  await loadCheckoutScript();
  if (!window.Razorpay) throw new Error('Razorpay checkout is unavailable. Please refresh and try again.');

  return new Promise<{ paymentId: string; orderId: string }>((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId, order_id: order.orderId, amount: order.amount,
      currency: order.currency, name: 'Kiddie Bloom', description: 'Book order',
      prefill: { name: opts.customer.name, email: opts.customer.email, contact: opts.customer.contact },
      theme: { color: '#ff4f9a' },
      modal: { ondismiss: () => reject(new Error('cancelled')) },
      handler: async (resp: any) => {
        try {
          await postJson('/verifyPayment', {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          resolve({ paymentId: resp.razorpay_payment_id, orderId: resp.razorpay_order_id });
        } catch (error) { reject(error); }
      },
    });
    rzp.on('payment.failed', (resp: any) =>
      reject(new Error(resp?.error?.description || 'Payment failed. Please try again.'))
    );
    rzp.open();
  });
}

type PrintableOrder = Awaited<ReturnType<typeof createPrintableOrder>>;
const orderCache = new Map<string, { at: number; p: Promise<PrintableOrder> }>();
const orderKey = (ids: string[], cur: string) => [...ids].sort().join(',') + '|' + cur;

/** Creates the Razorpay order in the background while the customer reviews the basket, so Pay opens instantly. */
export function prefetchPrintableOrder(resourceIds: string[], currency: string): void {
  if (!resourceIds.length) return;
  const key = orderKey(resourceIds, currency);
  const hit = orderCache.get(key);
  if (hit && Date.now() - hit.at < 8 * 60 * 1000) return;
  const p = createPrintableOrder(resourceIds, currency);
  p.catch(() => orderCache.delete(key));
  orderCache.set(key, { at: Date.now(), p });
}

/** Pays for printable PDFs (signed-in users). Resolves with one-time download tokens once the server verifies the payment. */
export async function payPrintablesWithRazorpay(opts: {
  resourceIds: string[];
  currency: string;
  prefill?: RazorpayPrefill;
}): Promise<{ resourceIds: string[]; downloadTokens: Record<string, string> }> {
  const key = orderKey(opts.resourceIds, opts.currency);
  const cached = orderCache.get(key);
  orderCache.delete(key); // each prefetched order can be used once
  let order: PrintableOrder;
  if (cached && Date.now() - cached.at < 8 * 60 * 1000) {
    try { order = await cached.p; }
    catch { order = await createPrintableOrder(opts.resourceIds, opts.currency); }
  } else {
    order = await createPrintableOrder(opts.resourceIds, opts.currency);
  }

  if (!order.keyId || !order.keyId.startsWith('rzp_')) {
    throw new Error('Razorpay is not configured on the payment server. Please try again later.');
  }
  await loadCheckoutScript();
  if (!window.Razorpay) throw new Error('Razorpay checkout is unavailable. Please refresh and try again.');

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId, order_id: order.orderId, amount: order.amount,
      currency: order.currency, name: 'Kiddie Bloom', description: 'Printable PDFs',
      prefill: opts.prefill || {}, theme: { color: '#ff4f9a' },
      modal: { ondismiss: () => reject(new Error('cancelled')) },
      handler: async (resp: any) => {
        try {
          const done = await verifyPrintablePayment({
            orderRef: order.orderRef,
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          resolve({ resourceIds: done.resourceIds, downloadTokens: done.downloadTokens });
        } catch (error) { reject(error); }
      },
    });
    rzp.on('payment.failed', (resp: any) =>
      reject(new Error(resp?.error?.description || 'Payment failed. Please try again.'))
    );
    rzp.open();
  });
}
