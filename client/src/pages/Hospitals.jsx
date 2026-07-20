import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Phone, MapPin, Edit2, Trash2, X } from 'lucide-react';

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
  const [form, setForm] = useState({
    name: '',
    district: 'Colombo',
    type: 'Government',
    contact: '',
    status: 'Active'
  });

  const districtsList = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Trincomalee', 'Batticaloa',
    'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
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
      name: '',
      district: 'Colombo',
      type: 'Government',
      contact: '',
      status: 'Active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setForm({
      name: item.name,
      district: item.district,
      type: item.type,
      contact: item.contact,
      status: item.status
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = editMode ? `/api/hospitals/${selectedId}` : '/api/hospitals';
    const method = editMode ? 'PUT' : 'POST';

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        setModalOpen(false);
        fetchHospitals();
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this hospital?')) {
      fetch(`/api/hospitals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(() => fetchHospitals())
        .catch(err => console.error(err));
    }
  };

  // Metrics
  const totalCount = hospitals.length;
  const govCount = hospitals.filter(h => h.type === 'Government').length;
  const pvtCount = hospitals.filter(h => h.type === 'Private').length;
  const activeCount = hospitals.filter(h => h.status === 'Active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by Hospital Name, District, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', width: '100%' }}
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hospitals match the criteria.</div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Hospital ID</th>
                  <th>Hospital Name</th>
                  <th>District</th>
                  <th>Sector Type</th>
                  <th>Contact Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((item, idx) => (
                  <tr key={item._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.hospitalId || `HSP${String(idx+1).padStart(3, '0')}`}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={12} color="var(--text-light)" />
                        <span>{item.district}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${item.type === 'Government' ? 'success' : 'info'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} color="var(--text-light)" />
                        <span>{item.contact}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${item.status === 'Active' ? 'success' : 'danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          style={{
                            padding: '6px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--text-sidebar)'
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          style={{
                            padding: '6px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--color-danger)',
                            backgroundColor: 'var(--color-danger-light)'
                          }}
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

              <div className="flex-between" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? 'Save Changes' : 'Register Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hospitals;
