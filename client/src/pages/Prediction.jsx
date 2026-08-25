import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, RefreshCw, Activity, Calendar, AlertTriangle, Droplet, Zap, ChevronRight } from 'lucide-react';

// ─── Mini sparkline SVG ───────────────────────────────────────────────────────
const MiniSparkline = ({ data = [], color = '#e11d48', width = 180, height = 60 }) => {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 4) + 2;
    const y = height - 2 - ((v - min) / (max - min || 1)) * (height - 4);
    return { x, y };
  });
  const pathD = 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x},${height} L ${pts[0].x},${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} stroke="#fff" strokeWidth="1" />
      ))}
    </svg>
  );
};

// ─── Full multi-line chart ────────────────────────────────────────────────────
const MultiLineChart = ({ diseaseTrend, accidentTrend, shortageTrend }) => {
  const W = 620, H = 240, PX = 52, PY = 28;
  const allVals = [...(diseaseTrend || []), ...(accidentTrend || []), ...(shortageTrend || [])];
  const minV = 0;
  const maxV = Math.max(...allVals, 100) * 1.08;
  const days = ['25 May', '26 May', '27 May', '28 May', '29 May', '30 May', '31 May'];

  const toX = i => PX + (i / 6) * (W - PX * 2);
  const toY = v => H - PY - ((v - minV) / (maxV - minV || 1)) * (H - PY * 2);

  const makePath = arr => arr ? 'M ' + arr.map((v, i) => `${toX(i)},${toY(v)}`).join(' L ') : '';

  const gridVals = [0, Math.round(maxV * 0.25), Math.round(maxV * 0.5), Math.round(maxV * 0.75), Math.round(maxV)];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
      {gridVals.map((v, idx) => {
        const y = toY(v);
        return (
          <g key={idx}>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="var(--border-color)" strokeWidth="0.6" strokeDasharray="4 4" />
            <text x={PX - 6} y={y + 4} fill="var(--text-secondary)" fontSize="9" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {days.map((d, i) => (
        <text key={d} x={toX(i)} y={H - 8} fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{d}</text>
      ))}
      {diseaseTrend  && <path d={makePath(diseaseTrend)}  fill="none" stroke="#8b5cf6" strokeWidth="2.5" />}
      {accidentTrend && <path d={makePath(accidentTrend)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />}
      {shortageTrend && <path d={makePath(shortageTrend)} fill="none" stroke="#ef4444" strokeWidth="2.5" />}
      {diseaseTrend?.map((v, i)  => <circle key={`d${i}`} cx={toX(i)} cy={toY(v)} r="3" fill="#8b5cf6" stroke="#fff" strokeWidth="1" />)}
      {accidentTrend?.map((v, i) => <circle key={`a${i}`} cx={toX(i)} cy={toY(v)} r="3" fill="#f59e0b" stroke="#fff" strokeWidth="1" />)}
      {shortageTrend?.map((v, i) => <circle key={`s${i}`} cx={toX(i)} cy={toY(v)} r="3" fill="#ef4444" stroke="#fff" strokeWidth="1" />)}
    </svg>
  );
};

// ─── Progress bar row ─────────────────────────────────────────────────────────
const BarRow = ({ name, count, percentage, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <div style={{ width: '110px', fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{name}</div>
    <div style={{ flex: 1, height: '5px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
      <div style={{ width: `${percentage}%`, height: '100%', borderRadius: '99px', background: color }} />
    </div>
    <div style={{ fontSize: '0.72rem', fontWeight: 700, minWidth: '32px', textAlign: 'right' }}>{count}</div>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', minWidth: '42px', textAlign: 'right' }}>({percentage}%)</div>
  </div>
);

// ─── Date range picker ────────────────────────────────────────────────────────
const DateRange = ({ from, to, onFromChange, onToChange }) => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Date Range</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>From</span>
      <input type="date" value={from} onChange={e => onFromChange(e.target.value)}
        style={{ fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '3px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>To</span>
      <input type="date" value={to} onChange={e => onToChange(e.target.value)}
        style={{ fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '3px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
    </div>
  </div>
);

// ─── Main Prediction Page ─────────────────────────────────────────────────────
const Prediction = ({ user }) => {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

  // Model states
  const [diseaseData,  setDiseaseData]  = useState(null);
  const [accidentData, setAccidentData] = useState(null);
  const [shortageData, setShortageData] = useState(null);
  const [shortageList, setShortageList] = useState([]);

  const [loadingDisease,  setLoadingDisease]  = useState(false);
  const [diseaseError, setDiseaseError] = useState('');
  const [loadingAccident, setLoadingAccident] = useState(false);
  const [accidentError, setAccidentError] = useState('');
  const [loadingShortage, setLoadingShortage] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Date ranges per model
  const [dFrom, setDFrom] = useState(weekAgo);
  const [dTo,   setDTo]   = useState(today);
  const [dDistrict, setDDistrict] = useState('');
  const [dBloodGroup, setDBloodGroup] = useState('');
  const [dRainfall, setDRainfall] = useState('');
  const [dFestival, setDFestival] = useState('');

  const [aFrom, setAFrom] = useState(weekAgo);
  const [aTo,   setATo]   = useState(today);
  const [aDistrict, setADistrict] = useState('');
  const [aBloodGroup, setABloodGroup] = useState('');
  const [aRainfall, setARainfall] = useState('');
  const [aFestival, setAFestival] = useState('');

  const [sFrom, setSFrom] = useState(weekAgo);
  const [sTo,   setSTo]   = useState(today);

  // Chart filter
  const [chartFilter, setChartFilter] = useState('All Models');

  const authHeader = { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' };

  // Fetch disease prediction
  const fetchDisease = useCallback(async () => {
    if (!dDistrict || !dBloodGroup || dRainfall === '' || dFestival === '') {
      setDiseaseData(null);
      setDiseaseError('');
      setLoadingDisease(false);
      return;
    }

    setLoadingDisease(true);
    setDiseaseError('');
    try {
      const selectedDate = new Date(`${dTo}T00:00:00`);
      const res = await fetch('/api/predictions/disease', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          year: selectedDate.getFullYear(),
          monthNumber: selectedDate.getMonth() + 1,
          district: dDistrict,
          bloodGroup: dBloodGroup,
          rainfall: Number(dRainfall),
          festival: Number(dFestival)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Disease model prediction failed');
      setDiseaseData(data);
    } catch (e) {
      console.error('Disease fetch error:', e);
      setDiseaseData(null);
      setDiseaseError(e.message);
    }
    setLoadingDisease(false);
  }, [dTo, dDistrict, dBloodGroup, dRainfall, dFestival]);

  // Fetch accident prediction
  const fetchAccident = useCallback(async () => {
    if (!aDistrict || !aBloodGroup || aRainfall === '' || aFestival === '') {
      setAccidentData(null);
      setAccidentError('');
      setLoadingAccident(false);
      return;
    }

    setLoadingAccident(true);
    setAccidentError('');
    try {
      const selectedDate = new Date(`${aTo}T00:00:00`);
      const res = await fetch('/api/predictions/accident', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          year: selectedDate.getFullYear(),
          monthNumber: selectedDate.getMonth() + 1,
          district: aDistrict,
          bloodGroup: aBloodGroup,
          rainfall: Number(aRainfall),
          festival: Number(aFestival)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Accident model prediction failed');
      setAccidentData(data);
    } catch (e) {
      console.error('Accident fetch error:', e);
      setAccidentData(null);
      setAccidentError(e.message);
    }
    setLoadingAccident(false);
  }, [aTo, aDistrict, aBloodGroup, aRainfall, aFestival]);

  // Fetch blood shortage predictions
  const fetchShortage = useCallback(async () => {
    setLoadingShortage(true);
    try {
      const res = await fetch('/api/predictions', { headers: authHeader });
      const data = await res.json();
      if (Array.isArray(data)) {
        setShortageList(data);
        // Synthesize a shortage summary from top district
        const topRisk = data.length ? Math.max(...data.map(d => d.shortageRisk)) : 80;
        const topDistrict = data.find(d => d.shortageRisk === topRisk) || data[0];
        const topTrend = topDistrict?.trend || [70, 72, 75, 78, 80, 82, 86];
        setShortageData({
          shortageRisk: topRisk,
          riskLevel: topRisk > 70 ? 'High Risk' : topRisk >= 30 ? 'Medium Risk' : 'Low Risk',
          trend: topTrend,
          estimatedUnits: Math.round(topRisk * 1.86)
        });
      }
    } catch (e) {
      console.error('Shortage fetch error:', e);
    }
    setLoadingShortage(false);
  }, [sFrom, sTo]);

  useEffect(() => { fetchDisease(); },  [fetchDisease]);
  useEffect(() => { fetchAccident(); }, [fetchAccident]);
  useEffect(() => { fetchShortage(); }, [fetchShortage]);

  const handleRecalculateAll = async () => {
    setUpdating(true);
    await Promise.all([fetchDisease(), fetchAccident(), fetchShortage()]);
    setUpdating(false);
  };

  // Chart trend lines
  const diseaseTrendChart  = chartFilter !== 'Accident' && chartFilter !== 'Blood Shortage' ? diseaseData?.trend  : null;
  const accidentTrendChart = chartFilter !== 'Disease'  && chartFilter !== 'Blood Shortage' ? accidentData?.trend : null;
  const shortageTrendChart = chartFilter !== 'Disease'  && chartFilter !== 'Accident'       ? (shortageList.find(d => d.district === 'Colombo')?.trend || shortageData?.trend) : null;

  const cardStyle = {
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Prediction Analytics</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Model-wise prediction insights for diseases, accidents, and blood shortages</p>
        </div>
        <button className="btn btn-primary" onClick={handleRecalculateAll} disabled={updating}>
          <RefreshCw size={15} className={updating ? 'animate-spin' : ''} />
          <span>{updating ? 'Running Models...' : 'Recalculate All'}</span>
        </button>
      </div>

      {/* Section label */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Model-wise Predictions</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Select date or date range for each prediction model</p>
      </div>

      {/* ── 3 Model Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="grid-responsive-3">

        {/* ── Card 1: Disease Prediction ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={17} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#8b5cf6' }}>Disease Prediction</h3>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Predicts the number of disease cases</p>
            </div>
          </div>

          <DateRange from={dFrom} to={dTo} onFromChange={setDFrom} onToChange={setDTo} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              District
              <select value={dDistrict} onChange={e => setDDistrict(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '3px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="">Select district</option>
                {[
                  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
                  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
                  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
                  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
                  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
                ].map(district => <option key={district}>{district}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Blood Group
              <select value={dBloodGroup} onChange={e => setDBloodGroup(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '3px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="">Select blood group</option>
                {['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'].map(group => <option key={group} value={group}>{group}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Rainfall
              <input type="number" min="0" placeholder="e.g. 120" value={dRainfall} onChange={e => setDRainfall(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '3px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </label>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Festival
              <select value={dFestival} onChange={e => setDFestival(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '3px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="">Select</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={fetchDisease}
            disabled={!dDistrict || !dBloodGroup || dRainfall === '' || dFestival === '' || loadingDisease}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '7px 12px', marginBottom: '8px' }}
          >
            <RefreshCw size={13} className={loadingDisease ? 'animate-spin' : ''} />
            {loadingDisease ? 'Calculating...' : 'Calculate Prediction'}
          </button>

          {loadingDisease ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Running disease model...</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total Predicted Cases</p>
                  <p style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{diseaseError ? '—' : diseaseData?.predictedCases?.toLocaleString() ?? '—'}</p>
                  {diseaseError && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px' }}>{diseaseError}</p>}
                </div>
                {diseaseData?.trend && <MiniSparkline data={diseaseData.trend} color="#8b5cf6" />}
              </div>

              {(() => {
                const hotspots = (diseaseData?.topHotspots && diseaseData.topHotspots.length > 0)
                  ? diseaseData.topHotspots
                  : [
                      { name: 'Colombo', count: 8, percentage: 42.1 },
                      { name: 'Galle', count: 4, percentage: 21.1 },
                      { name: 'Kandy', count: 3, percentage: 15.8 },
                      { name: 'Batticaloa', count: 2, percentage: 10.5 },
                      { name: 'Jaffna', count: 2, percentage: 10.5 }
                    ];
                return (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '8px' }}>Top Disease Outbreaks</p>
                    {hotspots.map(h => (
                      <BarRow key={h.name} name={h.name} count={h.count} percentage={h.percentage} color="#8b5cf6" />
                    ))}
                  </div>
                );
              })()}

              <button onClick={fetchDisease} style={{ marginTop: '10px', fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'none', border: 'none' }}>
                View Detailed Report <ChevronRight size={13} />
              </button>
            </>
          )}
        </div>

        {/* ── Card 2: Accident Prediction ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={17} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f59e0b' }}>Accident Prediction</h3>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Predicts the number of accidents</p>
            </div>
          </div>

          <DateRange from={aFrom} to={aTo} onFromChange={setAFrom} onToChange={setATo} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              District
              <select value={aDistrict} onChange={e => setADistrict(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '3px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="">Select district</option>
                {[
                  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
                  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
                  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
                  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
                  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
                ].map(district => <option key={district}>{district}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Blood Group
              <select value={aBloodGroup} onChange={e => setABloodGroup(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '3px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="">Select blood group</option>
                {['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'].map(group => <option key={group} value={group}>{group}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Rainfall
              <input type="number" min="0" placeholder="e.g. 120" value={aRainfall} onChange={e => setARainfall(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '3px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </label>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Festival
              <select value={aFestival} onChange={e => setAFestival(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '3px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="">Select</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={fetchAccident}
            disabled={!aDistrict || !aBloodGroup || aRainfall === '' || aFestival === '' || loadingAccident}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '7px 12px', marginBottom: '8px' }}
          >
            <RefreshCw size={13} className={loadingAccident ? 'animate-spin' : ''} />
            {loadingAccident ? 'Calculating...' : 'Calculate Prediction'}
          </button>

          {loadingAccident ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Running accident model...</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total Predicted Accidents</p>
                  <p style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{accidentError ? '—' : accidentData?.predictedAccidents?.toLocaleString() ?? '—'}</p>
                  {accidentError && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px' }}>{accidentError}</p>}
                </div>
                {accidentData?.trend && <MiniSparkline data={accidentData.trend} color="#f59e0b" />}
              </div>

              {accidentData?.topHotspots && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '8px' }}>Top Accident Hotspots</p>
                  {accidentData.topHotspots.map(h => (
                    <BarRow key={h.name} name={h.name} count={h.count} percentage={h.percentage} color="#f59e0b" />
                  ))}
                </div>
              )}

              <button onClick={fetchAccident} style={{ marginTop: '10px', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'none', border: 'none' }}>
                View Detailed Report <ChevronRight size={13} />
              </button>
            </>
          )}
        </div>

        {/* ── Card 3: Blood Shortage Prediction ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplet size={17} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ef4444' }}>Blood Shortage Prediction</h3>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Predicts blood shortage risk and quantity</p>
            </div>
          </div>

          <DateRange from={sFrom} to={sTo} onFromChange={setSFrom} onToChange={setSTo} />

          {loadingShortage ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Running shortage model...</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Shortage Expected</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1 }}>
                    {shortageData ? (shortageData.shortageRisk > 40 ? 'Yes' : 'No') : '—'}
                  </p>
                  {shortageData && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Severity: </span>
                      <span className={`badge badge-${shortageData.riskLevel === 'High Risk' ? 'danger' : shortageData.riskLevel === 'Medium Risk' ? 'warning' : 'success'}`} style={{ fontSize: '0.68rem' }}>
                        {shortageData.riskLevel}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Estimated Shortage</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1, color: '#ef4444' }}>
                    {shortageData?.estimatedUnits ?? '—'} <span style={{ fontSize: '0.9rem' }}>Units</span>
                  </p>
                </div>
              </div>

              <MiniSparkline data={shortageData?.trend || []} color="#ef4444" width={220} height={50} />

              {shortageList.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '8px' }}>At-Risk Blood Groups</p>
                  {[
                    { bg: 'O+', units: 92, pct: 49.5 },
                    { bg: 'A+', units: 45, pct: 24.2 },
                    { bg: 'B+', units: 28, pct: 15.1 },
                    { bg: 'AB+', units: 13, pct: 7.0 },
                    { bg: 'O-', units: 8,  pct: 4.3 },
                  ].map(r => (
                    <div key={r.bg} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, minWidth: '30px' }}>{r.bg}</span>
                      <div style={{ flex: 1, height: '5px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ width: `${r.pct}%`, height: '100%', borderRadius: '99px', background: '#ef4444' }} />
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', minWidth: '80px', textAlign: 'right' }}>{r.units} Units ({r.pct}%)</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={fetchShortage} style={{ marginTop: '10px', fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'none', border: 'none' }}>
                View Detailed Report <ChevronRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Daily Prediction Trend Chart ── */}
      <div className="dashboard-card">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Daily Prediction Trend</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trends for the selected period</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }} />
                <span>Disease Cases</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <span>Predicted Accidents</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <span>Blood Shortage (Units)</span>
              </div>
            </div>
            <select
              value={chartFilter}
              onChange={e => setChartFilter(e.target.value)}
              style={{ fontSize: '0.78rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '5px 10px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option>All Models</option>
              <option>Disease</option>
              <option>Accident</option>
              <option>Blood Shortage</option>
            </select>
          </div>
        </div>

        <div style={{ height: '240px' }}>
          <MultiLineChart
            diseaseTrend={diseaseTrendChart}
            accidentTrend={accidentTrendChart}
            shortageTrend={shortageTrendChart}
          />
        </div>
      </div>

      {/* ── 7-Day Shortage Risk Summary ── */}
      <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>7-Day Shortage Risk Summary</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Summary of blood shortage risk for districts for the selected date range</p>
        </div>

        {loadingShortage ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading prediction data...</div>
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
                {shortageList.map(p => (
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
                          <div className="progress-bar-fill" style={{
                            width: `${p.shortageRisk}%`, height: '100%',
                            backgroundColor: p.riskLevel === 'High Risk' ? 'var(--color-danger)' : p.riskLevel === 'Medium Risk' ? 'var(--color-warning)' : 'var(--color-success)'
                          }} />
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
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1100px) {
          .grid-responsive-3 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 700px) {
          .grid-responsive-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Prediction;

