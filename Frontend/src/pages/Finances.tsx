import React from 'react';

const Finances: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión Financiera</h2>
        <p className="text-gray-600">
          Controla tus ingresos, gastos, presupuestos y mantén un registro detallado de tu flujo de caja.
        </p>
        <div className="mt-6 space-x-4">
          <button className="btn-success">
            💵 Registrar Ingreso
          </button>
          <button className="btn-danger">
            💳 Registrar Gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Recientes</h3>
          <div className="text-gray-500 text-center py-8">
            Los ingresos se mostrarán aquí...
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos Recientes</h3>
          <div className="text-gray-500 text-center py-8">
            Los gastos se mostrarán aquí...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finances;
