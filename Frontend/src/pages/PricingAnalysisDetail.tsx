import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UnitPriceAnalysis, 
  UnitPriceItem, 
  Resource, 
  UnitPriceItemForm,
  CostBreakdown 
} from '../types/pricing';
import { 
  getUnitPriceAnalysis,
  getUnitPriceItems,
  getResources,
  createUnitPriceItem,
  updateUnitPriceItem,
  deleteUnitPriceItem,
  getCostBreakdown
} from '../utils/pricingApi';

const PricingAnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [analysis, setAnalysis] = useState<UnitPriceAnalysis | null>(null);
  const [items, setItems] = useState<UnitPriceItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitPriceItem | null>(null);

  const [formData, setFormData] = useState<UnitPriceItemForm>({
    resource: 0,
    quantity: '',
    performance_factor: '1.00',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const analysisId = parseInt(id!);
      
      const [analysisData, itemsData, resourcesData, breakdownData] = await Promise.all([
        getUnitPriceAnalysis(analysisId),
        getUnitPriceItems({ analysis: analysisId }),
        getResources(),
        getCostBreakdown(analysisId).catch(() => null) // En caso de que no haya items
      ]);
      
      setAnalysis(analysisData);
      setItems(itemsData);
      setResources(resourcesData);
      setCostBreakdown(breakdownData);
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
      if (editingItem) {
        const updated = await updateUnitPriceItem(editingItem.id, formData);
        setItems(items.map(i => i.id === updated.id ? updated : i));
      } else {
        const created = await createUnitPriceItem(parseInt(id!), formData);
        setItems([...items, created]);
      }
      resetForm();
      // Recargar el análisis para actualizar totales
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error al guardar el item');
    }
  };

  const handleEdit = (item: UnitPriceItem) => {
    setEditingItem(item);
    setFormData({
      resource: item.resource,
      quantity: item.quantity,
      performance_factor: item.performance_factor,
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: number) => {
    if (window.confirm('¿Está seguro de eliminar este item?')) {
      try {
        await deleteUnitPriceItem(itemId);
        setItems(items.filter(i => i.id !== itemId));
        // Recargar para actualizar totales
        loadData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error al eliminar el item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      resource: 0,
      quantity: '',
      performance_factor: '1.00',
      notes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const getResourceName = (resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? `${resource.code} - ${resource.name}` : 'Recurso no encontrado';
  };

  const getResourceUnit = (resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.unit : '';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div>Cargando análisis...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Análisis no encontrado</h3>
        <button onClick={() => navigate('/pricing-analysis')}>
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <div>
          <button 
            onClick={() => navigate('/pricing-analysis')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '15px'
            }}
          >
            ← Volver
          </button>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {analysis.name} ({analysis.code})
          </span>
        </div>
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
          ➕ Agregar Item
        </button>
      </div>

      {/* Información del Análisis */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>📋 Información General</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Categoría:</strong> {analysis.category_name}
            </div>
            <div>
              <strong>Unidad:</strong> {analysis.unit}
            </div>
            <div>
              <strong>% Gastos Generales:</strong> {analysis.overhead_percentage}%
            </div>
            <div>
              <strong>% Utilidad:</strong> {analysis.profit_margin}%
            </div>
            <div>
              <strong>Factor Eficiencia:</strong> {analysis.efficiency_factor}
            </div>
            <div>
              <strong>Factor Dificultad:</strong> {analysis.difficulty_factor}
            </div>
          </div>
          {analysis.description && (
            <div style={{ marginTop: '15px' }}>
              <strong>Descripción:</strong>
              <p style={{ marginTop: '5px', color: '#666' }}>{analysis.description}</p>
            </div>
          )}
        </div>

        {/* Resumen de Costos */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>💰 Resumen de Costos</h3>
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Costo Directo:</span>
              <span>${parseFloat(analysis.total_direct_cost).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Con Gastos Generales:</span>
              <span>${parseFloat(analysis.total_cost_with_overhead).toFixed(2)}</span>
            </div>
            <hr style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
              <span>Precio Final:</span>
              <span style={{ color: '#007bff' }}>
                ${parseFloat(analysis.final_unit_price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose de Costos Detallado */}
      {costBreakdown && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3>📊 Desglose Detallado por Tipo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Materiales</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                ${parseFloat(costBreakdown.materials_cost).toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Mano de Obra</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#17a2b8' }}>
                ${parseFloat(costBreakdown.labor_cost).toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Equipos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                ${parseFloat(costBreakdown.equipment_cost).toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Subcontratos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fd7e14' }}>
                ${parseFloat(costBreakdown.subcontract_cost).toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Otros</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>
                ${parseFloat(costBreakdown.other_cost).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Items */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderBottom: '1px solid #ddd' 
        }}>
          <h3 style={{ margin: 0 }}>📝 Items del Análisis</h3>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No hay items agregados a este análisis.
            <br />
            <button 
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '15px'
              }}
            >
              Agregar el primer item
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Recurso</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Cantidad</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Costo Unit.</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Factor</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {getResourceName(item.resource)}
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {parseFloat(item.quantity).toFixed(3)} {getResourceUnit(item.resource)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    ${parseFloat(item.unit_cost).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {parseFloat(item.performance_factor).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${parseFloat(item.total_cost).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleEdit(item)}
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
                        onClick={() => handleDelete(item.id)}
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
            <h3>{editingItem ? 'Editar Item' : 'Nuevo Item'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label>Recurso:</label>
                <select
                  value={formData.resource}
                  onChange={(e) => setFormData({...formData, resource: parseInt(e.target.value)})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}
                >
                  <option value={0}>Seleccione un recurso</option>
                  {resources.filter(r => r.is_active).map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.code} - {resource.name} (${parseFloat(resource.unit_cost).toFixed(2)}/{resource.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
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

                <div>
                  <label>Factor de Rendimiento:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.performance_factor}
                    onChange={(e) => setFormData({...formData, performance_factor: e.target.value})}
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
                <label>Notas:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                  {editingItem ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingAnalysisDetail;
