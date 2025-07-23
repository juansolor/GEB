import React, { useState, useEffect } from 'react';
import { Resource, ResourceType, ResourceForm } from '../types/pricing';
import { 
  getResources, 
  getResourceTypes,
  createResource,
  updateResource,
  deleteResource
} from '../utils/pricingApi';

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [filter, setFilter] = useState({ resourceType: '', search: '' });

  const [formData, setFormData] = useState<ResourceForm>({
    name: '',
    code: '',
    resource_type: 0,
    unit: '',
    unit_cost: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, [filter.resourceType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resourcesData, typesData] = await Promise.all([
        getResources({ 
          resource_type: filter.resourceType ? parseInt(filter.resourceType) : undefined 
        }),
        getResourceTypes()
      ]);
      setResources(resourcesData);
      setResourceTypes(typesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingResource) {
        const updated = await updateResource(editingResource.id, formData);
        setResources(resources.map(r => r.id === updated.id ? updated : r));
      } else {
        const created = await createResource(formData);
        setResources([...resources, created]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Error al guardar el recurso');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      code: resource.code,
      resource_type: resource.resource_type,
      unit: resource.unit,
      unit_cost: resource.unit_cost,
      description: resource.description || '',
      is_active: resource.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este recurso?')) {
      try {
        await deleteResource(id);
        setResources(resources.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Error al eliminar el recurso');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      resource_type: 0,
      unit: '',
      unit_cost: '',
      description: '',
      is_active: true
    });
    setEditingResource(null);
    setShowForm(false);
  };

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(filter.search.toLowerCase()) ||
    resource.code.toLowerCase().includes(filter.search.toLowerCase())
  );

  const getResourceTypeIcon = (typeId: number) => {
    const type = resourceTypes.find(t => t.id === typeId);
    if (!type) return '📦';
    switch (type.code) {
      case 'MAT': return '🧱';
      case 'MO': return '👷';
      case 'EQ': return '🚛';
      case 'SUB': return '🔧';
      case 'TRA': return '🚚';
      case 'OTR': return '📋';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div>Cargando recursos...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2>📦 Gestión de Recursos</h2>
        <button 
          onClick={() => setShowForm(true)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ➕ Nuevo Recurso
        </button>
      </div>

      {/* Filtros */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <label>Tipo de Recurso:</label>
          <select 
            value={filter.resourceType} 
            onChange={(e) => setFilter({...filter, resourceType: e.target.value})}
            style={{ marginLeft: '5px', padding: '5px', minWidth: '150px' }}
          >
            <option value="">Todos los tipos</option>
            {resourceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Buscar:</label>
          <input 
            type="text"
            value={filter.search} 
            onChange={(e) => setFilter({...filter, search: e.target.value})}
            placeholder="Buscar por nombre o código..."
            style={{ 
              marginLeft: '5px', 
              padding: '5px', 
              width: '100%',
              maxWidth: '300px'
            }}
          />
        </div>
      </div>

      {/* Tabla de Recursos */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tipo</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Código</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Unidad</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Costo Unitario</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map((resource) => (
              <tr key={resource.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: '18px', marginRight: '5px' }}>
                    {getResourceTypeIcon(resource.resource_type)}
                  </span>
                  {resource.resource_type_name}
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {resource.code}
                </td>
                <td style={{ padding: '12px' }}>
                  {resource.name}
                  {resource.description && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {resource.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px' }}>{resource.unit}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                  ${parseFloat(resource.unit_cost).toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span 
                    style={{
                      backgroundColor: resource.is_active ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  >
                    {resource.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleEdit(resource)}
                      style={{
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(resource.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResources.length === 0 && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#666' 
          }}>
            No se encontraron recursos con los filtros aplicados.
          </div>
        )}
      </div>

      {/* Formulario Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3>{editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label>Tipo de Recurso:</label>
                <select
                  value={formData.resource_type}
                  onChange={(e) => setFormData({...formData, resource_type: parseInt(e.target.value)})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}
                >
                  <option value={0}>Seleccione un tipo</option>
                  {resourceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Código:</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                  placeholder="ej: MAT-001, MO-005, EQ-010"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label>Unidad:</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    required
                    placeholder="ej: kg, m3, hora"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      marginTop: '5px'
                    }}
                  />
                </div>

                <div>
                  <label>Costo Unitario:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({...formData, unit_cost: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      marginTop: '5px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px', marginTop: '15px' }}>
                <label>Descripción:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '5px',
                    height: '80px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Recurso activo
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {editingResource ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
