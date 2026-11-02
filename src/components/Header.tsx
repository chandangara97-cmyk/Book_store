import React, { useState } from 'react';
import { asset } from '../utils/images';
import { useStore } from '../context/StoreContext';

const LINKS = [
  { view: 'home', label: 'Home' },
  { view: 'learning', label: 'Learning' },
  { view: 'toys', label: 'Toys' },
  { view: 'gift-finder', label: 'Gift Finder' },
  { view: 'printables', label: 'Printables' },
];

export const Header: React.FC = () => {
  const { view, setView, cartCount, wishlist, user, theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const go = (v: string) => { setView(v); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <header className="header">
    <div className="header-inner">
      <button className="brand brand-button" onClick={() => go('home')} aria-label="Kiddie Bloom home">
        <img className="brand-logo" src={asset('/img/kiddie-bloom-logo-sm.png')} alt="" width="48" height="48" />
        <span className="brand-text"><strong><span className="brand-kiddie">Kiddie</span> <span className="brand-bloom">Bloom</span></strong><small>Learn · Play · Grow</small></span>
      </button>
      <nav className="main-nav" aria-label="Main navigation">
        {LINKS.map(link => <button key={link.view} className={view === link.view || (link.view === 'learning' && view === 'library') ? 'active' : ''} onClick={() => go(link.view)}>{link.label}</button>)}
      </nav>
      <div className="header-actions">
        <button className="icon-btn header-action" onClick={() => go('wishlist')} aria-label={`Wishlist, ${wishlist.length} saved`} title="Wishlist">♡{wishlist.length > 0 && <i className="action-count">{wishlist.length}</i>}</button>
        <button className="icon-btn header-action" onClick={() => go('cart')} aria-label={`Cart, ${cartCount} items`} title="Shopping cart">🛒{cartCount > 0 && <i className="action-count">{cartCount}</i>}</button>
        <button className="icon-btn header-action" onClick={() => go('auth')} aria-label="Account" title="Account">♙</button>
        <button className="theme-switch" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'} title={theme === 'dark' ? 'Day mode' : 'Night mode'}><span>{theme === 'dark' ? '☀️' : '🌙'}</span><small>{theme === 'dark' ? 'Day' : 'Night'}</small></button>
        <button className="icon-btn mobile-menu-btn" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Toggle menu">☰</button>
      </div>
    </div>
    {mobileMenuOpen && <div className="mobile-drawer">
      {LINKS.map(link => <button key={link.view} className="mobile-drawer-link" onClick={() => go(link.view)}>{link.label}</button>)}
      <button className="mobile-drawer-link" onClick={() => go('wishlist')}>♡ Wishlist</button>
      <button className="mobile-drawer-link" onClick={() => go('cart')}>🛒 Cart ({cartCount})</button>
      <button className="mobile-drawer-link" onClick={() => go('auth')}>Account</button>
      {user?.isAdmin && <button className="mobile-drawer-link" onClick={() => go('admin')}>Studio Admin</button>}
      <button className="mobile-drawer-theme" onClick={toggleTheme}>{theme === 'dark' ? '☀️ Switch to Day Mode' : '🌙 Switch to Night Mode'}</button>
    </div>}
  </header>;
};
