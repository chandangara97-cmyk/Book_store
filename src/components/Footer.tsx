import React from 'react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setView, setSelectedCategory } = useStore();

  const navigateTo = (newView: string, category: string = 'all') => {
    setSelectedCategory(category);
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div>
          &copy; {new Date().getFullYear()} <strong>The Reading Nook</strong>. All rights reserved.
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => navigateTo('library', 'all')}>All Books</button>
          <button type="button" onClick={() => navigateTo('toys')}>Toys</button>
          <button type="button" onClick={() => navigateTo('gift-finder')}>Gift Finder</button>
          <button type="button" onClick={() => navigateTo('wishlist')}>Wishlist</button>
          <button type="button" onClick={() => navigateTo('cart')}>Cart</button>
          <button type="button" onClick={() => navigateTo('auth')}>Account</button>
          <button type="button" onClick={() => navigateTo('admin')}>Studio Admin</button>
        </div>
      </div>
    </footer>
  );
};
