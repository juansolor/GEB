import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { categoryApi } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

interface ProductFormProps {
  product?: Product;
  onSubmit: (productData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'product' as 'product' | 'service',
    category: '',
    categoryName: '', // New field for category name
    sku: '',
    price: '',
    cost: '',
    stock_quantity: '',
    min_stock_level: '',
    is_active: true,
    image: null as File | null
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await categoryApi.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();

    // Si estamos editando, llenar el formulario
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category?.toString() || '',
        categoryName: product.category_name || '',
        sku: product.sku,
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock_quantity: product.stock_quantity.toString(),
        min_stock_level: product.min_stock_level.toString(),
        is_active: product.is_active,
        image: null
      });

      // If editing and has category, set to select mode, otherwise create mode
      setIsCreatingCategory(!product.category);

      if (product.image) {
        setImagePreview(product.image);
      }
    } else {
      // For new products, default to create category mode
      setIsCreatingCategory(true);
    }
  }, [product]);

  const createNewCategory = async (categoryName: string) => {
    try {
      // First check if category already exists
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === categoryName.trim().toLowerCase()
      );
      
      if (existingCategory) {
        console.log('Category already exists, using existing:', existingCategory);
        return existingCategory;
      }
      
      // Create new category if it doesn't exist
      const newCategory = await categoryApi.createCategory({
        name: categoryName.trim(),
        description: ''
      });
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Preview de imagen
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryModeChange = (isCreating: boolean) => {
    setIsCreatingCategory(isCreating);
    // Clear category fields when switching modes
    setFormData(prev => ({
      ...prev,
      category: '',
      categoryName: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      is_active: formData.is_active
    };

    try {
      // Handle category creation or selection
      if (isCreatingCategory && formData.categoryName.trim()) {
        // Create new category
        const newCategory = await createNewCategory(formData.categoryName);
        submitData.category = newCategory.id;
      } else if (!isCreatingCategory && formData.category && formData.category !== '') {
        // Use existing category
        submitData.category = parseInt(formData.category);
      } else if (isCreatingCategory && !formData.categoryName.trim()) {
        alert('Por favor ingresa el nombre de la nueva categoría');
        return;
      }
      // Note: Category is optional, so we don't require it if neither mode is selected

      // Only add SKU if it's not empty
      if (formData.sku && formData.sku.trim() !== '') {
        submitData.sku = formData.sku.trim();
      }

      // Validate and add price (required)
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        alert('El precio debe ser un número válido mayor o igual a 0');
        return;
      }
      submitData.price = price;

      // Validate and add cost
      const cost = formData.cost ? parseFloat(formData.cost) : 0;
      if (isNaN(cost) || cost < 0) {
        alert('El costo debe ser un número válido mayor o igual a 0');
        return;
      }
      submitData.cost = cost;

      // Add stock fields only for products
      if (formData.type === 'product') {
        const stockQuantity = formData.stock_quantity ? parseInt(formData.stock_quantity) : 0;
        const minStockLevel = formData.min_stock_level ? parseInt(formData.min_stock_level) : 0;
        
        if (isNaN(stockQuantity) || stockQuantity < 0) {
          alert('La cantidad en stock debe ser un número válido mayor o igual a 0');
          return;
        }
        
        if (isNaN(minStockLevel) || minStockLevel < 0) {
          alert('El nivel mínimo de stock debe ser un número válido mayor o igual a 0');
          return;
        }
        
        submitData.stock_quantity = stockQuantity;
        submitData.min_stock_level = minStockLevel;
      } else {
        // For services, set stock fields to 0
        submitData.stock_quantity = 0;
        submitData.min_stock_level = 0;
      }

      // Add image if present
      if (formData.image) {
        submitData.image = formData.image;
      }

      console.log('Submitting product data:', submitData);
      onSubmit(submitData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.message ||
                          'Error al procesar la categoría';
      alert(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="product">Producto</option>
                <option value="service">Servicio</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <div className="space-y-2">
                {/* Toggle buttons */}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryModeChange(false)}
                    className={`px-3 py-1 text-xs rounded ${
                      !isCreatingCategory 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    Seleccionar existente
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryModeChange(true)}
                    className={`px-3 py-1 text-xs rounded ${
                      isCreatingCategory 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    Crear nueva
                  </button>
                </div>

                {/* Category input/select */}
                {isCreatingCategory ? (
                  <input
                    type="text"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleChange}
                    placeholder="Nombre de la nueva categoría"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={categoriesLoading}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">
                        {categoriesLoading ? 'Cargando categorías...' : 'Seleccionar categoría'}
                      </option>
                      {Array.isArray(categories) && categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categoriesLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                )}
                
                {isCreatingCategory && (
                  <p className="text-xs text-green-600">
                    💡 Se creará una nueva categoría automáticamente
                  </p>
                )}
              </div>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Costo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock (solo para productos) */}
            {formData.type === 'product' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad en Stock
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel Mínimo de Stock
                  </label>
                  <input
                    type="number"
                    name="min_stock_level"
                    value={formData.min_stock_level}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen
            </label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Estado activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Producto activo
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
