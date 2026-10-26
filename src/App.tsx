import React from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { BookDetailModal } from './components/BookDetailModal';
import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { ToysView } from './views/ToysView';
import { GiftFinderView } from './views/GiftFinderView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSummaryView } from './views/OrderSummaryView';
import { WishlistView } from './views/WishlistView';
import { AuthView } from './views/AuthView';
import { AdminView } from './views/AdminView';
import { Sparkles } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { view, selectedBook, setSelectedBook, toastMessage, theme } = useStore();

  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomeView />;
      case 'library':
        return <LibraryView />;
      case 'toys':
        return <ToysView />;
      case 'gift-finder':
        return <GiftFinderView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-summary':
        return <OrderSummaryView />;
      case 'wishlist':
        return <WishlistView />;
      case 'auth':
        return <AuthView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors ${
        theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
      data-theme={theme}
    >
      <Header />
      <div className="flex-1 w-full">{renderView()}</div>
      <Footer />
      <BottomNav />

      {/* Book details modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* Toast popup */}
      {toastMessage && (
        <div className="rn-toast" role="status" aria-live="polite">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
