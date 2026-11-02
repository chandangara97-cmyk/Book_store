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
function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Razorpay checkout could not be loaded. Please check your connection and try again.'));
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

  // 2. Open the official Razorpay Checkout (test keys are supported too).
  const isRealRazorpayKey = Boolean(order.keyId && !order.keyId.toLowerCase().includes('mock') && order.keyId.startsWith('rzp_'));

  if (isRealRazorpayKey) {
    try {
      await loadCheckoutScript();
      if (window.Razorpay) {
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
    } catch (e) {
      throw e instanceof Error ? e : new Error('Could not initialize Razorpay checkout.');
    }
  }
  throw new Error('Razorpay is not configured with a valid key. No payment was taken. Please contact support.');
}

/** Pays for printable PDFs (signed-in users). Resolves with one-time download tokens once the server verifies the payment. */
export async function payPrintablesWithRazorpay(opts: {
  resourceIds: string[];
  currency: string;
  prefill?: RazorpayPrefill;
}): Promise<{ resourceIds: string[]; downloadTokens: Record<string, string> }> {
  // 1. Create printable order on server
  const order = await createPrintableOrder(opts.resourceIds, opts.currency);

  const isRealRazorpayKey = Boolean(order.keyId && !order.keyId.toLowerCase().includes('mock') && order.keyId.startsWith('rzp_'));

  if (isRealRazorpayKey) {
    try {
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
    } catch (e) {
      throw e instanceof Error ? e : new Error('Could not initialize Razorpay checkout.');
    }
  }
  throw new Error('Razorpay is not configured with a valid key. No payment was taken. Please contact support.');
}
