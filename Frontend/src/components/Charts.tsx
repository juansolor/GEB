import React from 'react';

interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  title, 
  valuePrefix = '', 
  valueSuffix = '' 
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No hay datos para mostrar
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => isNaN(item.value) ? 0 : item.value));

  // Sanitizar los valores para evitar NaN en el renderizado
  const sanitizedData = data.map(item => ({
    ...item,
    value: typeof item.value === 'number' && !isNaN(item.value) ? item.value : 0
  }));

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sanitizedData.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ minWidth: '120px', fontSize: '14px', color: '#666' }}>
              {item.label}
            </div>
            <div style={{ flex: 1, height: '24px', backgroundColor: '#f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color || '#007bff',
                  borderRadius: '12px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div style={{ minWidth: '80px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
              {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SimpleLineChartProps {
  data: Array<{ label: string; value: number }>;
  title: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  data, 
  title, 
  valuePrefix = '', 
  valueSuffix = '' 
}) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No hay datos para mostrar
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => isNaN(item.value) ? 0 : item.value));
  const minValue = Math.min(...data.map(item => isNaN(item.value) ? 0 : item.value));
  const range = maxValue - minValue;

  // Sanitizar los valores para evitar NaN en el renderizado
  const sanitizedData = data.map(item => ({
    ...item,
    value: typeof item.value === 'number' && !isNaN(item.value) ? item.value : 0
  }));

  // Función segura para calcular x e y
  function getXY(index: number, arr: typeof sanitizedData, min: number, range: number) {
    const n = arr.length;
    let x = 0;
    let y = 100;
    if (n > 1 && range > 0) {
      x = (index / (n - 1)) * 100;
      y = 100 - ((arr[index].value - min) / range) * 100;
    } else if (n === 1) {
      x = 0;
      y = 100;
    }
    // Si x o y es NaN, forzar a 0 y 100
    if (isNaN(x)) x = 0;
    if (isNaN(y)) y = 100;
    return { x, y };
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>{title}</h3>
      <div style={{ position: 'relative', height: '200px', padding: '20px 0' }}>
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            points={sanitizedData.map((item, index) => {
              const { x, y } = getXY(index, sanitizedData, minValue, range);
              return `${x},${y}`;
            }).join(' ')}
            stroke="#007bff"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {sanitizedData.map((item, index) => {
            const { x, y } = getXY(index, sanitizedData, minValue, range);
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#007bff"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = '#007bff' 
}) => {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px', fontWeight: 'normal' }}>
            {title}
          </h4>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              {subtitle}
            </div>
          )}
        </div>
        {icon && (
          <div style={{ fontSize: '24px', opacity: 0.7 }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
