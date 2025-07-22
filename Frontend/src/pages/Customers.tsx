import React from 'react';

const Customers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Clientes</h2>
        <p className="text-gray-600">
          Administra la información de tus clientes, historial de compras y datos de contacto.
        </p>
        <div className="mt-6">
          <button className="btn-primary">
            👤 Agregar Cliente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Clientes</h3>
        <div className="text-gray-500 text-center py-8">
          Los clientes se mostrarán aquí...
        </div>
      </div>
    </div>
  );
};

export default Customers;
