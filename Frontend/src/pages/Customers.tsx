import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { customerApi } from '../utils/api';
import CustomerForm from '../components/CustomerForm';
import CustomerTable from '../components/CustomerTable';
import CustomerDetails from '../components/CustomerDetails';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  
  // Form state
  const [formLoading, setFormLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'individual' | 'business'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Statistics
  const [statistics, setStatistics] = useState({
    total_customers: 0,
    active_customers: 0,
    inactive_customers: 0,
    individual_customers: 0,
    business_customers: 0
  });

  // Load customers and statistics
  useEffect(() => {
    loadCustomers();
    loadStatistics();
  }, []);

  // Filter customers when search term or filters change
  useEffect(() => {
    filterCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, searchTerm, customerTypeFilter, statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getCustomers();
      setCustomers(data.results || data);
      setError(null);
    } catch (err: any) {
      setError(err.userMessage || 'Error al cargar los clientes');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await customerApi.getCustomerStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.document_number && customer.document_number.includes(searchTerm))
      );
    }

    // Customer type filter
    if (customerTypeFilter !== 'all') {
      filtered = filtered.filter(customer => customer.customer_type === customerTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(customer => customer.is_active === isActive);
    }

    setFilteredCustomers(filtered);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
    setShowDetails(false);
  };

  // const handleViewCustomer = (customer: Customer) => {
  //   setSelectedCustomer(customer);
  //   setShowDetails(true);
  // };

  const handleDeleteCustomer = (customerId: number) => {
    setCustomerToDelete(customerId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await customerApi.deleteCustomer(customerToDelete);
      await loadCustomers();
      await loadStatistics();
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
    } catch (err: any) {
      setError(err.userMessage || 'Error al eliminar el cliente');
    }
  };

  const handleToggleActive = async (customerId: number) => {
    try {
      await customerApi.toggleCustomerActive(customerId);
      await loadCustomers();
      await loadStatistics();
    } catch (err: any) {
      setError(err.userMessage || 'Error al cambiar el estado del cliente');
    }
  };

  const handleFormSubmit = async (customerData: Omit<Customer, 'id' | 'total_purchases' | 'created_at' | 'updated_at'>) => {
    try {
      setFormLoading(true);
      
      if (selectedCustomer) {
        await customerApi.updateCustomer(selectedCustomer.id, customerData);
      } else {
        await customerApi.createCustomer(customerData);
      }
      
      await loadCustomers();
      await loadStatistics();
      setShowForm(false);
      setSelectedCustomer(null);
    } catch (err: any) {
      setError(err.userMessage || `Error al ${selectedCustomer ? 'actualizar' : 'crear'} el cliente`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedCustomer(null);
  };

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('es-CO', {
  //     style: 'currency',
  //     currency: 'COP'
  //   }).format(amount);
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando clientes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => setError(null)} 
        />
      )}

      {/* Header and Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
            <p className="text-gray-600">
              Administra la información de tus clientes, historial de compras y datos de contacto.
            </p>
          </div>
          <button 
            onClick={handleAddCustomer}
            className="btn-primary flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Cliente
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium">Total Clientes</div>
            <div className="text-blue-900 text-2xl font-bold">{statistics.total_customers}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium">Activos</div>
            <div className="text-green-900 text-2xl font-bold">{statistics.active_customers}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-red-600 text-sm font-medium">Inactivos</div>
            <div className="text-red-900 text-2xl font-bold">{statistics.inactive_customers}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium">Empresas</div>
            <div className="text-purple-900 text-2xl font-bold">{statistics.business_customers}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-orange-600 text-sm font-medium">Personas</div>
            <div className="text-orange-900 text-2xl font-bold">{statistics.individual_customers}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Cliente
            </label>
            <input
              type="text"
              placeholder="Nombre, email, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Customer Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cliente
            </label>
            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="individual">Persona Natural</option>
              <option value="business">Empresa</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Mostrando {filteredCustomers.length} de {customers.length} clientes
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <CustomerTable
        customers={filteredCustomers}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onToggleActive={handleToggleActive}
        isLoading={loading}
      />

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={selectedCustomer}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={formLoading}
        />
      )}

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          onEdit={() => handleEditCustomer(selectedCustomer)}
          onClose={() => setShowDetails(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Eliminar Cliente"
          message="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          type="danger"
        />
      )}
    </div>
  );
};

export default Customers;
