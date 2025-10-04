import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
// Mantener Login y Register estáticos para carga inicial rápida
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy loaded pages / heavy components (code splitting)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Customers = lazy(() => import('./pages/Customers'));
const Sales = lazy(() => import('./pages/Sales'));
const Finances = lazy(() => import('./pages/Finances'));
const Depreciations = lazy(() => import('./pages/Depreciations'));
const Reports = lazy(() => import('./pages/Reports'));
const Users = lazy(() => import('./pages/Users'));
const PricingAnalysis = lazy(() => import('./pages/PricingAnalysis'));
const PricingAnalysisDetail = lazy(() => import('./pages/PricingAnalysisDetail'));
const Resources = lazy(() => import('./pages/Resources'));
const MarketingAnalytics = lazy(() => import('./pages/MarketingAnalytics'));
const BusinessIntelligenceDashboard = lazy(() => import('./components/BusinessIntelligenceDashboard'));
const DynamicPricingMatrix = lazy(() => import('./components/DynamicPricingMatrix'));
import PWAInstallButton, { OfflineIndicator } from './components/PWAInstallButton';
import { pwaManager } from './utils/pwa';
import './App.css';

function App() {
  // Initialize PWA on app load
  useEffect(() => {
    console.log('🚀 GEB PWA initialized');
  }, []);

  const fallback = (
    <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-live="polite">
      <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mr-4" />
      <span className="text-sm font-medium text-primary-600">Cargando módulo…</span>
    </div>
  );

  const withLayout = (Component: React.ReactNode) => (
    <ProtectedRoute>
      <Layout>{Component}</Layout>
    </ProtectedRoute>
  );

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <PWAInstallButton variant="banner" />
          <OfflineIndicator />
          <Suspense fallback={fallback}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={withLayout(<Dashboard />)} />
              <Route path="/products" element={withLayout(<Products />)} />
              <Route path="/inventory" element={withLayout(<Inventory />)} />
              <Route path="/customers" element={withLayout(<Customers />)} />
              <Route path="/sales" element={withLayout(<Sales />)} />
              <Route path="/finances" element={withLayout(<Finances />)} />
              <Route path="/depreciations" element={withLayout(<Depreciations />)} />
              <Route path="/business-intelligence" element={withLayout(<BusinessIntelligenceDashboard />)} />
              <Route path="/dynamic-pricing" element={withLayout(<DynamicPricingMatrix />)} />
              <Route path="/reports" element={withLayout(<Reports />)} />
              <Route path="/users" element={withLayout(<Users />)} />
              <Route path="/pricing-analysis" element={withLayout(<PricingAnalysis />)} />
              <Route path="/pricing-analysis/:id" element={withLayout(<PricingAnalysisDetail />)} />
              <Route path="/marketing-analytics" element={withLayout(<MarketingAnalytics />)} />
              <Route path="/resources" element={withLayout(<Resources />)} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
