import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, CheckCircle, Clock, Edit2, Trash2, X, Check, ArrowRight } from 'lucide-react';

const EmergencyRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
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

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/requests', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sort reverse chronological
          data.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
          setRequests(data);
          setFilteredRequests(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  useEffect(() => {
    let result = requests;

    if (searchTerm) {
      result = result.filter(item =>
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      result = result.filter(item => item.status === filterStatus);
    }

    setFilteredRequests(result);
  }, [searchTerm, filterStatus, requests]);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      patientName: '',
      bloodGroup: 'A+',
      hospital: '',
      district: 'Colombo',
      status: 'Pending'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setForm({
      patientName: item.patientName,
      bloodGroup: item.bloodGroup,
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
        fetchRequests();
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
      .then(() => fetchRequests())
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this emergency request?')) {
      fetch(`/api/requests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(() => fetchRequests())
        .catch(err => console.error(err));
    }
  };

  // Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const acceptedCount = requests.filter(r => r.status === 'Accepted').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Emergency Requests</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monitor critical shortages and hospital dispatch timelines</p>
        </div>
        <button className="btn btn-danger" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>New Urgent Request</span>
        </button>
      </div>

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
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by Patient Name, Hospital, Request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', width: '100%' }}
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
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading emergency requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No emergency requests logs exist.</div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Patient Name</th>
                  <th>Blood Group</th>
                  <th>Requesting Hospital</th>
                  <th>District</th>
                  <th>Requested Time</th>
                  <th>Status</th>
                  <th>Actions & Updates</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.requestId}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.patientName}</td>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{item.bloodGroup}</span>
                    </td>
                    <td>{item.hospital}</td>
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
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Accept button (Pending only) */}
                        {item.status === 'Pending' && (
                          <button
                            onClick={() => handleQuickStatusChange(item._id, 'Accepted')}
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                          >
                            <Check size={10} />
                            <span>Accept</span>
                          </button>
                        )}

                        {/* Complete button (Accepted only) */}
                        {item.status === 'Accepted' && (
                          <button
                            onClick={() => handleQuickStatusChange(item._id, 'Completed')}
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', backgroundColor: 'var(--color-success)', color: 'white' }}
                          >
                            <Check size={10} />
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
              {editMode ? 'Edit Emergency Request' : 'Create Urgent Dispatch Request'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Shanika Silva"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Required Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="form-control"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Requesting Medical Facility</label>
                  <input
                    type="text"
                    value={form.hospital}
                    onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Kandy Hospital"
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
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
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
    </div>
  );
};

export default EmergencyRequests;
