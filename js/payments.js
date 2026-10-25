/**
 * The Reading Nook - online payments (Razorpay, domestic + international)
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
  }
};
