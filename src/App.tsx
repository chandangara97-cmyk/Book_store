import React, { Suspense, lazy } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
const AuthView = lazy(() => import('./views/AuthView').then(m => ({ default: m.AuthView })));
const AdminView = lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })));
import { LearningView } from './views/LearningView';
import { HomeView } from './views/HomeView';
import { ToysView } from './views/ToysView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSummaryView } from './views/OrderSummaryView';
import { WishlistView } from './views/WishlistView';
import { GiftFinderView } from './views/GiftFinderView';
import { LibraryView as BooksView } from './views/LibraryView';

export const AppContent: React.FC = () => {
  const { view, toastMessage } = useStore();

  const renderView = () => {
    switch (view) {
      case 'auth':
        return <AuthView />;
      case 'admin':
        return <AdminView />;
      case 'home':
        return <HomeView />;
      case 'library':
        return <BooksView />;
      case 'toys':
        return <ToysView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-summary':
        return <OrderSummaryView />;
      case 'wishlist':
        return <WishlistView />;
      case 'gifts':
        return <GiftFinderView />;
      case 'printables':
      default:
        return <LearningView />;
    }
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1 }}><Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>}>{renderView()}</Suspense></div>
      <Footer />
      <BottomNav />

      {/* Toast popup */}
      {toastMessage && (
        <div className="rn-toast" role="status" aria-live="polite">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
