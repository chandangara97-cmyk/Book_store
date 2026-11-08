import { API_URL, createPrintableOrder, verifyPrintablePayment } from './printablesApi';

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
/** Call early (e.g. when the basket opens) so checkout.js is already loaded when the customer taps Pay. */
export function preloadRazorpay(): void { loadCheckoutScript().catch(() => {}); }

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve();
      s.onerror = () => {
        console.warn('Razorpay script could not be loaded from CDN (normal in offline/sandbox mode).');
        resolve(); // Continue to test/mock payment gateway
      };
      document.body.appendChild(s);
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
 * Creates the order on the server, opens Razorpay Checkout, and verifies the signature on the server.
 * Resolves only after server-side signature verification; rejects if the gateway is unavailable or payment is dismissed.
 */
export async function payWithRazorpay(opts: {
  items: { id: string; qty: number }[];
  currency: string;
  country: string;
  customer: RazorpayPrefill & { email?: string };
  orderRef: string;
}): Promise<{ paymentId: string; orderId: string }> {
  // 1. Create order on server
  const order = await postJson<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    isTest?: boolean;
    orderRef?: string;
  }>('/createOrder', {
    items: opts.items,
    currency: opts.currency,
    country: opts.country,
    customer: opts.customer,
    orderRef: opts.orderRef,
  });

  // 2. Use Razorpay Checkout only. Never simulate a payment in the browser.
  // Test keys are allowed for controlled testing; the backend must still verify signatures.
  const hasRazorpayKey = Boolean(order.keyId && order.keyId.startsWith('rzp_'));

  if (hasRazorpayKey) {
    await loadCheckoutScript();
    if (window.Razorpay) {
      // Cancellation and gateway failures must never be converted into a successful order.
        return await new Promise<{ paymentId: string; orderId: string }>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: order.keyId,
            order_id: order.orderId,
            amount: order.amount,
            currency: order.currency,
            name: 'Kiddie Bloom',
            description: 'Book order',
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
              } catch (e) {
                reject(e);
              }
            },
          });
          rzp.on('payment.failed', (resp: any) =>
            reject(new Error(resp?.error?.description || 'Payment failed. Please try again.'))
          );
          rzp.open();
        });
    }
    throw new Error('Payment gateway could not be loaded. Please check your connection and try again.');
  }

  throw new Error('Secure payment is not configured. Please contact the store administrator or try again later. No payment has been taken.');
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
  // 1. Create printable order on server
  const key = orderKey(opts.resourceIds, opts.currency);
  const cached = orderCache.get(key);
  orderCache.delete(key); // use each prefetched order once
  let order: PrintableOrder;
  if (cached && Date.now() - cached.at < 8 * 60 * 1000) {
    try { order = await cached.p; } catch { order = await createPrintableOrder(opts.resourceIds, opts.currency); }
  } else {
    order = await createPrintableOrder(opts.resourceIds, opts.currency);
  }

  // Test and live Razorpay keys both use the real Razorpay Checkout flow.
  // Never accept simulated payment details from the browser.
  const hasRazorpayKey = Boolean(order.keyId && order.keyId.startsWith('rzp_'));

  if (hasRazorpayKey) {
    await loadCheckoutScript();
    if (window.Razorpay) {
        return await new Promise((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: order.keyId,
            order_id: order.orderId,
            amount: order.amount,
            currency: order.currency,
            name: 'Kiddie Bloom',
            description: 'Printable PDFs',
            prefill: opts.prefill || {},
            theme: { color: '#ff4f9a' },
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
              } catch (e) {
                reject(e);
              }
            },
          });
          rzp.on('payment.failed', (resp: any) =>
            reject(new Error(resp?.error?.description || 'Payment failed. Please try again.'))
          );
          rzp.open();
        });
    }
    throw new Error('Payment gateway could not be loaded. Please check your connection and try again.');
  }

  throw new Error('Secure printable payment is not configured. Please contact the store administrator or try again later. No payment has been taken.');
}
