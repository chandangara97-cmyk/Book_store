import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CURRENCY_SYMBOLS, DEFAULT_FX_RATES } from '../data/initialData';
import { Order, CustomerDetails } from '../types';
import { payWithRazorpay } from '../razorpayApi';

const FX_ENDPOINT = 'https://open.er-api.com/v6/latest/INR';
const FX_CACHE_KEY = 'readingNookFxRates';

export const CheckoutView: React.FC = () => {
  const { cart, saveOrder, setView, showToast, user } = useStore();

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal: '',
    country: 'IN'
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [currency, setCurrency] = useState<string>('INR');
  const [fxRates, setFxRates] = useState<Record<string, number>>(DEFAULT_FX_RATES);
  const [rateStatus, setRateStatus] = useState<string>('Checking live exchange rates…');
  const [rateSource, setRateSource] = useState<string>('Standard indicative rates');
  const [rateUpdatedAt, setRateUpdatedAt] = useState<string | null>(null);
  const [isLiveRates, setIsLiveRates] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch FX Rates
  useEffect(() => {
    let mounted = true;
    async function loadRates() {
      try {
        const response = await fetch(FX_ENDPOINT, { cache: 'no-store' });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        if (data && data.result === 'success' && data.rates) {
          if (!mounted) return;
          const newRates: Record<string, number> = { INR: 1 };
          Object.keys(CURRENCY_SYMBOLS).forEach((c) => {
            if (c !== 'INR' && Number.isFinite(Number(data.rates[c]))) {
              newRates[c] = Number(data.rates[c]);
            }
          });
          setFxRates(newRates);
          setIsLiveRates(true);
          setRateSource('Live indicative market rate');
          const time = data.time_last_update_utc || new Date().toISOString();
          setRateUpdatedAt(time);
          setRateStatus(`Live indicative rates updated: ${new Date(time).toLocaleTimeString()}`);
          localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ rates: newRates, updatedAt: time }));
          return;
        }
      } catch (err) {
        console.warn('Using cached or fallback exchange rates', err);
      }

      // Fallback to cache
      try {
        const cached = JSON.parse(localStorage.getItem(FX_CACHE_KEY) || 'null');
        if (cached?.rates && mounted) {
          setFxRates(cached.rates);
          setRateUpdatedAt(cached.updatedAt);
          setRateSource('Previously cached rate');
          setRateStatus('Showing saved exchange rates');
          return;
        }
      } catch {
        // use defaults
      }

      if (mounted) {
        setRateStatus('Using standard indicative INR exchange rates');
      }
    }

    loadRates();
    return () => {
      mounted = false;
    };
  }, []);

  // Price calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
    0
  );
  const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  const base = subtotal + shipping;

  // Fee calculation from payments.js:
  const isInternational = customer.country !== 'IN';
  const feePct = isInternational ? 3 : 2;
  const eff = (feePct / 100) * 1.18; // with 18% GST on payment fee
  const fee = base > 0 ? Math.round((base / (1 - eff) - base) * 100) / 100 : 0;
  const grandTotalINR = base + fee;

  // Converted amount
  const activeRate = fxRates[currency] || 1;
  const convertedTotal = grandTotalINR * activeRate;

  const formatMoney = (inrAmount: number, targetCurrency: string = currency) => {
    const rate = fxRates[targetCurrency] || 1;
    const converted = inrAmount * rate;
    const sym = CURRENCY_SYMBOLS[targetCurrency] || '₹';
    if (targetCurrency === 'INR') {
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${sym}${converted.toFixed(2)}`;
  };

  const handleCountryChange = (country: string) => {
    setCustomer((prev) => ({ ...prev, country }));
    // If international country chosen and currency is still INR, suggest USD
    if (country !== 'IN' && currency === 'INR') {
      setCurrency('USD');
    }
  };

  const handlePaymentMethodChange = (method: 'card' | 'upi') => {
    setPaymentMethod(method);
  };

  const finalizeOrder = (isPaid: boolean = false, paymentId?: string) => {
    const orderId = 'RN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    const order: Order = {
      orderId,
      createdAt: new Date().toISOString(),
      status: isPaid ? 'Paid' : 'Demo checkout — order confirmed',
      customer,
      items: cart.map((item) => ({
        id: item.id,
        title: item.title,
        author: item.author || 'Kiddie Bloom',
        priceINR: Number(item.price) || 0,
        qty: Number(item.qty) || 1,
        lineTotalINR: (Number(item.price) || 0) * (Number(item.qty) || 1),
        type: item.type
      })),
      totalsINR: {
        subtotal,
        shipping,
        fee,
        feePct,
        international: isInternational,
        tax: 0,
        total: grandTotalINR
      },
      currency,
      exchangeRate: activeRate,
      convertedTotal,
      exchangeRateUpdatedAt: rateUpdatedAt,
      exchangeRateSource: rateSource,
      exchangeRateWasLive: isLiveRates,
      paymentMethod:
        paymentMethod === 'card'
          ? 'Credit / Debit Card'
          : 'UPI (India)',
      paymentId: paymentId || (isPaid ? 'PAY-' + Math.random().toString(36).substring(2, 9).toUpperCase() : undefined)
    };

    saveOrder(order);
    setView('order-summary');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.email.trim() || !customer.address1.trim()) {
      showToast('Please fill in your name, email, and shipping address.');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty.');
      return;
    }

    setIsProcessing(true);

    // Razorpay Standard Checkout (card / UPI / net banking)
    const orderRef = 'RN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    payWithRazorpay({
      items: cart.map((i) => ({ id: i.id, qty: Number(i.qty) || 1 })),
      currency,
      country: customer.country,
      customer: { name: customer.name, email: customer.email, contact: customer.phone },
      orderRef
    })
      .then(({ paymentId }) => finalizeOrder(true, paymentId))
      .catch((err: Error) => {
        showToast(err.message === 'cancelled' ? 'Payment cancelled.' : err.message || 'Payment failed.');
      })
      .finally(() => setIsProcessing(false));
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>No items in checkout</h2>
        <p style={{ color: 'var(--text-muted)', margin: '14px 0 24px' }}>
          Please add books or toys to your cart first.
        </p>
        <button type="button" className="btn" onClick={() => setView('library')}>
          Go to Library
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <button
            type="button"
            onClick={() => setView('cart')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--mut)',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            ← Back to Cart
          </button>
          <h1>Checkout</h1>
          <p>Secure payment · International currencies accepted</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '70px' }}>
        <form onSubmit={handleSubmit}>
          <div className="checkout-grid">
            {/* Left Forms */}
            <div>
              {/* Contact Information */}
              <div className="checkout-section">
                <h2>Contact Information</h2>
                <div className="form-group">
                  <label htmlFor="checkoutEmail">Email address *</label>
                  <input
                    id="checkoutEmail"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkoutPhone">Phone (with country code)</label>
                  <input
                    id="checkoutPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="checkout-section">
                <h2>Shipping Address</h2>
                <div className="form-group">
                  <label htmlFor="checkoutFullName">Full Name *</label>
                  <input
                    id="checkoutFullName"
                    type="text"
                    required
                    placeholder="Your full name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkoutAddress1">Address Line 1 *</label>
                  <input
                    id="checkoutAddress1"
                    type="text"
                    required
                    placeholder="Street address, P.O. box"
                    value={customer.address1}
                    onChange={(e) => setCustomer({ ...customer, address1: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkoutAddress2">Address Line 2 (optional)</label>
                  <input
                    id="checkoutAddress2"
                    type="text"
                    placeholder="Apartment, suite, unit, etc."
                    value={customer.address2 || ''}
                    onChange={(e) => setCustomer({ ...customer, address2: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="checkoutCity">City *</label>
                    <input
                      id="checkoutCity"
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkoutState">State / Province *</label>
                    <input
                      id="checkoutState"
                      type="text"
                      required
                      value={customer.state}
                      onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="checkoutPostal">Postal / ZIP Code *</label>
                    <input
                      id="checkoutPostal"
                      type="text"
                      required
                      value={customer.postal}
                      onChange={(e) => setCustomer({ ...customer, postal: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkoutCountry">Country *</label>
                    <select
                      id="checkoutCountry"
                      value={customer.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="SG">Singapore</option>
                      <option value="AU">Australia</option>
                      <option value="CA">Canada</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                      <option value="OTHER">Other Country</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="checkout-section">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  <label className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => handlePaymentMethodChange('card')}
                    />
                    <span className="icon">💳</span>
                    <div className="info">
                      <strong>Credit / Debit Card</strong>
                      <span>Visa, Mastercard, Amex, RuPay · International cards accepted</span>
                    </div>
                  </label>

                  <label className={`payment-method ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => handlePaymentMethodChange('upi')}
                    />
                    <span className="icon">📱</span>
                    <div className="info">
                      <strong>UPI (India)</strong>
                      <span>Google Pay, PhonePe, Paytm, BHIM QR</span>
                    </div>
                  </label>
                </div>

                <div className="intl-note">
                  <strong>Secure payment by Razorpay.</strong>
                  <br />
                  Cards (Visa, Mastercard, RuPay, international cards), UPI, net banking and wallets are all
                  shown in the secure Razorpay window. International cards work in your local currency; the
                  exact methods shown depend on your Razorpay account settings.
                </div>
              </div>
            </div>

            {/* Right: Sticky Order Summary */}
            <div>
              <div className="checkout-section" style={{ position: 'sticky', top: '90px' }}>
                <h2>Order Summary</h2>

                {/* Currency selector */}
                <div style={{ marginBottom: '14px' }}>
                  <label
                    htmlFor="currencySelect"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}
                  >
                    Display currency:
                  </label>
                  <select
                    id="currencySelect"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border)',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="INR">INR – Indian Rupee (₹)</option>
                    <option value="USD">USD – US Dollar ($)</option>
                    <option value="EUR">EUR – Euro (€)</option>
                    <option value="GBP">GBP – British Pound (£)</option>
                    <option value="AED">AED – UAE Dirham (د.إ)</option>
                    <option value="SGD">SGD – Singapore Dollar (S$)</option>
                    <option value="AUD">AUD – Australian Dollar (A$)</option>
                    <option value="CAD">CAD – Canadian Dollar (C$)</option>
                  </select>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {rateStatus}
                  </p>
                </div>

                {/* Items */}
                <div style={{ maxHeight: '240px', overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '0.92rem'
                      }}
                    >
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          Qty: {item.qty}
                        </div>
                      </div>
                      <div>
                        {item.type === 'gift' ? 'FREE' : formatMoney(Number(item.price) * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ marginTop: '16px', borderTop: '1.5px solid var(--border)', paddingTop: '12px' }}>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatMoney(shipping)}</span>
                  </div>
                  {fee > 0 && (
                    <div className="summary-row">
                      <span>
                        Processing fee ({isInternational ? 'intl' : 'domestic'} ~{feePct}%+GST)
                      </span>
                      <span>{formatMoney(fee)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Tax / GST</span>
                    <span>Included</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total ({currency})</span>
                    <span>{formatMoney(grandTotalINR)}</span>
                  </div>
                  {currency !== 'INR' && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>
                      (Base: ₹{grandTotalINR.toLocaleString('en-IN')})
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-block"
                  style={{ marginTop: '22px' }}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing…' : `Pay Securely · ${formatMoney(grandTotalINR)}`}
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '14px',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  🔒 SSL Secured · 256-bit encryption
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
