import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import InstallPWA from './components/InstallPWA';
import OfflineBanner from './components/OfflineBanner';
import PrivateRoute from './components/PrivateRoute';

// Páginas carregadas imediatamente (críticas)
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas com lazy loading (não críticas)
const Expenses = lazy(() => import('./pages/Expenses'));
const Income = lazy(() => import('./pages/Income'));
const Debts = lazy(() => import('./pages/Debts'));
const Goals = lazy(() => import('./pages/Goals'));
const Reports = lazy(() => import('./pages/Reports'));
const Insights = lazy(() => import('./pages/Insights'));
const Categories = lazy(() => import('./pages/Categories'));
const Settings = lazy(() => import('./pages/Settings'));
const Import = lazy(() => import('./pages/Import'));
const RecategorizeExpenses = lazy(() => import('./pages/RecategorizeExpenses'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
    </div>
  </div>
);

// Componente com page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const isMobile = window.innerWidth < 768; // Breakpoint md do Tailwind

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={isMobile ? { opacity: 0, y: 20 } : false}
        animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1 }}
        exit={isMobile ? { opacity: 0, y: -20 } : false}
        transition={{ duration: isMobile ? 0.2 : 0 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/income"
            element={
              <PrivateRoute>
                <Income />
              </PrivateRoute>
            }
          />
          <Route
            path="/debts"
            element={
              <PrivateRoute>
                <Debts />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <Goals />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />
          <Route
            path="/import"
            element={
              <PrivateRoute>
                <Import />
              </PrivateRoute>
            }
          />
          <Route
            path="/recategorize"
            element={
              <PrivateRoute>
                <RecategorizeExpenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationSettings />
              </PrivateRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <PrivateRoute>
                <Insights />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
      <InstallPWA />
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
