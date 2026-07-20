import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplet,
  Users,
  Building2,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import SriLankaMap from '../components/SriLankaMap';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = () => {
    setRefreshing(true);
    fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Dashboard Analytics...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { cards, bloodGroupStock, districtAvailability, predictions, monthlyOverview, recentRequests, recentDonations } = stats || {};

  // Custom SVG Line Chart coordinates helper
  // Map monthly data to coordinates inside a 500x200 viewBox
  const lineChartWidth = 500;
  const lineChartHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  const pointsDonations = monthlyOverview?.map((d, index) => {
    const x = paddingX + (index * (lineChartWidth - paddingX * 2)) / (monthlyOverview.length - 1);
    // scale max value 2500
    const y = lineChartHeight - paddingY - (d.donations * (lineChartHeight - paddingY * 2)) / 2500;
    return { x, y, val: d.donations };
  }) || [];

  const pointsUsage = monthlyOverview?.map((d, index) => {
    const x = paddingX + (index * (lineChartWidth - paddingX * 2)) / (monthlyOverview.length - 1);
    // scale max value 2500
    const y = lineChartHeight - paddingY - (d.usage * (lineChartHeight - paddingY * 2)) / 2500;
    return { x, y, val: d.usage };
  }) || [];

  const pathDonations = pointsDonations.length > 0
    ? `M ${pointsDonations[0].x} ${pointsDonations[0].y} ` + pointsDonations.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const pathUsage = pointsUsage.length > 0
    ? `M ${pointsUsage[0].x} ${pointsUsage[0].y} ` + pointsUsage.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title / Refresh */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Analytics Overview</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sri Lanka blood reserve network statistics</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Sync Live Data'}</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total Blood Units */}
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '12px', borderRadius: '12px' }}>
            <Droplet size={24} color="var(--color-primary)" fill="var(--color-primary)" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Blood Units</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0' }}>{cards?.totalBloodUnits?.toLocaleString() || '0'}</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 'bold' }}>↑ 8.5% from last month</span>
          </div>
        </div>

        {/* Card 2: Active Donors */}
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ backgroundColor: 'var(--color-info-light)', padding: '12px', borderRadius: '12px' }}>
            <Users size={24} color="var(--color-info)" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Donors</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0' }}>{cards?.activeDonors?.toLocaleString() || '0'}</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 'bold' }}>↑ 6.2% from last month</span>
          </div>
        </div>

        {/* Card 3: Registered Hospitals */}
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ backgroundColor: 'var(--color-success-light)', padding: '12px', borderRadius: '12px' }}>
            <Building2 size={24} color="var(--color-success)" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Registered Hospitals</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0' }}>{cards?.registeredHospitals || '0'}</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', fontWeight: 'bold' }}>↑ 2 new this month</span>
          </div>
        </div>

        {/* Card 4: Emergency Requests */}
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ backgroundColor: 'var(--color-warning-light)', padding: '12px', borderRadius: '12px' }}>
            <AlertTriangle size={24} color="var(--color-warning)" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Emergency Requests</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0' }}>{cards?.emergencyRequests || '0'}</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>↑ {cards?.emergencyRequests || '0'} active requests</span>
          </div>
        </div>

        {/* Card 5: Expiring Soon */}
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ backgroundColor: 'var(--color-warning-light)', padding: '12px', borderRadius: '12px' }}>
            <Calendar size={24} color="var(--color-warning)" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Expiring Soon</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0' }}>{cards?.expiringSoon || '0'}</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>Units within 7 days</span>
          </div>
        </div>

        {/* Card 6: Critical Shortages */}
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ backgroundColor: 'var(--color-danger-light)', padding: '12px', borderRadius: '12px' }}>
            <ShieldAlert size={24} color="var(--color-danger)" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Critical Shortages</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0' }}>{cards?.criticalShortages || '0'}</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>Districts at risk</span>
          </div>
        </div>
      </div>

      {/* Row 2: Blood Stock Progress + Sri Lanka Map + Prediction summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }} className="dashboard-row-responsive">
        {/* Left: Blood Stock by Blood Group */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Blood Stock by Blood Group</h3>
            <button onClick={() => navigate('/inventory')} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Inventory</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'space-between' }}>
            {Object.keys(bloodGroupStock || {}).map((group) => {
              const units = bloodGroupStock[group];
              const maxScale = 500; // scale standard max unit limit
              const percentage = Math.min(100, (units / maxScale) * 100);

              return (
                <div key={group} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ width: '40px', fontSize: '0.8rem', fontWeight: 700 }}>{group}</span>
                  <div style={{ flex: 1 }} className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: 'var(--color-primary)'
                      }}
                    />
                  </div>
                  <span style={{ width: '60px', fontSize: '0.75rem', fontWeight: 600, textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {units} Units
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: District-wise Map */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>District-wise Availability</h3>
            <button onClick={() => navigate('/monitoring')} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Details</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <SriLankaMap availability={districtAvailability} onDistrictSelect={(dist) => navigate('/monitoring')} />
          </div>
        </div>

        {/* Right: Blood Shortage Prediction */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Blood Shortage Prediction (7 Days)</h3>
            <button onClick={() => navigate('/prediction')} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Prediction</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'space-between' }}>
            {predictions?.map((pred) => (
              <div key={pred.district} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="flex-between">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{pred.district}</span>
                  <span className={`badge badge-${pred.riskLevel === 'High Risk' ? 'danger' : pred.riskLevel === 'Medium Risk' ? 'warning' : 'success'}`}>
                    {pred.riskLevel}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }} className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pred.shortageRisk}%`,
                        backgroundColor: pred.riskLevel === 'High Risk' ? 'var(--color-danger)' : pred.riskLevel === 'Medium Risk' ? 'var(--color-warning)' : 'var(--color-success)'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '30px', textAlign: 'right' }}>
                    {pred.shortageRisk}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Monthly Line Chart + Recent Emergency Table + Recent Donations Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '24px' }} className="dashboard-row-responsive">
        {/* Monthly line chart */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Monthly Overview</h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                <span>Donations</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-info)' }} />
                <span>Usage</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Custom Responsive SVG Chart */}
            <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} style={{ width: '100%', height: '100%' }}>
              {/* Horizontal grid lines */}
              {[0, 500, 1000, 1500, 2000, 2500].map(val => {
                const y = lineChartHeight - paddingY - (val * (lineChartHeight - paddingY * 2)) / 2500;
                return (
                  <line
                    key={val}
                    x1={paddingX}
                    y1={y}
                    x2={lineChartWidth - paddingX}
                    y2={y}
                    stroke="var(--border-color)"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Line paths */}
              <path d={pathDonations} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
              <path d={pathUsage} fill="none" stroke="var(--color-info)" strokeWidth="2.5" />

              {/* Dots on points */}
              {pointsDonations.map((p, i) => (
                <circle key={`d-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--color-primary)" stroke="#ffffff" strokeWidth="1" />
              ))}
              {pointsUsage.map((p, i) => (
                <circle key={`u-${i}`} cx={p.x} cy={p.y} r="4" fill="var(--color-info)" stroke="#ffffff" strokeWidth="1" />
              ))}

              {/* X Axis Labels */}
              {monthlyOverview?.map((d, index) => {
                const x = paddingX + (index * (lineChartWidth - paddingX * 2)) / (monthlyOverview.length - 1);
                return (
                  <text key={d.month} x={x} y={lineChartHeight - 4} fill="var(--text-secondary)" fontSize="8px" fontWeight="600" textAnchor="middle">
                    {d.month}
                  </text>
                );
              })}

              {/* Y Axis Labels */}
              {[0, 1000, 2000].map(val => {
                const y = lineChartHeight - paddingY - (val * (lineChartHeight - paddingY * 2)) / 2500;
                return (
                  <text key={val} x={paddingX - 8} y={y + 3} fill="var(--text-secondary)" fontSize="8px" fontWeight="600" textAnchor="end">
                    {val >= 1000 ? `${val/1000}K` : val}
                  </text>
                );
              })}
            </svg>
          </div>
          <button onClick={() => navigate('/reports')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-primary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', fontWeight: 600 }}>
            <span>View Full Analytics Report</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Center: Recent Emergency Requests */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Emergency Requests</h3>
            <button onClick={() => navigate('/requests')} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              View All
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Patient</th>
                  <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Group</th>
                  <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Hospital</th>
                  <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests?.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 0', fontWeight: 500 }}>{r.patientName}</td>
                    <td style={{ padding: '8px 0' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{r.bloodGroup}</span>
                    </td>
                    <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>{r.hospital}</td>
                    <td style={{ padding: '8px 0' }}>
                      <span className={`badge badge-${r.status === 'Completed' ? 'success' : r.status === 'Accepted' ? 'info' : 'warning'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Donations */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Donations</h3>
            <button onClick={() => navigate('/donors')} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              View All
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentDonations?.map((d) => (
              <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${d.name}`}
                  alt={d.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.name}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{d.district} • {new Date(d.lastDonationDate).toLocaleDateString('en-GB')}</p>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>{d.bloodGroup}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          .dashboard-row-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
