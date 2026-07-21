import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, SlidersHorizontal } from 'lucide-react';

const BloodInventory = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterRh, setFilterRh] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    bloodGroup: 'A+',
    rhFactor: 'positive',
    district: 'Colombo',
    availableUnits: '',
    expiryDays: '35'
  });

  const districtsList = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Trincomalee', 'Batticaloa',
    'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/inventory', {
      headers: { Authorization: `Bearer ${user.token}` }
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

  // Apply filters and searches locally
  useEffect(() => {
    let result = inventory;

    if (searchTerm) {
      result = result.filter(item =>
        item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDistrict) {
      result = result.filter(item => item.district === filterDistrict);
    }

    if (filterGroup) {
      result = result.filter(item => item.bloodGroup === filterGroup);
    }

    if (filterRh) {
      result = result.filter(item => item.rhFactor === filterRh);
    }

    setFilteredInventory(result);
  }, [searchTerm, filterDistrict, filterGroup, filterRh, inventory]);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      bloodGroup: 'A+',
      rhFactor: 'positive',
      district: 'Colombo',
      availableUnits: '',
      expiryDays: '35'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setForm({
      bloodGroup: item.bloodGroup,
      rhFactor: item.rhFactor,
      district: item.district,
      availableUnits: item.availableUnits,
      expiryDays: item.expiryDays
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = editMode ? `/api/inventory/${selectedId}` : '/api/inventory';
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
        fetchInventory();
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(() => fetchInventory())
        .catch(err => console.error(err));
    }
  };

  const totalUnits = filteredInventory.reduce((acc, curr) => acc + curr.availableUnits, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Blood Inventory</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Track and manage active blood units in stock</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Stock</span>
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="dashboard-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px' }} className="flex-column-responsive">
          {/* Search box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by District or Blood Group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }} className="flex-wrap-responsive">
            {/* Filter District */}
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="form-control"
              style={{ width: '150px' }}
            >
              <option value="">All Districts</option>
              {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Filter Group */}
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="form-control"
              style={{ width: '130px' }}
            >
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>

            {/* Filter Rh */}
            <select
              value={filterRh}
              onChange={(e) => setFilterRh(e.target.value)}
              className="form-control"
              style={{ width: '120px' }}
            >
              <option value="">All Rh Factors</option>
              <option value="positive">Rh+</option>
              <option value="negative">Rh-</option>
            </select>

            {/* Clear filters */}
            {(filterDistrict || filterGroup || filterRh || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDistrict('');
                  setFilterGroup('');
                  setFilterRh('');
                }}
                style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory table */}
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading inventory details...</div>
        ) : filteredInventory.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No inventory stock records match the selected filters.</div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Rh Factor</th>
                  <th>District Location</th>
                  <th>Available Units</th>
                  <th>Expiry Days Remaining</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{item.bloodGroup}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${item.rhFactor === 'positive' ? 'success' : 'info'}`}>
                        {item.rhFactor === 'positive' ? 'Rh+' : 'Rh-'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.district}</td>
                    <td style={{ fontWeight: 800 }}>{item.availableUnits} Units</td>
                    <td>
                      <span className={`badge badge-${item.expiryDays <= 5 ? 'danger' : item.expiryDays <= 10 ? 'warning' : 'success'}`}>
                        {item.expiryDays} Days
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(item.lastUpdated).toLocaleDateString('en-GB')}
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

        {/* Footer Metrics */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }} className="flex-between">
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Total Filtered Stock: {totalUnits} Units</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Showing {filteredInventory.length} entries</span>
        </div>
      </div>

      {/* CRUD Modal dialog */}
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
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', fontFamily: 'Outfit' }}>
              {editMode ? 'Edit Stock Entry' : 'Add New Blood Stock'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                  <label>Rh Factor</label>
                  <select
                    value={form.rhFactor}
                    onChange={(e) => setForm({ ...form, rhFactor: e.target.value })}
                    className="form-control"
                  >
                    <option value="positive">positive (+)</option>
                    <option value="negative">negative (-)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>District Location</label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="form-control"
                >
                  {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Available Units</label>
                  <input
                    type="number"
                    value={form.availableUnits}
                    onChange={(e) => setForm({ ...form, availableUnits: e.target.value })}
                    className="form-control"
                    placeholder="e.g. 150"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Days Remaining</label>
                  <input
                    type="number"
                    value={form.expiryDays}
                    onChange={(e) => setForm({ ...form, expiryDays: e.target.value })}
                    className="form-control"
                    placeholder="e.g. 35"
                    required
                  />
                </div>
              </div>

              <div className="flex-between" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodInventory;
