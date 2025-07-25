import React, { useState, useEffect } from 'react';
import { Sale } from '../types';
import { salesApi, SaleCreateData } from '../utils/salesApi';
import SaleForm from '../components/SaleForm';

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statistics, setStatistics] = useState({
    total_sales: 0,
    total_revenue: 0,
    pending_sales: 0,
    completed_sales: 0,
    monthly_sales: 0,
    monthly_revenue: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesResponse, statsResponse] = await Promise.all([
        salesApi.getSales(),
        salesApi.getStatistics()
      ]);
      
      setSales(salesResponse.results);
      setStatistics(statsResponse);
    } catch (error: any) {
      console.error('Error loading sales:', error);
      alert(error.userMessage || 'Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = async (saleData: SaleCreateData) => {
    try {
      setIsSubmitting(true);
      await salesApi.createSale(saleData);
      setShowForm(false);
      loadData(); // Reload data
      alert('Venta creada exitosamente');
    } catch (error: any) {
      console.error('Error creating sale:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.userMessage ||
                          'Error al crear la venta';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSale = async (saleId: number) => {
    if (!window.confirm('¿Confirmar que deseas marcar esta venta como completada?')) {
      return;
    }
    
    try {
      await salesApi.completeSale(saleId);
      loadData();
      alert('Venta marcada como completada');
    } catch (error: any) {
      console.error('Error completing sale:', error);
      alert(error.response?.data?.error || 'Error al completar la venta');
    }
  };

  const handleCancelSale = async (saleId: number) => {
    if (!window.confirm('¿Confirmar que deseas cancelar esta venta? Se restaurará el stock de productos.')) {
      return;
    }
    
    try {
      await salesApi.cancelSale(saleId);
      loadData();
      alert('Venta cancelada y stock restaurado');
    } catch (error: any) {
      console.error('Error cancelling sale:', error);
      alert(error.response?.data?.error || 'Error al cancelar la venta');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      credit: 'Crédito'
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando ventas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Ventas</h2>
            <p className="text-gray-600">
              Registra nuevas ventas, consulta el historial y gestiona los pagos de tus clientes.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>💰</span>
            <span>Nueva Venta</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium">Total Ventas</div>
            <div className="text-blue-900 text-2xl font-bold">{statistics.total_sales}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium">Ingresos Totales</div>
            <div className="text-green-900 text-xl font-bold">{formatCurrency(statistics.total_revenue)}</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-yellow-600 text-sm font-medium">Pendientes</div>
            <div className="text-yellow-900 text-2xl font-bold">{statistics.pending_sales}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium">Completadas</div>
            <div className="text-purple-900 text-2xl font-bold">{statistics.completed_sales}</div>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-indigo-600 text-sm font-medium">Ventas del Mes</div>
            <div className="text-indigo-900 text-2xl font-bold">{statistics.monthly_sales}</div>
          </div>
          
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="text-teal-600 text-sm font-medium">Ingresos del Mes</div>
            <div className="text-teal-900 text-xl font-bold">{formatCurrency(statistics.monthly_revenue)}</div>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Ventas</h3>
        
        {sales.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No hay ventas registradas</div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Crear primera venta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.sale_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.customer_name || 'Sin cliente'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(sale.sale_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPaymentMethodLabel(sale.payment_method)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(sale.total_amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {sale.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleCompleteSale(sale.id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Completar venta"
                            >
                              ✅
                            </button>
                            <button
                              onClick={() => handleCancelSale(sale.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Cancelar venta"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Form Modal */}
      {showForm && (
        <SaleForm
          onSubmit={handleCreateSale}
          onCancel={() => setShowForm(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default Sales;
