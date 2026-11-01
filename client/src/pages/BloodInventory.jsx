import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, CheckCircle2, Building2, MapPin, ChevronRight, Layers } from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SearchWithSuggestions from '../components/SearchWithSuggestions';
import HospitalNameAutocomplete from '../components/HospitalNameAutocomplete';

// ── Group raw records by (hospitalName + bloodGroup) ──────────────────────────
const groupInventory = (records) => {
  const map = {};
  records.forEach(item => {
    const key = `${(item.hospitalName || item.district || '').trim()}||${item.bloodGroup}`;
    if (!map[key]) {
      map[key] = {
        key,
        bloodGroup: item.bloodGroup,
        rhFactor: item.rhFactor,
        district: item.district,
        hospitalName: item.hospitalName || `${item.district} District General Hospital`,
        totalUnits: 0,
        minExpiry: Infinity,
        lastUpdated: item.lastUpdated,
        records: []
      };
    }
    map[key].totalUnits += Number(item.availableUnits) || 0;
    map[key].minExpiry = Math.min(map[key].minExpiry, Number(item.expiryDays) || 999);
    if (new Date(item.lastUpdated) > new Date(map[key].lastUpdated)) {
      map[key].lastUpdated = item.lastUpdated;
    }
    map[key].records.push(item);
  });
  return Object.values(map);
};

