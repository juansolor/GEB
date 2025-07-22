import React from 'react';

const Products: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Productos</h2>
        <p className="text-gray-600">
          Aquí podrás gestionar todos tus productos y servicios, controlar el inventario, 
          precios y categorías.
        </p>
        <div className="mt-6">
          <button className="btn-primary">
            📦 Agregar Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Productos</h3>
        <div className="text-gray-500 text-center py-8">
          Los productos se mostrarán aquí...
        </div>
      </div>
    </div>
  );
};

export default Products;
