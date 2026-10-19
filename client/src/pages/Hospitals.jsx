import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Building2, Phone, MapPin, Edit2, Trash2, X, Mail } from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SearchWithSuggestions from '../components/SearchWithSuggestions';

const Hospitals = ({ user }) => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Table horizontal scroll ref
  const tableContainerRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollBy({ left: 180, behavior: 'smooth' });
      }
    } else if (e.key === 'ArrowLeft') {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollBy({ left: -180, behavior: 'smooth' });
      }
    }
  };
  const [form, setForm] = useState({
    hospitalId: '',
    name: '',
    district: 'Colombo',
    type: 'Government',
    contact: '',
    email: '',
    address: '',
    status: 'Active'
  });

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const districtsList = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
    'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
  ];

  const fetchHospitals = () => {
    setLoading(true);
    fetch('/api/hospitals', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHospitals(data);
          setFilteredHospitals(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHospitals();
  }, [user]);

  useEffect(() => {
    let result = hospitals;

    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contact.includes(searchTerm)
      );
    }

    if (filterType) {
      result = result.filter(item => item.type === filterType);
    }

    setFilteredHospitals(result);
  }, [searchTerm, filterType, hospitals]);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      hospitalId: '',
      name: '',
      district: 'Colombo',
      type: 'Government',
      contact: '',
      email: '',
      address: '',
      status: 'Active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setForm({
      hospitalId: item.hospitalId || '',
      name: item.name,
      district: item.district,
      type: item.type,
      contact: item.contact,
      email: item.email || '',
      address: item.address || '',
      status: item.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editMode ? `/api/hospitals/${selectedId}` : '/api/hospitals';
    const method = editMode ? 'PUT' : 'POST';
    setSubmitting(true);

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || 'Failed to save hospital', 'error');
      } else {
        setModalOpen(false);
        fetchHospitals();
        showToast(editMode ? 'Hospital updated successfully!' : 'Hospital registered successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    setDeleting(true);
    fetch(`/api/hospitals/${itemToDelete._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then((data) => {
        setDeleting(false);
        setDeleteModalOpen(false);
        if (data.message && data.message.includes('successfully')) {
          fetchHospitals();
          showToast(`Hospital "${itemToDelete.name}" removed successfully!`, 'success');
        } else {
          showToast(data.message || 'Failed to remove hospital.', 'error');
        }
        setItemToDelete(null);
      })
      .catch(err => {
        console.error(err);
        setDeleting(false);
        showToast('Network error. Please try again.', 'error');
      });
  };

  // Metrics
  const totalCount = hospitals.length;
  const govCount = hospitals.filter(h => h.type === 'Government').length;
  const pvtCount = hospitals.filter(h => h.type === 'Private').length;
  const activeCount = hospitals.filter(h => h.status === 'Active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '14px 20px',
          borderRadius: '10px',
          backgroundColor: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.25s ease',
          maxWidth: '340px'
        }}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Registered Hospitals</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage medical centers requesting blood units</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Hospital</span>
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="dashboard-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Building2 size={36} color="var(--color-primary)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Hospitals</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalCount}</h3>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Building2 size={36} color="var(--color-success)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Government Institutions</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{govCount}</h3>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Building2 size={36} color="var(--color-info)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Private Hospitals</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pvtCount}</h3>
          </div>
        </div>
        <div className="dashboard-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Building2 size={36} color="var(--color-primary)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active This Month</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="dashboard-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px' }} className="flex-column-responsive">
          <div style={{ flex: 1 }}>
            <SearchWithSuggestions
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by Hospital Name, District, Phone..."
              suggestions={Array.from(new Set(
                hospitals.flatMap(h => [h.name, h.district, h.type, h.contact]).filter(Boolean)
              )).map(val => ({ label: String(val), category: 'Hospital' }))}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-control"
            style={{ width: '180px' }}
          >
            <option value="">All Types</option>
            <option value="Government">Government</option>
            <option value="Private">Private</option>
          </select>
        </div>
      </div>

      {/* Table list */}
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading hospitals database...</div>
        ) : filteredHospitals.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {hospitals.length === 0
              ? 'No hospitals registered yet. Click "Add New Hospital" to get started.'
              : 'No hospitals match the search criteria.'}
          </div>
        ) : (
          <div
            ref={tableContainerRef}
            className="table-container hospital-table-scroll"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            style={{
              margin: 0,
              border: 'none',
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 290px)',
              minHeight: '340px',
              width: '100%',
              outline: 'none',
              position: 'relative'
            }}
          >
            <table className="custom-table" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>Hospital ID</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>Hospital Name</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>District</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>Sector Type</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>Contact Number</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>Coordinator Email</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>Address</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>Status</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '10px 8px', fontSize: '0.72rem', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((item, idx) => (
                  <tr key={item._id}>
                    <td style={{ whiteSpace: 'nowrap', padding: '9px 8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{item.hospitalId || `HSP${String(idx + 1).padStart(3, '0')}`}</span>
                    </td>
                    <td style={{ fontWeight: 700, whiteSpace: 'nowrap', padding: '9px 8px', fontSize: '0.8rem' }}>{item.name}</td>
                    <td style={{ whiteSpace: 'nowrap', padding: '9px 8px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} color="var(--text-light)" />
                        <span>{item.district}</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', padding: '9px 8px' }}>
                      <span className={`badge badge-${item.type === 'Government' ? 'success' : 'info'}`} style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', padding: '9px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} color="var(--text-light)" />
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{item.contact}</span>
                      </div>
                    </td>
                    {/* Email column */}
                    <td style={{ whiteSpace: 'nowrap', padding: '9px 8px' }}>
                      {item.email ? (
                        <a
                          href={`mailto:${item.email}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#2563eb',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}
                          title={item.email}
                        >
                          <Mail size={11} />
                          <span>{item.email}</span>
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    {/* Address column */}
                    <td style={{ padding: '9px 8px', maxWidth: '170px' }}>
                      {item.address ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                          <Building2 size={11} color="var(--text-light)" style={{ flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.address}>
                            {item.address}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', padding: '9px 8px' }}>
                      <span className={`badge badge-${item.status === 'Active' ? 'success' : 'danger'}`} style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center', padding: '9px 8px' }}>
                      <div style={{ display: 'inline-flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          style={{
                            padding: '4px 6px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--text-sidebar)'
                          }}
                          title="Edit Hospital"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          style={{
                            padding: '4px 6px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--color-danger)',
                            backgroundColor: 'var(--color-danger-light)'
                          }}
                          title="Delete Hospital"
                        >
                          <Trash2 size={11} />
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

      {/* CRUD Modal */}
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
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', fontFamily: 'Outfit' }}>
              {editMode ? 'Edit Hospital Info' : 'Register New Hospital'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Hospital ID</label>
                <input
                  type="text"
                  value={form.hospitalId}
                  onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                  className="form-control"
                  placeholder="e.g. HSP001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Hospital Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Colombo General Hospital"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="form-control"
                  >
                    {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sector Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="form-control"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="form-control"
                    placeholder="e.g. 011 234 5678"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Coordinator Email <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.75rem' }}>(used for emergency dispatch alerts)</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-control"
                  placeholder="e.g. bloodbank@hospital.gov.lk"
                />
              </div>

              <div className="form-group">
                <label>Hospital Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Hospital Road, Colombo 08"
                />
              </div>

              <div className="flex-between" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting
                    ? (editMode ? 'Saving...' : 'Registering...')
                    : (editMode ? 'Save Changes' : 'Register Center')
                  }
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
        title="Remove Hospital?"
        description="Are you sure you want to remove this hospital from the system? This action is permanent and cannot be undone."
        itemDetails={{
          name: itemToDelete?.name,
          info: `${itemToDelete?.district || ''} District · ${itemToDelete?.type || 'Government'} Hospital`,
          badge: itemToDelete?.type || 'Hospital'
        }}
        loading={deleting}
      />
    </div>
  );
};

export default Hospitals;
