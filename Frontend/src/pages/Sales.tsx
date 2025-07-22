import React from 'react';

const Sales: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Ventas</h2>
        <p className="text-gray-600">
          Registra nuevas ventas, consulta el historial y gestiona los pagos de tus clientes.
        </p>
        <div className="mt-6">
          <button className="btn-primary">
            💰 Nueva Venta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Ventas</h3>
        <div className="text-gray-500 text-center py-8">
          Las ventas se mostrarán aquí...
        </div>
      </div>
    </div>
  );
};

export default Sales;
