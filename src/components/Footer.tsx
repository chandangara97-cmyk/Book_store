import { asset } from '../utils/images';
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
        <div className="footer-brand">
          <img src={asset('/img/kiddie-bloom-logo-sm.png')} alt="Kiddie Bloom logo" width="44" height="44" />
          <span>&copy; {new Date().getFullYear()} <strong>Kiddie Bloom</strong>. All rights reserved.</span>
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => navigateTo('home')}>Home</button>
          <button type="button" onClick={() => navigateTo('library')}>Books</button>
          <button type="button" onClick={() => navigateTo('toys')}>Toys & Play</button>
          <button type="button" onClick={() => navigateTo('printables')}>Learning Studio</button>
          <button type="button" onClick={() => navigateTo('gifts')}>Gift Finder</button>
          <button type="button" onClick={() => navigateTo('auth')}>My Account</button>
        </div>
      </div>
    </footer>
  );
};
