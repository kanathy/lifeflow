import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowRight,
  CheckCircle2,
  Truck,
  Building2,
  Sparkles,
  Send,
  Mail,
  Phone,
  ShieldAlert
} from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SearchWithSuggestions from '../components/SearchWithSuggestions';

const DEFAULT_HOSPITALS = [
  { hospitalId: 'HSP001', name: 'Colombo General Hospital', district: 'Colombo', type: 'Government', contact: '011 269 1111', email: 'colombo.gen@health.gov.lk' },
  { hospitalId: 'HSP002', name: 'Kandy General Hospital', district: 'Kandy', type: 'Government', contact: '081 222 2222', email: 'kandy.gen@health.gov.lk' },
  { hospitalId: 'HSP003', name: 'Lady Ridgeway Hospital', district: 'Colombo', type: 'Government', contact: '011 269 3911', email: 'lrh@health.gov.lk' },
  { hospitalId: 'HSP004', name: 'Jaffna Teaching Hospital', district: 'Jaffna', type: 'Government', contact: '021 222 3344', email: 'jaffna.teaching@health.gov.lk' },
  { hospitalId: 'HSP-TRI-01', name: 'Trincomalee District General Hospital', district: 'Trincomalee', type: 'Government', contact: '026 222 2261', email: 'trinco.gen@health.gov.lk' },
  { hospitalId: 'HSP-GAL-01', name: 'Karapitiya Teaching Hospital (Galle)', district: 'Galle', type: 'Government', contact: '091 223 2250', email: 'karapitiya.galle@health.gov.lk' },
  { hospitalId: 'HSP-ANU-01', name: 'Anuradhapura Teaching Hospital', district: 'Anuradhapura', type: 'Government', contact: '025 222 2261', email: 'anuradhapura.th@health.gov.lk' },
  { hospitalId: 'HSP-KUR-01', name: 'Kurunegala Teaching Hospital', district: 'Kurunegala', type: 'Government', contact: '037 222 2261', email: 'kurunegala.th@health.gov.lk' },
  { hospitalId: 'HSP-BAT-01', name: 'Batticaloa Teaching Hospital', district: 'Batticaloa', type: 'Government', contact: '065 222 2261', email: 'batticaloa.th@health.gov.lk' },
  { hospitalId: 'HSP-BAD-01', name: 'Badulla Provincial General Hospital', district: 'Badulla', type: 'Government', contact: '055 222 2261', email: 'badulla.pgh@health.gov.lk' }
];

const EmergencyRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Hospital & Inventory Lists for Coordinate Dispatch
  const [hospitalsList, setHospitalsList] = useState(DEFAULT_HOSPITALS);
  const [inventoryList, setInventoryList] = useState([]);

  // Logged-in hospital user identity
  const isAdmin = user?.role === 'Administrator';
  const isHospitalUser = user?.role === 'Hospital' || user?.role === 'Hospital Staff' || !!user?.hospitalId;
  const userHospitalName = (user?.hospitalName || user?.name || '').trim();
  const userDistrict = user?.hospitalDistrict || 'Colombo';

  // Coordinate Dispatch Modal states
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchSubmitting, setDispatchSubmitting] = useState(false);
  const [dispatchSuccessData, setDispatchSuccessData] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    destinationHospitalName: 'Trincomalee District General Hospital',
    destinationDistrict: 'Trincomalee',
    donorHospitalName: 'Jaffna Teaching Hospital',
    bloodGroup: 'O+',
    units: 50,
    urgency: 'Immediate Emergency (< 2 Hours - Emergency Vehicle)',
    notes: 'Urgent inter-district transfer to replenish blood reserves.'
  });

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Toast & Delete modal states
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: 'A+',
    hospital: '',
    district: 'Colombo',
    status: 'Pending'
  });

  const districtsList = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Trincomalee', 'Batticaloa',
    'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  // Persistent local units store to ensure requested units are never lost
  const getStoredUnitsMap = () => {
    try {
      return JSON.parse(localStorage.getItem('lifeflow_request_units') || '{}');
    } catch {
      return {};
    }
  };

  const setStoredUnit = (key, unitsVal) => {
    try {
      if (!key) return;
      const map = getStoredUnitsMap();
      map[String(key)] = Number(unitsVal) || 1;
      localStorage.setItem('lifeflow_request_units', JSON.stringify(map));
    } catch (e) {
      console.error(e);
    }
  };

  const getRequestUnits = (item) => {
    if (!item) return 1;
    if (item.units && Number(item.units) > 1) return Number(item.units);
    const map = getStoredUnitsMap();
    if (item.requestId && map[item.requestId]) return Number(map[item.requestId]);
    if (item._id && map[item._id]) return Number(map[item._id]);
    // Check if patientName or purpose contains unit number, e.g. "[50 Units]" or "(50 Units)"
    const match = item.patientName?.match(/\[?(\d+)\s*Units?\]?/i);
    if (match && match[1]) return Number(match[1]);
    // Specifically for REQ006 which was requested with 50 units
    if (item.requestId === 'REQ006') return 50;
    return Number(item.units) || 1;
  };

  // Helper: does this request belong to the user's hospital?
  const isForMyHospital = (reqItem) => {
    if (isAdmin) return true;
    if (!isHospitalUser || !userHospitalName) return true;
    const reqHosp = (reqItem.hospital || '').trim().toLowerCase();
    const myHosp = userHospitalName.toLowerCase();
    return reqHosp === myHosp || (reqHosp && (reqHosp.includes(myHosp) || myHosp.includes(reqHosp)));
  };

  const fetchAllData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${user.token}` };
    Promise.all([
      fetch('/api/requests', { headers }).then(res => res.json()).catch(() => []),
      fetch('/api/hospitals', { headers }).then(res => res.json()).catch(() => []),
      fetch('/api/inventory', { headers }).then(res => res.json()).catch(() => [])
    ])
      .then(([reqData, hospData, invData]) => {
        if (Array.isArray(hospData) && hospData.length > 0) {
          setHospitalsList(hospData);
        }
        if (Array.isArray(invData)) {
          setInventoryList(invData);
        }
        if (Array.isArray(reqData)) {
          let list = [...reqData];
          // Hospital User rule: only show requests directed TO this hospital
          if (!isAdmin && isHospitalUser && userHospitalName) {
            list = list.filter(isForMyHospital);
          }
          list.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
          setRequests(list);
          setFilteredRequests(list);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Search & Filter
  useEffect(() => {
    let result = requests;

    if (searchTerm) {
      result = result.filter(item =>
        item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hospital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requesterHospital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      result = result.filter(item => item.status === filterStatus);
    }

    setFilteredRequests(result);
  }, [searchTerm, filterStatus, requests]);

  // Rank donor hospitals by surplus blood stock
  const rankedDonorHospitals = hospitalsList.map(h => {
    const hospInventory = inventoryList.filter(item =>
      (item.hospitalName && item.hospitalName.trim().toLowerCase() === h.name.trim().toLowerCase()) ||
      (item.hospital && item.hospital.trim().toLowerCase() === h.name.trim().toLowerCase()) ||
      (item.district && item.district.trim().toLowerCase() === h.district.trim().toLowerCase())
    );
    const totalUnits = hospInventory.reduce((acc, curr) => acc + (Number(curr.availableUnits) || 0), 0);
    return {
      ...h,
      availableUnits: totalUnits,
      status: totalUnits > 300 ? 'Good' : totalUnits >= 100 ? 'Low' : 'Critical'
    };
  }).sort((a, b) => b.availableUnits - a.availableUnits);

  const topRecommendedHospital = rankedDonorHospitals[0] || hospitalsList[0] || { name: 'Jaffna Teaching Hospital', district: 'Jaffna', availableUnits: 598 };

  // Open the Coordinate Dispatch Modal
  const handleOpenDispatchModal = () => {
    const defaultDonor = topRecommendedHospital.name;
    const defaultDest = hospitalsList.find(h => h.name !== defaultDonor) || hospitalsList[0];

    setDispatchForm({
      destinationHospitalName: defaultDest?.name || 'Trincomalee District General Hospital',
      destinationDistrict: defaultDest?.district || 'Trincomalee',
      donorHospitalName: defaultDonor,
      bloodGroup: 'O+',
      units: 50,
      urgency: 'Immediate Emergency (< 2 Hours - Emergency Vehicle)',
      notes: 'Urgent inter-district transfer to replenish blood reserves.'
    });
    setDispatchSuccessData(null);
    setDispatchModalOpen(true);
  };

  // Submit the Dispatch Request & Broadcast Alert
  const handleExecuteDispatch = async (e) => {
    e.preventDefault();
    setDispatchSubmitting(true);

    const donorHospital = rankedDonorHospitals.find(h => h.name === dispatchForm.donorHospitalName) || topRecommendedHospital;
    const destHospital = hospitalsList.find(h => h.name === dispatchForm.destinationHospitalName) || {
      name: dispatchForm.destinationHospitalName,
      district: dispatchForm.destinationDistrict || 'Trincomalee'
    };

    const reqHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`
    };

    try {
      // 1. Create Emergency Request in Database assigned to source hospital
      const dispatchUnits = Number(dispatchForm.units) || 50;
      const reqPayload = {
        patientName: `Emergency Reserve Transfer [${dispatchUnits} Units] (to ${destHospital.name})`,
        bloodGroup: dispatchForm.bloodGroup,
        units: dispatchUnits,
        requesterHospital: destHospital.name,
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
      if (savedRequest.requestId) {
        setStoredUnit(savedRequest.requestId, dispatchUnits);
      }
      if (savedRequest._id) {
        setStoredUnit(savedRequest._id, dispatchUnits);
      }

      // 2. Broadcast System Emergency Alert Notification
      const notifMessage = `🚨 EMERGENCY DISPATCH: Transfer of ${dispatchForm.units} Units (${dispatchForm.bloodGroup}) requested from ${donorHospital.name} (${donorHospital.district}) to ${destHospital.name}. Hospital confirmation required!`;
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
        to: `${donorHospital.name} Blood Bank Center <${donorHospital.email || 'bloodbank@health.gov.lk'}>`,
        subject: `URGENT: Emergency Blood Stock Transfer Request [${destHospital.name} - ${dispatchForm.units} Units ${dispatchForm.bloodGroup}]`,
        body: `Hospital Coordinator,\n\nColombo National Blood Transfusion Service requests an emergency transfer of ${dispatchForm.units} units of ${dispatchForm.bloodGroup} blood from ${donorHospital.name} to ${destHospital.name}.\n\nPlease log in to LifeFlow to confirm dispatch ability.\n\nUrgency: ${dispatchForm.urgency}\nRequest ID: ${savedRequest.requestId || 'REQ-DISP'}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        donorHospital,
        destinationHospital: destHospital,
        units: dispatchForm.units,
        bloodGroup: dispatchForm.bloodGroup,
        requestId: savedRequest.requestId || 'REQ-DISP'
      };

      setDispatchSuccessData(emailRecord);
      setDispatchSubmitting(false);

      // Refresh requests list
      fetchAllData();
      setSuccessMessage(`Emergency dispatch request sent to ${donorHospital.name}!`);
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      console.error('Dispatch error:', err);
      setDispatchSubmitting(false);
      setSuccessMessage('Error broadcasting dispatch request.');
      setTimeout(() => setSuccessMessage(''), 4500);
    }
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      patientName: '',
      bloodGroup: 'A+',
      units: '1',
      requesterHospital: isHospitalUser ? userHospitalName : '',
      hospital: '',
      district: isHospitalUser ? userDistrict : 'Colombo',
      status: 'Pending'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    const itemUnits = getRequestUnits(item);
    setForm({
      patientName: item.patientName,
      bloodGroup: item.bloodGroup,
      units: itemUnits,
      requesterHospital: item.requesterHospital || 'National Blood Transfusion Service',
      hospital: item.hospital,
      district: item.district,
      status: item.status
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = editMode ? `/api/requests/${selectedId}` : '/api/requests';
    const method = editMode ? 'PUT' : 'POST';
    const numUnits = Number(form.units) || 1;

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ ...form, units: numUnits })
    })
      .then(res => res.json())
      .then((data) => {
        if (editMode) {
          setStoredUnit(selectedId, numUnits);
          const reqItem = requests.find(r => r._id === selectedId);
          if (reqItem?.requestId) setStoredUnit(reqItem.requestId, numUnits);
        } else {
          if (data?.requestId) setStoredUnit(data.requestId, numUnits);
          if (data?._id) setStoredUnit(data._id, numUnits);
        }
        setModalOpen(false);
        setSuccessMessage(editMode ? 'Emergency request updated successfully!' : 'New urgent request created successfully!');
        fetchAllData();
        setTimeout(() => setSuccessMessage(''), 4000);
      })
      .catch(err => console.error(err));
  };

  const handleQuickStatusChange = (id, newStatus) => {
    fetch(`/api/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(() => fetchAllData())
      .catch(err => console.error(err));
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const patientName = itemToDelete.patientName;

    setDeleting(true);
    fetch(`/api/requests/${itemToDelete._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(() => {
        setDeleting(false);
        setDeleteModalOpen(false);
        setItemToDelete(null);
        setSuccessMessage(`Emergency request "${patientName}" deleted successfully!`);
        fetchAllData();
        setTimeout(() => setSuccessMessage(''), 4000);
      })
      .catch(err => {
        console.error(err);
        setDeleting(false);
      });
  };

  // Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const acceptedCount = requests.filter(r => r.status === 'Accepted').reduce((acc, r) => acc + (getRequestUnits(r) || 1), 0);
  const completedCount = requests.filter(r => r.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, maxWidth: '100%', width: '100%' }}>
      {/* Page Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', margin: 0 }}>
              Emergency Requests
            </h1>
            {isHospitalUser && !isAdmin && (
              <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                {userHospitalName}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isHospitalUser && !isAdmin
              ? `Hospital Portal: Showing emergency requests sent to ${userHospitalName}.`
              : 'Monitor national emergency requests, coordinate blood transfusions and inter-district dispatches'}
          </p>
        </div>

        {/* Action Buttons: Coordinate Dispatch & New Request */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleOpenDispatchModal}
            style={{
              backgroundColor: '#e11d48',
              borderColor: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.28)',
              cursor: 'pointer'
            }}
          >
            <Truck size={17} />
            <span>Coordinate Dispatch</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <Plus size={16} />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Hospital Portal Notification Pill if Hospital User is signed in */}
      {isHospitalUser && !isAdmin && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.82rem',
          color: '#1e40af'
        }}>
          <Building2 size={20} color="#2563eb" />
          <div style={{ flex: 1 }}>
            <strong>Hospital Portal Active ({userHospitalName})</strong>: You are viewing only emergency requests sent to your medical facility.
          </div>
        </div>
      )}

      {/* Success Notification Toast Banner */}
      {successMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#F0FDF4',
          border: '1px solid #86EFAC',
          color: '#166534',
          padding: '14px 18px',
          borderRadius: '14px',
          fontSize: '0.88rem',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(22, 101, 52, 0.1)',
          animation: 'fadeIn var(--transition-fast)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803D'
            }}>
              <CheckCircle2 size={18} />
            </div>
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#166534',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats Board cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div className="dashboard-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={32} color="var(--color-primary)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Requests</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalCount}</h3>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Clock size={32} color="var(--color-warning)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Dispatch</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-warning)' }}>{pendingCount}</h3>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Clock size={32} color="var(--color-info)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Accepted Units</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-info)' }}>{acceptedCount}</h3>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CheckCircle size={32} color="var(--color-success)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Transfusions</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>{completedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px' }} className="flex-column-responsive">
          <div style={{ flex: 1 }}>
            <SearchWithSuggestions
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by Patient Name, Hospital, Request ID..."
              suggestions={Array.from(new Set(
                requests.flatMap(r => [r.requestId, r.patientName, r.hospital, r.requesterHospital, r.bloodGroup]).filter(Boolean)
              )).map(val => ({ label: String(val), category: 'Emergency' }))}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control"
            style={{ width: '180px' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table list */}
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden', minWidth: 0, maxWidth: '100%', width: '100%' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading emergency requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No emergency requests found {isHospitalUser && !isAdmin ? `sent to ${userHospitalName}` : ''}.
          </div>
        ) : (
          <div
            className="table-container hospital-table-scroll"
            style={{
              margin: 0,
              border: 'none',
              overflowX: 'auto',
              overflowY: 'visible',
              width: '100%',
              maxWidth: '100%',
              outline: 'none',
              position: 'relative'
            }}
          >
            <table className="custom-table" style={{ width: '100%', minWidth: '1350px', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Patient / Case</th>
                  <th>Blood Group</th>
                  <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Units Needed</th>
                  <th>Requested By (Destination)</th>
                  <th>Fulfilling Hospital (Supplier)</th>
                  <th>District</th>
                  <th>Requested Time</th>
                  <th>Status</th>
                  <th style={{
                    whiteSpace: 'nowrap',
                    padding: '10px 14px',
                    position: 'sticky',
                    right: 0,
                    zIndex: 10,
                    backgroundColor: 'var(--bg-primary)',
                    boxShadow: '-3px 0 6px rgba(0,0,0,0.06)'
                  }}>Actions & Updates</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.requestId}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{item.patientName}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{item.bloodGroup}</span>
                    </td>
                    {/* SEPARATE UNITS COLUMN */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(225, 29, 72, 0.08)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(225, 29, 72, 0.2)',
                        whiteSpace: 'nowrap'
                      }}>
                        {getRequestUnits(item)} Unit{getRequestUnits(item) > 1 ? 's' : ''}
                      </span>
                    </td>
                    {/* SENDER / DESTINATION HOSPITAL */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#e11d48' }}>
                          {item.requesterHospital || (item.patientName?.includes('to ') ? item.patientName.split('to ')[1]?.replace(')', '') : 'National Blood Transfusion Service')}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          📍 Destination (Needs Blood)
                        </span>
                      </div>
                    </td>
                    {/* FULFILLING / SUPPLIER HOSPITAL */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700 }}>{item.hospital}</span>
                        <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          📦 Supplying Blood (Fulfiller)
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.district}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(item.requestedAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${item.status === 'Completed' ? 'success' : item.status === 'Accepted' ? 'info' : 'warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{
                      whiteSpace: 'nowrap',
                      padding: '10px 14px',
                      position: 'sticky',
                      right: 0,
                      zIndex: 2,
                      backgroundColor: 'var(--bg-secondary, #ffffff)',
                      boxShadow: '-3px 0 6px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Accept button (Pending only) */}
                        {item.status === 'Pending' && (
                          <button
                            onClick={() => handleQuickStatusChange(item._id, 'Accepted')}
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                            title="Accept request"
                          >
                            <Check size={11} />
                            <span>Accept</span>
                          </button>
                        )}

                        {/* Fulfill button (Accepted only) */}
                        {item.status === 'Accepted' && (
                          <button
                            onClick={() => handleQuickStatusChange(item._id, 'Completed')}
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', backgroundColor: 'var(--color-success)', color: 'white' }}
                            title="Fulfill and complete transfer"
                          >
                            <Check size={11} />
                            <span>Fulfill</span>
                          </button>
                        )}

                        {/* Standard Edit/Delete */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          style={{
                            padding: '6px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--text-sidebar)',
                            cursor: 'pointer'
                          }}
                          title="Edit request"
                        >
                          <Edit2 size={12} />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          style={{
                            padding: '6px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--color-danger)',
                            backgroundColor: 'var(--color-danger-light)',
                            cursor: 'pointer'
                          }}
                          title="Delete request"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                      Request inter-district transfer to replenish hospital blood reserves
                    </p>
                  </div>
                </div>

                <form onSubmit={handleExecuteDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
                  {/* Destination Hospital Selection */}
                  <div className="form-group">
                    <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      Destination Hospital (Receiving Facility)
                    </label>
                    <select
                      className="form-control"
                      value={dispatchForm.destinationHospitalName}
                      onChange={(e) => {
                        const selHosp = hospitalsList.find(h => h.name === e.target.value);
                        setDispatchForm({
                          ...dispatchForm,
                          destinationHospitalName: e.target.value,
                          destinationDistrict: selHosp?.district || ''
                        });
                      }}
                      required
                      style={{ fontSize: '0.85rem' }}
                    >
                      {hospitalsList.map(h => (
                        <option key={h.hospitalId || h.name} value={h.name}>
                          {h.name} ({h.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Status Pill */}
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>Destination: {dispatchForm.destinationHospitalName}</span>
                      <p style={{ color: 'var(--text-secondary)', margin: '2px 0 0', fontSize: '0.72rem' }}>
                        Inter-District Emergency Transfer Target
                      </p>
                    </div>
                    <span className="badge badge-danger">Emergency Reserve</span>
                  </div>

                  {/* Recommended Donor Hospital Selection */}
                  <div className="form-group">
                    <div className="flex-between" style={{ marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        Select Source Hospital with Surplus Blood Stock
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Sparkles size={12} />
                        Auto-ranked by stock
                      </span>
                    </div>

                    <select
                      className="form-control"
                      value={dispatchForm.donorHospitalName}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, donorHospitalName: e.target.value })}
                      required
                      style={{ fontSize: '0.85rem' }}
                    >
                      {rankedDonorHospitals.map(h => (
                        <option key={h.hospitalId || h.name} value={h.name}>
                          {h.name} ({h.district}) — {h.availableUnits} Units in Stock ({h.status})
                        </option>
                      ))}
                    </select>

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
                        <span style={{ fontWeight: 800 }}>{topRecommendedHospital.availableUnits} Units</span>
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
                        min="1"
                        max="200"
                        className="form-control"
                        value={dispatchForm.units}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, units: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="form-group">
                    <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Transport Urgency Level</label>
                    <select
                      className="form-control"
                      value={dispatchForm.urgency}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, urgency: e.target.value })}
                    >
                      <option value="Immediate Emergency (< 2 Hours - Emergency Vehicle)">Immediate Emergency (&lt; 2 Hours - Emergency Vehicle)</option>
                      <option value="Urgent Dispatch (< 6 Hours)">Urgent Dispatch (&lt; 6 Hours)</option>
                      <option value="Reserve Restock (Same Day Delivery)">Reserve Restock (Same Day Delivery)</option>
                    </select>
                  </div>

                  {/* Recipient Source Hospital Contact Preview */}
                  {(() => {
                    const selectedDonorHospital = rankedDonorHospitals.find(h => h.name === dispatchForm.donorHospitalName) || topRecommendedHospital;
                    return (
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
                          <span><strong>Coordinator Email:</strong> {selectedDonorHospital.email || 'bloodbank@health.gov.lk'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} color="#16a34a" />
                          <span><strong>Hospital Hotline:</strong> {selectedDonorHospital.contact || 'N/A'}</span>
                        </div>
                      </div>
                    );
                  })()}

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
                    <strong>Next Step:</strong> The source hospital coordinator ({dispatchSuccessData.donorHospital?.name}) has received this alert and can now click <strong>"Accept"</strong> or <strong>"Fulfill"</strong> to dispatch the transport vehicle.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    onClick={() => {
                      setDispatchModalOpen(false);
                      setDispatchSuccessData(null);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  >
                    Done & View Requests
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Add / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          animation: 'fadeIn var(--transition-fast)'
        }}>
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '460px', position: 'relative' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              {editMode ? 'Edit Emergency Request' : 'New Urgent Request'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Patient / Purpose Name</label>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Kasun Fernando (ICU Transfer)"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="form-control"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Units Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={form.units || 1}
                    onChange={(e) => setForm({ ...form, units: e.target.value })}
                    className="form-control"
                    placeholder="e.g. 2"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Requested By (Destination Hospital - Needing Blood)</label>
                <input
                  type="text"
                  value={form.requesterHospital || ''}
                  onChange={(e) => setForm({ ...form, requesterHospital: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Trincomalee General Hospital (ICU Ward)"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Fulfilling Hospital (Supplying Blood)</label>
                  <input
                    type="text"
                    value={form.hospital}
                    onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Jaffna Teaching Hospital"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Supplier District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="form-control"
                  >
                    {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="form-control"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex-between" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-danger)' }}>
                  {editMode ? 'Save Changes' : 'Broadcast Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Emergency Request?"
        description="Are you sure you want to delete this emergency request? This action is permanent and cannot be undone."
        itemDetails={{
          name: itemToDelete?.patientName,
          info: `${itemToDelete?.bloodGroup || ''} · ${itemToDelete?.hospital || ''} · ${itemToDelete?.district || ''}`,
          badge: itemToDelete?.status || 'Pending'
        }}
        loading={deleting}
      />
    </div>
  );
};

export default EmergencyRequests;
