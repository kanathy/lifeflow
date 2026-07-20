import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Calendar, Check, Volume2, Info, X } from 'lucide-react';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Category tab filter
  const [activeTab, setActiveTab] = useState('All');
  
  // Announcement Modal form
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    message: '',
    type: 'System'
  });

  const fetchNotifications = () => {
    setLoading(true);
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setFilteredNotifications(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Handle activeTab local filters
  useEffect(() => {
    let result = notifications;

    if (activeTab === 'Unread') {
      result = result.filter(n => n.status === 'Unread');
    } else if (activeTab === 'Alerts') {
      result = result.filter(n => n.type === 'Alert');
    } else if (activeTab === 'Reminders') {
      result = result.filter(n => n.type === 'Reminder');
    } else if (activeTab === 'System') {
      result = result.filter(n => n.type === 'System');
    }

    setFilteredNotifications(result);
  }, [activeTab, notifications]);

  const handleMarkRead = (id) => {
    fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(() => fetchNotifications())
      .catch(err => console.error(err));
  };

  const handleMarkAllRead = () => {
    fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(() => fetchNotifications())
      .catch(err => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        setModalOpen(false);
        fetchNotifications();
      })
      .catch(err => console.error(err));
  };

  const getIcon = (type) => {
    if (type === 'Alert') return <AlertTriangle size={18} color="var(--color-danger)" />;
    if (type === 'Reminder') return <Calendar size={18} color="var(--color-warning)" />;
    return <Info size={18} color="var(--color-info)" />;
  };

  const unreadCount = notifications.filter(n => n.status === 'Unread').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>Notifications</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage administrative system broadcasts and alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={handleMarkAllRead}>
              <Check size={16} />
              <span>Mark all as read</span>
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Volume2 size={16} />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        gap: '24px',
        paddingBottom: '2px'
      }}>
        {['All', 'Unread', 'Alerts', 'Reminders', 'System'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                paddingBottom: '10px',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab} {tab === 'Unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div className="dashboard-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading alerts...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No notifications found.</div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item._id}
              className="dashboard-card animate-fade-in"
              style={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'start',
                gap: '16px',
                borderLeft: `4px solid ${item.status === 'Unread' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                backgroundColor: item.status === 'Unread' ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                opacity: item.status === 'Read' ? 0.75 : 1
              }}
            >
              <div style={{
                backgroundColor: item.type === 'Alert' ? 'var(--color-danger-light)' : item.type === 'Reminder' ? 'var(--color-warning-light)' : 'var(--color-info-light)',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px'
              }}>
                {getIcon(item.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }} className="flex-between">
                  <span className={`badge badge-${item.type === 'Alert' ? 'danger' : item.type === 'Reminder' ? 'warning' : 'info'}`} style={{ fontSize: '0.65rem' }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(item.dateTime).toLocaleDateString('en-GB')} {new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: item.status === 'Unread' ? 600 : 400 }}>
                  {item.message}
                </p>
              </div>

              {item.status === 'Unread' && (
                <button
                  onClick={() => handleMarkRead(item._id)}
                  style={{
                    padding: '6px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--color-primary)',
                    alignSelf: 'center'
                  }}
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Manual Broadcast modal */}
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
              Broadcast Alert Announcement
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Alert Category</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="form-control"
                >
                  <option value="System">System info</option>
                  <option value="Alert">Alert (Urgent)</option>
                  <option value="Reminder">Reminder</option>
                </select>
              </div>

              <div className="form-group">
                <label>Broadcast Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="form-control"
                  rows={4}
                  placeholder="Type the message to display on dashboards..."
                  required
                />
              </div>

              <div className="flex-between" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
