import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, AlertTriangle, HelpCircle, Activity } from 'lucide-react';

const Prediction = ({ user }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Toggle factors state
  const [factors, setFactors] = useState({
    accidentRate: true,
    outbreaks: true,
    weather: true,
    publicEvents: false,
    historicalUsage: true
  });

  const fetchPredictions = () => {
    setLoading(true);
    fetch('/api/predictions', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPredictions(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPredictions();
  }, [user]);

  const handleRecalculate = () => {
    setUpdating(true);
    fetch('/api/predictions/recalculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPredictions(data);
        }
        setUpdating(false);
      })
      .catch(err => {
        console.error(err);
        setUpdating(false);
      });
  };

  const handleToggleFactor = (factorKey) => {
    setFactors(prev => ({
      ...prev,
      [factorKey]: !prev[factorKey]
    }));
    // Simulate updating predictions based on toggling factors
    handleRecalculate();
  };

  // Custom SVG Multi-Line Chart coordinates helper
  // Map monthly data to coordinates inside a 600x220 viewBox
  const lineChartWidth = 600;
  const lineChartHeight = 220;
  const paddingX = 50;
  const paddingY = 30;

  const daysLabel = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  // Render trend lines for the top 3 districts: Colombo, Kandy, Galle
  const colomboTrend = predictions.find(p => p.district === 'Colombo')?.trend || [70, 75, 80, 85, 90, 88, 92];
  const kandyTrend = predictions.find(p => p.district === 'Kandy')?.trend || [50, 52, 55, 60, 58, 62, 65];
  const galleTrend = predictions.find(p => p.district === 'Galle')?.trend || [40, 42, 45, 43, 44, 45, 47];

  const mapPoints = (trend) => {
    return trend.map((val, index) => {
      const x = paddingX + (index * (lineChartWidth - paddingX * 2)) / (trend.length - 1);
      // scale max value 100
      const y = lineChartHeight - paddingY - (val * (lineChartHeight - paddingY * 2)) / 100;
      return { x, y };
    });
  };

  const colomboPoints = mapPoints(colomboTrend);
  const kandyPoints = mapPoints(kandyTrend);
  const gallePoints = mapPoints(galleTrend);

  const getPath = (points) => {
    if (points.length === 0) return '';
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Blood Shortage Prediction</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shortage risk forecasting based on environmental factors</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleRecalculate}
          disabled={updating}
        >
          <RefreshCw size={16} className={updating ? 'animate-spin' : ''} />
          <span>{updating ? 'Running Predictor...' : 'Recalculate'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }} className="flex-column-responsive">
        {/* Left: Trend Graph */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>7-Day Shortage Risk Trend (%)</h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                <span>Colombo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
                <span>Kandy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-info)' }} />
                <span>Galle</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Custom Responsive SVG Chart */}
            <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} style={{ width: '100%', height: '100%' }}>
              {/* Horizontal grid lines */}
              {[0, 20, 40, 60, 80, 100].map(val => {
                const y = lineChartHeight - paddingY - (val * (lineChartHeight - paddingY * 2)) / 100;
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={lineChartWidth - paddingX}
                      y2={y}
                      stroke="var(--border-color)"
                      strokeWidth="0.5"
                      strokeDasharray="4 4"
                    />
                    <text x={paddingX - 8} y={y + 3} fill="var(--text-secondary)" fontSize="8px" fontWeight="600" textAnchor="end">
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Line paths */}
              <path d={getPath(colomboPoints)} fill="none" stroke="var(--color-danger)" strokeWidth="2.5" />
              <path d={getPath(kandyPoints)} fill="none" stroke="var(--color-warning)" strokeWidth="2.5" />
              <path d={getPath(gallePoints)} fill="none" stroke="var(--color-info)" strokeWidth="2.5" />

              {/* Dots */}
              {colomboPoints.map((p, i) => <circle key={`c-${i}`} cx={p.x} cy={p.y} r="3" fill="var(--color-danger)" stroke="#ffffff" strokeWidth="1" />)}
              {kandyPoints.map((p, i) => <circle key={`k-${i}`} cx={p.x} cy={p.y} r="3" fill="var(--color-warning)" stroke="#ffffff" strokeWidth="1" />)}
              {gallePoints.map((p, i) => <circle key={`g-${i}`} cx={p.x} cy={p.y} r="3" fill="var(--color-info)" stroke="#ffffff" strokeWidth="1" />)}

              {/* X Axis Labels */}
              {daysLabel.map((day, index) => {
                const x = paddingX + (index * (lineChartWidth - paddingX * 2)) / (daysLabel.length - 1);
                return (
                  <text key={day} x={x} y={lineChartHeight - 8} fill="var(--text-secondary)" fontSize="8px" fontWeight="600" textAnchor="middle">
                    {day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Predictor Factors Checklist */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Active Predictor Factors</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Enable or disable parameters used by the machine learning algorithm to calculate regional shortages:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* Factor 1: Accident Rate */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <input
                type="checkbox"
                checked={factors.accidentRate}
                onChange={() => handleToggleFactor('accidentRate')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Accident Rate Statistics</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Calculates emergency surgical demands</p>
              </div>
            </label>

            {/* Factor 2: Disease Outbreaks */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <input
                type="checkbox"
                checked={factors.outbreaks}
                onChange={() => handleToggleFactor('outbreaks')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Dengue / Disease Outbreaks</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Estimates platelet demand spikes</p>
              </div>
            </label>

            {/* Factor 3: Weather Conditions */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <input
                type="checkbox"
                checked={factors.weather}
                onChange={() => handleToggleFactor('weather')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Monsoon & Weather Constraints</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Predicts donor mobilization disruptions</p>
              </div>
            </label>

            {/* Factor 4: Public Events */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <input
                type="checkbox"
                checked={factors.publicEvents}
                onChange={() => handleToggleFactor('publicEvents')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Festivals & Public Holidays</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Monitors donation camp attendance rates</p>
              </div>
            </label>

            {/* Factor 5: Historical Usage */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <input
                type="checkbox"
                checked={factors.historicalUsage}
                onChange={() => handleToggleFactor('historicalUsage')}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Historical Seasonal Patterns</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Analyzes month-over-month trend variations</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Forecast Table Summary */}
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden', marginTop: '10px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, padding: '18px 24px', borderBottom: '1px solid var(--border-color)' }}>
          7-Day Shortage Risk Summary
        </h3>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading prediction logs...</div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>District Location</th>
                  <th>Risk Rate (%)</th>
                  <th>Warning Grade</th>
                  <th>Current Stock Status</th>
                  <th>Prediction Metric Status</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.district}>
                    <td style={{ fontWeight: 700 }}>{p.district}</td>
                    <td style={{ fontWeight: 800 }}>{p.shortageRisk}%</td>
                    <td>
                      <span className={`badge badge-${p.riskLevel === 'High Risk' ? 'danger' : p.riskLevel === 'Medium Risk' ? 'warning' : 'success'}`}>
                        {p.riskLevel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar-container" style={{ width: '80px', height: '6px' }}>
                          <div className="progress-bar-fill" style={{ width: `${p.shortageRisk}%`, backgroundColor: p.riskLevel === 'High Risk' ? 'var(--color-danger)' : p.riskLevel === 'Medium Risk' ? 'var(--color-warning)' : 'var(--color-success)' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: p.riskLevel === 'High Risk' ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                        <Activity size={14} />
                        <span>{p.riskLevel === 'High Risk' ? 'Action required - low reserves predicted' : 'Stable levels predicted'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Prediction;
