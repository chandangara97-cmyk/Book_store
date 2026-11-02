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
 * Interactive Razorpay Payment Simulator Modal.
 * Renders when live credentials are not present or when Razorpay CDN is restricted in iframe/sandbox.
 */
function openPaymentSimulator(opts: {
  orderId: string;
  orderRef?: string;
  amountMinor: number;
  currency: string;
  customer?: RazorpayPrefill;
  title: string;
}): Promise<{ paymentId: string; signature: string }> {
  return new Promise((resolve, reject) => {
    // Prevent duplicate modals
    const existing = document.getElementById('kb-payment-modal-root');
    if (existing) existing.remove();

    const formattedAmount = (opts.amountMinor / 100).toFixed(2);
    const sym = opts.currency === 'INR' ? '₹' : opts.currency + ' ';

    const modalRoot = document.createElement('div');
    modalRoot.id = 'kb-payment-modal-root';
    modalRoot.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(6px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: kbFadeIn 0.2s ease-out;
    `;

    modalRoot.innerHTML = `
      <style>
        @keyframes kbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kbSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .kb-pay-box {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: kbSlideUp 0.25s ease-out;
          color: #1e293b;
        }
        .kb-pay-header {
          background: linear-gradient(135deg, #17224f 0%, #2b3a7a 100%);
          color: #ffffff;
          padding: 20px 24px;
          position: relative;
        }
        .kb-tab-btn {
          flex: 1;
          padding: 10px;
          border: none;
          background: none;
          font-weight: 600;
          font-size: 14px;
          color: #64748b;
          border-bottom: 2px solid transparent;
          cursor: pointer;
        }
        .kb-tab-btn.active {
          color: #ff4f9a;
          border-bottom-color: #ff4f9a;
        }
        .kb-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          margin-top: 4px;
          box-sizing: border-box;
          outline: none;
        }
        .kb-input:focus {
          border-color: #ff4f9a;
          box-shadow: 0 0 0 3px rgba(255, 79, 154, 0.15);
        }
      </style>
      <div class="kb-pay-box" role="dialog" aria-modal="true">
        <div class="kb-pay-header">
          <button id="kb-pay-close-btn" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.15); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">✕</button>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 22px;">🌸</span>
            <div>
              <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #ffffff;">Kiddie Bloom</h3>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1;">${opts.title}</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 14px;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8;">Total Payable</div>
              <div style="font-size: 26px; font-weight: 800; color: #ffd21f;">${sym}${formattedAmount}</div>
            </div>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">SECURE CHECKOUT</span>
          </div>
        </div>

        <!-- Payment Method Tabs -->
        <div style="display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
          <button class="kb-tab-btn active" id="tab-card">💳 Card</button>
          <button class="kb-tab-btn" id="tab-upi">📱 UPI</button>
          <button class="kb-tab-btn" id="tab-net">🏦 NetBanking</button>
        </div>

        <div style="padding: 20px 24px;">
          <!-- Card Tab Content -->
          <div id="content-card">
            <div style="margin-bottom: 12px;">
              <label style="font-size: 12px; font-weight: 700; color: #475569;">Card Number</label>
              <input id="kb-card-no" class="kb-input" placeholder="4111 2222 3333 4444" value="4111 2222 3333 4444" />
            </div>
            <div style="display: flex; gap: 12px; margin-bottom: 12px;">
              <div style="flex: 1;">
                <label style="font-size: 12px; font-weight: 700; color: #475569;">Expiry</label>
                <input class="kb-input" placeholder="MM/YY" value="12/28" />
              </div>
              <div style="flex: 1;">
                <label style="font-size: 12px; font-weight: 700; color: #475569;">CVV</label>
                <input class="kb-input" placeholder="123" value="888" type="password" maxlength="4" />
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="font-size: 12px; font-weight: 700; color: #475569;">Name on Card</label>
              <input class="kb-input" placeholder="Full name" value="${opts.customer?.name || 'Kiddie Bloom Reader'}" />
            </div>
          </div>

          <!-- UPI Tab Content -->
          <div id="content-upi" style="display: none;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
              <button type="button" class="kb-upi-app" style="border: 1.5px solid #ff4f9a; border-radius: 12px; padding: 10px 4px; background: #fff0f6; font-size: 11px; font-weight: 700; color: #17224f; cursor: pointer; text-align: center;">Google Pay</button>
              <button type="button" class="kb-upi-app" style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px 4px; background: white; font-size: 11px; font-weight: 700; color: #17224f; cursor: pointer; text-align: center;">PhonePe</button>
              <button type="button" class="kb-upi-app" style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px 4px; background: white; font-size: 11px; font-weight: 700; color: #17224f; cursor: pointer; text-align: center;">Paytm</button>
              <button type="button" class="kb-upi-app" style="border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px 4px; background: white; font-size: 11px; font-weight: 700; color: #17224f; cursor: pointer; text-align: center;">BHIM QR</button>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="font-size: 12px; font-weight: 700; color: #475569;">VPA / UPI ID</label>
              <input class="kb-input" placeholder="username@oksbi" value="kiddiebloom@upi" />
            </div>
          </div>

          <!-- Net Banking Content -->
          <div id="content-net" style="display: none;">
            <label style="font-size: 12px; font-weight: 700; color: #475569;">Select Your Bank</label>
            <select class="kb-input" style="background: white; margin-bottom: 16px;">
              <option>HDFC Bank</option>
              <option>State Bank of India (SBI)</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>Kotak Mahindra Bank</option>
            </select>
          </div>

          <div id="kb-status-box" style="margin-bottom: 14px; padding: 8px 12px; background: #f0fdf4; border-radius: 10px; font-size: 12px; color: #166534; display: flex; align-items: center; gap: 8px;">
            <span>🛡️</span>
            <span>256-bit encrypted test transaction. Click below to confirm.</span>
          </div>

          <button id="kb-confirm-pay-btn" style="width: 100%; background: #ff4f9a; hover: background: #e03f84; color: white; border: none; border-radius: 12px; padding: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px;">
            Pay ${sym}${formattedAmount}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalRoot);

    // Event handlers
    const closeBtn = document.getElementById('kb-pay-close-btn');
    const confirmBtn = document.getElementById('kb-confirm-pay-btn') as HTMLButtonElement | null;
    const tabCard = document.getElementById('tab-card');
    const tabUpi = document.getElementById('tab-upi');
    const tabNet = document.getElementById('tab-net');
    const contentCard = document.getElementById('content-card');
    const contentUpi = document.getElementById('content-upi');
    const contentNet = document.getElementById('content-net');

    const switchTab = (tab: 'card' | 'upi' | 'net') => {
      [tabCard, tabUpi, tabNet].forEach((t) => t?.classList.remove('active'));
      if (contentCard) contentCard.style.display = tab === 'card' ? 'block' : 'none';
      if (contentUpi) contentUpi.style.display = tab === 'upi' ? 'block' : 'none';
      if (contentNet) contentNet.style.display = tab === 'net' ? 'block' : 'none';

      if (tab === 'card') tabCard?.classList.add('active');
      if (tab === 'upi') tabUpi?.classList.add('active');
      if (tab === 'net') tabNet?.classList.add('active');
    };

    tabCard?.addEventListener('click', () => switchTab('card'));
    tabUpi?.addEventListener('click', () => switchTab('upi'));
    tabNet?.addEventListener('click', () => switchTab('net'));

    const cleanup = () => {
      modalRoot.remove();
    };

    closeBtn?.addEventListener('click', () => {
      cleanup();
      reject(new Error('cancelled'));
    });

    confirmBtn?.addEventListener('click', () => {
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = 'Authorizing with bank…';
        confirmBtn.style.opacity = '0.8';
      }

      setTimeout(() => {
        const paymentId = 'pay_' + Math.random().toString(36).slice(2, 12);
        const signature = 'sig_' + Math.random().toString(36).slice(2, 16);
        cleanup();
        resolve({ paymentId, signature });
      }, 900);
    });
  });
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

  // 2. Determine whether to try live Razorpay or fallback to in-app payment modal
  const isRealRazorpayKey = Boolean(
    order.keyId &&
      !order.isTest &&
      !order.keyId.includes('mock') &&
      order.keyId.startsWith('rzp_') &&
      !order.keyId.startsWith('rzp_test_kiddiebloom')
  );

  if (isRealRazorpayKey) {
    await loadCheckoutScript();
    if (window.Razorpay) {
      // NOTE: no try/catch here - cancel/failure must NOT fall through to the simulator (caused a 2nd payment popup)
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

  // 3. Open Interactive Payment Simulator (works seamlessly without third-party popups)
  const simResult = await openPaymentSimulator({
    orderId: order.orderId,
    orderRef: opts.orderRef,
    amountMinor: order.amount,
    currency: order.currency,
    customer: opts.customer,
    title: 'Bookstore & Learning Studio',
  });

  // 4. Verify on server
  await postJson('/verifyPayment', {
    razorpay_order_id: order.orderId,
    razorpay_payment_id: simResult.paymentId,
    razorpay_signature: simResult.signature,
  });

  return { paymentId: simResult.paymentId, orderId: order.orderId };
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

  const isRealRazorpayKey = Boolean(
    order.keyId &&
      !order.isTest &&
      !order.keyId.includes('mock') &&
      order.keyId.startsWith('rzp_') &&
      !order.keyId.startsWith('rzp_test_kiddiebloom')
  );

  if (isRealRazorpayKey) {
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

  // Fallback simulator for printables
  const simResult = await openPaymentSimulator({
    orderId: order.orderId,
    orderRef: order.orderRef,
    amountMinor: order.amount,
    currency: order.currency,
    customer: opts.prefill,
    title: 'Printable Activity Worksheets',
  });

  const done = await verifyPrintablePayment({
    orderRef: order.orderRef,
    razorpay_order_id: order.orderId,
    razorpay_payment_id: simResult.paymentId,
    razorpay_signature: simResult.signature,
  });

  return { resourceIds: done.resourceIds, downloadTokens: done.downloadTokens };
}
