import React from 'react';
import { useStore } from '../context/StoreContext';
import { House, BookOpen, Sparkles, ShoppingBag, UserRound } from 'lucide-react';
const TABS = [
  { view: 'home', label: 'Home', Icon: House },
  { view: 'library', label: 'Books', Icon: BookOpen },
  { view: 'printables', label: 'Learn', Icon: Sparkles },
  { view: 'cart', label: 'Bag', Icon: ShoppingBag },
  { view: 'auth', label: 'Account', Icon: UserRound },
];
export const BottomNav: React.FC = () => {
  const { view, setView, setSelectedCategory, cartCount } = useStore();
  if (view === 'checkout' || view === 'order-summary' || view === 'admin') return null;
  return <nav className="bottom-nav kb-bottom-nav" aria-label="Quick navigation">{TABS.map(({view:target,label,Icon}) => <button key={target} className={`bn-tab ${(view === target || (target === 'library' && view === 'books')) ? 'active' : ''}`} onClick={() => {setSelectedCategory('all');setView(target);window.scrollTo({top:0});}}><span className="bn-icon"><Icon size={19}/>{target === 'cart' && cartCount > 0 && <i>{cartCount}</i>}</span><span className="bn-label">{label}</span></button>)}</nav>;
};
