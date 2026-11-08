import { createPrintableOrder, verifyPrintablePayment } from './printablesApi';

declare global { interface Window { Razorpay?: any; } }
export interface RazorpayPrefill { name?: string; email?: string; contact?: string; }
let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Payments are available in a browser only.'));
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error('Razorpay checkout did not initialize.'));
    script.onerror = () => { scriptPromise = null; reject(new Error('Unable to load secure payment checkout. Please try again.')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
export function preloadRazorpay(): void { loadCheckoutScript().catch(() => undefined); }

function requireLiveKey(keyId?: string, isTest?: boolean): string {
  if (isTest || !keyId || !/^rzp_live_[A-Za-z0-9]+$/.test(keyId)) {
    throw new Error('Live payments are not configured yet. Please contact the store before placing a paid order.');
  }
  return keyId;
}
function buildUrl(path: string): string {
  const api = ((import.meta.env.VITE_API_URL as string | undefined) || '/api').replace(/\/$/, '');
  return `${api}${path.startsWith('/') ? path : `/${path}`}`;
}
async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Payment request failed (${response.status}).`);
  return data as T;
}

export async function payWithRazorpay(opts: {
  items: { id: string; qty: number }[]; currency: string; country: string;
  customer: RazorpayPrefill & { email?: string }; orderRef: string;
}): Promise<{ paymentId: string; orderId: string }> {
  const order = await postJson<{ orderId: string; amount: number; currency: string; keyId: string; isTest?: boolean }>('/createOrder', {
    items: opts.items, currency: opts.currency, country: opts.country, customer: opts.customer, orderRef: opts.orderRef,
  });
  const key = requireLiveKey(order.keyId, order.isTest);
  await loadCheckoutScript();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key, order_id: order.orderId, amount: order.amount, currency: order.currency,
      name: 'Kiddie Bloom', description: 'Books, toys & learning products',
      prefill: { name: opts.customer.name, email: opts.customer.email, contact: opts.customer.contact },
      theme: { color: '#d97998' }, modal: { ondismiss: () => reject(new Error('cancelled')) },
      handler: async (result: any) => {
        try {
          await postJson('/verifyPayment', {
            razorpay_order_id: result.razorpay_order_id,
            razorpay_payment_id: result.razorpay_payment_id,
            razorpay_signature: result.razorpay_signature,
          });
          resolve({ paymentId: result.razorpay_payment_id, orderId: result.razorpay_order_id });
        } catch (error) { reject(error); }
      },
    });
    checkout.on('payment.failed', (result: any) => reject(new Error(result?.error?.description || 'Payment failed. Please try again.')));
    checkout.open();
  });
}

type PrintableOrder = Awaited<ReturnType<typeof createPrintableOrder>>;
const orderCache = new Map<string, { at: number; promise: Promise<PrintableOrder> }>();
const orderKey = (ids: string[], currency: string) => [...ids].sort().join(',') + '|' + currency;
export function prefetchPrintableOrder(resourceIds: string[], currency: string): void {
  if (!resourceIds.length) return;
  const key = orderKey(resourceIds, currency);
  const existing = orderCache.get(key);
  if (existing && Date.now() - existing.at < 8 * 60 * 1000) return;
  const promise = createPrintableOrder(resourceIds, currency);
  promise.catch(() => orderCache.delete(key));
  orderCache.set(key, { at: Date.now(), promise });
}
export async function payPrintablesWithRazorpay(opts: {
  resourceIds: string[]; currency: string; prefill?: RazorpayPrefill;
}): Promise<{ resourceIds: string[]; downloadTokens: Record<string, string> }> {
  const key = orderKey(opts.resourceIds, opts.currency);
  const cached = orderCache.get(key);
  orderCache.delete(key);
  let order: PrintableOrder;
  if (cached && Date.now() - cached.at < 8 * 60 * 1000) {
    try { order = await cached.promise; } catch { order = await createPrintableOrder(opts.resourceIds, opts.currency); }
  } else order = await createPrintableOrder(opts.resourceIds, opts.currency);
  const liveKey = requireLiveKey(order.keyId, order.isTest);
  await loadCheckoutScript();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: liveKey, order_id: order.orderId, amount: order.amount, currency: order.currency,
      name: 'Kiddie Bloom', description: 'Printable learning PDFs', prefill: opts.prefill || {},
      theme: { color: '#d97998' }, modal: { ondismiss: () => reject(new Error('cancelled')) },
      handler: async (result: any) => {
        try {
          const verified = await verifyPrintablePayment({
            orderRef: order.orderRef, razorpay_order_id: result.razorpay_order_id,
            razorpay_payment_id: result.razorpay_payment_id, razorpay_signature: result.razorpay_signature,
          });
          resolve({ resourceIds: verified.resourceIds, downloadTokens: verified.downloadTokens });
        } catch (error) { reject(error); }
      },
    });
    checkout.on('payment.failed', (result: any) => reject(new Error(result?.error?.description || 'Payment failed. Please try again.')));
    checkout.open();
  });
}
