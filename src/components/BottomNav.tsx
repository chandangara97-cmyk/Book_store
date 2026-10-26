import React from 'react';
import { useStore } from '../context/StoreContext';

const TABS = [
  { view: 'home', icon: '🏠', label: 'Home' },
  { view: 'library', icon: '📚', label: 'Books' },
  { view: 'toys', icon: '🧸', label: 'Toys' },
  { view: 'gift-finder', icon: '🎁', label: 'Gifts' },
  { view: 'cart', icon: '🛒', label: 'Cart' },
];

export const BottomNav: React.FC = () => {
  const { view, setView, setSelectedCategory, cartCount } = useStore();

  if (view === 'checkout' || view === 'order-summary') return null;

  const go = (v: string) => {
    setSelectedCategory('all');
    setView(v);
    window.scrollTo({ top: 0 });
  };

  return (
    <nav className="bottom-nav no-print" aria-label="App navigation">
      {TABS.map((t) => (
        <button
          key={t.view}
          type="button"
          className={`bn-tab ${view === t.view ? 'active' : ''}`}
          onClick={() => go(t.view)}
          aria-current={view === t.view ? 'page' : undefined}
        >
          <span className="bn-icon">
            {t.icon}
            {t.view === 'cart' && cartCount > 0 && <span className="bn-badge">{cartCount}</span>}
          </span>
          <span className="bn-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
};
