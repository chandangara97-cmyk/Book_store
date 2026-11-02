import React, { Suspense, lazy } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
const AuthView = lazy(() => import('./views/AuthView').then(m => ({ default: m.AuthView })));
const AdminView = lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })));
import { LearningView } from './views/LearningView';

export const AppContent: React.FC = () => {
  const { view, toastMessage } = useStore();

  const renderView = () => {
    switch (view) {
      case 'auth':
        return <AuthView />;
      case 'admin':
        return <AdminView />;
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
