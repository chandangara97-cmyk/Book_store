import { API_URL } from './printablesApi';

declare global {
  interface Window { Razorpay?: any; }
}

export interface RazorpayPrefill { name?: string; email?: string; contact?: string; }

let scriptPromise: Promise<void> | null = null;
function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve();
      s.onerror = () => { scriptPromise = null; reject(new Error('Could not load Razorpay. Check your connection.')); };
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) throw new Error('Payments are not set up yet (VITE_API_URL is missing).');
  const r = await fetch(API_URL + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
  await loadCheckoutScript();
  const order = await postJson<{ orderId: string; amount: number; currency: string; keyId: string }>('/createOrder', {
    items: opts.items, currency: opts.currency, country: opts.country, customer: opts.customer, orderRef: opts.orderRef
  });

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId, // public key id only
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
            razorpay_signature: resp.razorpay_signature
          });
          resolve({ paymentId: resp.razorpay_payment_id, orderId: resp.razorpay_order_id });
        } catch (e) { reject(e); }
      }
    });
    rzp.on('payment.failed', (resp: any) => reject(new Error((resp && resp.error && resp.error.description) || 'Payment failed. Please try again.')));
    rzp.open();
  });
}
