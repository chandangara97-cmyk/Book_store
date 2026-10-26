import { asset } from '../utils/images';
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CURRENCY_SYMBOLS } from '../data/initialData';
import { 
  Sparkles, 
  BookOpen, 
  Bot, 
  Gift, 
  ShoppingBag, 
  Heart, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ShieldCheck, 
  User as UserIcon,
  Globe,
  Sliders
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    view, 
    setView, 
    cartCount, 
    cartTotal,
    user, 
    setSelectedCategory, 
    theme, 
    toggleTheme,
    currency,
    setCurrency,
    formatPrice,
    wishlist
  } = useStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

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

  const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/85 border-b border-cyan-500/15 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        
        {/* Zone 1: Futuristic Brand Wordmark */}
        <a
          href="#top"
          className="group flex items-center gap-3 shrink-0 focus-visible:outline-none"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('home');
          }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/30 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400/60 transition-all">
            <img 
              src={asset('/img/kiddie-bloom-logo-sm.png')} 
              alt="Kiddie Bloom logo" 
              className="w-7 h-7 object-contain drop-shadow" 
            />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-950 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
              Kiddie<span className="text-cyan-400">Bloom</span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Nexus
              </span>
            </span>
            <span className="text-[11px] text-slate-400 tracking-wider">
              Quantum Learning Studio
            </span>
          </div>
        </a>

        {/* Zone 2: Single-Line Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium" aria-label="Main Navigation">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              view === 'home' 
                ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            onClick={() => navigateTo('home')}
          >
            <span>Overview</span>
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
            onClick={() => scrollToSection('find')}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Age Synthesizer</span>
          </button>

          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              view === 'library' 
                ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            onClick={() => navigateTo('library')}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>All Holo-Books</span>
          </button>

          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              view === 'toys' 
                ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            onClick={() => navigateTo('toys')}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>STEM & Tech Toys</span>
          </button>

          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              view === 'gift-finder' 
                ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            onClick={() => navigateTo('gift-finder')}
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Gift Engine</span>
          </button>
        </nav>

        {/* Zone 3: Interactive Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Currency Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              title="Change Currency"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>{CURRENCY_SYMBOLS[currency] || ''} {currency}</span>
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5">
                <div className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1 tracking-wider border-b border-slate-800">
                  Select Currency
                </div>
                {supportedCurrencies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between transition-colors ${
                      currency === c 
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                    onClick={() => {
                      setCurrency(c);
                      setCurrencyDropdownOpen(false);
                    }}
                  >
                    <span>{c}</span>
                    <span className="text-slate-400">{CURRENCY_SYMBOLS[c]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            className={`relative p-2 rounded-lg border transition-all ${
              view === 'wishlist' 
                ? 'border-pink-500/40 bg-pink-500/10 text-pink-300' 
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-pink-300 hover:border-pink-500/30'
            }`}
            title="Wishlist Vault"
            aria-label="Wishlist"
            onClick={() => navigateTo('wishlist')}
          >
            <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-pink-400 fill-pink-400/30' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            type="button"
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border font-medium text-xs transition-all ${
              cartCount > 0 
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-cyan-500/30'
            }`}
            title="Cart & Teleport Checkout"
            onClick={() => navigateTo('cart')}
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline font-mono">
              {cartCount > 0 ? formatPrice(cartTotal) : 'Cart'}
            </span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[11px] font-black font-mono flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
            title={theme === 'dark' ? 'Switch to Solar Light mode' : 'Switch to Cyber Dark mode'}
            aria-label="Toggle Theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Account / Admin */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Account Hub"
            onClick={() => navigateTo(user?.isAdmin ? 'admin' : 'auth')}
          >
            {user?.isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.name ? user.name.split(' ')[0] : 'Sign in'}</span>
              </>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Cyber Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cyan-500/15 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 hover:border-cyan-500/40"
              onClick={() => navigateTo('home')}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 hover:border-cyan-500/40"
              onClick={() => scrollToSection('find')}
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Age Synthesizer</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 hover:border-cyan-500/40"
              onClick={() => navigateTo('library')}
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Holo-Library</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 hover:border-cyan-500/40"
              onClick={() => navigateTo('toys')}
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>STEM Toys</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 hover:border-cyan-500/40"
              onClick={() => navigateTo('gift-finder')}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Gift Engine</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200 hover:border-cyan-500/40"
              onClick={() => navigateTo(user?.isAdmin ? 'admin' : 'auth')}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{user?.isAdmin ? 'Admin Console' : 'Account'}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Currency:</span>
            <div className="flex gap-1">
              {['INR', 'USD', 'EUR', 'GBP'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    currency === c 
                      ? 'bg-cyan-500 text-slate-950 font-bold' 
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                  onClick={() => setCurrency(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
