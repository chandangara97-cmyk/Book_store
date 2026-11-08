import { asset } from '../utils/images';
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const { view, setView, cartCount, user, setSelectedCategory, theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (newView: string, category: string = 'all') => {
    setSelectedCategory(category);
    setView(newView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openUploadPage = () => {
    setMobileMenuOpen(false);
    window.location.href = asset('/upload-pdf.html');
  };

  const scrollToSection = (id: string) => {
    if (view !== 'home') {
      setView('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <a
          href="#top"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('home');
          }}
        >
          <img className="brand-logo" src={asset('/img/kiddie-bloom-logo-sm.png')} alt="Kiddie Bloom logo" width="56" height="56" />
          <div className="brand-text">
            <h1 aria-label="Kiddie Bloom">
              {['K','i','d','d','i','e'].map((c, i) => (
                <span key={i} className={`wm wm${i}`}>{c}</span>
              ))}{' '}
              <span className="wm-bloom">Bloom</span>
            </h1>
            <span>Books · Play · Learn · Bloom</span>
          </div>
        </a>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li><button type="button" className={view === 'home' ? 'active' : ''} onClick={() => navigateTo('home')}>Home</button></li>
            <li><button type="button" className={view === 'library' ? 'active' : ''} onClick={() => navigateTo('library')}>Books</button></li>
            <li><button type="button" className={view === 'toys' ? 'active' : ''} onClick={() => navigateTo('toys')}>Toys & gifts</button></li>
            <li><button type="button" className={view === 'printables' ? 'active' : ''} onClick={() => navigateTo('printables')}>Learning studio</button></li>
            <li><button type="button" className={view === 'gifts' ? 'active' : ''} onClick={() => navigateTo('gifts')}>Gift finder</button></li>
            <li><button type="button" className={view === 'cart' ? 'active' : ''} onClick={() => navigateTo('cart')}>Cart ({cartCount})</button></li>
          </ul>
        </nav>

        <div className="header-actions">
          {user?.isAdmin && (
            <button
              type="button"
              className="admin-tag-btn mobile-hide"
              title="Upload PDF"
              onClick={openUploadPage}
            >
              Studio Admin
            </button>
          )}

          <button
            type="button"
            className="icon-btn"
            title="Account"
            aria-label="Account"
            onClick={() => navigateTo('auth')}
          >
            👤
          </button>

          <button
            type="button"
            className="icon-btn theme-toggle-btn mobile-hide"
            title={theme === 'dark' ? 'Switch to light day mode' : 'Switch to cozy night mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            style={{ fontSize: '18px' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            className="icon-btn mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="navigation" aria-label="Mobile menu">
          <button type="button" className="mobile-drawer-link" onClick={() => navigateTo('home')}>🏡 Home</button>
          <button type="button" className="mobile-drawer-link" onClick={() => navigateTo('library')}>📚 Books</button>
          <button type="button" className="mobile-drawer-link" onClick={() => navigateTo('toys')}>🧸 Toys & gifts</button>
          <button type="button" className="mobile-drawer-link" onClick={() => navigateTo('printables')}>🖍️ Learning studio</button>
          <button type="button" className="mobile-drawer-link" onClick={() => navigateTo('gifts')}>🎁 Gift finder</button>
          <button type="button" className="mobile-drawer-link" onClick={() => navigateTo('cart')}>🛒 Cart ({cartCount})</button>
          {user?.isAdmin && (
            <button type="button" className="mobile-drawer-link" onClick={openUploadPage}>
              ⚙️ Studio Admin
            </button>
          )}
          <button
            type="button"
            className="mobile-drawer-theme"
            onClick={() => {
              toggleTheme();
              setMobileMenuOpen(false);
            }}
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Cozy Night Mode'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
