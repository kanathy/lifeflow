import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SriLankaMap from '../components/SriLankaMap';
import SearchWithSuggestions from '../components/SearchWithSuggestions';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  X,
  Mail,
  Truck,
  Building2,
  Sparkles,
  Clock,
  Send,
  Check,
  CheckCircle2,
  Phone,
  ExternalLink
} from 'lucide-react';

// ─── Sri Lanka District GPS Coordinates (lat, lng) ────────────────────────────
const DISTRICT_COORDS = {
  'Ampara':        { lat: 7.2975,  lng: 81.6747 },
  'Anuradhapura':  { lat: 8.3114,  lng: 80.4037 },
  'Badulla':       { lat: 6.9934,  lng: 81.0550 },
  'Batticaloa':    { lat: 7.7310,  lng: 81.6747 },
  'Colombo':       { lat: 6.9271,  lng: 79.8612 },
  'Galle':         { lat: 6.0535,  lng: 80.2210 },
  'Gampaha':       { lat: 7.0840,  lng: 79.9989 },
  'Hambantota':    { lat: 6.1241,  lng: 81.1185 },
  'Jaffna':        { lat: 9.6615,  lng: 80.0255 },
  'Kalutara':      { lat: 6.5854,  lng: 79.9607 },
  'Kandy':         { lat: 7.2906,  lng: 80.6337 },
  'Kegalle':       { lat: 7.2513,  lng: 80.3464 },
  'Kilinochchi':   { lat: 9.3803,  lng: 80.3770 },
  'Kurunegala':    { lat: 7.4867,  lng: 80.3647 },
  'Mannar':        { lat: 8.9810,  lng: 79.9044 },
  'Matale':        { lat: 7.4675,  lng: 80.6234 },
  'Matara':        { lat: 5.9549,  lng: 80.5550 },
  'Monaragala':    { lat: 6.8728,  lng: 81.3506 },
  'Mullaitivu':    { lat: 9.2671,  lng: 80.8128 },
  'Nuwara Eliya':  { lat: 6.9497,  lng: 80.7891 },
  'Polonnaruwa':   { lat: 7.9403,  lng: 81.0188 },
  'Puttalam':      { lat: 8.0362,  lng: 79.8283 },
  'Ratnapura':     { lat: 6.6828,  lng: 80.3992 },
  'Trincomalee':   { lat: 8.5874,  lng: 81.2152 },
  'Vavuniya':      { lat: 8.7514,  lng: 80.4971 }
};

// ─── Haversine distance (km) between two districts ─────────────────────────────
const distanceBetweenDistricts = (distA, distB) => {
  const a = DISTRICT_COORDS[distA];
  const b = DISTRICT_COORDS[distB];
  if (!a || !b) return 999;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng));
  return Math.round(R * c);
};

// ─── Composite score: higher = better donor ─────────────────────────────────────
// Score = (stockScore × 0.6) + (proximityScore × 0.4)
// stockScore    : normalized 0–100 based on available units
// proximityScore: normalized 0–100, closer = higher
const computeDonorScore = (hospitals, destinationDistrict) => {
  if (!hospitals.length) return hospitals;
  const maxUnits = Math.max(...hospitals.map(h => h.availableUnits), 1);
  const maxDist  = Math.max(...hospitals.map(h => distanceBetweenDistricts(h.district, destinationDistrict)), 1);

  return hospitals.map(h => {
    const dist = distanceBetweenDistricts(h.district, destinationDistrict);
    const stockScore     = (h.availableUnits / maxUnits) * 100;
    const proximityScore = ((maxDist - dist) / maxDist) * 100;
    const score          = stockScore * 0.6 + proximityScore * 0.4;
    return { ...h, distanceKm: dist, score: Math.round(score * 10) / 10 };
  });
};

