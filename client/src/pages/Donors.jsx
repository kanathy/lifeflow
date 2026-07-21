import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Calendar, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

const Donors = ({ user }) => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    bloodGroup: 'O+',
    contact: '',
    email: '',
    district: 'Colombo',
    status: 'Active',
    lastDonationDate: ''
  });

  const districtsList = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Trincomalee', 'Batticaloa',
    'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const fetchDonors = () => {
    setLoading(true);
    fetch('/api/donors', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDonors(data);
          setFilteredDonors(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDonors();
  }, [user]);

  useEffect(() => {
    let result = donors;

    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contact.includes(searchTerm) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterGroup) {
      result = result.filter(item => item.bloodGroup === filterGroup);
    }

    setFilteredDonors(result);
  }, [searchTerm, filterGroup, donors]);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      name: '',
      bloodGroup: 'O+',
      contact: '',
      email: '',
      district: 'Colombo',
      status: 'Active',
      lastDonationDate: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setForm({
      name: item.name,
      bloodGroup: item.bloodGroup,
      contact: item.contact,
      email: item.email || '',
      district: item.district,
      status: item.status,
      lastDonationDate: item.lastDonationDate ? new Date(item.lastDonationDate).toISOString().split('T')[0] : ''
    });
    setModalOpen(true);
  };

  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = editMode ? `/api/donors/${selectedId}` : '/api/donors';
    const method = editMode ? 'PUT' : 'POST';

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Error saving donor'); });
        }
        return res.json();
      })
      .then(() => {
        setFeedbackMsg('Donor saved successfully');
        setModalOpen(false);
        fetchDonors();
      })
      .catch(err => {
        console.error(err);
        setFeedbackMsg(`Error: ${err.message}`);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this donor profile?')) {
      fetch(`/api/donors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(() => fetchDonors())
        .catch(err => console.error(err));
    }
  };

  // Metrics calculations
  const totalCount = donors.length;
  const activeCount = donors.filter(d => d.status === 'Active').length;
  const inactiveCount = donors.filter(d => d.status === 'Inactive').length;
  const monthlyDonations = donors.filter(d => d.lastDonationDate && new Date(d.lastDonationDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {feedbackMsg && (
        <div style={{ padding: '8px 12px', backgroundColor: feedbackMsg.startsWith('Error') ? 'var(--color-danger-light)' : 'var(--color-success-light)', color: feedbackMsg.startsWith('Error') ? 'var(--color-danger)' : 'var(--color-success)', borderRadius: '4px', marginBottom: '12px' }}>
          {feedbackMsg}
        </div>
      )}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Donors Network</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage volunteer donors database records</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Donor</span>
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="dashboard-card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Registered</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalCount}</h3>
        </div>
        <div className="dashboard-card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active status</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>{activeCount}</h3>
        </div>
        <div className="dashboard-card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Inactive status</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-light)' }}>{inactiveCount}</h3>
        </div>
        <div className="dashboard-card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Donations (Last 30 days)</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{monthlyDonations}</h3>
        </div>
      </div>

      {/* Search Filter Panel */}
      <div className="dashboard-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px' }} className="flex-column-responsive">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by Name, District, Contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="form-control"
            style={{ width: '180px' }}
          >
            <option value="">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
      </div>

      {/* Donors list */}
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading donors database...</div>
        ) : filteredDonors.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No donor records match the query.</div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Blood Group</th>
                  <th>Contact Details</th>
                  <th>Location</th>
                  <th>Last Donation</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`}
                          alt={item.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)' }}
                        />
                        <div>
                          <p style={{ fontWeight: 700 }}>{item.name}</p>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ID: {item.donorId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{item.bloodGroup}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)' }}>
                          <Phone size={10} /> <span>{item.contact}</span>
                        </div>
                        {item.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                            <Mail size={10} /> <span>{item.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.district}</td>
                    <td>
                      {item.lastDonationDate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          <Calendar size={12} color="var(--text-light)" />
                          <span>{new Date(item.lastDonationDate).toLocaleDateString('en-GB')}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Never donated</span>
                      )}
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

      {/* Modal Dialog */}
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
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', fontFamily: 'Outfit' }}>
              {editMode ? 'Edit Donor details' : 'Register New Donor'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Nimal Bandara"
                  required
                />
              </div>

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
                  <label>District Location</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="form-control"
                  >
                    {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
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
                    placeholder="e.g. 077 123 4567"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-control"
                    placeholder="e.g. nimal@gmail.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Last Donation Date</label>
                  <input
                    type="date"
                    value={form.lastDonationDate}
                    onChange={(e) => setForm({ ...form, lastDonationDate: e.target.value })}
                    className="form-control"
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
                  {editMode ? 'Save Changes' : 'Register Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donors;
