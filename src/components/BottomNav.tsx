import React from 'react';
import { useStore } from '../context/StoreContext';
const TABS = [
  { view: 'home', icon: '⌂', label: 'Home' },
  { view: 'learning', icon: '📚', label: 'Learn' },
  { view: 'toys', icon: '🧸', label: 'Toys' },
  { view: 'wishlist', icon: '♡', label: 'Saved' },
  { view: 'cart', icon: '🛒', label: 'Cart' },
];
export const BottomNav: React.FC = () => {
  const { view, setView, cartCount } = useStore();
  if (['checkout', 'order-summary', 'auth', 'admin'].includes(view)) return null;
  return <nav className="bottom-nav no-print" aria-label="Quick navigation">
    {TABS.map(t => <button key={t.view} type="button" className={`bn-tab ${view === t.view || (t.view === 'learning' && view === 'library') ? 'active' : ''}`} onClick={() => { setView(t.view); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
      <span className="bn-icon">{t.icon}{t.view === 'cart' && cartCount > 0 ? <i className="bn-count">{cartCount}</i> : null}</span><span className="bn-label">{t.label}</span>
    </button>)}
  </nav>;
};
