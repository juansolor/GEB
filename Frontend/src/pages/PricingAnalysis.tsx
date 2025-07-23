import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UnitPriceAnalysis, 
  ServiceCategory, 
  UnitPriceAnalysisForm 
} from '../types/pricing';
import { 
  getUnitPriceAnalyses, 
  getServiceCategories,
  createUnitPriceAnalysis,
  updateUnitPriceAnalysis,
  deleteUnitPriceAnalysis,
  duplicateUnitPriceAnalysis,
  changeAnalysisStatus
} from '../utils/pricingApi';

const PricingAnalysis: React.FC = () => {
  const [analyses, setAnalyses] = useState<UnitPriceAnalysis[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<UnitPriceAnalysis | null>(null);
  const [filter, setFilter] = useState({ category: '', status: '' });

  const [formData, setFormData] = useState<UnitPriceAnalysisForm>({
    name: '',
    code: '',
    category: 0,
    description: '',
    unit: '',
    overhead_percentage: '15.00',
    profit_margin: '20.00',
    efficiency_factor: '1.00',
    difficulty_factor: '1.00'
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analysesData, categoriesData] = await Promise.all([
        getUnitPriceAnalyses({ 
          category: filter.category ? parseInt(filter.category) : undefined,
          status: filter.status || undefined
        }),
        getServiceCategories()
      ]);
      setAnalyses(analysesData);
      setCategories(categoriesData);
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
      if (editingAnalysis) {
        const updated = await updateUnitPriceAnalysis(editingAnalysis.id, formData);
        setAnalyses(analyses.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await createUnitPriceAnalysis(formData);
        setAnalyses([...analyses, created]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error al guardar el análisis');
    }
  };

  const handleEdit = (analysis: UnitPriceAnalysis) => {
    setEditingAnalysis(analysis);
    setFormData({
      name: analysis.name,
      code: analysis.code,
      category: analysis.category,
      description: analysis.description || '',
      unit: analysis.unit,
      overhead_percentage: analysis.overhead_percentage,
      profit_margin: analysis.profit_margin,
      efficiency_factor: analysis.efficiency_factor,
      difficulty_factor: analysis.difficulty_factor
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este análisis?')) {
      try {
        await deleteUnitPriceAnalysis(id);
        setAnalyses(analyses.filter(a => a.id !== id));
      } catch (error) {
        console.error('Error deleting analysis:', error);
        alert('Error al eliminar el análisis');
      }
    }
  };

  const handleDuplicate = async (analysis: UnitPriceAnalysis) => {
    const newCode = prompt('Ingrese el nuevo código para la copia:', `${analysis.code}-COPY`);
    if (newCode) {
      try {
        const duplicated = await duplicateUnitPriceAnalysis(analysis.id, newCode);
        setAnalyses([...analyses, duplicated]);
      } catch (error) {
        console.error('Error duplicating analysis:', error);
        alert('Error al duplicar el análisis');
      }
    }
  };

  const handleStatusChange = async (analysis: UnitPriceAnalysis, newStatus: string) => {
    try {
      const updated = await changeAnalysisStatus(analysis.id, newStatus);
      setAnalyses(analyses.map(a => a.id === updated.id ? updated : a));
    } catch (error) {
      console.error('Error changing status:', error);
      alert('Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: 0,
      description: '',
      unit: '',
      overhead_percentage: '15.00',
      profit_margin: '20.00',
      efficiency_factor: '1.00',
      difficulty_factor: '1.00'
    });
    setEditingAnalysis(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'draft': return '#ffc107';
      case 'archived': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      default: return status;
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
        <div>Cargando análisis de precios...</div>
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
        <h2>💰 Análisis de Precios Unitarios</h2>
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
          ➕ Nuevo Análisis
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
          <label>Categoría:</label>
          <select 
            value={filter.category} 
            onChange={(e) => setFilter({...filter, category: e.target.value})}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="">Todas</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Estado:</label>
          <select 
            value={filter.status} 
            onChange={(e) => setFilter({...filter, status: e.target.value})}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="">Todos</option>
            <option value="draft">Borrador</option>
            <option value="approved">Aprobado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
      </div>

      {/* Lista de Análisis */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {analyses.map((analysis) => (
          <div 
            key={analysis.id} 
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>
                <Link 
                  to={`/pricing-analysis/${analysis.id}`}
                  style={{ 
                    color: 'inherit', 
                    textDecoration: 'none',
                    borderBottom: '1px dashed #007bff'
                  }}
                >
                  {analysis.name}
                </Link>
              </h4>
              <span 
                style={{
                  backgroundColor: getStatusColor(analysis.status),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              >
                {getStatusText(analysis.status)}
              </span>
            </div>
            
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>Código:</strong> {analysis.code}
            </p>
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>Categoría:</strong> {analysis.category_name}
            </p>
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>Unidad:</strong> {analysis.unit}
            </p>
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>Precio Final:</strong> ${parseFloat(analysis.final_unit_price).toFixed(2)}
            </p>
            
            {analysis.description && (
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', fontStyle: 'italic' }}>
                {analysis.description}
              </p>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginTop: '15px',
              flexWrap: 'wrap'
            }}>
              <Link
                to={`/pricing-analysis/${analysis.id}`}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  display: 'inline-block'
                }}
              >
                👁️ Ver Detalle
              </Link>
              
              <button 
                onClick={() => handleEdit(analysis)}
                style={{
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✏️ Editar
              </button>
              
              <button 
                onClick={() => handleDuplicate(analysis)}
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 Duplicar
              </button>

              {analysis.status === 'draft' && (
                <button 
                  onClick={() => handleStatusChange(analysis, 'approved')}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✅ Aprobar
                </button>
              )}

              <button 
                onClick={() => handleDelete(analysis.id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
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
            <h3>{editingAnalysis ? 'Editar Análisis' : 'Nuevo Análisis'}</h3>
            
            <form onSubmit={handleSubmit}>
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

              <div style={{ marginBottom: '15px' }}>
                <label>Código:</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
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

              <div style={{ marginBottom: '15px' }}>
                <label>Categoría:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: parseInt(e.target.value)})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}
                >
                  <option value={0}>Seleccione una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Unidad:</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  required
                  placeholder="ej: m3, m2, kg, hora"
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
                  <label>% Gastos Generales:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.overhead_percentage}
                    onChange={(e) => setFormData({...formData, overhead_percentage: e.target.value})}
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
                  <label>% Utilidad:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.profit_margin}
                    onChange={(e) => setFormData({...formData, profit_margin: e.target.value})}
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
                  {editingAnalysis ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingAnalysis;
