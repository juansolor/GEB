import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reportes y Análisis</h2>
        <p className="text-gray-600">
          Genera reportes detallados de ventas, inventario, finanzas y rendimiento del negocio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Reporte de Ventas</h3>
          <p className="text-gray-600 mb-4">Analiza el rendimiento de ventas por período.</p>
          <button className="btn-primary w-full">Generar Reporte</button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Reporte de Inventario</h3>
          <p className="text-gray-600 mb-4">Estado actual del inventario y movimientos.</p>
          <button className="btn-primary w-full">Generar Reporte</button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Reporte Financiero</h3>
          <p className="text-gray-600 mb-4">Ingresos, gastos y rentabilidad del negocio.</p>
          <button className="btn-primary w-full">Generar Reporte</button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Reporte de Clientes</h3>
          <p className="text-gray-600 mb-4">Análisis de comportamiento de clientes.</p>
          <button className="btn-primary w-full">Generar Reporte</button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Reporte de Tendencias</h3>
          <p className="text-gray-600 mb-4">Tendencias de ventas y productos más vendidos.</p>
          <button className="btn-primary w-full">Generar Reporte</button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Reporte Personalizado</h3>
          <p className="text-gray-600 mb-4">Crea reportes con criterios específicos.</p>
          <button className="btn-secondary w-full">Personalizar</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
