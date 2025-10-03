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
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-full p-3 text-black text-2xl`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="stat-label text-sm">{stat.title}</p>
                <p className="stat-value text-2xl">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="card-title text-lg mb-4">Ingresos del Mes</h3>
          <div className="text-3xl font-bold text-green-600">
            ${stats.monthlyRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <p className="card-text text-sm mt-2">
            +12% respecto al mes anterior
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="card-title text-lg mb-4">Gastos del Mes</h3>
          <div className="text-3xl font-bold text-red-600">
            ${stats.monthlyExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <p className="card-text text-sm mt-2">
            -5% respecto al mes anterior
          </p>
        </div>
      </div>

      {/* Profit */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="card-title text-lg mb-4">Ganancia Neta del Mes</h3>
        <div className="text-4xl font-bold text-primary-600">
          ${(stats.monthlyRevenue - stats.monthlyExpenses).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full" 
            style={{ width: `${((stats.monthlyRevenue - stats.monthlyExpenses) / stats.monthlyRevenue) * 100}%` }}
          ></div>
        </div>
        <p className="card-text text-sm mt-2">
          Margen de ganancia: {(((stats.monthlyRevenue - stats.monthlyExpenses) / stats.monthlyRevenue) * 100).toFixed(1)}%
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="card-title text-lg mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/sales')}
            className="btn-primary"
          >
            📝 Nueva Venta
          </button>
          <button 
            onClick={() => navigate('/customers')}
            className="btn-secondary"
          >
            👤 Agregar Cliente
          </button>
          <button 
            onClick={() => navigate('/products')}
            className="btn-secondary"
          >
            📦 Nuevo Producto
          </button>
          <button 
            onClick={() => navigate('/inventory')}
            className="btn-secondary"
          >
            📋 Gestionar Inventario
          </button>
        </div>
      </div>

      {/* New BI & Analytics Section */}
      <div className="card">
        <h3 className="card-title text-lg mb-4">Business Intelligence & Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/business-intelligence')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="font-semibold">BI Dashboard</span>
            <span className="text-xs opacity-90">KPIs e Insights</span>
          </button>
          <button 
            onClick={() => navigate('/dynamic-pricing')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
          >
            <span className="text-2xl mb-2">⚡</span>
            <span className="font-semibold">Pricing Dinámico</span>
            <span className="text-xs opacity-90">Matriz de Costos</span>
          </button>
          <button 
            onClick={() => navigate('/depreciations')}
            className="flex flex-col items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <span className="text-2xl mb-2">📉</span>
            <span className="font-semibold">Depreciaciones</span>
            <span className="text-xs opacity-90">Activos Fijos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
