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

export const AppContent: React.FC = () => {
  const { view, selectedBook, setSelectedBook, toastMessage } = useStore();

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
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1 }}>{renderView()}</div>
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
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