const DEFAULT_HOSPITALS = [
  { hospitalId: 'HSP001', name: 'Colombo General Hospital', district: 'Colombo', type: 'Government', contact: '011 269 1111', email: 'colombo.gen@health.gov.lk' },
  { hospitalId: 'HSP002', name: 'Kandy General Hospital', district: 'Kandy', type: 'Government', contact: '081 222 2222', email: 'kandy.gen@health.gov.lk' },
  { hospitalId: 'HSP003', name: 'Lady Ridgeway Hospital', district: 'Colombo', type: 'Government', contact: '011 269 3911', email: 'lrh@health.gov.lk' },
  { hospitalId: 'HSP004', name: 'Jaffna Teaching Hospital', district: 'Jaffna', type: 'Government', contact: '021 222 3344', email: 'jaffna.teaching@health.gov.lk' },
  { hospitalId: 'HSP006', name: 'Karapitiya Teaching Hospital', district: 'Galle', type: 'Government', contact: '091 223 2250', email: 'karapitiya.galle@health.gov.lk' },
  { hospitalId: 'HSP007', name: 'Anuradhapura Teaching Hospital', district: 'Anuradhapura', type: 'Government', contact: '025 222 2261', email: 'anuradhapura.th@health.gov.lk' },
  { hospitalId: 'HSP008', name: 'Kurunegala Teaching Hospital', district: 'Kurunegala', type: 'Government', contact: '037 222 2261', email: 'kurunegala.th@health.gov.lk' },
  { hospitalId: 'HSP009', name: 'Batticaloa Teaching Hospital', district: 'Batticaloa', type: 'Government', contact: '065 222 2261', email: 'batticaloa.th@health.gov.lk' },
  { hospitalId: 'HSP010', name: 'Badulla Provincial General Hospital', district: 'Badulla', type: 'Government', contact: '055 222 2261', email: 'badulla.pgh@health.gov.lk' }
];

