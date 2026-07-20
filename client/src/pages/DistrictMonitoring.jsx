import React, { useState, useEffect } from 'react';
import SriLankaMap from '../components/SriLankaMap';
import { ShieldAlert, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

const DistrictMonitoring = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('Colombo');

  useEffect(() => {
    fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(stats => {
        setData(stats);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading monitoring records...</div>;
  }

  const { districtAvailability, bloodGroupStock } = data || {};

  // Formulate a detailed list of all districts
  const districts = Object.keys(districtAvailability || {}).map(name => {
    const details = districtAvailability[name];
    // Shortage Risk logic based on units
    let shortageRisk = 'Low';
    let riskPercent = 20;
    if (details.status === 'Critical') {
      shortageRisk = 'High';
      riskPercent = 85;
    } else if (details.status === 'Low') {
      shortageRisk = 'Medium';
      riskPercent = 55;
    }

    return {
      name,
      totalUnits: details.totalUnits,
      status: details.status,
      shortageRisk,
      riskPercent
    };
  });

  const selectedDetails = districts.find(d => d.name === selectedDistrict) || districts[0];

  const handleDispatchAlert = (distName) => {
    alert(`Emergency Stock Transfer broadcasted for ${distName} District! Coordinating with nearest regional blood banks.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>District Monitoring</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Real-time regional blood reserve network alerts</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }} className="flex-column-responsive">
        {/* Left: Map Card */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', width: '100%' }}>Interactive Regional Status</h3>
          <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SriLankaMap availability={districtAvailability} onDistrictSelect={(dist) => setSelectedDistrict(dist)} />
          </div>
        </div>

        {/* Right: Detailed List & Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active selection info */}
          {selectedDetails && (
            <div className="dashboard-card" style={{
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
              borderLeft: `5px solid ${selectedDetails.status === 'Good' ? 'var(--color-success)' : selectedDetails.status === 'Low' ? 'var(--color-warning)' : 'var(--color-danger)'}`
            }}>
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedDetails.name} District details</h2>
                <span className={`badge badge-${selectedDetails.status === 'Good' ? 'success' : selectedDetails.status === 'Low' ? 'warning' : 'danger'}`}>
                  {selectedDetails.status} Availability
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', margin: '16px 0' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Blood Stock</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedDetails.totalUnits} Units</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Shortage Risk</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: selectedDetails.shortageRisk === 'High' ? 'var(--color-danger)' : selectedDetails.shortageRisk === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {selectedDetails.shortageRisk} Risk
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coordinating Center</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedDetails.name} General</p>
                </div>
              </div>

              {selectedDetails.status === 'Critical' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'var(--color-danger-light)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--color-danger)',
                  marginTop: '16px'
                }}>
                  <ShieldAlert color="var(--color-danger)" size={20} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)' }}>CRITICAL RESERVE ALERT</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--color-danger)' }}>Supply is below 100 units. Transfer requested immediately.</p>
                  </div>
                  <button onClick={() => handleDispatchAlert(selectedDetails.name)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>
                    Coordinate Dispatch
                  </button>
                </div>
              )}
            </div>
          )}

          {/* District Status List */}
          <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, padding: '18px 24px', borderBottom: '1px solid var(--border-color)' }}>
              District Status Overview
            </h3>
            <div style={{ overflowY: 'auto', maxHeight: '250px', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'left' }}>
                    <th style={{ padding: '10px 18px' }}>District</th>
                    <th style={{ padding: '10px 18px' }}>Total Units</th>
                    <th style={{ padding: '10px 18px' }}>Risk Factor</th>
                    <th style={{ padding: '10px 18px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((d) => (
                    <tr
                      key={d.name}
                      onClick={() => setSelectedDistrict(d.name)}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        backgroundColor: selectedDistrict === d.name ? 'var(--color-primary-light)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '10px 18px', fontWeight: 700 }}>{d.name}</td>
                      <td style={{ padding: '10px 18px', fontWeight: 600 }}>{d.totalUnits} Units</td>
                      <td style={{ padding: '10px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar-container" style={{ width: '60px', height: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${d.riskPercent}%`, backgroundColor: d.status === 'Good' ? 'var(--color-success)' : d.status === 'Low' ? 'var(--color-warning)' : 'var(--color-danger)' }} />
                          </div>
                          <span style={{ fontSize: '0.7rem' }}>{d.riskPercent}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 18px' }}>
                        <span className={`badge badge-${d.status === 'Good' ? 'success' : d.status === 'Low' ? 'warning' : 'danger'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictMonitoring;
