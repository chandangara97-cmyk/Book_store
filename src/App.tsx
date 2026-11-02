import React from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { AuthView } from './views/AuthView';
import { AdminView } from './views/AdminView';
import { LearningView } from './views/LearningView';
import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { ToysView } from './views/ToysView';
import { GiftFinderView } from './views/GiftFinderView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSummaryView } from './views/OrderSummaryView';
import { WishlistView } from './views/WishlistView';

export const AppContent: React.FC = () => {
  const { view, toastMessage } = useStore();
  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView />;
      case 'learning': case 'library': return <LibraryView />;
      case 'toys': return <ToysView />;
      case 'gift-finder': return <GiftFinderView />;
      case 'wishlist': return <WishlistView />;
      case 'cart': return <CartView />;
      case 'checkout': return <CheckoutView />;
      case 'order-summary': return <OrderSummaryView />;
      case 'library-downloads': return <LibraryView />;
      case 'auth': return <AuthView />;
      case 'admin': return <AdminView />;
      case 'printables': default: return <LearningView />;
    }
  };
  const immersive = view === 'checkout' || view === 'order-summary' || view === 'auth' || view === 'admin';
  return <div className={`app-shell page-${view}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Header />
    <div style={{ flex: 1 }}>{renderView()}</div>
    {!immersive && <Footer />}
    <BottomNav />
    {toastMessage && <div className="rn-toast" role="status" aria-live="polite"><span>{toastMessage}</span></div>}
  </div>;
};
