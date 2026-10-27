import React from 'react';
import { useStore } from '../context/StoreContext';

const TABS = [
  { view: 'printables', icon: '🖍️', label: 'Printables' },
  { view: 'auth', icon: '👤', label: 'Account' },
];

export const BottomNav: React.FC = () => {
  const { view, setView, setSelectedCategory } = useStore();

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
          className={`bn-tab ${(view === t.view || (t.view === 'printables' && view === 'home')) ? 'active' : ''}`}
          onClick={() => go(t.view)}
          aria-current={(view === t.view || (t.view === 'printables' && view === 'home')) ? 'page' : undefined}
        >
          <span className="bn-icon">
            {t.icon}
            
          </span>
          <span className="bn-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
};
