import React, { useState } from 'react';
import { asset } from '../utils/images';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, UserRound, Menu, X, Heart, Sparkles, BookOpen, Puzzle, Gift, Sun, Moon, LayoutDashboard } from 'lucide-react';

export const Header: React.FC = () => {
  const { view, setView, cartCount, user, setSelectedCategory, theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = (v: string) => { setSelectedCategory('all'); setView(v); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const links = [
    { view: 'library', label: 'Books', icon: BookOpen },
    { view: 'toys', label: 'Toys & Play', icon: Puzzle },
    { view: 'printables', label: 'Learning Studio', icon: Sparkles },
    { view: 'gifts', label: 'Gift Finder', icon: Gift },
  ];
  return <>
    <div className="kb-announcement"><Sparkles size={14}/> Little joys, big discoveries <span>·</span> Thoughtful learning for every age</div>
    <header className="header kb-header">
      <div className="kb-header-main">
        <button className="kb-brand" onClick={() => navigate('home')} aria-label="Kiddie Bloom home">
          <img src={asset('/img/kiddie-bloom-logo-sm.png')} alt="" width="52" height="52" />
          <span><strong>Kiddie Bloom</strong><small>READ · PLAY · GROW</small></span>
        </button>
        <nav className="kb-desktop-nav" aria-label="Main navigation">
          {links.map(({view: target,label,icon:Icon}) => <button key={target} className={view === target ? 'is-active' : ''} onClick={() => navigate(target)}><Icon size={17}/>{label}</button>)}
        </nav>
        <div className="kb-header-actions">
          <button className="kb-action" aria-label="Wishlist" title="Wishlist" onClick={() => navigate('wishlist')}><Heart size={19}/></button>
          <button className="kb-action kb-cart-action" aria-label={`Shopping bag, ${cartCount} items`} title="Shopping bag" onClick={() => navigate('cart')}><ShoppingBag size={20}/>{cartCount > 0 && <i>{cartCount}</i>}</button>
          <button className="kb-action" aria-label="My account" title="My account" onClick={() => navigate('auth')}><UserRound size={19}/></button>
          <button className="kb-action kb-theme-action" aria-label="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
          {user?.isAdmin && <button className="kb-admin-shortcut" onClick={() => navigate('admin')}><LayoutDashboard size={16}/> Admin</button>}
          <button className="kb-menu-toggle" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileMenuOpen(v => !v)}>{mobileMenuOpen ? <X/> : <Menu/>}</button>
        </div>
      </div>
      {mobileMenuOpen && <nav className="kb-mobile-menu" aria-label="Mobile navigation">
        <button onClick={() => navigate('home')}>Home</button>
        {links.map(({view:target,label,icon:Icon}) => <button key={target} onClick={() => navigate(target)}><Icon size={18}/>{label}</button>)}
        <button onClick={() => navigate('wishlist')}><Heart size={18}/> Favourites</button>
        <button onClick={() => navigate('cart')}><ShoppingBag size={18}/> Shopping bag ({cartCount})</button>
        {user?.isAdmin && <button onClick={() => navigate('admin')}><LayoutDashboard size={18}/> Admin dashboard</button>}
      </nav>}
    </header>
  </>;
};
