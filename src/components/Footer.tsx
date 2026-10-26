import { asset } from '../utils/images';
import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookOpen, Bot, Gift, Heart, ShoppingBag, ShieldCheck, User } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setView, setSelectedCategory, user } = useStore();

  const navigateTo = (newView: string, category: string = 'all') => {
    setSelectedCategory(category);
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/90 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/30 flex items-center justify-center">
            <img src={asset('/img/kiddie-bloom-logo-sm.png')} alt="Kiddie Bloom" className="w-5 h-5 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white font-display">
              Kiddie<span className="text-cyan-400">Bloom</span> Studio
            </span>
            <span className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Kiddie Bloom. All rights reserved.
            </span>
          </div>
        </div>

        {/* Clean Link Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
          <button 
            type="button" 
            onClick={() => navigateTo('library', 'all')}
            className="hover:text-cyan-400 transition-colors"
          >
            All Books
          </button>
          <button 
            type="button" 
            onClick={() => navigateTo('toys')}
            className="hover:text-cyan-400 transition-colors"
          >
            STEM Toys
          </button>
          <button 
            type="button" 
            onClick={() => navigateTo('gift-finder')}
            className="hover:text-cyan-400 transition-colors"
          >
            Gift Finder
          </button>
          <button 
            type="button" 
            onClick={() => navigateTo('wishlist')}
            className="hover:text-cyan-400 transition-colors"
          >
            Wishlist
          </button>
          <button 
            type="button" 
            onClick={() => navigateTo('cart')}
            className="hover:text-cyan-400 transition-colors"
          >
            Cart
          </button>
          <button 
            type="button" 
            onClick={() => navigateTo('auth')}
            className="hover:text-cyan-400 transition-colors"
          >
            Account
          </button>
          <button 
            type="button" 
            onClick={() => navigateTo('admin')}
            className="hover:text-cyan-400 transition-colors"
          >
            {user?.isAdmin ? 'Studio Admin' : 'Admin'}
          </button>
        </div>

      </div>
    </footer>
  );
};
