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
          <span className="logo-graphic" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </span>
          <div className="brand-text">
            <h1>THE READING NOOK</h1>
            <span>Books · Ideas · Possibilities</span>
          </div>
        </a>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <button
                type="button"
                className={view === 'library' ? 'active' : ''}
                onClick={() => navigateTo('library')}
              >
                Shop all books
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollToSection('find')}
              >
                Find by age
              </button>
            </li>
            <li>
              <button
                type="button"
                className={view === 'toys' ? 'active' : ''}
                onClick={() => navigateTo('toys')}
              >
                Toys & Gifts
              </button>
            </li>
            <li>
              <button
                type="button"
                className={view === 'gift-finder' ? 'active' : ''}
                onClick={() => navigateTo('gift-finder')}
              >
                Gift Finder
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollToSection('how')}
              >
                How to buy
              </button>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="admin-tag-btn"
            title="Studio Admin"
            onClick={() => navigateTo('admin')}
          >
            {user?.isAdmin ? 'Studio Admin' : 'Admin'}
          </button>

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
            className="icon-btn"
            title="Wishlist"
            aria-label="Wishlist"
            onClick={() => navigateTo('wishlist')}
          >
            ♡
          </button>

          <button
            type="button"
            className="icon-btn"
            title="Cart"
            aria-label="Cart"
            onClick={() => navigateTo('cart')}
          >
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            type="button"
            className="icon-btn theme-toggle-btn"
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
            style={{ display: 'none' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <button
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: '8px 0', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}
            onClick={() => navigateTo('library')}
          >
            📚 Shop all books
          </button>
          <button
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: '8px 0', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}
            onClick={() => scrollToSection('find')}
          >
            🔍 Find by age
          </button>
          <button
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: '8px 0', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}
            onClick={() => navigateTo('toys')}
          >
            🧸 Toys & Learning Kits
          </button>
          <button
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: '8px 0', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}
            onClick={() => navigateTo('gift-finder')}
          >
            🎁 Gift Finder
          </button>
          <button
            style={{ textAlign: 'left', background: 'none', border: 'none', padding: '8px 0', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}
            onClick={() => navigateTo('admin')}
          >
            ⚙️ Studio Admin
          </button>
          <button
            style={{
              textAlign: 'left',
              background: 'var(--accent)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '6px'
            }}
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
