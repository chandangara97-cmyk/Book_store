import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { LearningResource } from '../types';
import { API_URL } from '../printablesApi';
import { payPrintablesWithRazorpay, preloadRazorpay, prefetchPrintableOrder } from '../razorpayApi';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];

type Props = {
  resources: LearningResource[];
  onClose: () => void;
  onPaid: (ids: string[]) => void;
  onRemove?: (id: string) => void;
  isLoggedIn: boolean;
  onNeedLogin: () => void;
  renderThumb?: (r: LearningResource) => React.ReactNode;
  getSubtitle?: (r: LearningResource) => string;
};

/** Single combined popup: basket review + currency + pay. Replaces the old basket modal -> order summary modal two-step. */
export const PrintablePayModal: React.FC<Props> = ({ resources, onClose, onPaid, onRemove, isLoggedIn, onNeedLogin, renderThumb, getSubtitle }) => {
  const { showToast } = useStore();
  const [currency, setCurrency] = useState('INR');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [links, setLinks] = useState<{ id: string; title: string; url: string }[]>([]);
  const ids = resources.map(r => r.id);
  const idsKey = ids.join(',');
  useEffect(() => { preloadRazorpay(); }, []);
  // Create the order in the background (after a short pause so quick Remove taps don't spam the server)
  useEffect(() => {
    if (!isLoggedIn || links.length || !ids.length) return;
    const t = setTimeout(() => prefetchPrintableOrder(ids, currency), 400);
    return () => clearTimeout(t);
  }, [idsKey, currency, isLoggedIn, links.length]);
  const total = resources.reduce((n, r) => n + r.price, 0);

  const pay = async () => {
    if (busy || !resources.length) return;
    if (!isLoggedIn) { onNeedLogin(); return; }
    setBusy(true); setError('');
    const paidResources = resources;
    try {
      const done = await payPrintablesWithRazorpay({ resourceIds: ids, currency });
      const made = paidResources.filter(r => done.downloadTokens?.[r.id]).map(r => ({ id: r.id, title: r.title, url: `${API_URL}/downloadOnce?token=${encodeURIComponent(done.downloadTokens[r.id])}` }));
      if (!made.length) throw new Error('Payment was confirmed, but the download links could not be created. Please contact support with your order reference.');
      setLinks(made);
      showToast('Payment verified. Your one-time PDF links are ready.');
      onPaid(done.resourceIds);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment could not be completed.';
      if (msg !== 'cancelled') setError(msg);
    } finally { setBusy(false); }
  };

  const done = links.length > 0;

  return <div className="modal-overlay" onClick={() => { if (!busy) onClose(); }}>
    <div className="modal-content" role="dialog" aria-label={done ? 'Your downloads' : 'Your basket'} style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <button className="close-modal-btn" onClick={onClose} disabled={busy}>✕</button>
      <h2 style={{ fontSize: 24, marginBottom: 4, color: 'var(--ink)' }}>{done ? '✅ Your downloads' : '🧺 Your basket'}</h2>

      {done && <div role="status" style={{ background: '#edf7f0', border: '1px solid #cfe4d4', borderRadius: 14, padding: 16, margin: '12px 0 16px' }}>
        <strong style={{ display: 'block', color: '#214c3d', marginBottom: 10 }}>Payment approved — your PDFs are ready</strong>
        {links.map(l => <a key={l.id} href={l.url} style={{ display: 'block', background: '#214c3d', color: 'white', padding: '11px 16px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}>{l.title} ↓</a>)}
        <p style={{ fontSize: 12, color: '#5c6472', margin: '10px 0 0' }}>Keep these links private. Each expires after one successful download or 24 hours.</p>
      </div>}

      {!done && (resources.length === 0
        ? <p style={{ textAlign: 'center', padding: '24px 0' }}>Your basket is empty. Tap “Add to basket” on any printable.</p>
        : <>
          <p style={{ color: '#5c6472', fontSize: 14, margin: '0 0 14px' }}>Check everything you’ve selected, then pay.</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
            {resources.map(r => <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: '1px solid #e5e9e1', borderRadius: 14 }}>
              {renderThumb && <div style={{ width: 52, flex: 'none', aspectRatio: '1 / 1.414', borderRadius: 8, overflow: 'hidden', background: '#edf7f0', display: 'grid', placeItems: 'center', fontSize: 26 }}>{renderThumb(r)}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', color: '#214c3d', lineHeight: 1.3 }}>{r.title}</strong>
                {getSubtitle && <small style={{ color: '#68756c' }}>{getSubtitle(r)}</small>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>₹{r.price.toFixed(0)}</strong>
                {onRemove && <button type="button" disabled={busy} onClick={() => onRemove(r.id)} style={{ display: 'block', background: 'none', border: 0, color: '#b3261e', fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: '4px 0 0', marginLeft: 'auto' }}>Remove</button>}
              </div>
            </li>)}
          </ul>

          <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, margin: '16px 0 4px' }}><span>Total ({resources.length} item{resources.length === 1 ? '' : 's'})</span><span>₹{total.toFixed(0)}</span></p>
          <p style={{ color: '#5c6472', fontSize: 12, margin: '0 0 14px' }}>Digital PDFs · no shipping. After verified payment, each private download link works once and expires after 24 hours.</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <label htmlFor="pp-cur" style={{ fontWeight: 700 }}>Pay in</label>
            <select id="pp-cur" value={currency} disabled={busy} onChange={e => setCurrency(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10 }}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn gold" style={{ flex: 1, minWidth: 180 }} disabled={busy} onClick={pay}>{busy ? 'Opening secure checkout…' : `Pay with Razorpay · ₹${total.toFixed(0)}`}</button>
            <button type="button" className="btn alt" disabled={busy} onClick={onClose}>Keep browsing</button>
          </div>
          {!isLoggedIn && <p style={{ fontSize: 12, color: '#5c6472', marginTop: 10 }}>You’ll be asked to sign in first. Your basket is saved.</p>}
        </>)}

      {error && <p role="alert" style={{ color: '#b3261e', marginTop: 10 }}>{error}</p>}
    </div>
  </div>;
};
