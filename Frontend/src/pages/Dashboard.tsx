import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, you would have dashboard endpoint
      // For now, we'll simulate with placeholder data
      setTimeout(() => {
        setStats({
          totalSales: 150,
          totalCustomers: 45,
          totalProducts: 89,
          lowStockProducts: 5,
          monthlyRevenue: 15750.50,
          monthlyExpenses: 8320.25,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Ventas Totales',
      value: stats.totalSales.toString(),
      icon: '💰',
      color: 'bg-green-500',
    },
    {
      title: 'Clientes',
      value: stats.totalCustomers.toString(),
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: 'Productos',
      value: stats.totalProducts.toString(),
      icon: '📦',
      color: 'bg-purple-500',
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStockProducts.toString(),
      icon: '⚠️',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="metric-card-high-contrast">
            <div className="flex items-center justify-center flex-col">
              <div className="text-4xl mb-3" style={{ 
                color: stat.color === 'bg-green-500' ? '#065f46' : 
                      stat.color === 'bg-blue-500' ? '#1e40af' :
                      stat.color === 'bg-purple-500' ? '#581c87' : '#991b1b'
              }}>
                {stat.icon}
              </div>
              <div className="text-center">
                <p className="metric-value-high-contrast">{stat.value}</p>
                <p className="metric-label-high-contrast">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-high-contrast">
          <h3 className="card-header-high-contrast">Ingresos del Mes</h3>
          <div className="metric-value-high-contrast text-green-600">
            ${stats.monthlyRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <p className="card-content-high-contrast text-sm mt-2">
            +12% respecto al mes anterior
          </p>
        </div>

        <div className="card-high-contrast">
          <h3 className="card-header-high-contrast">Gastos del Mes</h3>
          <div className="metric-value-high-contrast text-red-600">
            ${stats.monthlyExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <p className="card-content-high-contrast text-sm mt-2">
            -5% respecto al mes anterior
          </p>
        </div>
      </div>

      {/* Profit */}
      <div className="card-high-contrast">
        <h3 className="card-header-high-contrast">Ganancia Neta del Mes</h3>
        <div className="metric-value-high-contrast text-primary-600">
          ${(stats.monthlyRevenue - stats.monthlyExpenses).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full" 
            style={{ width: `${((stats.monthlyRevenue - stats.monthlyExpenses) / stats.monthlyRevenue) * 100}%` }}
          ></div>
        </div>
        <p className="card-content-high-contrast text-sm mt-2">
          Margen de ganancia: {(((stats.monthlyRevenue - stats.monthlyExpenses) / stats.monthlyRevenue) * 100).toFixed(1)}%
        </p>
      </div>

      {/* Quick Actions */}
      <div className="card-high-contrast">
        <h3 className="card-header-high-contrast">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/sales')}
            className="btn-high-contrast-primary p-3 rounded-lg text-center"
          >
            📝 Nueva Venta
          </button>
          <button 
            onClick={() => navigate('/customers')}
            className="btn-high-contrast-green p-3 rounded-lg text-center"
          >
            👤 Agregar Cliente
          </button>
          <button 
            onClick={() => navigate('/products')}
            className="btn-high-contrast-blue p-3 rounded-lg text-center"
          >
            📦 Nuevo Producto
          </button>
          <button 
            onClick={() => navigate('/inventory')}
            className="btn-high-contrast-indigo p-3 rounded-lg text-center"
          >
            📋 Gestionar Inventario
          </button>
        </div>
      </div>

      {/* New BI & Analytics Section */}
      <div className="card-high-contrast">
        <h3 className="card-header-high-contrast">Business Intelligence & Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/business-intelligence')}
            className="btn-high-contrast-blue flex flex-col items-center p-4 rounded-lg transition-all"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="font-semibold text-white">BI Dashboard</span>
            <span className="text-xs text-white opacity-90">KPIs e Insights</span>
          </button>
          <button 
            onClick={() => navigate('/dynamic-pricing')}
            className="btn-high-contrast-purple flex flex-col items-center p-4 rounded-lg transition-all"
          >
            <span className="text-2xl mb-2">⚡</span>
            <span className="font-semibold text-white">Pricing Dinámico</span>
            <span className="text-xs text-white opacity-90">Matriz de Costos</span>
          </button>
          <button 
            onClick={() => navigate('/depreciations')}
            className="btn-high-contrast-orange flex flex-col items-center p-4 rounded-lg transition-all"
          >
            <span className="text-2xl mb-2">📉</span>
            <span className="font-semibold text-white">Depreciaciones</span>
            <span className="text-xs text-white opacity-90">Activos Fijos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
