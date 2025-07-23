import React from 'react';
import { Customer } from '../types';

interface CustomerDetailsProps {
  customer: Customer;
  onEdit: () => void;
  onClose: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  onEdit,
  onClose
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleString('es-CO');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-600 font-medium text-lg">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                <p className="text-gray-500">
                  {customer.customer_type === 'business' ? 'Empresa' : 'Persona Natural'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              customer.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {customer.is_active ? 'Cliente Activo' : 'Cliente Inactivo'}
            </span>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Información Básica
              </h3>
              
              {customer.document_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Número de Documento
                  </label>
                  <p className="text-gray-900">{customer.document_number}</p>
                </div>
              )}

              {customer.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">
                    <a href={`mailto:${customer.email}`} className="text-blue-600 hover:text-blue-800">
                      {customer.email}
                    </a>
                  </p>
                </div>
              )}

              {customer.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Teléfono
                  </label>
                  <p className="text-gray-900">
                    <a href={`tel:${customer.phone}`} className="text-blue-600 hover:text-blue-800">
                      {customer.phone}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Dirección
              </h3>
              
              {customer.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Dirección
                  </label>
                  <p className="text-gray-900">{customer.address}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {customer.city && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Ciudad
                    </label>
                    <p className="text-gray-900">{customer.city}</p>
                  </div>
                )}

                {customer.state && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Estado/Región
                    </label>
                    <p className="text-gray-900">{customer.state}</p>
                  </div>
                )}
              </div>

              {customer.postal_code && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Código Postal
                  </label>
                  <p className="text-gray-900">{customer.postal_code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
              Resumen de Compras
            </h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">Total de Compras:</span>
                <span className="text-blue-900 text-xl font-bold">
                  {formatCurrency(customer.total_purchases)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                Notas
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
              Información de Registro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <label className="block font-medium">Creado:</label>
                <p>{customer.created_at ? formatDate(customer.created_at) : 'N/A'}</p>
              </div>
              <div>
                <label className="block font-medium">Última actualización:</label>
                <p>{customer.updated_at ? formatDate(customer.updated_at) : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cerrar
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Editar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
