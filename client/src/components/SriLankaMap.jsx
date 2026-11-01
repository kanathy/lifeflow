import React, { useState, useRef } from 'react';
import SRI_LANKA_MAP from '../data/sriLankaDistricts';

const EMPTY_DISTRICT_DATA = {
  totalUnits: 0,
  status: 'Critical',
  bloodGroups: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 }
};

const SriLankaMap = ({ availability, onDistrictSelect, selectedDistrict }) => {
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const getDistrictInfo = (name) => {
    if (!name) return EMPTY_DISTRICT_DATA;
    
    // Check direct match
    if (availability && availability[name] && availability[name].totalUnits !== undefined) {
      return availability[name];
    }

    // Check alias Moneragala / Monaragala
    const alias = name === 'Moneragala' ? 'Monaragala' : name === 'Monaragala' ? 'Moneragala' : name;
    if (availability && availability[alias] && availability[alias].totalUnits !== undefined) {
      return availability[alias];
    }

    // Case-insensitive match in availability
    if (availability) {
      const matchKey = Object.keys(availability).find(k => k.toLowerCase() === name.toLowerCase());
      if (matchKey && availability[matchKey].totalUnits !== undefined) {
        return availability[matchKey];
      }
    }

    // Default fallback if district has no inventory records
    return EMPTY_DISTRICT_DATA;
  };

  const getDistrictColor = (status) => {
    if (status === 'Good') return '#10b981'; // Green
    if (status === 'Low') return '#f59e0b';  // Amber
    return '#ef4444';                       // Red (Critical)
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const getBloodBreakdown = (info) => {
    if (info?.bloodGroups) {
      return info.bloodGroups;
    }
    return { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 };
  };

  const currentDistrictName = hovered || selectedDistrict || 'Colombo';
  const activeDistrictInfo = getDistrictInfo(currentDistrictName);
  const activeBreakdown = activeDistrictInfo ? getBloodBreakdown(activeDistrictInfo) : null;
  const tooltipDistrictInfo = hovered ? getDistrictInfo(hovered) : null;
  const tooltipBreakdown = tooltipDistrictInfo ? getBloodBreakdown(tooltipDistrictInfo) : null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ 
        position: 'relative', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      {/* Mini Status Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '6px'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          Good (&gt;300)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          Low (100-300)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          Critical (&lt;100)
        </span>
      </div>

      {/* SVG Map of all 25 Districts */}
      <svg
        viewBox="0 0 450 793"
        style={{
          width: '100%',
          maxHeight: '370px',
          filter: 'drop-shadow(0px 8px 20px rgba(0, 0, 0, 0.08))',
          overflow: 'visible'
        }}
      >
        <defs>
          <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {SRI_LANKA_MAP.map((dist) => {
          const info = getDistrictInfo(dist.name);
          const color = getDistrictColor(info.status);
          const isHovered = hovered === dist.name;
          const isSelected = selectedDistrict && (selectedDistrict.toLowerCase() === dist.name.toLowerCase() || (selectedDistrict === 'Monaragala' && dist.name === 'Moneragala'));

          return (
            <path
              key={dist.id}
              id={dist.id}
              d={dist.path}
              fill={color}
              stroke={isHovered ? '#ffffff' : isSelected ? '#1e293b' : 'rgba(255, 255, 255, 0.65)'}
              strokeWidth={isHovered ? '3.5' : isSelected ? '2.8' : '1.2'}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={isHovered ? 1 : isSelected ? 0.96 : 0.88}
              filter={isHovered || isSelected ? 'url(#hoverGlow) brightness(1.15)' : 'none'}
              style={{
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transformOrigin: 'center center'
              }}
              onMouseEnter={() => setHovered(dist.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onDistrictSelect && onDistrictSelect(dist.name)}
            />
          );
        })}
      </svg>

      {/* Cursor Follower Floating Tooltip */}
      {hovered && tooltipDistrictInfo && (
        <div 
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 14}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.25)',
            zIndex: 100,
            minWidth: '220px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
              {hovered}
            </span>
            <span 
              className={`badge badge-${tooltipDistrictInfo.status === 'Good' ? 'success' : tooltipDistrictInfo.status === 'Low' ? 'warning' : 'danger'}`}
              style={{ fontSize: '0.68rem', padding: '2px 7px' }}
            >
              {tooltipDistrictInfo.status}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Total Stock: <strong style={{ color: 'var(--text-primary)' }}>{tooltipDistrictInfo.totalUnits} Units</strong>
          </div>

          {/* Blood group units mini grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            marginTop: '4px',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-color)'
          }}>
            {tooltipBreakdown && Object.entries(tooltipBreakdown).map(([bg, count]) => (
              <div 
                key={bg}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '3px 2px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.68rem',
                  border: count < 10 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid transparent'
                }}
              >
                <div style={{ fontWeight: 800, color: count < 10 ? '#ef4444' : '#e11d48', fontSize: '0.7rem' }}>{bg}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.72rem' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Summary Pill */}
      <div style={{
        marginTop: '12px',
        padding: '10px 14px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm, 8px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '0.8rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease'
      }}>
        {activeDistrictInfo ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                <strong>{currentDistrictName}</strong> District {hovered ? '(Hovered)' : ''}
              </div>
              <span className={`badge badge-${activeDistrictInfo.status === 'Good' ? 'success' : activeDistrictInfo.status === 'Low' ? 'warning' : 'danger'}`}>
                {activeDistrictInfo.status} • Total: {activeDistrictInfo.totalUnits} Units
              </span>
            </div>
            {/* Blood group pills */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
              {activeBreakdown && Object.entries(activeBreakdown).map(([bg, count]) => (
                <span 
                  key={bg}
                  style={{
                    backgroundColor: 'var(--bg-card, #fff)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '5px',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <strong style={{ color: count < 10 ? '#ef4444' : '#e11d48' }}>{bg}:</strong>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </span>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', width: '100%', fontSize: '0.76rem' }}>
            Select or hover over any district on the map to view all blood group stock details
          </div>
        )}
      </div>
    </div>
  );
};

export default SriLankaMap;
