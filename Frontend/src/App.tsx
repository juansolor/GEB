import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Finances from './pages/Finances';
import Depreciations from './pages/Depreciations';
import Reports from './pages/Reports';
import Users from './pages/Users';
import PricingAnalysis from './pages/PricingAnalysis';
import PricingAnalysisDetail from './pages/PricingAnalysisDetail';
import Resources from './pages/Resources';
import MarketingAnalytics from './pages/MarketingAnalytics';
import BusinessIntelligenceDashboard from './components/BusinessIntelligenceDashboard';
import DynamicPricingMatrix from './components/DynamicPricingMatrix';
import Layout from './components/Layout';
import PWAInstallButton, { OfflineIndicator } from './components/PWAInstallButton';
import { pwaManager } from './utils/pwa';
import './App.css';

function App() {
  // Initialize PWA on app load
  useEffect(() => {
    console.log('🚀 GEB PWA initialized');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* PWA Install Banner */}
          <PWAInstallButton variant="banner" />
          
          {/* Offline Indicator */}
          <OfflineIndicator />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Inventory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Customers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/finances"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Finances />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/depreciations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Depreciations />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/business-intelligence"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BusinessIntelligenceDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dynamic-pricing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DynamicPricingMatrix />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricing-analysis"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PricingAnalysis />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricing-analysis/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PricingAnalysisDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketing-analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MarketingAnalytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Resources />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
