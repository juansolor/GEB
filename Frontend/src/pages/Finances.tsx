import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  FinancialStatistics, 
  TransactionCreateData,
  transactionApi 
} from '../utils/financesApi';
import TransactionForm from '../components/TransactionForm';

const Finances: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<FinancialStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState<'income' | 'expense' | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsResponse, statisticsResponse] = await Promise.all([
        transactionApi.getRecent(20),
        transactionApi.getStatistics()
      ]);
      
      setTransactions(transactionsResponse.data);
      setStatistics(statisticsResponse.data);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (data: TransactionCreateData) => {
    try {
      await transactionApi.create(data);
      await loadData();
      setShowForm(null);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await transactionApi.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error al eliminar la transacción');
      }
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.transaction_type === filter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión Financiera</h2>
        <p className="text-gray-600">
          Controla tus ingresos, gastos, presupuestos y mantén un registro detallado de tu flujo de caja.
        </p>
        <div className="mt-6 space-x-4">
          <button 
            onClick={() => setShowForm('income')}
            className="btn-success"
          >
            💵 Registrar Ingreso
          </button>
          <button 
            onClick={() => setShowForm('expense')}
            className="btn-danger"
          >
            💳 Registrar Gasto
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(statistics.current_month.income)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">💳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gastos del Mes</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(statistics.current_month.expenses)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  statistics.current_month.balance >= 0 ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  <span className={statistics.current_month.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}>
                    📊
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Balance del Mes</p>
                <p className={`text-2xl font-bold ${
                  statistics.current_month.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'
                }`}>
                  {formatCurrency(statistics.current_month.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'income'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setFilter('expense')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'expense'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Gastos
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando transacciones...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No hay transacciones para mostrar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.transaction_type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.transaction_type === 'income' ? '💵 Ingreso' : '💳 Gasto'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                      {transaction.category_name && (
                        <div className="text-sm text-gray-500">{transaction.category_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.payment_method === 'cash' && '💵 Efectivo'}
                      {transaction.payment_method === 'card' && '💳 Tarjeta'}
                      {transaction.payment_method === 'transfer' && '🏦 Transferencia'}
                      {transaction.payment_method === 'check' && '📝 Cheque'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          type={showForm}
          onSubmit={handleCreateTransaction}
          onClose={() => setShowForm(null)}
        />
      )}
    </div>
  );
};

export default Finances;
