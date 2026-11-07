import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Calendar, Edit2, Trash2, X, AlertTriangle, CheckCircle, Eye, Send, CheckSquare, Square, Users, Sparkles, Filter, ChevronRight, Check } from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SearchWithSuggestions from '../components/SearchWithSuggestions';

const Donors = ({ user }) => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  // Bulk shortage email outreach states
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [shortageSummary, setShortageSummary] = useState([
    { bg: 'O+', label: 'High Shortage (Critical)', units: 148 },
    { bg: 'A+', label: 'High Shortage', units: 119 },
    { bg: 'B-', label: 'Moderate Reserve', units: 85 },
    { bg: 'AB-', label: 'Critical Shortage', units: 42 }
  ]);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const isAdmin = user?.role === 'Administrator';

  const fetchDonors = () => {
    setLoading(true);
    fetch('/api/donors', {
      headers: { Authorization: `Bearer ${user?.token || ''}` }
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

  const isHospitalUser = user?.role === 'Hospital' || user?.role === 'Hospital Staff' || !!user?.hospitalId;
  const userDistrict = user?.hospitalDistrict || (user?.name?.toLowerCase().includes('jaffna') ? 'Jaffna' : 'Colombo');

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm({
      name: '',
      bloodGroup: 'O+',
      contact: '',
      email: '',
      district: isHospitalUser ? userDistrict : 'Colombo',
      status: 'Active',
      lastDonationDate: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    if (!isAdmin) {
      setFeedbackMsg('View only: Only administrators are authorized to edit donor details.');
      setTimeout(() => setFeedbackMsg(''), 4000);
      return;
    }
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
    if (editMode && !isAdmin) {
      setFeedbackMsg('Forbidden: Only administrators can modify donor records.');
      setTimeout(() => setFeedbackMsg(''), 4000);
      return;
    }
    const endpoint = editMode ? `/api/donors/${selectedId}` : '/api/donors';
    const method = editMode ? 'PUT' : 'POST';

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token || ''}`
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
        const msg = editMode ? 'Donor profile updated successfully!' : 'New donor details added successfully!';
        setFeedbackMsg(msg);
        setModalOpen(false);
        fetchDonors();
        setTimeout(() => setFeedbackMsg(''), 4000);
      })
      .catch(err => {
        console.error(err);
        setFeedbackMsg(`Error: ${err.message}`);
        setTimeout(() => setFeedbackMsg(''), 4000);
      });
  };

  const handleDelete = (item) => {
    if (!isAdmin) {
      setFeedbackMsg('View only: Only administrators are authorized to delete donors.');
      setTimeout(() => setFeedbackMsg(''), 4000);
      return;
    }
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete || !isAdmin) return;

    const donorName = itemToDelete.name;

    setDeleting(true);
    fetch(`/api/donors/${itemToDelete._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user?.token || ''}` }
    })
      .then(() => {
        setDeleting(false);
        setDeleteModalOpen(false);
        setItemToDelete(null);
        fetchDonors();
        setFeedbackMsg(`Donor profile "${donorName}" removed successfully!`);
        setTimeout(() => setFeedbackMsg(''), 4000);
      })
      .catch(err => {
        console.error(err);
        setDeleting(false);
      });
  };

  // ─── Bulk Shortage Email Handlers ──────────────────────────────────────────
  const generateEmailTemplate = (bg = 'Selected Blood Group', count = 0) => {
    return `Dear Volunteer Donor,

This is an urgent emergency blood donation appeal from the National Blood Transfusion Service / LifeFlow Sri Lanka.

Our hospital network is currently experiencing a critical shortage of ${bg} blood group reserves. As a registered active donor with blood group ${bg}, your timely donation can save emergency patients, surgical cases, and accident victims today.

• Blood Group Needed: ${bg}
• Priority Level: CRITICAL EMERGENCY SHORTAGE APPEAL
• Coordinating Center: LifeFlow Regional Blood Bank Network
• Operating Hours: 8:00 AM – 6:00 PM (Daily)

If you are currently in good health and have not donated blood in the last 3-4 months, please visit your nearest hospital blood bank center at your earliest convenience.

Every single drop counts. Together, we can save lives.

Emergency Dispatch Hotline: +94 11 269 1111 / LifeFlow Support
Thank you for your noble commitment to saving lives!

LifeFlow Blood Bank Emergency Coordination Team`;
  };

  const handleSelectShortageGroup = (bg) => {
    setFilterGroup(bg);
    const matchingIds = donors
      .filter(d => d.bloodGroup === bg && d.status === 'Active')
      .map(d => d._id);
    setSelectedDonorIds(matchingIds);
    setEmailSubject(`[URGENT] Critical ${bg} Blood Shortage Appeal - LifeFlow Emergency Dispatch`);
    setEmailMessage(generateEmailTemplate(bg, matchingIds.length));
  };

  const handleToggleSelectAll = () => {
    if (selectedDonorIds.length === filteredDonors.length && filteredDonors.length > 0) {
      setSelectedDonorIds([]);
    } else {
      setSelectedDonorIds(filteredDonors.map(d => d._id));
    }
  };

  const handleToggleDonorSelect = (id) => {
    setSelectedDonorIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenBulkEmailModal = () => {
    if (selectedDonorIds.length === 0) {
      setFeedbackMsg('Please select at least one donor to send an emergency shortage email.');
      setTimeout(() => setFeedbackMsg(''), 4000);
      return;
    }
    const targetGroup = filterGroup || 'Urgent Shortage';
    if (!emailSubject) {
      setEmailSubject(`[URGENT] Critical ${targetGroup} Blood Shortage Appeal - LifeFlow Emergency Dispatch`);
    }
    if (!emailMessage) {
      setEmailMessage(generateEmailTemplate(targetGroup, selectedDonorIds.length));
    }
    setEmailModalOpen(true);
  };

  const handleSendBulkEmail = async () => {
    if (!emailSubject || !emailMessage) {
      setFeedbackMsg('Error: Please provide both an email subject and message body.');
      setTimeout(() => setFeedbackMsg(''), 4000);
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch('/api/donors/bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({
          donorIds: selectedDonorIds,
          bloodGroup: filterGroup || 'Mixed',
          subject: emailSubject,
          message: emailMessage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to dispatch emails');

      setEmailModalOpen(false);
      setFeedbackMsg(`Emergency shortage appeal email sent successfully to ${data.recipientCount} donor(s)!`);
      setSelectedDonorIds([]);
      setTimeout(() => setFeedbackMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setFeedbackMsg(`Error: ${err.message}`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
    setSendingEmail(false);
  };

  const handleOpenLocalEmail = () => {
    const selectedDonorsList = donors.filter(d => selectedDonorIds.includes(d._id));
    const emails = selectedDonorsList.map(d => d.email).filter(Boolean);
    if (!emails.length) {
      setFeedbackMsg('Error: None of the selected donors have email addresses.');
      setTimeout(() => setFeedbackMsg(''), 4000);
      return;
    }
    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(emails.join(','))}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Metrics calculations
  const totalCount = donors.length;
  const activeCount = donors.filter(d => d.status === 'Active').length;
  const inactiveCount = donors.filter(d => d.status === 'Inactive').length;
  const monthlyDonations = donors.filter(d => d.lastDonationDate && new Date(d.lastDonationDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* Floating Success Toast */}
      {feedbackMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: feedbackMsg.startsWith('Error') ? '#EF4444' : '#10B981',
          color: '#FFFFFF',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.95rem',
          fontWeight: 700
        }}>
          <CheckCircle size={22} color="#FFFFFF" />
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg('')} style={{ background: 'none', border: 'none', color: '#FFFFFF', marginLeft: '12px', cursor: 'pointer' }}>
            <X size={16} />
          </button>
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

      {!isAdmin && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(59, 130, 246, 0.06)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <Eye size={16} color="#3B82F6" />
          <span><strong>Hospital Donor Portal:</strong> You can register new volunteer donors to the network. Existing donor records are in View-Only mode (modifications and removals are managed by System Administrators).</span>
        </div>
      )}

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

      {/* Emergency Blood Shortage Outreach & Bulk Dispatch Panel (Admin Only) */}
      {isAdmin && (
        <div className="dashboard-card" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(244, 63, 94, 0.08))',
          border: '1.5px solid rgba(239, 68, 68, 0.25)',
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444, #e11d48)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}>
                <AlertTriangle size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Blood Shortage Donor Outreach & Bulk Email
                  </h3>
                  <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                    Admin Feature
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                  Check blood shortages, filter eligible donors by blood group, and dispatch urgent donation appeals in bulk
                </p>
              </div>
            </div>

            {selectedDonorIds.length > 0 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenBulkEmailModal}
                style={{
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  padding: '8px 16px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                }}
              >
                <Send size={14} />
                <span>Dispatch Bulk Email ({selectedDonorIds.length} Donors)</span>
              </button>
            )}
          </div>

          {/* Quick Filter Critical Shortage Blood Groups */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} color="#ef4444" />
              <span>Target Shortage Groups:</span>
            </span>

            {['O+', 'A+', 'B-', 'AB-', 'A-', 'B+'].map(bg => {
              const isSelected = filterGroup === bg;
              const matchingCount = donors.filter(d => d.bloodGroup === bg && d.status === 'Active').length;
              return (
                <button
                  key={bg}
                  type="button"
                  onClick={() => handleSelectShortageGroup(bg)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '7px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '1.5px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.25)',
                    backgroundColor: isSelected ? '#ef4444' : 'rgba(239, 68, 68, 0.08)',
                    color: isSelected ? '#ffffff' : '#b91c1c'
                  }}
                  title={`Filter active donors with blood group ${bg} and auto-select for bulk email`}
                >
                  <span>{bg}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(239, 68, 68, 0.15)',
                    color: isSelected ? '#fff' : '#ef4444'
                  }}>
                    {matchingCount} active
                  </span>
                </button>
              );
            })}

            {filterGroup && (
              <button
                type="button"
                onClick={() => { setFilterGroup(''); setSelectedDonorIds([]); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Filter Panel */}
      <div className="dashboard-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px' }} className="flex-column-responsive">
          <div style={{ flex: 1 }}>
            <SearchWithSuggestions
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by Name, District, Contact..."
              suggestions={Array.from(new Set(
                donors.flatMap(d => [d.name, d.district, d.bloodGroup, d.phone]).filter(Boolean)
              )).map(val => ({ label: String(val), category: 'Donor' }))}
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
          <div className="table-container hospital-table-scroll" style={{ margin: 0, border: 'none', overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '950px', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  {isAdmin && (
                    <th style={{ width: '42px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={filteredDonors.length > 0 && selectedDonorIds.length === filteredDonors.length}
                        onChange={handleToggleSelectAll}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                        title="Select/Deselect all filtered donors"
                      />
                    </th>
                  )}
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
                {filteredDonors.map((item) => {
                  const isSelected = selectedDonorIds.includes(item._id);
                  return (
                  <tr key={item._id} style={{ backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.04)' : undefined }}>
                    {isAdmin && (
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleDonorSelect(item._id)}
                          style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--color-primary)' }}
                        />
                      </td>
                    )}
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
                      {isAdmin ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Donor Profile"
                            style={{
                              padding: '6px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              color: 'var(--text-sidebar)',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Delete Donor Profile"
                            style={{
                              padding: '6px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              color: 'var(--color-danger)',
                              backgroundColor: 'var(--color-danger-light)',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted, #64748b)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'var(--bg-card, #f1f5f9)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600
                        }}>
                          <Eye size={12} /> View only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
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

      {/* Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Donor Profile?"
        description="Are you sure you want to remove this volunteer donor profile? This action is permanent and cannot be undone."
        itemDetails={{
          name: itemToDelete?.name,
          info: `${itemToDelete?.bloodGroup || ''} Donor · ${itemToDelete?.district || ''} District`,
          badge: itemToDelete?.bloodGroup || 'Donor'
        }}
        loading={deleting}
      />

      {/* ── Floating Bulk Action Bar ── */}
      {isAdmin && selectedDonorIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          backgroundColor: 'var(--bg-primary)',
          border: '1.5px solid var(--color-primary)',
          borderRadius: '14px',
          padding: '10px 22px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          animation: 'slideUp 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.74rem',
              fontWeight: 800
            }}>
              {selectedDonorIds.length}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Donors Selected {filterGroup ? `(${filterGroup})` : ''}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenBulkEmailModal}
              style={{
                padding: '7px 16px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                backgroundColor: '#ef4444',
                borderColor: '#ef4444'
              }}
            >
              <Send size={13} />
              <span>Send Bulk Shortage Email</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedDonorIds([])}
              style={{ padding: '7px 12px', fontSize: '0.8rem' }}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* ── Bulk Shortage Email Modal ── */}
      {emailModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
          animation: 'fadeIn var(--transition-fast)'
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setEmailModalOpen(false); }}
        >
          <div className="dashboard-card animate-scale-up" style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '24px' }}>
            <button
              onClick={() => setEmailModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444, #e11d48)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}>
                <Send size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit' }}>
                  Emergency Shortage Appeal (Bulk Email)
                </h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                  Dispatch targeted blood donation appeal to {selectedDonorIds.length} volunteer donors
                </p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendBulkEmail(); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Target summary badge */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#ef4444" />
                    <strong style={{ fontSize: '0.82rem', color: '#b91c1c' }}>
                      Target Recipients: {selectedDonorIds.length} Active Donors
                    </strong>
                  </div>
                  {filterGroup && (
                    <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                      Blood Group: {filterGroup}
                    </span>
                  )}
                </div>

                {/* Recipient names preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '60px', overflowY: 'auto' }}>
                  {donors.filter(d => selectedDonorIds.includes(d._id)).slice(0, 8).map(d => (
                    <span key={d._id} style={{
                      fontSize: '0.68rem',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: 'rgba(255,255,255,0.7)',
                      color: 'var(--text-primary)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontWeight: 600
                    }}>
                      {d.name} ({d.bloodGroup} · {d.district})
                    </span>
                  ))}
                  {selectedDonorIds.length > 8 && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', alignSelf: 'center', fontWeight: 600 }}>
                      +{selectedDonorIds.length - 8} more donors
                    </span>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="form-control"
                  placeholder="e.g. [URGENT] Critical Blood Shortage Appeal - LifeFlow"
                  required
                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
                />
              </div>

              {/* Message Body */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Emergency Appeal Message Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmailMessage(generateEmailTemplate(filterGroup || 'Urgent Shortage', selectedDonorIds.length))}
                    style={{ fontSize: '0.68rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Reset Template
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="form-control"
                  required
                  style={{ fontSize: '0.78rem', lineHeight: 1.5, fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleOpenLocalEmail}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="Open default email client (Gmail / Outlook) with all recipient emails in BCC"
                >
                  <Mail size={13} />
                  <span>Open in Mail App (BCC)</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEmailModalOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sendingEmail}
                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <Send size={14} className={sendingEmail ? 'animate-spin' : ''} />
                    <span>{sendingEmail ? 'Dispatching...' : `Send to ${selectedDonorIds.length} Donors`}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donors;
