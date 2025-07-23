import React from 'react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onClose,
  onEdit,
  onDelete
}) => {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Detalles del Producto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Imagen */}
          {product.image && (
            <div className="col-span-1 md:col-span-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Información Básica
              </h3>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Nombre:</span>
                  <p className="text-gray-900">{product.name}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Tipo:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    product.type === 'product' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.type === 'product' ? 'Producto' : 'Servicio'}
                  </span>
                </div>

                {product.sku && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">SKU:</span>
                    <p className="text-gray-900 font-mono">{product.sku}</p>
                  </div>
                )}

                {product.category_name && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Categoría:</span>
                    <p className="text-gray-900">{product.category_name}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {product.description && (
              <div>
                <span className="text-sm font-medium text-gray-700">Descripción:</span>
                <p className="text-gray-900 mt-1">{product.description}</p>
              </div>
            )}
          </div>

          {/* Información financiera y stock */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Información Financiera
              </h3>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Precio:</span>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Costo:</span>
                  <p className="text-gray-900">{formatCurrency(product.cost)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Margen de ganancia:</span>
                  <p className={`font-semibold ${
                    product.profit_margin > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.profit_margin.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            {product.type === 'product' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Inventario
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Stock actual:</span>
                    <p className={`text-lg font-bold ${
                      product.is_low_stock ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {product.stock_quantity} unidades
                      {product.is_low_stock && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Stock bajo
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Nivel mínimo:</span>
                    <p className="text-gray-900">{product.min_stock_level} unidades</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fechas
              </h3>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Creado:</span>
                  <p className="text-gray-900 text-sm">{formatDate(product.created_at)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Actualizado:</span>
                  <p className="text-gray-900 text-sm">{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onDelete}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
          >
            🗑️ Eliminar
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700"
          >
            ✏️ Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
