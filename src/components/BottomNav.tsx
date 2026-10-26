import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, BookOpen, Bot, Gift, ShoppingBag } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { view, setView, setSelectedCategory, cartCount } = useStore();

  if (view === 'checkout' || view === 'order-summary') return null;

  const tabs = [
    { view: 'home', icon: Home, label: 'Home' },
    { view: 'library', icon: BookOpen, label: 'Books' },
    { view: 'toys', icon: Bot, label: 'Toys' },
    { view: 'gift-finder', icon: Gift, label: 'Gifts' },
    { view: 'cart', icon: ShoppingBag, label: 'Cart' },
  ];

  const go = (v: string) => {
    setSelectedCategory('all');
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-3 inset-x-4 z-40 p-1.5 rounded-2xl bg-slate-950/90 border border-cyan-500/25 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex items-center justify-around" 
      aria-label="Mobile navigation bar"
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = view === t.view;
        return (
          <button
            key={t.view}
            type="button"
            onClick={() => go(t.view)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
              isActive 
                ? 'text-cyan-300 bg-cyan-500/15 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'text-slate-400 hover:text-white'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {t.view === 'cart' && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black font-mono flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono tracking-wider mt-1">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
