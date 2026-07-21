import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Mail, Monitor, Save, CloudLightning, ShieldAlert, Check, User, LogOut, Key } from 'lucide-react';

const Settings = ({ user, logout }) => {
  const [activeSubTab, setActiveSubTab] = useState('General');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    systemName: '',
    organization: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });

  useEffect(() => {
    fetch('/api/settings', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setForm({
          systemName: data.systemName || '',
          organization: data.organization || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        setSaving(false);
        setSuccess(true);
        // auto dismiss success
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch(err => {
        console.error(err);
        setSaving(false);
      });
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      if (logout) logout();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>System & User Settings</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure global system settings, profile parameters, and session management</p>
        </div>
        <button 
          onClick={handleLogoutClick}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e11d48', color: '#e11d48', fontWeight: 700 }}
        >
          <LogOut size={16} />
          <span>Logout System</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }} className="flex-column-responsive">
        {/* Left Side: Sub Navigation tabs */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', height: 'fit-content' }}>
          {[
            { id: 'General', label: 'General Settings', icon: SettingsIcon },
            { id: 'Account', label: 'User Account & Logout', icon: User },
            { id: 'Notifications', label: 'Notification Settings', icon: Bell },
            { id: 'Email', label: 'Email Integrations', icon: Mail },
            { id: 'System', label: 'System Properties', icon: Monitor },
            { id: 'Backup', label: 'Backup & Restore', icon: CloudLightning }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: isActive ? 'var(--color-primary)' : 'var(--text-sidebar)',
                  backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                  textAlign: 'left'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '10px', paddingTop: '10px' }}>
            <button
              onClick={handleLogoutClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#e11d48',
                backgroundColor: 'rgba(225, 29, 72, 0.08)',
                textAlign: 'left'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Side: Tab Contents Panel */}
        <div className="dashboard-card" style={{ padding: '28px' }}>
          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-success-light)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              animation: 'fadeIn var(--transition-fast)'
            }}>
              <Check size={16} />
              <span>Configurations saved successfully! Changes applied globally.</span>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading settings profile...</div>
          ) : activeSubTab === 'General' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
                General System Customizations
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>System Platform Title</label>
                  <input
                    type="text"
                    value={form.systemName}
                    onChange={(e) => setForm({ ...form, systemName: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Governing Organization</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Support Contact Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Emergency Support Hotlines</label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Headquarters Postal Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="form-control"
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ width: 'fit-content', alignSelf: 'end', marginTop: '10px' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving changes...' : 'Save Settings Changes'}</span>
              </button>
            </form>
          ) : activeSubTab === 'Account' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Active Session & Account Details
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Admin'}`}
                  alt="avatar"
                  style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{user?.name || 'User Profile'}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email: {user?.email || 'N/A'}</p>
                  <div style={{ marginTop: '6px' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      Role: {user?.role || 'Staff'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LogOut size={18} />
                  <span>Session Control</span>
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Logging out will safely end your active session on this device. You will need to enter your password to sign back in.
                </p>
                <button
                  onClick={handleLogoutClick}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#e11d48', borderColor: '#e11d48', width: 'fit-content' }}
                >
                  <LogOut size={16} />
                  <span>Logout Account Now</span>
                </button>
              </div>
            </div>
          ) : (
            // Placeholder integrations panel
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center',
              gap: '12px'
            }}>
              <ShieldAlert size={40} color="var(--text-light)" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Sandbox Mode Integration</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '380px' }}>
                This parameters panel ({activeSubTab}) is pre-configured for sandbox mode. Toggle General Settings or User Account tab to edit active global values.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

