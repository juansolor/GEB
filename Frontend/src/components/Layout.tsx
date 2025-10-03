import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Productos', path: '/products', icon: '📦' },
    { name: 'Inventario', path: '/inventory', icon: '📋' },
    { name: 'Clientes', path: '/customers', icon: '👥' },
    { name: 'Ventas', path: '/sales', icon: '💰' },
    { name: 'Finanzas', path: '/finances', icon: '💳' },
    { name: 'Depreciaciones', path: '/depreciations', icon: '📉' },
    { name: 'Recursos', path: '/resources', icon: '🧱' },
    { name: 'Análisis de Precios', path: '/pricing-analysis', icon: '📋' },
    { name: 'BI Dashboard', path: '/business-intelligence', icon: '📊' },
    { name: 'Pricing Dinámico', path: '/dynamic-pricing', icon: '⚡' },
    { name: 'Marketing Analytics', path: '/marketing-analytics', icon: '🎯' },
    { name: 'Reportes', path: '/reports', icon: '📈' },
    ...(user?.role === 'admin' ? [{ name: 'Usuarios', path: '/users', icon: '⚙️' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} sidebar-container transition-all duration-300`}>
        <div className="sidebar-header">
          <div className="flex items-center justify-between">
            <h1 className={`sidebar-brand ${!sidebarOpen && 'hidden'}`}>
              GEB
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sidebar-toggle"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link flex items-center px-4 py-3 transition-colors ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="main-header">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="header-title">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
            
            <div className="flex items-center space-x-4">
              <span className="user-info text-sm">
                Bienvenido, {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="logout-btn px-4 py-2 rounded-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