const DistrictMonitoring = ({ user }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('Colombo');
  const [searchTerm, setSearchTerm] = useState('');

  // Hospital & Emergency Request states
  const [hospitalsList, setHospitalsList] = useState(DEFAULT_HOSPITALS);
  const [requestsList, setRequestsList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  // Coordinate Dispatch Modal states
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchSubmitting, setDispatchSubmitting] = useState(false);
  const [dispatchSuccessData, setDispatchSuccessData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [dispatchForm, setDispatchForm] = useState({
    donorHospitalName: '',
    bloodGroup: 'O+',
    units: 50,
    urgency: 'Immediate Emergency (High Risk)',
    notes: 'Urgent inter-district transfer to replenish critical blood reserves.'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchAllData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${user.token}` };

    Promise.all([
      fetch('/api/dashboard/stats', { headers }).then(r => r.json()),
      fetch('/api/hospitals', { headers }).then(r => r.json()).catch(() => []),
      fetch('/api/requests', { headers }).then(r => r.json()).catch(() => []),
      fetch('/api/inventory', { headers }).then(r => r.json()).catch(() => [])
    ])
      .then(([stats, hosp, reqs, inv]) => {
        setData(stats);
        if (Array.isArray(inv)) {
          setInventoryList(inv);
        }
        if (Array.isArray(hosp) && hosp.length > 0) {
          // Merge: match DEFAULT_HOSPITALS by EXACT name only (never by district)
          // Priority: DB email > name-matched default email > district-based auto-generated email
          const merged = hosp.map(h => {
            const foundByName = DEFAULT_HOSPITALS.find(
              dh => dh.name.trim().toLowerCase() === h.name.trim().toLowerCase()
            );
            return {
              ...h,
              email: h.email || foundByName?.email || `${h.district.toLowerCase().replace(/ /g, '')}.bloodbank@health.gov.lk`,
              // Keep DB contact; only use DEFAULT contact if DB has none AND name matched exactly
              contact: h.contact || foundByName?.contact || 'N/A'
            };
          });
          setHospitalsList(merged);
        }
        if (Array.isArray(reqs)) {
          setRequestsList(reqs.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch monitoring data error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading monitoring records...</div>;
  }

  const ALL_25_DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  // Aggregate ONLY real inventory from BloodInventory
  const districtAvailability = {};
  ALL_25_DISTRICTS.forEach(d => {
    districtAvailability[d] = {
      totalUnits: 0,
      status: 'Critical',
      bloodGroups: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 }
    };
  });

  if (Array.isArray(inventoryList)) {
    inventoryList.forEach(item => {
      const dist = item.district;
      if (!dist) return;

      const trimmed = dist.trim();
      const matchedKey = ALL_25_DISTRICTS.find(d => d.toLowerCase() === trimmed.toLowerCase()) ||
        (trimmed.toLowerCase() === 'monaragala' ? 'Moneragala' : trimmed);

      if (!districtAvailability[matchedKey]) {
        districtAvailability[matchedKey] = {
          totalUnits: 0,
          status: 'Critical',
          bloodGroups: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 }
        };
      }

      const units = Number(item.availableUnits) || 0;
      districtAvailability[matchedKey].totalUnits += units;
      if (item.bloodGroup && districtAvailability[matchedKey].bloodGroups[item.bloodGroup] !== undefined) {
        districtAvailability[matchedKey].bloodGroups[item.bloodGroup] += units;
      }
    });
  }

  // Set status purely based on actual units in BloodInventory: Good (>300), Low (100-300), Critical (<100)
  Object.keys(districtAvailability).forEach(dist => {
    const units = districtAvailability[dist].totalUnits;
    districtAvailability[dist].status = units > 300 ? 'Good' : units >= 100 ? 'Low' : 'Critical';
  });

  const EMPTY_BLOOD_GROUPS = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 };

  // Formulate a detailed list of all districts
  const districts = Object.keys(districtAvailability || {}).map(name => {
    const details = districtAvailability[name] || {};
    const totalUnits = Number(details.totalUnits) || 0;
    let shortageRisk = 'Low';
    let riskPercent = 20;
    if (details.status === 'Critical' || totalUnits < 100) {
      shortageRisk = 'High';
      riskPercent = 85;
    } else if (details.status === 'Low' || totalUnits <= 300) {
      shortageRisk = 'Medium';
      riskPercent = 55;
    }

    const bloodGroups = details.bloodGroups || EMPTY_BLOOD_GROUPS;

    // Match official hospital for this district
    const hosp = hospitalsList.find(h => h.district && h.district.toLowerCase() === name.toLowerCase());
    const hospitalName = hosp?.name || `${name} District General Hospital`;

    return {
      name,
      hospitalName,
      totalUnits,
      status: details.status || (totalUnits > 300 ? 'Good' : totalUnits >= 100 ? 'Low' : 'Critical'),
      shortageRisk,
      riskPercent,
      bloodGroups
    };
  });

  const selectedDetails = districts.find(d => d.name === selectedDistrict) || districts[0];

  // Suggestions for search bar
  const districtSuggestions = districts.map(d => ({
    label: d.name,
    category: d.status,
    sublabel: `${d.totalUnits} Units • ${d.shortageRisk} Risk`
  }));

  // Filter districts by search query
  const filteredDistricts = districts.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Smart Donor Hospital Ranking ──────────────────────────────────────────────
  // Composite score: 60% blood stock units + 40% proximity to destination district
  const rankedDonorHospitals = (() => {
    const mapped = hospitalsList
      .map(h => {
        const distData = districtAvailability?.[h.district] || { totalUnits: 0, status: 'Critical' };
        return { ...h, availableUnits: distData.totalUnits, status: distData.status };
      })
      .filter(h => h.district !== selectedDistrict); // exclude the critical district itself

    const scored = computeDonorScore(mapped, selectedDistrict);
    return scored.sort((a, b) => b.score - a.score);
  })();

  const topRecommendedHospital = rankedDonorHospitals[0] || hospitalsList[0];
  const selectedDonorHospital = rankedDonorHospitals.find(h => h.name === dispatchForm.donorHospitalName) || topRecommendedHospital;

  // Open the Coordinate Dispatch Modal
  const handleOpenDispatchModal = () => {
    setDispatchForm({
      donorHospitalName: topRecommendedHospital.name,
      bloodGroup: 'O+',
      units: 50,
      urgency: 'Immediate Emergency (High Risk)',
      notes: `Urgent inter-district reserve replenishment for ${selectedDetails.name} District.`
    });
    setDispatchSuccessData(null);
    setDispatchModalOpen(true);
  };

  // Submit the Dispatch Request & Broadcast Mail & Alert
  const handleExecuteDispatch = async (e) => {
    e.preventDefault();
    setDispatchSubmitting(true);

    const donorHospital = rankedDonorHospitals.find(h => h.name === dispatchForm.donorHospitalName) || topRecommendedHospital;
    const reqHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`
    };

    try {
      // 1. Create Emergency Request in Database
      const reqPayload = {
        patientName: `Inter-District Reserve Transfer (to ${selectedDetails.name} General)`,
        bloodGroup: dispatchForm.bloodGroup,
        hospital: donorHospital.name,
        district: donorHospital.district,
        status: 'Pending'
      };

      const reqRes = await fetch('/api/requests', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(reqPayload)
      });
      const savedRequest = await reqRes.json();

      // 2. Broadcast System Emergency Alert Notification
      const notifMessage = `🚨 EMERGENCY DISPATCH: Transfer of ${dispatchForm.units} Units (${dispatchForm.bloodGroup}) requested from ${donorHospital.name} (${donorHospital.district}) to ${selectedDetails.name} District. Hospital confirmation required!`;
      await fetch('/api/notifications', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          message: notifMessage,
          type: 'Alert'
        })
      });

      // 3. Prepare simulated Mail Dispatch Payload
      const emailRecord = {
        to: `${donorHospital.name} Blood Bank Center <${donorHospital.email}>`,
        subject: `URGENT: Emergency Blood Stock Transfer Request [${selectedDetails.name} District - ${dispatchForm.units} Units ${dispatchForm.bloodGroup}]`,
        body: `Hospital Coordinator,\n\nColombo National Blood Transfusion Service requests an emergency transfer of ${dispatchForm.units} units of ${dispatchForm.bloodGroup} blood from ${donorHospital.name} to ${selectedDetails.name} District.\n\nPlease log in to LifeFlow to confirm dispatch ability.\n\nUrgency: ${dispatchForm.urgency}\nRequest ID: ${savedRequest.requestId || 'REQ-NEW'}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        donorHospital,
        targetDistrict: selectedDetails.name,
        units: dispatchForm.units,
        bloodGroup: dispatchForm.bloodGroup,
        requestId: savedRequest.requestId || 'REQ-DISP'
      };

      setDispatchSuccessData(emailRecord);
      setDispatchSubmitting(false);

      // Refresh requests list
      fetchAllData();
      showToast(`Emergency alert and transfer email dispatched to ${donorHospital.name}!`);
    } catch (err) {
      console.error('Dispatch error:', err);
      setDispatchSubmitting(false);
      showToast('Error broadcasting dispatch request.');
    }
  };

  // Hospital Confirmation Actions: Accept / Send Blood
  const handleConfirmTransfer = async (reqItem) => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`
    };

    try {
      await fetch(`/api/requests/${reqItem._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ...reqItem,
          status: 'Accepted'
        })
      });

      await fetch('/api/notifications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: `✅ DISPATCH CONFIRMED: ${reqItem.hospital} has confirmed blood transfer for request ${reqItem.requestId}! Transport vehicle dispatched.`,
          type: 'System'
        })
      });

      fetchAllData();
      showToast(`Transfer confirmed by ${reqItem.hospital}! Vehicle dispatched.`);
    } catch (err) {
      console.error('Confirm transfer error:', err);
    }
  };

  // Decline action
  const handleDeclineTransfer = async (reqItem) => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`
    };

    try {
      await fetch(`/api/requests/${reqItem._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ...reqItem,
          status: 'Cancelled'
        })
      });

      await fetch('/api/notifications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: `⚠️ TRANSFER DECLINED: ${reqItem.hospital} was unable to fulfill request ${reqItem.requestId}. Re-routing to next available hospital.`,
          type: 'Alert'
        })
      });

      fetchAllData();
      showToast(`Transfer request cancelled. Re-routing required.`);
    } catch (err) {
      console.error('Decline error:', err);
    }
  };

  // Active Dispatches relating to the selected district
  const relatedDispatches = requestsList.filter(r =>
    r.district === selectedDistrict || (r.patientName && r.patientName.includes(selectedDistrict))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          backgroundColor: '#10B981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '0.88rem'
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>District Monitoring</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Real-time regional blood reserve network alerts & inter-district dispatch coordination</p>
      </div>

      <div
        className="district-monitoring-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(460px, 1.25fr) minmax(0, 1.4fr)',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* Left: Map Card */}
        <div
          className="dashboard-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            minWidth: '440px',
            padding: '24px'
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '20px', width: '100%' }}>
            Interactive Regional Status
          </h3>
          <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SriLankaMap
              availability={districtAvailability}
              onDistrictSelect={(dist) => setSelectedDistrict(dist)}
              selectedDistrict={selectedDistrict}
              maxHeight="540px"
            />
          </div>
        </div>

        {/* Right: Detailed List & Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
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
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedDetails.name} General Hospital</p>
                </div>
              </div>

              {/* All Blood Types Stock Details */}
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <div className="flex-between" style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Blood Group Stock Breakdown ({selectedDetails.name})
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Total: <strong style={{ color: 'var(--text-primary)' }}>{selectedDetails.totalUnits} Units</strong>
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))',
                  gap: '8px'
                }}>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => {
                    const count = selectedDetails.bloodGroups?.[bg] ?? 0;
                    const bgStatus = count > 50 ? 'Good' : count >= 20 ? 'Low' : 'Critical';
                    const palette =
                      bgStatus === 'Good'
                        ? { bg: '#f0fdf4', border: '#86efac', text: '#15803d', labelColor: '#16a34a' }
                        : bgStatus === 'Low'
                        ? { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', labelColor: '#d97706' }
                        : { bg: '#fff1f2', border: '#fda4af', text: '#be123c', labelColor: '#e11d48' };
                    return (
                      <div
                        key={bg}
                        style={{
                          backgroundColor: palette.bg,
                          border: `1px solid ${palette.border}`,
                          borderRadius: '8px',
                          padding: '8px 4px',
                          textAlign: 'center',
                          boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.04))'
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: palette.text }}>{bg}</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: palette.text, marginTop: '2px' }}>{count}</div>
                        <div style={{
                          display: 'inline-block',
                          marginTop: '3px',
                          backgroundColor: palette.border,
                          color: palette.text,
                          fontSize: '0.58rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '10px'
                        }}>{bgStatus}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CRITICAL RESERVE ALERT & COORDINATE DISPATCH BUTTON */}
              {(() => {
                const BG_ORDER = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
                const bgEntries = BG_ORDER.map(bg => ({ bg, units: selectedDetails.bloodGroups?.[bg] ?? 0 }));
                const criticalBGs = bgEntries.filter(e => e.units < 20).sort((a, b) => a.units - b.units);
                const mostCriticalBG = criticalBGs[0]?.bg || 'O+';
                const criticalLabels = criticalBGs.slice(0, 4).map(e => `${e.bg}(${e.units})`).join(', ');

                // Show dispatch if: overall Critical OR any individual blood type is Critical
                const overallCritical = selectedDetails.status === 'Critical';
                const hasBloodTypeCritical = criticalBGs.length > 0;
                if (!overallCritical && !hasBloodTypeCritical) return null;

                const isPartialCritical = !overallCritical && hasBloodTypeCritical;

                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: isPartialCritical ? '#fff7ed' : 'var(--color-danger-light)',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px dashed ${isPartialCritical ? '#f97316' : 'var(--color-danger)'}`,
                    marginTop: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <ShieldAlert color={isPartialCritical ? '#f97316' : 'var(--color-danger)'} size={22} />
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 800, color: isPartialCritical ? '#c2410c' : 'var(--color-danger)', margin: 0 }}>
                        {isPartialCritical ? 'BLOOD TYPE SHORTAGE ALERT' : 'CRITICAL RESERVE ALERT'}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: isPartialCritical ? '#c2410c' : 'var(--color-danger)', margin: '2px 0 0' }}>
                        {isPartialCritical
                          ? `Overall stock is Low (${selectedDetails.totalUnits} units) but some blood types are critically short.`
                          : `Supply is below 100 units (${selectedDetails.totalUnits} units). Request emergency transfer from surplus hospital.`
                        }
                      </p>
                      {criticalBGs.length > 0 && (
                        <p style={{ fontSize: '0.68rem', color: isPartialCritical ? '#ea580c' : '#be123c', margin: '4px 0 0', fontWeight: 700 }}>
                          🩸 Most needed: {criticalLabels} units
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setDispatchForm(prev => ({
                          ...prev,
                          bloodGroup: mostCriticalBG,
                          donorHospitalName: topRecommendedHospital?.name || '',
                          units: 50,
                          urgency: isPartialCritical ? 'Urgent (Medium Risk)' : 'Immediate Emergency (High Risk)',
                          notes: `Urgent inter-district transfer to replenish critical blood reserves (${mostCriticalBG} critically low at ${selectedDetails.name}).`
                        }));
                        setDispatchSuccessData(null);
                        setDispatchModalOpen(true);
                      }}
                      className="btn btn-danger"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        backgroundColor: isPartialCritical ? '#f97316' : undefined,
                        borderColor: isPartialCritical ? '#f97316' : undefined
                      }}
                    >
                      <Truck size={15} />
                      <span>Coordinate Dispatch</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ACTIVE DISPATCH TRANSFERS TRACKER (Hospital Confirmation View) */}
          {relatedDispatches.length > 0 && (
            <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="#2563eb" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
                    Active Inter-District Dispatch Requests ({relatedDispatches.length})
                  </h4>
                </div>
                <button
                  onClick={() => navigate('/requests')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <span>Open Emergency Requests</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {relatedDispatches.slice(0, 3).map(reqItem => (
                  <div
                    key={reqItem._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>{reqItem.requestId}</span>
                        <span className={`badge badge-${reqItem.status === 'Completed' ? 'success' : reqItem.status === 'Accepted' ? 'info' : reqItem.status === 'Cancelled' ? 'danger' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                          {reqItem.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e11d48' }}>
                          {reqItem.bloodGroup}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        {reqItem.hospital} ({reqItem.district}) • {new Date(reqItem.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Confirmation Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {reqItem.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleConfirmTransfer(reqItem)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                            title="Confirm blood is available and dispatch transport vehicle"
                          >
                            <Check size={14} />
                            <span>Confirm & Send Blood</span>
                          </button>
                          <button
                            onClick={() => handleDeclineTransfer(reqItem)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#e11d48', borderColor: '#fecdd3', backgroundColor: '#fff1f2' }}
                            title="Decline if unable to fulfill"
                          >
                            <X size={14} />
                            <span>Decline</span>
                          </button>
                        </>
                      ) : reqItem.status === 'Accepted' ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={16} />
                          <span>Dispatch Confirmed & En-route</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{reqItem.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* District Status List */}
          <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  District Status Overview
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Showing {filteredDistricts.length} of {districts.length} districts
                </span>
              </div>

              {/* District Search with Suggestions Bar */}
              <div style={{ minWidth: '220px', flex: 1, maxWidth: '300px' }}>
                <SearchWithSuggestions
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSelect={(distName) => {
                    setSearchTerm(distName);
                    setSelectedDistrict(distName);
                  }}
                  placeholder="Search district name..."
                  suggestions={districtSuggestions}
                />
              </div>
            </div>

            <div
              tabIndex={0}
              style={{
                overflowX: 'auto',
                overflowY: 'auto',
                maxHeight: '260px',
                flex: 1,
                outline: 'none',
                scrollbarWidth: 'thin'
              }}
            >
              <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'var(--bg-primary)',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    textAlign: 'left',
                    zIndex: 2
                  }}>
                    <th style={{ padding: '10px 14px', minWidth: '110px' }}>District</th>
                    <th style={{ padding: '10px 14px', minWidth: '180px' }}>Coordinating Hospital</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', color: '#e11d48' }}>A+</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', color: '#e11d48' }}>A-</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', color: '#e11d48' }}>B+</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', color: '#e11d48' }}>B-</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', color: '#e11d48' }}>O+</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', color: '#e11d48' }}>O-</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', color: '#e11d48' }}>AB+</th>
                    <th style={{ padding: '10px 6px', textAlign: 'center', color: '#e11d48' }}>AB-</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Total Units</th>
                    <th style={{ padding: '10px 14px' }}>Risk Factor</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistricts.length === 0 ? (
                    <tr>
                      <td colSpan={13} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        No districts found matching &quot;{searchTerm}&quot;.
                        <button
                          onClick={() => setSearchTerm('')}
                          style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 700, cursor: 'pointer', marginLeft: '8px' }}
                        >
                          Clear search
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredDistricts.map((d) => (
                      <tr
                        key={d.name}
                        onClick={() => setSelectedDistrict(d.name)}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          backgroundColor: selectedDistrict === d.name ? 'var(--color-primary-light, #FFF1F2)' : 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: selectedDistrict === d.name ? '#e11d48' : 'inherit' }}>
                          {d.name}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {d.hospitalName}
                        </td>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{d.bloodGroups?.['A+'] ?? 0}</td>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{d.bloodGroups?.['A-'] ?? 0}</td>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{d.bloodGroups?.['B+'] ?? 0}</td>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{d.bloodGroups?.['B-'] ?? 0}</td>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{d.bloodGroups?.['O+'] ?? 0}</td>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{d.bloodGroups?.['O-'] ?? 0}</td>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{d.bloodGroups?.['AB+'] ?? 0}</td>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{d.bloodGroups?.['AB-'] ?? 0}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>{d.totalUnits} Units</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar-container" style={{ width: '55px', height: '6px' }}>
                              <div className="progress-bar-fill" style={{ width: `${d.riskPercent}%`, backgroundColor: d.status === 'Good' ? 'var(--color-success)' : d.status === 'Low' ? 'var(--color-warning)' : 'var(--color-danger)' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem' }}>{d.riskPercent}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={`badge badge-${d.status === 'Good' ? 'success' : d.status === 'Low' ? 'warning' : 'danger'}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚨 COORDINATE DISPATCH MODAL (Inter-District Hospital Alert & Mail Dispatch) */}
      {/* ========================================================================= */}
      {dispatchModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '580px', position: 'relative', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setDispatchModalOpen(false)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>

            {!dispatchSuccessData ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={20} color="#e11d48" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', margin: 0 }}>
                      Coordinate Emergency Blood Dispatch
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Request inter-district transfer to replenish <strong>{selectedDetails.name} District</strong>
                    </p>
                  </div>
                </div>

                {/* Destination Hospital — Per Blood Type Status */}
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '8px',
                  margin: '16px 0',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>Destination: {selectedDetails.name} General Hospital</span>
                      <p style={{ color: 'var(--text-secondary)', margin: '2px 0 0', fontSize: '0.72rem' }}>
                        Total Stock: <strong>{selectedDetails.totalUnits} Units</strong> — Blood type breakdown below
                      </p>
                    </div>
                    <span className="badge badge-danger">Critical Reserve</span>
                  </div>

                  {/* Per Blood Type Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => {
                      const units = selectedDetails.bloodGroups?.[bg] ?? 0;
                      const bgStatus = units > 50 ? 'Good' : units >= 20 ? 'Low' : 'Critical';
                      const bgColor  = bgStatus === 'Good' ? { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', badge: '#dcfce7', badgeText: '#166534' }
                                     : bgStatus === 'Low'  ? { bg: '#fffbeb', border: '#fde68a', text: '#92400e', badge: '#fef3c7', badgeText: '#92400e' }
                                     :                       { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', badge: '#ffe4e6', badgeText: '#be123c' };
                      return (
                        <div key={bg} style={{
                          backgroundColor: bgColor.bg,
                          border: `1px solid ${bgColor.border}`,
                          borderRadius: '6px',
                          padding: '6px 8px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: '0.82rem', color: bgColor.text }}>{bg}</div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: bgColor.text, margin: '2px 0' }}>{units}</div>
                          <div style={{
                            display: 'inline-block',
                            backgroundColor: bgColor.badge,
                            color: bgColor.badgeText,
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '10px'
                          }}>{bgStatus}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleExecuteDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Recommended Donor Hospital Selection */}
                  <div className="form-group">
                    <div className="flex-between" style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        Select Source Hospital with Surplus Blood Stock
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Sparkles size={12} />
                        Stock + Distance Score
                      </span>
                    </div>

                    <select
                      className="form-control"
                      value={dispatchForm.donorHospitalName}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, donorHospitalName: e.target.value })}
                      required
                      style={{ fontSize: '0.85rem' }}
                    >
                      {rankedDonorHospitals.map((h, idx) => (
                        <option key={h.hospitalId || h.name} value={h.name}>
                          #{idx + 1} {h.name} ({h.district}) — {h.availableUnits} Units • {h.distanceKm ?? '?'} km • Score: {h.score ?? '—'}
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                      Ranked by composite score: 60% stock surplus + 40% proximity to destination
                    </p>

                    {/* Top Recommended Highlight Box */}
                    {topRecommendedHospital && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} color="#16a34a" />
                          <span><strong>Recommended:</strong> {topRecommendedHospital.name} ({topRecommendedHospital.district})</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span style={{ fontWeight: 800 }}>{topRecommendedHospital.availableUnits} Units</span>
                          <span style={{ fontSize: '0.68rem', color: '#15803d' }}>
                            {topRecommendedHospital.distanceKm ?? '?'} km away • Score: {topRecommendedHospital.score ?? '—'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Blood Group & Units */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Blood Group Needed</label>
                      <select
                        className="form-control"
                        value={dispatchForm.bloodGroup}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, bloodGroup: e.target.value })}
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Units to Request</label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        className="form-control"
                        value={dispatchForm.units}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, units: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  {/* Urgency & Notes */}
                  <div className="form-group">
                    <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Transport Urgency Level</label>
                    <select
                      className="form-control"
                      value={dispatchForm.urgency}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, urgency: e.target.value })}
                    >
                      <option value="Immediate Emergency (High Risk)">Immediate Emergency (&lt; 2 Hours - Emergency Vehicle)</option>
                      <option value="Urgent Dispatch (< 6 Hours)">Urgent Dispatch (&lt; 6 Hours)</option>
                      <option value="Reserve Restock (Today)">Reserve Restock (Same Day Delivery)</option>
                    </select>
                  </div>

                  {/* Recipient Contact Preview — updates based on dropdown selection */}
                  {selectedDonorHospital && (
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                        <Building2 size={13} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                        {selectedDonorHospital.name} — {selectedDonorHospital.district}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="#2563eb" />
                        <span><strong>Coordinator Email:</strong> {selectedDonorHospital.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="#16a34a" />
                        <span><strong>Hospital Hotline:</strong> {selectedDonorHospital.contact || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setDispatchModalOpen(false)}
                      className="btn btn-secondary"
                      style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={dispatchSubmitting}
                      className="btn btn-primary"
                      style={{
                        padding: '10px 22px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        backgroundColor: '#e11d48',
                        borderColor: '#e11d48',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: dispatchSubmitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Send size={16} />
                      <span>{dispatchSubmitting ? 'Dispatching Alert...' : 'Send Alert & Dispatch Request'}</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success & Mail Dispatch Confirmation Preview */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', margin: 0, color: '#16a34a' }}>
                    Emergency Dispatch Alert Broadcasted!
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Emergency request registered & notification dispatched to receiving hospital.
                  </p>
                </div>

                {/* Email Delivery Receipt Box */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={15} color="#2563eb" />
                      Official Email Dispatch Confirmation
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Delivered</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '6px', color: '#475569', fontSize: '0.78rem' }}>
                    <strong>To:</strong>
                    <span>{dispatchSuccessData.to}</span>

                    <strong>Subject:</strong>
                    <span>{dispatchSuccessData.subject}</span>

                    <strong>Time:</strong>
                    <span>{dispatchSuccessData.timestamp}</span>

                    <strong>Request ID:</strong>
                    <span style={{ fontWeight: 800, color: '#e11d48' }}>{dispatchSuccessData.requestId}</span>
                  </div>

                  <div style={{ marginTop: '6px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#334155', whiteSpace: 'pre-line' }}>
                    {dispatchSuccessData.body}
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Clock size={16} color="#2563eb" />
                  <span>
                    <strong>Next Step:</strong> The donor hospital coordinator has received this alert and can now click <strong>"Confirm & Send Blood"</strong> to dispatch the transport vehicle.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    onClick={() => {
                      setDispatchModalOpen(false);
                      setDispatchSuccessData(null);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setDispatchModalOpen(false);
                      navigate('/requests');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>View in Emergency Requests</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictMonitoring;
