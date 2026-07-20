import React, { useState } from 'react';

const SriLankaMap = ({ availability, onDistrictSelect }) => {
  const [hovered, setHovered] = useState(null);

  // Schematic SVG coordinates representing the districts of Sri Lanka
  // Coordinates are designed to look organic, stylized, and modern
  const districts = [
    {
      id: 'Jaffna',
      name: 'Jaffna',
      path: 'M 140 30 Q 150 15 160 30 Q 185 45 165 75 Q 140 85 130 65 Q 120 40 140 30 Z',
      labelX: 155,
      labelY: 45,
      fallbackColor: '#10b981' // Good
    },
    {
      id: 'Anuradhapura',
      name: 'Anuradhapura',
      path: 'M 130 90 Q 170 70 200 110 Q 180 160 140 170 Q 110 130 130 90 Z',
      labelX: 155,
      labelY: 130,
      fallbackColor: '#10b981' // Good
    },
    {
      id: 'Trincomalee',
      name: 'Trincomalee',
      path: 'M 205 110 Q 230 100 240 130 Q 220 175 195 165 Q 185 130 205 110 Z',
      labelX: 215,
      labelY: 140,
      fallbackColor: '#f59e0b' // Low
    },
    {
      id: 'Kandy',
      name: 'Kandy',
      path: 'M 145 180 Q 190 175 195 210 Q 180 250 140 240 Q 125 210 145 180 Z',
      labelX: 165,
      labelY: 210,
      fallbackColor: '#ef4444' // Critical
    },
    {
      id: 'Batticaloa',
      name: 'Batticaloa',
      path: 'M 200 175 Q 240 170 250 215 Q 215 260 195 240 Q 190 200 200 175 Z',
      labelX: 220,
      labelY: 210,
      fallbackColor: '#f59e0b' // Low
    },
    {
      id: 'Colombo',
      name: 'Colombo',
      path: 'M 105 230 Q 130 230 135 270 Q 110 295 95 285 Q 90 260 105 230 Z',
      labelX: 110,
      labelY: 265,
      fallbackColor: '#ef4444' // Critical
    },
    {
      id: 'Galle',
      name: 'Galle',
      path: 'M 100 295 Q 130 280 145 320 Q 125 355 105 340 Q 95 315 100 295 Z',
      labelX: 120,
      labelY: 320,
      fallbackColor: '#10b981' // Good
    },
    {
      id: 'Hambantota',
      name: 'Hambantota',
      path: 'M 150 310 Q 185 270 215 310 Q 195 350 150 345 Z',
      labelX: 175,
      labelY: 320,
      fallbackColor: '#f59e0b' // Low
    }
  ];

  const getColor = (districtId) => {
    const data = availability?.[districtId];
    if (!data) {
      const dist = districts.find(d => d.id === districtId);
      return dist ? dist.fallbackColor : '#cbd5e1';
    }
    
    if (data.status === 'Good') return '#10b981'; // Green
    if (data.status === 'Low') return '#f59e0b'; // Orange/Yellow
    return '#ef4444'; // Red
  };

  const getUnits = (districtId) => {
    return availability?.[districtId]?.totalUnits || 0;
  };

  const getStatusText = (districtId) => {
    return availability?.[districtId]?.status || 'Critical';
  };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        viewBox="80 0 200 370"
        style={{
          width: '100%',
          maxHeight: '340px',
          filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.05))'
        }}
      >
        {districts.map((district) => {
          const color = getColor(district.id);
          const isHovered = hovered === district.id;

          return (
            <g
              key={district.id}
              onClick={() => onDistrictSelect && onDistrictSelect(district.name)}
              onMouseEnter={() => setHovered(district.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Main district shape */}
              <path
                d={district.path}
                fill={color}
                stroke="var(--bg-secondary)"
                strokeWidth={isHovered ? '2.5' : '1.5'}
                opacity={isHovered ? '0.9' : '0.75'}
                style={{
                  transition: 'all 0.2s ease',
                  filter: isHovered ? 'brightness(1.05)' : 'none'
                }}
              />
              
              {/* Dot indicator */}
              <circle
                cx={district.labelX}
                cy={district.labelY}
                r="3"
                fill="#ffffff"
                opacity="0.8"
              />

              {/* Label */}
              <text
                x={district.labelX + 6}
                y={district.labelY + 3}
                fill="var(--text-primary)"
                fontSize="8px"
                fontWeight="700"
                style={{
                  pointerEvents: 'none',
                  textShadow: '0 1px 2px var(--bg-secondary)'
                }}
              >
                {district.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip info bar */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {hovered ? (
          <>
            <div>
              <strong>{hovered}</strong> District
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge badge-${getStatusText(hovered) === 'Good' ? 'success' : getStatusText(hovered) === 'Low' ? 'warning' : 'danger'}`}>
                {getStatusText(hovered)} ({getUnits(hovered)} Units)
              </span>
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', width: '100%' }}>
            Hover over map districts to view real-time availability
          </div>
        )}
      </div>
    </div>
  );
};

export default SriLankaMap;
