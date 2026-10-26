import React from 'react';
import { useStore } from '../context/StoreContext';
import { CURRENCY_SYMBOLS } from '../data/initialData';

export const OrderSummaryView: React.FC = () => {
  const { lastOrder, setView, setSelectedCategory } = useStore();

  if (!lastOrder) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>No order found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '14px 0 24px' }}>
          No recent order summary was recorded in this session.
        </p>
        <button type="button" className="btn" onClick={() => setView('library')}>
          Browse Books
        </button>
      </div>
    );
  }

  const { orderId, createdAt, status, customer, items, totalsINR, currency, exchangeRate, convertedTotal, paymentMethod, paymentId } = lastOrder;
  const sym = CURRENCY_SYMBOLS[currency] || '₹';

  const formatCurr = (val: number, cur: string = currency) => {
    if (cur === 'INR') return `₹${Math.round(val).toLocaleString('en-IN')}`;
    return `${CURRENCY_SYMBOLS[cur] || ''}${val.toFixed(2)}`;
  };

  return (
    <main className="container">
      <section className="invoice" id="invoice">
        {/* Invoice Header */}
        <div className="invoice-head">
          <div>
            <h1>Order Summary</h1>
            <div className="muted">Kiddie Bloom · Preschool Worksheets</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ fontSize: '18px', color: 'var(--ink)' }}>{orderId}</strong>
            <div className="muted">{new Date(createdAt).toLocaleString()}</div>
            <div style={{ color: '#2e7d32', fontWeight: 700, fontSize: '14px' }}>
              ✓ {status}
            </div>
            {paymentId && (
              <div style={{ fontSize: '12px', color: 'var(--mut)' }}>ID: {paymentId}</div>
            )}
          </div>
        </div>

        {/* Invoice Grid: Customer & FX */}
        <div className="invoice-grid">
          <div>
            <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>Customer</h3>
            <div className="muted" style={{ lineHeight: 1.6 }}>
              <strong>{customer.name}</strong>
              <br />
              {customer.email}
              <br />
              {customer.phone && <>{customer.phone}<br /></>}
              {customer.address1}
              {customer.address2 ? `, ${customer.address2}` : ''}
              <br />
              {customer.city}, {customer.state} {customer.postal}
              <br />
              {customer.country}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>Payment & Exchange Rate</h3>
            <div className="muted" style={{ lineHeight: 1.6 }}>
              Payment method: <strong>{paymentMethod}</strong>
              <br />
              Selected currency: <strong>{currency}</strong>
              <br />
              1 INR = {exchangeRate.toPrecision(6)} {currency}
              <br />
              Rate source: {lastOrder.exchangeRateSource || 'Indicative rate'}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit price (INR)</th>
                <th style={{ textAlign: 'right' }}>Line total (INR)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{it.title}</strong>
                    {it.author && (
                      <div className="muted" style={{ fontSize: '13px' }}>
                        by {it.author}
                      </div>
                    )}
                  </td>
                  <td>{it.qty}</td>
                  <td style={{ textAlign: 'right' }}>
                    {it.priceINR === 0 ? 'FREE' : `₹${it.priceINR}`}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {it.lineTotalINR === 0 ? 'FREE' : `₹${it.lineTotalINR}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="invoice-totals">
          <div>
            <span>Subtotal (INR)</span>
            <strong>₹{totalsINR.subtotal.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span>Shipping (INR)</span>
            <strong>{totalsINR.shipping === 0 ? 'Free' : `₹${totalsINR.shipping}`}</strong>
          </div>
          {totalsINR.fee > 0 && (
            <div>
              <span>Payment processing fee (INR)</span>
              <strong>₹{totalsINR.fee.toFixed(2)}</strong>
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
            <span>Total (INR)</span>
            <strong>₹{totalsINR.total.toLocaleString('en-IN')}</strong>
          </div>
          <div className="grand">
            <span>Converted total ({currency})</span>
            <strong>{formatCurr(convertedTotal, currency)}</strong>
          </div>
        </div>

        {/* Notice */}
        <div
          style={{
            background: '#f8f2e7',
            padding: '16px',
            borderRadius: '12px',
            marginTop: '26px',
            fontSize: '0.88rem',
            lineHeight: 1.55
          }}
        >
          <strong>Payment & Delivery Note:</strong> Your order summary has been generated and saved
          to your profile. For physical books and toys, standard shipping arrives within 3–5
          business days. Digital books are ready for immediate reading.
        </div>
      </section>

      {/* Actions */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '50px'
        }}
      >
        <button type="button" className="btn" onClick={() => window.print()}>
          🖨️ Print / Save as PDF
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setView('home')}
        >
          Return to Home
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setSelectedCategory('all');
            setView('library');
          }}
        >
          Browse More Books
        </button>
      </div>
    </main>
  );
};
