import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Users: React.FC = () => {
  const { user } = useAuth();

  // Only admin can access this page
  if (user?.role !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-red-600 text-lg">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Usuarios</h2>
        <p className="text-gray-600">
          Administra los usuarios del sistema, roles y permisos de acceso.
        </p>
        <div className="mt-6">
          <button className="btn-primary">
            👤 Crear Usuario
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Usuarios</h3>
        <div className="text-gray-500 text-center py-8">
          Los usuarios se mostrarán aquí...
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Roles y Permisos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">Administrador</h4>
            <p className="text-sm text-gray-600 mt-2">
              Acceso completo a todas las funciones del sistema.
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">Gerente</h4>
            <p className="text-sm text-gray-600 mt-2">
              Acceso a reportes y gestión de ventas, productos y clientes.
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">Empleado</h4>
            <p className="text-sm text-gray-600 mt-2">
              Acceso básico para registrar ventas y consultar información.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
