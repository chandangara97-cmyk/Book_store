import React, { Suspense, lazy } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PrintablesHome } from './views/PrintablesHome';
const AuthView = lazy(() => import('./views/AuthView').then(m => ({ default: m.AuthView })));
const AdminView = lazy(() => import('./views/AdminView').then(m => ({ default: m.AdminView })));

export const AppContent: React.FC = () => {
  const { view, toastMessage } = useStore();
  const page = view === 'auth' ? <AuthView /> : view === 'admin' ? <AdminView /> : <PrintablesHome />;
  return <div className="app-shell kb-app-shell">
    <Header />
    <div className="kb-page-content"><Suspense fallback={<div className="kb-loading">Preparing your little world…</div>}>{page}</Suspense></div>
    <Footer />
    {toastMessage && <div className="rn-toast" role="status" aria-live="polite">{toastMessage}</div>}
  </div>;
};
