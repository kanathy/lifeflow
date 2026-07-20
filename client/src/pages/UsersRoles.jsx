import React, { useState, useEffect } from 'react';
import { Plus, Search, Shield, UserCheck, ShieldAlert, Edit2, Trash2, X } from 'lucide-react';

const UsersRoles = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    status: 'Active',
    password: ''
  });

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => {
        if (res.status === 403) {
          throw new Error('Access Denied');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user.role === 'Administrator') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, users]);

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      name: '',
      email: '',
      role: 'Viewer',
      status: 'Active',
      password: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setForm({
      name: item.name,
      email: item.email,
      role: item.role,
      status: item.status,
      password: '' // Omit password updates by default
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = editMode ? `/api/users/${selectedId}` : '/api/users';
    const method = editMode ? 'PUT' : 'POST';

    // If editMode and password is empty, delete it from form submission data
    const submissionForm = { ...form };
    if (editMode && !submissionForm.password) {
      delete submissionForm.password;
    }

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(submissionForm)
    })
      .then(res => res.json())
      .then(() => {
        setModalOpen(false);
        fetchUsers();
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if (id === user._id) {
      alert('You cannot delete your own active administrator profile!');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user profile?')) {
      fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(() => fetchUsers())
        .catch(err => console.error(err));
    }
  };

  // Block Access for Non-Admins
  if (user.role !== 'Administrator') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        gap: '16px'
      }}>
        <div style={{ backgroundColor: 'var(--color-danger-light)', padding: '24px', borderRadius: '50%' }}>
          <ShieldAlert size={48} color="var(--color-danger)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          This administrative configuration panel is locked. Only profiles assigned the **Administrator** role can alter credential directories.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Users & Roles</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage administrative dashboard user accounts and scopes</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search Filter panel */}
      <div className="dashboard-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by Name, Email, or Role Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="dashboard-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading user accounts directory...</div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Member Name</th>
                  <th>Role Designation</th>
                  <th>Email Address</th>
                  <th>System Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.userId}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`}
                          alt="avatar"
                          style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)' }}
                        />
                        <span style={{ fontWeight: 700 }}>{item.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${item.role === 'Administrator' ? 'danger' : item.role === 'Donor Coordinator' ? 'warning' : item.role === 'Hospital Staff' ? 'info' : 'success'}`}>
                        {item.role}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{item.email}</td>
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
                          disabled={item._id === user._id}
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
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', fontFamily: 'Outfit' }}>
              {editMode ? 'Edit User Credentials' : 'Create New Dashboard User'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>User Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Admin User"
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
                  placeholder="e.g. staff@kandy.lk"
                  required
                />
              </div>

              <div className="form-group">
                <label>{editMode ? 'Password (Leave blank to keep unchanged)' : 'Password'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="form-control"
                  placeholder="••••••••"
                  required={!editMode}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Access Role Scope</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="form-control"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Hospital Staff">Hospital Staff</option>
                    <option value="Donor Coordinator">Donor Coordinator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
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
                  {editMode ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersRoles;
