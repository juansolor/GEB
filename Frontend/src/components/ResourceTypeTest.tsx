import React, { useState, useEffect } from 'react';
import { getResourceTypes } from '../utils/pricingApi';
import { ResourceType } from '../types/pricing';

const ResourceTypeTest: React.FC = () => {
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testResourceTypes = async () => {
      try {
        console.log('🧪 INICIANDO PRUEBA DE RESOURCE TYPES');
        setLoading(true);
        
        const data = await getResourceTypes();
        console.log('🧪 DATOS RECIBIDOS:', data);
        console.log('🧪 TIPO:', typeof data, Array.isArray(data));
        console.log('🧪 LONGITUD:', data?.length);
        
        setResourceTypes(data || []);
        setError(null);
      } catch (err) {
        console.error('🧪 ERROR EN PRUEBA:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    testResourceTypes();
  }, []);

  if (loading) return <div>🔄 Cargando tipos de recursos...</div>;
  if (error) return <div>❌ Error: {error}</div>;

  return (
    <div style={{ padding: '20px', border: '2px solid blue', margin: '20px' }}>
      <h3>🧪 PRUEBA DE RESOURCE TYPES</h3>
      <p><strong>Cantidad:</strong> {resourceTypes.length}</p>
      <p><strong>Tipo:</strong> {Array.isArray(resourceTypes) ? 'Array' : typeof resourceTypes}</p>
      
      <h4>📋 Lista:</h4>
      {resourceTypes.length > 0 ? (
        <ul>
          {resourceTypes.map(type => (
            <li key={type.id}>
              <strong>ID:</strong> {type.id} | 
              <strong>Name:</strong> {type.name} | 
              <strong>Display:</strong> {type.name_display}
            </li>
          ))}
        </ul>
      ) : (
        <p>❌ No hay tipos de recursos</p>
      )}
      
      <h4>🔍 Raw Data:</h4>
      <pre style={{ background: '#f0f0f0', padding: '10px', fontSize: '12px' }}>
        {JSON.stringify(resourceTypes, null, 2)}
      </pre>
    </div>
  );
};

export default ResourceTypeTest;
