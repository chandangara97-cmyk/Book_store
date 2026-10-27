import React from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { AuthView } from './views/AuthView';
import { AdminView } from './views/AdminView';
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
      <div style={{ flex: 1 }}>{renderView()}</div>
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
