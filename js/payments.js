/**
 * The Reading Nook - Razorpay + PayPal international payments
 * Set ORDER_API after you deploy the Cloud Functions (see PAYMENTS-SETUP.md).
 * Payments stay in demo mode until ORDER_API is filled in.
 */
const PAYMENTS = {
  ORDER_API: '',              // e.g. https://us-central1-YOUR-PROJECT.cloudfunctions.net/api
  // Gateway charges used to show an estimate. CONFIRM these in your Razorpay dashboard / razorpay.com/pricing
  FEE_DOMESTIC_PCT: 2,        // India cards / UPI / netbanking (estimate)
  FEE_INTERNATIONAL_PCT: 3,   // international cards (estimate)
  GST_ON_FEE_PCT: 18,
  PASS_FEE_TO_CUSTOMER: true, // true: customer pays the fee; false: store absorbs it (fee hidden)
  FREE_SHIPPING_FROM: 499, SHIPPING_INR: 49,
  isLive() { return !!this.ORDER_API; },
  /** Charges for a given INR base amount. Gross-up so the store still receives `base` after fees. */
  calc(baseINR, country) {
    const pct = country && country !== 'IN' ? this.FEE_INTERNATIONAL_PCT : this.FEE_DOMESTIC_PCT;
    const eff = (pct / 100) * (1 + this.GST_ON_FEE_PCT / 100);
    const fee = this.PASS_FEE_TO_CUSTOMER && baseINR > 0 ? baseINR / (1 - eff) - baseINR : 0;
    return { pct, fee: Math.round(fee * 100) / 100, international: !!(country && country !== 'IN') };
  },
  loadSdk() {
    return new Promise((res, rej) => {
      if (window.Razorpay) return res();
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = res; s.onerror = () => rej(new Error('Could not load Razorpay. Check your connection.'));
      document.head.appendChild(s);
    });
  },
  async post(path, body) {
    const r = await fetch(this.ORDER_API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Payment service error');
    return d;
  },
  /** Creates the order on the server (which recalculates prices, rate and fee), then opens Razorpay. */
  async pay(order, onSuccess, onFail) {
    try {
      await this.loadSdk();
      const o = await this.post('/createOrder', {
        items: order.items.map(i => ({ id: i.id, qty: i.qty })),
        currency: order.currency, country: order.customer.country, orderRef: order.orderId,
        customer: { name: order.customer.name, email: order.customer.email, phone: order.customer.phone }
      });
      const rzp = new Razorpay({
        key: o.keyId, order_id: o.orderId, amount: o.amount, currency: o.currency,
        name: 'The Reading Nook', description: 'Book order ' + order.orderId,
        prefill: { name: order.customer.name, email: order.customer.email, contact: order.customer.phone },
        theme: { color: '#1b2a4a' },
        handler: async resp => {
          try {
            const v = await this.post('/verifyPayment', resp);
            onSuccess({ ...order, status: 'Paid', paymentId: resp.razorpay_payment_id, charged: v.charged });
          } catch (e) { onFail(e); }
        },
        modal: { ondismiss: () => onFail(new Error('Payment cancelled')) }
      });
      rzp.on('payment.failed', r => onFail(new Error(r.error && r.error.description || 'Payment failed')));
      rzp.open();
    } catch (e) { onFail(e); }
  },
  async loadPayPalSdk(currency) {
    const cfg = await this.post('/paypalConfig', {});
    if (window.paypal) return cfg;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(cfg.clientId) + '&currency=' + encodeURIComponent(currency) + '&intent=capture';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load PayPal. Please check your connection and try again.'));
      document.head.appendChild(s);
    });
    return cfg;
  },
  async payPal(order, onSuccess, onFail) {
    let modal;
    try {
      if (!this.isLive()) throw new Error('Online payments are not configured yet. Please contact the store.');
      if (order.currency === 'INR') throw new Error('Please select USD or another international currency for PayPal.');
      await this.loadPayPalSdk(order.currency);
      modal = document.createElement('div');
      modal.id = 'rn-paypal-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(20,28,45,.62);display:flex;align-items:center;justify-content:center;padding:20px;';
      modal.innerHTML = '<div style="position:relative;background:#fff;border-radius:18px;padding:28px;width:min(440px,100%);box-shadow:0 24px 80px #0003"><button type="button" aria-label="Close" id="rn-paypal-close" style="position:absolute;right:12px;top:10px;border:0;background:transparent;font-size:25px;cursor:pointer">×</button><h2 style="margin:0 0 8px;color:#1b2a4a;font:600 24px Georgia,serif">Pay securely with PayPal</h2><p style="margin:0 0 20px;color:#5c6472;font:14px system-ui">Your payment is processed securely by PayPal.</p><div id="rn-paypal-buttons"></div><p style="margin:14px 0 0;color:#737987;font:12px system-ui">Order ' + String(order.orderId).replace(/[<>"'&]/g, '') + '</p></div>';
      document.body.appendChild(modal);
      const close = () => { if (modal && modal.isConnected) modal.remove(); };
      modal.querySelector('#rn-paypal-close').onclick = () => { close(); onFail(new Error('Payment cancelled')); };
      const result = await window.paypal.Buttons({
        style: { layout: 'vertical', shape: 'rect', label: 'paypal', tagline: false },
        createOrder: async () => {
          const created = await this.post('/createPayPalOrder', {
            items: order.items.map(i => ({ id: i.id, qty: i.qty })), currency: order.currency,
            country: order.customer.country, orderRef: order.orderId,
            customer: { name: order.customer.name, email: order.customer.email, phone: order.customer.phone }
          });
          return created.id;
        },
        onApprove: async data => {
          try {
            const captured = await this.post('/capturePayPalOrder', { paypalOrderId: data.orderID });
            close();
            onSuccess({ ...order, status: 'Paid', paymentId: captured.captureId, charged: { amount: captured.amount, currency: captured.currency }, paymentMethod: 'PayPal' });
          } catch (e) { close(); onFail(e); }
        },
        onCancel: () => { close(); onFail(new Error('Payment cancelled')); },
        onError: err => { close(); onFail(new Error((err && err.message) || 'PayPal payment failed. Please try again.')); }
      });
      await result.render('#rn-paypal-buttons');
    } catch (e) { if (modal && modal.isConnected) modal.remove(); onFail(e); }
  }
};