const BloodInventory = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterRh, setFilterRh] = useState('');

  // Toast & Delete modal states
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    bloodGroup: 'A+',
    rhFactor: 'positive',
    district: 'Colombo',
    availableUnits: '',
    expiryDays: '42'
  });

  // Detail drawer: show all records for a group when row is clicked
  const [detailGroup, setDetailGroup] = useState(null); // grouped item

  const districtsList = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Trincomalee', 'Batticaloa',
    'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/inventory', {
      headers: { Authorization: `Bearer ${user?.token || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInventory(data);
          setFilteredInventory(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  // Apply filters/search on raw inventory, then group
  useEffect(() => {
    let result = inventory;
    if (searchTerm) {
      result = result.filter(item =>
        item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.hospitalName && item.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterDistrict) result = result.filter(item => item.district === filterDistrict);
    if (filterGroup)    result = result.filter(item => item.bloodGroup === filterGroup);
    if (filterRh)       result = result.filter(item => item.rhFactor === filterRh);
    setFilteredInventory(result);
  }, [searchTerm, filterDistrict, filterGroup, filterRh, inventory]);

  // Grouped rows for table display
  const groupedRows = groupInventory(filteredInventory);

  const isAdmin = user?.role === 'Administrator';
  const isHospitalUser = user?.role === 'Hospital' || user?.role === 'Hospital Staff' || !!user?.hospitalId;
  const userHospitalName = (user?.hospitalName || user?.name || '').trim();

  const isMyHospitalItem = (item) => {
    if (isAdmin) return true;
    if (!isHospitalUser || !userHospitalName) return false;
    const itemHosp = (item?.hospitalName || item?.hospital || '').trim().toLowerCase();
    const myHosp = userHospitalName.toLowerCase();
    return itemHosp === myHosp || (itemHosp && (itemHosp.includes(myHosp) || myHosp.includes(itemHosp)));
  };

  const userDistrict = user?.hospitalDistrict ||
    (isHospitalUser ? inventory.find(i => isMyHospitalItem(i))?.district : null) ||
    (userHospitalName.toLowerCase().includes('jaffna') ? 'Jaffna' : 'Colombo');

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      bloodGroup: 'A+',
      rhFactor: 'positive',
      district: isHospitalUser ? userDistrict : 'Colombo',
      availableUnits: '',
      expiryDays: '42',
      hospitalName: isHospitalUser ? userHospitalName : ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item, e) => {
    e && e.stopPropagation();
    if (!isMyHospitalItem(item)) {
      setSuccessMessage('You are only authorized to edit stock for your own hospital.');
      setTimeout(() => setSuccessMessage(''), 3500);
      return;
    }
    setEditMode(true);
    setSelectedId(item._id);
    setForm({
      bloodGroup: item.bloodGroup,
      rhFactor: item.rhFactor,
      district: item.district,
      availableUnits: item.availableUnits,
      expiryDays: item.expiryDays,
      hospitalName: item.hospitalName || userHospitalName
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = editMode ? `/api/inventory/${selectedId}` : '/api/inventory';
    const method = editMode ? 'PUT' : 'POST';
    const payload = {
      ...form,
      hospitalName: isHospitalUser ? userHospitalName : (form.hospitalName || ''),
      district: isHospitalUser ? userDistrict : form.district
    };
    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setModalOpen(false);
        setSuccessMessage(editMode ? 'Stock entry updated successfully!' : 'New stock entry created successfully!');
        fetchInventory();
        setDetailGroup(null); // refresh detail panel
        setTimeout(() => setSuccessMessage(''), 4000);
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (item, e) => {
    e && e.stopPropagation();
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const group = itemToDelete.bloodGroup;
    const district = itemToDelete.district;
    setDeleting(true);
    fetch(`/api/inventory/${itemToDelete._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user?.token || ''}` }
    })
      .then(() => {
        setDeleting(false);
        setDeleteModalOpen(false);
        setItemToDelete(null);
        setSuccessMessage(`Blood stock entry "${group}" for ${district} deleted successfully!`);
        fetchInventory();
        setDetailGroup(null);
        setTimeout(() => setSuccessMessage(''), 4000);
      })
      .catch(err => { console.error(err); setDeleting(false); });
  };

  const totalUnits = filteredInventory.reduce((acc, curr) => acc + curr.availableUnits, 0);

  // When a grouped row is clicked, open detail panel with fresh records from grouped data
  const handleRowClick = (group) => {
    setDetailGroup(group);
  };

  // Re-sync detail panel whenever inventory refreshes
  useEffect(() => {
    if (!detailGroup) return;
    const refreshed = groupInventory(inventory).find(g => g.key === detailGroup.key);
    setDetailGroup(refreshed || null);
  }, [inventory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Blood Inventory</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Track and manage active blood units in stock across all Sri Lanka districts</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Stock</span>
        </button>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534',
          padding: '14px 18px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 600,
          boxShadow: '0 4px 14px rgba(22,101,52,0.1)', animation: 'fadeIn var(--transition-fast)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D' }}>
              <CheckCircle2 size={18} />
            </div>
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Hospital portal banner */}
      {isHospitalUser && !isAdmin && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)',
          borderRadius: '10px', padding: '12px 16px', fontSize: '0.82rem', color: '#1e40af'
        }}>
          <Building2 size={20} color="#2563eb" />
          <div style={{ flex: 1 }}>
            <strong>Hospital Portal Active ({userHospitalName})</strong>: You are viewing national stock records in read-only mode. You are authorized to edit stock for <strong>{userHospitalName}</strong> only.
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="dashboard-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px' }} className="flex-column-responsive">
          <div style={{ flex: 1 }}>
            <SearchWithSuggestions
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by District, Hospital or Blood Group..."
              suggestions={Array.from(new Set(
                inventory.flatMap(i => [i.district, i.hospitalName, i.bloodGroup]).filter(Boolean)
              )).map(val => ({ label: String(val), category: 'Stock' }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }} className="flex-wrap-responsive">
            <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} className="form-control" style={{ width: '150px' }}>
              <option value="">All Districts</option>
              {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="form-control" style={{ width: '130px' }}>
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            <select value={filterRh} onChange={e => setFilterRh(e.target.value)} className="form-control" style={{ width: '120px' }}>
              <option value="">All Rh Factors</option>
              <option value="positive">Rh+</option>
              <option value="negative">Rh-</option>
            </select>
            {(filterDistrict || filterGroup || filterRh || searchTerm) && (
              <button onClick={() => { setSearchTerm(''); setFilterDistrict(''); setFilterGroup(''); setFilterRh(''); }} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table — Grouped */}
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading inventory details...</div>
        ) : groupedRows.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No inventory stock records match the selected filters.
          </div>
        ) : (
          <div className="table-container hospital-table-scroll" style={{ margin: 0, border: 'none', overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '900px', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Rh Factor</th>
                  <th>District</th>
                  <th>Hospital</th>
                  <th>Available Units <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-secondary)' }}>(total)</span></th>
                  <th>Closest Expiry <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-secondary)' }}>(min)</span></th>
                  <th>Batches</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map(group => (
                  <tr
                    key={group.key}
                    onClick={() => handleRowClick(group)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view all batches for this stock"
                  >
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{group.bloodGroup}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${group.rhFactor === 'positive' ? 'success' : 'info'}`}>
                        {group.rhFactor === 'positive' ? 'Rh+' : 'Rh-'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{group.district}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{group.hospitalName}</td>
                    <td style={{ fontWeight: 800 }}>{group.totalUnits} Units</td>
                    <td>
                      <span className={`badge badge-${group.minExpiry <= 5 ? 'danger' : group.minExpiry <= 10 ? 'warning' : 'success'}`}>
                        {group.minExpiry === Infinity ? '—' : `${group.minExpiry} Days`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Layers size={13} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{group.records.length}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(group.lastUpdated).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} className="flex-between">
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Total Filtered Stock: {totalUnits} Units</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Showing {groupedRows.length} grouped entries ({filteredInventory.length} batches)</span>
        </div>
      </div>

      {/* ── Detail Panel Modal: all batches for a grouped stock ── */}
      {detailGroup && (
        <div style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, right: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 250, animation: 'fadeIn var(--transition-fast)'
        }}>
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <button
              onClick={() => setDetailGroup(null)}
              style={{ position: 'absolute', top: '14px', right: '14px', color: 'var(--text-light)', zIndex: 1 }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                background: 'linear-gradient(135deg,#ef4444,#f87171)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>{detailGroup.bloodGroup}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '3px' }}>
                  {detailGroup.bloodGroup} — Stock Batches
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={13} />
                  {detailGroup.hospitalName} &nbsp;·&nbsp; {detailGroup.district} District
                </p>
              </div>
              {detailGroup.records && detailGroup.records.length > 0 && isMyHospitalItem(detailGroup) && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '7px 13px' }}
                  onClick={() => { setDetailGroup(null); handleOpenAdd(); }}
                >
                  <Plus size={13} /> Add New Batch
                </button>
              )}
            </div>

            {/* Summary strip */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px',
              background: 'rgba(225,29,72,0.04)', border: '1px solid rgba(225,29,72,0.15)',
              borderRadius: '12px', padding: '14px 16px', marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Total Units</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)' }}>{detailGroup.totalUnits}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Closest Expiry</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900, color: detailGroup.minExpiry <= 5 ? '#ef4444' : detailGroup.minExpiry <= 10 ? '#f59e0b' : '#10b981' }}>
                  {detailGroup.minExpiry} Days
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Batches</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>{detailGroup.records.length}</p>
              </div>
            </div>

            {/* Individual batch records */}
            <p style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)' }}>
              All Batches in Stock
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {detailGroup.records.map((rec, idx) => (
                <div key={rec._id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'var(--color-primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0
                  }}>
                    #{idx + 1}
                  </div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Units</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 800 }}>{rec.availableUnits} Units</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Expiry</p>
                      <span className={`badge badge-${rec.expiryDays <= 5 ? 'danger' : rec.expiryDays <= 10 ? 'warning' : 'success'}`} style={{ fontSize: '0.72rem' }}>
                        {rec.expiryDays} Days
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Updated</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{new Date(rec.lastUpdated).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  {isMyHospitalItem(rec) && (
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={(e) => { setDetailGroup(null); handleOpenEdit(rec, e); }}
                        style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-sidebar)', cursor: 'pointer' }}
                        title="Edit this batch"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(rec, e)}
                        style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-light)', cursor: 'pointer' }}
                        title="Delete this batch"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setDetailGroup(null)} style={{ fontSize: '0.8rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, right: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, animation: 'fadeIn var(--transition-fast)'
        }}>
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-light)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', fontFamily: 'Outfit' }}>
              {editMode ? 'Edit Stock Batch' : 'Add New Blood Stock'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isHospitalUser && !isAdmin ? (
                <div style={{ background: 'rgba(225,29,72,0.05)', border: '1px solid rgba(225,29,72,0.18)', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em' }}>Hospital Facility</span>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Your Hospital</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                    <Building2 size={18} />
                    <span>{userHospitalName}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} />
                    <span>District: <strong>{userDistrict}</strong></span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Hospital Facility Name</label>
                    <HospitalNameAutocomplete
                      value={form.hospitalName || ''}
                      onChange={value => setForm(prev => ({ ...prev, hospitalName: value }))}
                      onSelect={selectedName => {
                        const match = inventory.find(i => i.hospitalName === selectedName);
                        if (match && match.district) {
                          setForm(prev => ({ ...prev, hospitalName: selectedName, district: match.district }));
                        } else {
                          setForm(prev => ({ ...prev, hospitalName: selectedName }));
                        }
                      }}
                      suggestions={Array.from(new Set([
                        ...inventory.map(i => i.hospitalName).filter(Boolean),
                        'National Hospital of Sri Lanka',
                        'Colombo General Hospital',
                        'Jaffna Teaching Hospital',
                        'Kandy General Hospital',
                        'Galle General Hospital'
                      ]))}
                      placeholder="e.g. National Hospital of Sri Lanka"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>District Location</label>
                    <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="form-control">
                      {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} className="form-control">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Rh Factor</label>
                  <select value={form.rhFactor} onChange={e => setForm({ ...form, rhFactor: e.target.value })} className="form-control">
                    <option value="positive">positive (+)</option>
                    <option value="negative">negative (-)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Available Units</label>
                  <input type="number" value={form.availableUnits} onChange={e => setForm({ ...form, availableUnits: e.target.value })} className="form-control" placeholder="e.g. 150" required />
                </div>
                <div className="form-group">
                  <label>Expiry Days Remaining</label>
                  <input type="number" value={form.expiryDays} onChange={e => setForm({ ...form, expiryDays: e.target.value })} className="form-control" placeholder="e.g. 42" required />
                </div>
              </div>

              <div className="flex-between" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editMode ? 'Save Changes' : 'Create Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Blood Stock Batch?"
        description="Are you sure you want to delete this batch? This action is permanent and cannot be undone."
        itemDetails={{
          name: `${itemToDelete?.bloodGroup} Blood Stock`,
          info: `${itemToDelete?.district} District · ${itemToDelete?.availableUnits} Units Available`,
          badge: itemToDelete?.bloodGroup,
          isBlood: true
        }}
        loading={deleting}
      />
    </div>
  );
};

export default BloodInventory;
