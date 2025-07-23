import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { productApi, categoryApi } from '../utils/api';
import ProductForm from '../components/ProductForm';
import ProductDetails from '../components/ProductDetails';
import ProductTable from '../components/ProductTable';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Selected product for edit/view/delete
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory, selectedType, showActiveOnly]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [productsData, categoriesData] = await Promise.all([
        productApi.getProducts(),
        categoryApi.getCategories()
      ]);
      console.log('Loaded products data:', productsData);
      console.log('Sample product:', productsData[0]);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      const errorMessage = error.userMessage ||
                          error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.message ||
                          'Error al cargar los datos. Verifica que el servidor esté ejecutándose.';
      setError(errorMessage);
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    if (isLoading) return; // Don't reload during initial load
    
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.type = selectedType;
      if (showActiveOnly) params.is_active = true;

      const data = await productApi.getProducts(params);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const handleDeleteProduct = (product: Product) => {
    console.log('handleDeleteProduct called with product:', product);
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (productData: any) => {
    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        // Update existing product
        const updatedProduct = await productApi.updateProduct(selectedProduct.id, productData);
        setProducts(Array.isArray(products) ? products.map(p => 
          p.id === selectedProduct.id ? updatedProduct : p
        ) : [updatedProduct]);
      } else {
        // Create new product
        const newProduct = await productApi.createProduct(productData);
        setProducts(Array.isArray(products) ? [newProduct, ...products] : [newProduct]);
      }
      setShowForm(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      // Extract detailed error message
      let errorMessage = 'Error al guardar el producto';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for field-specific errors
        if (typeof errorData === 'object') {
          const fieldErrors: string[] = [];
          Object.entries(errorData).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              fieldErrors.push(`${field}: ${errors}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n');
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.userMessage) {
        errorMessage = error.userMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    console.log('confirmDelete called with selectedProduct:', selectedProduct);
    if (!selectedProduct) {
      console.error('No selectedProduct found');
      return;
    }
    
    console.log('selectedProduct.id:', selectedProduct.id);
    if (!selectedProduct.id) {
      console.error('selectedProduct.id is undefined or null');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await productApi.deleteProduct(selectedProduct.id);
      setProducts(Array.isArray(products) ? products.filter(p => p.id !== selectedProduct.id) : []);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Error al eliminar el producto';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate statistics
  const stats = {
    total: Array.isArray(products) ? products.length : 0,
    active: Array.isArray(products) ? products.filter(p => p.is_active).length : 0,
    lowStock: Array.isArray(products) ? products.filter(p => p.is_low_stock && p.type === 'product').length : 0,
    totalValue: Array.isArray(products) ? products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0) : 0
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={loadData}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Productos</h2>
            <p className="text-gray-600">
              Administra tu inventario de productos y servicios
            </p>
          </div>
          <button 
            onClick={handleAddProduct}
            className="bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>📦</span>
            <span>Agregar Producto</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium">Total Productos</div>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium">Activos</div>
            <div className="text-2xl font-bold text-green-900">{stats.active}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-red-600 text-sm font-medium">Stock Bajo</div>
            <div className="text-2xl font-bold text-red-900">{stats.lowStock}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium">Valor Total</div>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(stats.totalValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, SKU o descripción..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="product">Productos</option>
              <option value="service">Servicios</option>
            </select>
          </div>

          {/* Active filter */}
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="activeOnly"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="activeOnly" className="ml-2 block text-sm text-gray-700">
              Solo productos activos
            </label>
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Productos ({Array.isArray(products) ? products.length : 0})
          </h3>
        </div>
        <div className="p-6">
          <ProductTable
            products={Array.isArray(products) ? products : []}
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <ProductForm
          product={selectedProduct || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      {showDetails && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => {
            setShowDetails(false);
            setSelectedProduct(null);
          }}
          onEdit={() => {
            setShowDetails(false);
            setShowForm(true);
          }}
          onDelete={() => {
            setShowDetails(false);
            setShowDeleteDialog(true);
          }}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Eliminar Producto"
          message={`¿Estás seguro de que quieres eliminar el producto "${selectedProduct?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedProduct(null);
          }}
          isLoading={isSubmitting}
          type="danger"
        />
      )}
    </div>
  );
};

export default Products;
