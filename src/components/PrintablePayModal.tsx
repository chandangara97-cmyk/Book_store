import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LearningResource } from '../types';
import { capturePrintableOrder, createPrintableOrder, getPayPalConfig, loadPayPalSdk } from '../printablesApi';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];

export const PrintablePayModal: React.FC<{ resource: LearningResource; onClose: () => void; onPaid: (ids: string[]) => void }> = ({ resource, onClose, onPaid }) => {
  const { showToast } = useStore();
  const box = useRef<HTMLDivElement>(null);
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading'); setError('');
    (async () => {
      try {
        const cfg = await getPayPalConfig();
        const paypal = await loadPayPalSdk(cfg.clientId, currency);
        if (cancelled || !box.current) return;
        box.current.innerHTML = '';
        await paypal.Buttons({
          style: { layout: 'vertical', shape: 'pill', label: 'pay' },
          createOrder: async () => { const o = await createPrintableOrder([resource.id], currency); (box.current as any).__ref = o.orderRef; return o.id; },
          onApprove: async (data: { orderID: string }) => {
            try {
              const done = await capturePrintableOrder((box.current as any).__ref, data.orderID);
              showToast('Payment received. Your PDF is ready to download!');
              onPaid(done.resourceIds);
            } catch (e) { setError(e instanceof Error ? e.message : 'Payment could not be confirmed.'); }
          },
          onError: (e: unknown) => setError(e instanceof Error ? e.message : 'PayPal reported a problem. You have not been charged unless PayPal says so.'),
        }).render(box.current);
        if (!cancelled) setStatus('ready');
      } catch (e) { if (!cancelled) { setStatus('error'); setError(e instanceof Error ? e.message : 'Could not start checkout.'); } }
    })();
    return () => { cancelled = true; };
  }, [currency, resource.id]);

  return <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
      <button className="close-modal-btn" onClick={onClose}>✕</button>
      <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--ink)' }}>{resource.title}</h2>
      <p style={{ color: '#5c6472', fontSize: 14, marginBottom: 16 }}>Digital download (PDF) · no shipping · ₹{resource.price.toFixed(0)} (charged in your chosen currency at today’s rate, including payment fees). The download unlocks right after payment.</p>
      <label htmlFor="pp-cur" style={{ fontWeight: 700, marginRight: 8 }}>Pay in</label>
      <select id="pp-cur" value={currency} onChange={e => setCurrency(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, marginBottom: 16 }}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
      {status === 'loading' && <p>Loading secure checkout…</p>}
      {error && <p role="alert" style={{ color: '#b3261e' }}>{error}</p>}
      <div ref={box} />
    </div>
  </div>;
};
