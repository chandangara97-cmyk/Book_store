import React, { Suspense, lazy } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { BookDetailModal } from './components/BookDetailModal';
import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { ToysView } from './views/ToysView';
import { LearningView } from './views/LearningView';
import { GiftFinderView } from './views/GiftFinderView';
import { CartView } from './views/CartView';
import { WishlistView } from './views/WishlistView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSummaryView } from './views/OrderSummaryView';
const AuthView = lazy(() => import('./views/AuthView').then(m => ({ default: m.AuthView })));
const AdminView = lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })));

export const AppContent: React.FC = () => {
  const { view, toastMessage, selectedBook, setSelectedBook } = useStore();
  const pages: Record<string, React.ReactNode> = {
    home: <HomeView />, library: <LibraryView />, books: <LibraryView />,
    toys: <ToysView />, printables: <LearningView />, learning: <LearningView />,
    gifts: <GiftFinderView />, 'gift-finder': <GiftFinderView />,
    cart: <CartView />, wishlist: <WishlistView />, checkout: <CheckoutView />,
    'order-summary': <OrderSummaryView />,
  };
  const page = view === 'auth' ? <AuthView /> : view === 'admin' ? <AdminView /> : (pages[view] || <HomeView />);
  const minimal = view === 'checkout' || view === 'order-summary';
  return <div className="app-shell kb-app-shell">
    <Header />
    <div className="kb-page-content"><Suspense fallback={<div className="kb-loading">Preparing your little world…</div>}>{page}</Suspense></div>
    {!minimal && <Footer />}
    {!minimal && <BottomNav />}
    {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    {toastMessage && <div className="rn-toast" role="status" aria-live="polite">{toastMessage}</div>}
  </div>;
};
