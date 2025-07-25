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
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UnitPriceItemForm>({
    resource: 0,
    quantity: '',
    unit_cost: '',
    performance_factor: '1.00',
    notes: ''
  });

  // Referencia para rastrear la última vez que se cargaron datos
  const lastLoadTime = React.useRef<number>(0);
  // Referencia para el ID actual siendo procesado
  const currentLoadingId = React.useRef<string | null>(null);
  
  useEffect(() => {
    if (id) {
      console.log('ID changed in URL to:', id);
      
      // Verificar si este ID ya está siendo cargado o si se cargó recientemente
      const now = Date.now();
      const timeSinceLastLoad = now - lastLoadTime.current;
      
      // Si es el mismo ID que estamos cargando actualmente o si pasaron menos de 2 segundos, no hacemos nada
      if (currentLoadingId.current === id && timeSinceLastLoad < 2000) {
        console.log(`Ignorando carga repetida para ID ${id}, última carga hace ${timeSinceLastLoad}ms`);
        return;
      }
      
      // Actualizar referencia del ID que estamos cargando
      currentLoadingId.current = id;
      lastLoadTime.current = now;
      
      // Limpiar completamente el estado actual para evitar mostrar datos antiguos
      setItems([]);
      setCostBreakdown(null);
      setAnalysis(null);
      setError(null);
      
      // Crear un marcador único para esta carga
      const loadId = now;
      console.log(`Iniciando carga #${loadId} para análisis ${id}`);
      
      // Almacenar el ID de análisis actual para validar después
      const currentAnalysisId = parseInt(id);
      
      // Cargar los datos con validación posterior
      loadData().then(() => {
        // Verificar que seguimos en el mismo análisis (para evitar condiciones de carrera)
        if (parseInt(id) === currentAnalysisId) {
          console.log(`Carga #${loadId} completada exitosamente para análisis ${id}`);
        } else {
          console.warn(`Carga #${loadId} completada pero ya no estamos en el análisis ${currentAnalysisId}, ahora estamos en ${id}`);
        }
        
        // Limpiar la referencia del ID actual si corresponde
        if (currentLoadingId.current === id) {
          currentLoadingId.current = null;
        }
      }).catch(error => {
        console.error(`Error en carga #${loadId}:`, error);
        if (currentLoadingId.current === id) {
          currentLoadingId.current = null;
        }
      });
    }
  }, [id]);
  
  // Efecto adicional para verificar que los ítems corresponden al análisis actual
  // Usamos un useRef para rastrear si ya estamos en proceso de corrección para evitar ciclos
  const isCorrectingItems = React.useRef(false);
  
  useEffect(() => {
    if (analysis && items.length > 0 && !isCorrectingItems.current) {
      const firstItem = items[0];
      // Si tenemos ítems pero su analysis_id no coincide con el análisis actual, hay un problema
      if (firstItem.analysis !== analysis.id) {
        console.error(`⚠️ ALERTA: Los ítems mostrados pertenecen al análisis ID ${firstItem.analysis}, pero estamos viendo el análisis ID ${analysis.id}`);
        // Intentar corregir automáticamente solicitando los ítems correctos - pero solo una vez
        isCorrectingItems.current = true;
        
        // Mostrar mensaje de depuración
        console.log('Iniciando corrección de ítems - solicitando los correctos una sola vez');
        
        getUnitPriceItems({ analysis: analysis.id })
          .then(correctItems => {
            console.log('Corrección completada - ítems correctos cargados:', correctItems?.length);
            setItems(correctItems || []);
            // Reiniciamos el flag después de un tiempo para permitir futuras correcciones si es necesario
            setTimeout(() => {
              isCorrectingItems.current = false;
            }, 5000);
          })
          .catch(error => {
            console.error('Error al intentar corregir ítems:', error);
            // También reiniciamos el flag en caso de error
            isCorrectingItems.current = false;
          });
      }
    }
  }, [analysis, items]);
  
  // Efecto adicional para verificar cambios en la ruta que podrían no reflejarse en el id
  useEffect(() => {
    const checkRoute = () => {
      const currentPath = window.location.pathname;
      console.log('Current path:', currentPath);
      const pathId = currentPath.split('/').pop();
      
      if (pathId && pathId !== id) {
        console.warn(`⚠️ Posible inconsistencia de ruta: URL path ID = ${pathId}, param ID = ${id}`);
      }
    };
    
    checkRoute();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Limpiar datos anteriores para evitar mostrar información obsoleta
      setItems([]);
      setCostBreakdown(null);
      
      const analysisId = parseInt(id!);
      
      console.log('=== DEBUG FRONTEND LOADDATA START ===');
      console.log('URL ID Parameter:', id);
      console.log('Parsed Analysis ID:', analysisId);
      
      // Cargar datos en paralelo
      const [analysisData, itemsData, resourcesData, breakdownData] = await Promise.all([
        getUnitPriceAnalysis(analysisId),
        getUnitPriceItems({ analysis: analysisId }),
        getResources(),
        getCostBreakdown(analysisId).catch((error) => {
          console.error('Error loading cost breakdown:', error);
          return null;
        })
      ]);
      
      console.log('=== DEBUG FRONTEND DATA ===');
      console.log('Analysis data:', analysisData);
      console.log('Analysis ID from data:', analysisData?.id);
      console.log('Analysis Name:', analysisData?.name);
      console.log('Analysis Code:', analysisData?.code);
      
      console.log('Items data (RAW from backend):', JSON.stringify(itemsData, null, 2));
      console.log('Items count:', itemsData?.length);
      
      // Debug individual de cada item
      if (itemsData && itemsData.length > 0) {
        console.log('=== ITEMS INDIVIDUALES ===');
        itemsData.forEach((item, index) => {
          console.log(`Item ${index + 1}:`, {
            id: item.id,
            analysis: item.analysis,
            resource_id: item.resource,
            resource_name: item.resource_name,
            resource_code: item.resource_code,
            resource_type: item.resource_type,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost,
            notes: item.notes
          });
        });
        console.log('===========================');
      }
      
      // Clasificar ítems por tipo de recurso
      const materialItems = itemsData?.filter(item => item.resource_type === 'material' || item.resource_code?.startsWith('MAT-'));
      const laborItems = itemsData?.filter(item => item.resource_type === 'labor' || item.resource_code?.startsWith('MO-'));
      const equipmentItems = itemsData?.filter(item => item.resource_type === 'equipment' || item.resource_code?.startsWith('EQ-'));
      const transportItems = itemsData?.filter(item => item.resource_type === 'transport' || item.resource_code?.startsWith('TR-'));
      
      console.log('Material items:', materialItems?.length, materialItems?.map(i => i.resource_code));
      console.log('Labor items:', laborItems?.length, laborItems?.map(i => i.resource_code));
      console.log('Equipment items:', equipmentItems?.length, equipmentItems?.map(i => i.resource_code));
      console.log('Transport items:', transportItems?.length, transportItems?.map(i => i.resource_code));
      
      console.log('Resources data length:', resourcesData?.length);
      console.log('Breakdown data:', breakdownData);
      
      if (breakdownData) {
        console.log('Breakdown materials_cost:', breakdownData.materials_cost, 'type:', typeof breakdownData.materials_cost);
        console.log('Breakdown materials_cost parsed:', parseFloat(breakdownData.materials_cost || '0'));
        console.log('Breakdown labor_cost:', breakdownData.labor_cost, 'type:', typeof breakdownData.labor_cost);
        console.log('Breakdown equipment_cost:', breakdownData.equipment_cost, 'type:', typeof breakdownData.equipment_cost);
        console.log('Breakdown transport in other:', breakdownData.other_cost);
        
        // Verificar coherencia entre análisis y desglose
        const hasMaterialItems = materialItems?.length > 0;
        const hasMaterialCost = parseFloat(breakdownData.materials_cost || '0') > 0;
        
        if (hasMaterialItems !== hasMaterialCost) {
          console.warn('⚠️ INCONSISTENCIA: Hay materiales en items pero costo es 0 o viceversa');
          console.warn(`Items materiales: ${hasMaterialItems ? 'SÍ' : 'NO'}, Costo materiales > 0: ${hasMaterialCost ? 'SÍ' : 'NO'}`);
        }
        
        // Mostrar todo el breakdown para verificar valores
        console.log('Raw breakdown JSON:', JSON.stringify(breakdownData, null, 2));
      } else {
        console.log('Breakdown data is null or undefined');
      }
      console.log('======================');
      
      // Verificar que el análisis cargado coincide con el ID solicitado
      if (analysisData.id !== analysisId) {
        console.error(`❌ Error: ID del análisis cargado (${analysisData.id}) no coincide con el solicitado (${analysisId})`);
        setError(`Error de sincronización: El análisis cargado (${analysisData.id}) no es el solicitado (${analysisId})`);
        return;
      }
      
      // Filtrar ítems para asegurarnos de que pertenecen a este análisis
      const filteredItems = itemsData.filter(item => !item.analysis || item.analysis === analysisId);
      if (filteredItems.length !== itemsData.length) {
        console.warn(`⚠️ Se filtraron ${itemsData.length - filteredItems.length} ítems que no pertenecían al análisis ${analysisId}`);
        console.log('Items filtrados:', itemsData.filter(item => item.analysis && item.analysis !== analysisId));
      }
      
      setAnalysis(analysisData);
      setItems(filteredItems);
      setResources(resourcesData);
      setCostBreakdown(breakdownData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos: ' + (err instanceof Error ? err.message : String(err)));
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
    
    return Promise.resolve();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FRONTEND SUBMIT DEBUG ===');
    console.log('Form data being submitted:', formData);
    console.log('Editing item:', editingItem);
    console.log('Analysis ID:', id);
    
    // Check if this resource is already in the analysis (for new items only)
    if (!editingItem && formData.resource) {
      const existingItem = items.find(item => item.resource === formData.resource);
      if (existingItem) {
        // Show an error or ask the user if they want to update the existing item instead
        const confirmUpdate = window.confirm(
          'Este recurso ya existe en el análisis. ¿Desea actualizar la cantidad existente?'
        );
        
        if (confirmUpdate) {
          // Update the existing item instead of creating a new one
          console.log('Updating existing item with ID:', existingItem.id);
          try {
            const updated = await updateUnitPriceItem(existingItem.id, formData);
            console.log('Update successful:', updated);
            setItems(items.map(i => i.id === updated.id ? updated : i));
            resetForm();
            // Recargar el análisis para actualizar totales
            loadData();
            return;
          } catch (error) {
            console.error('Error updating existing item:', error);
          }
        } else {
          // User chose not to update
          return;
        }
      }
    }
    
    try {
      if (editingItem) {
        console.log('Updating item with ID:', editingItem.id);
        const updated = await updateUnitPriceItem(editingItem.id, formData);
        console.log('Update successful:', updated);
        setItems(Array.isArray(items) ? items.map(i => i.id === updated.id ? updated : i) : [updated]);
      } else {
        console.log('Creating new item for analysis:', parseInt(id!));
        const created = await createUnitPriceItem(parseInt(id!), formData);
        console.log('Creation successful:', created);
        setItems(Array.isArray(items) ? [...items, created] : [created]);
      }
      resetForm();
      // Recargar el análisis para actualizar totales
      loadData();
    } catch (error: any) {
      console.error('Error saving item:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error status text:', error.response?.statusText);
      
      // Mostrar error más detallado al usuario
      let errorMessage = 'Error al guardar el item';
      if (error.response?.data) {
        // Check for non-field errors first
        if (error.response.data.non_field_errors) {
          errorMessage = `Error: ${error.response.data.non_field_errors.join('. ')}`;
          // Check if this is a uniqueness constraint error
          if (error.response.data.non_field_errors.some((err: string) => 
              err.includes('unique') || err.includes('ya existe'))) {
            errorMessage = 'Este recurso ya existe en el análisis. Por favor edite el item existente.';
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          // Si hay errores de validación, mostrarlos
          const validationErrors = Object.entries(error.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorMessage = `Errores de validación:\n${validationErrors}`;
        }
      }
      
      alert(errorMessage);
    }
    
    console.log('=============================');
  };

  const handleEdit = (item: UnitPriceItem) => {
    setEditingItem(item);
    setFormData({
      resource: item.resource,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
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
      unit_cost: '',
      performance_factor: '1.00',
      notes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const getResourceName = (item: UnitPriceItem) => {
    // Usar la información del recurso que viene con el item desde el backend
    if (item.resource_name) {
      return `${item.resource_code || ''} - ${item.resource_name}`;
    }
    
    // Fallback: buscar en el array de recursos
    const resource = resources.find(r => r.id === item.resource);
    if (resource) {
      return `${resource.code} - ${resource.name}`;
    }
    
    console.warn(`Recurso con ID ${item.resource} no encontrado`);
    return `Recurso ID: ${item.resource} (no encontrado)`;
  };

  const getResourceUnit = (item: UnitPriceItem) => {
    // Usar la información del recurso que viene con el item desde el backend
    if (item.resource_unit) {
      return item.resource_unit;
    }
    
    // Fallback: buscar en el array de recursos
    const resource = resources.find(r => r.id === item.resource);
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

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #f5c6cb',
      }}>
        <h3>Error</h3>
        <p>{error}</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/pricing-analysis')} style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Volver a la lista
          </button>
          <button onClick={() => {
            setError(null);
            loadData();
          }} style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Análisis no encontrado</h3>
        <button onClick={() => navigate('/pricing-analysis')} style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Volver a la lista
        </button>
      </div>
    );
  }

  // Verificar discrepancias entre análisis y datos mostrados
  const checkDataConsistency = () => {
    if (!analysis || !items || items.length === 0) return null;
    
    // Verificar inconsistencias de ID
    const itemsFromWrongAnalysis = items.some(item => item.analysis && item.analysis !== analysis.id);
    
    // Materiales en análisis ID 1, no en ID 2
    const hasMaterialItems = items.some(item => item.resource_code?.startsWith('MAT-') || item.resource_type === 'material');
    const shouldHaveMaterials = analysis.id === 1;
    
    if (itemsFromWrongAnalysis || (hasMaterialItems && !shouldHaveMaterials) || (!hasMaterialItems && shouldHaveMaterials)) {
      return (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffeeba',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong>Advertencia:</strong> Hay una posible inconsistencia entre los datos mostrados y el análisis seleccionado.
            <br />
            ID del Análisis: {analysis.id}, Nombre: {analysis.name}
            <br />
            {itemsFromWrongAnalysis && <span>Se están mostrando ítems de otro análisis.</span>}
            {!itemsFromWrongAnalysis && hasMaterialItems && !shouldHaveMaterials && 
              <span>Se muestran materiales pero este análisis no debería tenerlos.</span>}
            {!itemsFromWrongAnalysis && !hasMaterialItems && shouldHaveMaterials && 
              <span>No se muestran materiales pero este análisis debería tenerlos.</span>}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Corregir ahora
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Alerta de consistencia */}
      {checkDataConsistency()}
      
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
          <button 
            onClick={() => {
              setLoading(true);
              // Limpiar completamente el estado
              setItems([]);
              setAnalysis(null);
              setCostBreakdown(null);
              
              // Forzar una recarga completa con un pequeño retraso
              setTimeout(() => {
                // Recargar la página actual para forzar una actualización completa
                window.location.reload();
              }, 100);
            }}
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              padding: '6px 10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginLeft: '15px'
            }}
            title="Forzar recarga completa de datos"
          >
            🔄 Recargar página
          </button>
          <button 
            onClick={() => {
              // Evitar recargas múltiples
              if (loading) {
                console.log('Ya hay una carga en proceso, ignorando solicitud');
                return;
              }
              
              setLoading(true);
              // Limpiar completamente el estado relevante
              setItems([]);
              setCostBreakdown(null);
              
              // Intentar una recarga forzada de datos usando la API directamente
              const analysisId = parseInt(id!);
              const reloadId = Date.now();
              console.log(`Recarga manual #${reloadId} para análisis ID: ${analysisId}`);
              
              // Filtrar los ítems que realmente pertenecen a este análisis
              Promise.all([
                // Solicitar items con un breve retraso para evitar sobrecarga
                new Promise(resolve => setTimeout(() => resolve(true), 100))
                  .then(() => getUnitPriceItems({ analysis: analysisId }))
                  .then(items => {
                    const filteredItems = items.filter(item => !item.analysis || item.analysis === analysisId);
                    if (items.length !== filteredItems.length) {
                      console.warn(`⚠️ Se filtraron ${items.length - filteredItems.length} ítems que no pertenecían al análisis ${analysisId}`);
                    }
                    return filteredItems;
                  }),
                getCostBreakdown(analysisId)
              ]).then(([newItems, newBreakdown]) => {
                console.log(`Recarga #${reloadId} completada - ${newItems?.length || 0} items cargados`);
                setItems(newItems || []);
                setCostBreakdown(newBreakdown || null);
                setLoading(false);
              }).catch(error => {
                console.error('Error en recarga de datos:', error);
                setLoading(false);
                alert('Error al recargar los datos');
              });
            }}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '6px 10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginLeft: '10px'
            }}
            title="Recargar solo los datos sin refrescar la página"
          >
            🔁 Actualizar datos
          </button>
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
      {(() => {
        console.log('RENDER DEBUG - costBreakdown:', costBreakdown);
        console.log('RENDER ID from URL:', id);
        console.log('RENDER analysis:', analysis?.id, analysis?.name, analysis?.code);
        console.log('RENDER items count:', items?.length);
        
        // Clasificar ítems en la fase de renderizado
        const renderedMaterialItems = items?.filter(item => item.resource_code?.startsWith('MAT-') || item.resource_type === 'material');
        const renderedLaborItems = items?.filter(item => item.resource_code?.startsWith('MO-') || item.resource_type === 'labor');
        const renderedEquipmentItems = items?.filter(item => item.resource_code?.startsWith('EQ-') || item.resource_type === 'equipment');
        const renderedTransportItems = items?.filter(item => item.resource_code?.startsWith('TR-') || item.resource_type === 'transport');
        
        console.log('RENDER Material items:', renderedMaterialItems?.length, renderedMaterialItems?.map(i => i.resource_code));
        console.log('RENDER Labor items:', renderedLaborItems?.length, renderedLaborItems?.map(i => i.resource_code));
        console.log('RENDER Equipment items:', renderedEquipmentItems?.length, renderedEquipmentItems?.map(i => i.resource_code));
        console.log('RENDER Transport items:', renderedTransportItems?.length, renderedTransportItems?.map(i => i.resource_code));
        
        if (costBreakdown) {
          console.log('RENDER materials_cost:', costBreakdown.materials_cost, 'parsed:', parseFloat(costBreakdown.materials_cost || '0'));
          console.log('RENDER labor_cost:', costBreakdown.labor_cost, 'parsed:', parseFloat(costBreakdown.labor_cost || '0'));
          console.log('RENDER equipment_cost:', costBreakdown.equipment_cost, 'parsed:', parseFloat(costBreakdown.equipment_cost || '0'));
        }
        return null;
      })()}
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
                ${parseFloat(costBreakdown.materials_cost || '0').toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Mano de Obra</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#17a2b8' }}>
                ${parseFloat(costBreakdown.labor_cost || '0').toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Equipos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                ${parseFloat(costBreakdown.equipment_cost || '0').toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Subcontratos</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fd7e14' }}>
                ${parseFloat(costBreakdown.subcontract_cost || '0').toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Otros</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6c757d' }}>
                ${parseFloat(costBreakdown.other_cost || '0').toFixed(2)}
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
              {Array.isArray(items) && items.map((item) => (
                <tr key={item.id} style={{ 
                  borderBottom: '1px solid #eee',
                  backgroundColor: item.analysis && item.analysis !== analysis.id ? '#fff3cd30' : undefined 
                }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {getResourceName(item)}
                      {item.analysis && item.analysis !== analysis.id && (
                        <span style={{ 
                          backgroundColor: '#fff3cd', 
                          color: '#856404',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          marginLeft: '5px'
                        }}>
                          ⚠️ Análisis #{item.analysis}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {parseFloat(item.quantity).toFixed(3)} {getResourceUnit(item)}
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
                  onChange={(e) => {
                    const resourceId = parseInt(e.target.value);
                    const selectedResource = resources.find(r => r.id === resourceId);
                    setFormData({
                      ...formData, 
                      resource: resourceId,
                      // Auto-fill unit_cost from the selected resource
                      unit_cost: selectedResource ? selectedResource.unit_cost : ''
                    });
                  }}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
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
