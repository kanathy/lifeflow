import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Mail, Monitor, Save, CloudLightning, ShieldAlert, Check } from 'lucide-react';

const Settings = ({ user }) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>System Settings</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure global system settings and integrations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }} className="flex-column-responsive">
        {/* Left Side: Sub Navigation tabs */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', height: 'fit-content' }}>
          {[
            { id: 'General', label: 'General Settings', icon: SettingsIcon },
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
                This parameters panel ({activeSubTab}) is pre-configured for sandbox mode. Toggle General Settings tab to edit active global values.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
