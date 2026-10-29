import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LearningResource } from '../types';
import { API_URL } from '../printablesApi';
import { payPrintablesWithRazorpay } from '../razorpayApi';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];

export const PrintablePayModal: React.FC<{ resources: LearningResource[]; onClose: () => void; onPaid: (ids: string[]) => void }> = ({ resources, onClose, onPaid }) => {
  const { showToast } = useStore();
  const [currency, setCurrency] = useState('INR');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [links, setLinks] = useState<{ id: string; title: string; url: string }[]>([]);
  const ids = resources.map(r => r.id);
  const total = resources.reduce((n, r) => n + r.price, 0);

  const pay = async () => {
    setBusy(true); setError('');
    try {
      const done = await payPrintablesWithRazorpay({ resourceIds: ids, currency });
      const made = resources.filter(r => done.downloadTokens?.[r.id]).map(r => ({ id: r.id, title: r.title, url: `${API_URL}/downloadOnce?token=${encodeURIComponent(done.downloadTokens[r.id])}` }));
      if (!made.length) throw new Error('Payment was confirmed, but the download links could not be created. Please contact support with your order reference.');
      setLinks(made);
      showToast('Payment verified. Your one-time PDF links are ready.');
      onPaid(done.resourceIds);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment could not be completed.';
      if (msg !== 'cancelled') setError(msg);
    } finally { setBusy(false); }
  };

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" style={{ maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <button className="close-modal-btn" onClick={onClose}>✕</button>
      <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--ink)' }}>{links.length ? 'Your downloads' : 'Order summary'}</h2>
      {!links.length && <>
        <ul style={{ listStyle: 'none', margin: '0 0 12px', padding: 0, display: 'grid', gap: 8 }}>
          {resources.map(r => <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 12px', border: '1px solid #e5e9e1', borderRadius: 12 }}><span style={{ fontWeight: 700 }}>{r.title}</span><strong>₹{r.price.toFixed(0)}</strong></li>)}
        </ul>
        <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, margin: '0 0 6px' }}><span>Total ({resources.length} item{resources.length === 1 ? '' : 's'})</span><span>₹{total.toFixed(0)}</span></p>
        <p style={{ color: '#5c6472', fontSize: 13, marginBottom: 16 }}>Digital PDFs · no shipping. After verified payment, each private download link works once and expires after 24 hours.</p>
      </>}
      {links.length > 0 && <div role="status" style={{ background: '#edf7f0', border: '1px solid #cfe4d4', borderRadius: 14, padding: 16, marginBottom: 16 }}><strong style={{ display: 'block', color: '#214c3d', marginBottom: 10 }}>Payment approved — your PDFs are ready</strong>
        {links.map(l => <a key={l.id} href={l.url} style={{ display: 'block', background: '#214c3d', color: 'white', padding: '11px 16px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}>{l.title} ↓</a>)}
        <p style={{ fontSize: 12, color: '#5c6472', margin: '10px 0 0' }}>Keep these links private. Each expires after one successful download or 24 hours.</p></div>}
      {!links.length && <>
        <label htmlFor="pp-cur" style={{ fontWeight: 700, marginRight: 8 }}>Pay in</label>
        <select id="pp-cur" value={currency} onChange={e => setCurrency(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, marginBottom: 16 }}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
        <div><button type="button" className="btn" disabled={busy} onClick={pay}>{busy ? 'Opening secure checkout…' : 'Pay with Razorpay'}</button></div>
      </>}
      {error && <p role="alert" style={{ color: '#b3261e' }}>{error}</p>}
    </div>
  </div>;
};
