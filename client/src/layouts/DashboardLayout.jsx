import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplet,
  Users,
  Building2,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Bell,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar,
  Filter
} from 'lucide-react';

const DashboardLayout = ({ children, theme, toggleTheme, user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reportsExpanded, setReportsExpanded] = useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Blood Inventory', path: '/inventory', icon: Droplet },
    { name: 'Donors', path: '/donors', icon: Users },
    { name: 'Hospitals', path: '/hospitals', icon: Building2 },
    { name: 'Emergency Requests', path: '/requests', icon: AlertTriangle, badge: true },
    { name: 'District Monitoring', path: '/monitoring', icon: MapPin },
    { name: 'Prediction', path: '/prediction', icon: TrendingUp },
    { name: 'Notifications', path: '/notifications', icon: Bell, badgeCount: true },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: FileText,
      hasSubmenu: true,
      subItems: [
        { name: 'Incident Reports', path: '/reports?tab=incident' },
        { name: 'Inventory Reports', path: '/reports?tab=inventory' },
        { name: 'Donation Reports', path: '/reports?tab=donation' },
        { name: 'Request Reports', path: '/reports?tab=request' },
        { name: 'Usage Reports', path: '/reports?tab=usage' },
        { name: 'Summary Reports', path: '/reports?tab=summary' }
      ]
    },
    { name: 'Users & Roles', path: '/users', icon: UserCheck, adminOnly: true },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  // Fetch notifications for topbar dropdown
  useEffect(() => {
    if (user) {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data.slice(0, 5));
            setUnreadCount(data.filter(n => n.status === 'Unread').length);
          }
        })
        .catch(err => console.error('Failed to load notifications:', err));
    }
  }, [user, location.pathname]);

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      setReportsExpanded(!reportsExpanded);
      navigate(item.path);
    } else {
      navigate(item.path);
      setSidebarOpen(false);
    }
  };

  const handleMarkAllRead = () => {
    fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' })));
        setUnreadCount(0);
      })
      .catch(err => console.error(err));
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Filter menu items by user role (adminOnly check)
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'Administrator') return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 95,
            display: 'none'
          }}
          className="sidebar-overlay-responsive"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transition: 'transform var(--transition-normal)'
        }}
        className={`sidebar-responsive ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplet size={24} color="var(--color-primary)" fill="var(--color-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-primary)' }}>LifeFlow</h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Blood Bank Management System</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'none', marginLeft: 'auto', color: 'var(--text-primary)' }}
            className="sidebar-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredMenuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <React.Fragment key={idx}>
                <button
                  onClick={() => handleMenuClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                    backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                    textAlign: 'left'
                  }}
                  className={`sidebar-link-hover ${isActive ? 'active-link' : ''}`}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  {item.badgeCount && unreadCount > 0 && (
                    <span style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: '50px',
                      fontWeight: 'bold'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    reportsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                  {item.badge && !item.hasSubmenu && (
                    <span style={{
                      backgroundColor: 'var(--color-warning)',
                      color: 'white',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%'
                    }} />
                  )}
                </button>

                {/* Render Accordion Submenu */}
                {item.hasSubmenu && reportsExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '32px', gap: '2px', marginTop: '2px', marginBottom: '4px' }}>
                    {item.subItems.map((sub, sIdx) => {
                      const isSubActive = sIdx === 0; // Default active on Incident Reports
                      return (
                        <button
                          key={sIdx}
                          onClick={() => {
                            navigate(sub.path);
                            setSidebarOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: isSubActive ? 700 : 500,
                            color: isSubActive ? '#e11d48' : 'var(--text-secondary)',
                            backgroundColor: isSubActive ? 'rgba(225, 29, 72, 0.08)' : 'transparent',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '1rem', lineHeight: '0.5' }}>•</span>
                          <span>{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-sidebar)',
              marginTop: 'auto',
              textAlign: 'left'
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>

        {/* Heartbeat indicator Banner */}
        <div style={{ padding: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #c51e3a, #e11d48)',
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Droplet size={32} color="#ffffff" fill="#ffffff" style={{ animation: 'pulse 2s infinite', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '2px 0 6px 0' }}>Every Drop Counts</h4>
            <p style={{ fontSize: '0.65rem', opacity: 0.9 }}>Donate Blood, Save Lives</p>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div
        style={{
          flex: 1,
          paddingLeft: '260px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)'
        }}
        className="main-panel-responsive"
      >
        {/* Header */}
        <header
          style={{
            height: '70px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
          className="flex-between"
        >
          {/* Left info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
              className="menu-toggle-btn"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'capitalize' }}>
                {location.pathname.substring(1).replace('-', ' ') || 'Dashboard'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Welcome back, <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{user?.name || 'User'}!</span>
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="header-search">
              <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50px',
                  padding: '8px 16px 8px 36px',
                  fontSize: '0.8rem',
                  width: '220px',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                color: 'var(--text-sidebar)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Drawer trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotiOpen(!notiOpen)}
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-sidebar)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    fontSize: '0.6rem',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Mini notifications panel */}
              {notiOpen && (
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '16px',
                  zIndex: 110,
                  animation: 'scaleUp var(--transition-fast)'
                }}>
                  <div className="flex-between" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Recent Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>No notifications</p>
                    ) : (
                      notifications.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                            <span className={`badge badge-${item.type === 'Alert' ? 'danger' : item.type === 'Reminder' ? 'warning' : 'info'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                              {item.type}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>
                              {new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: item.status === 'Unread' ? 'bold' : 'normal' }}>
                            {item.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setNotiOpen(false);
                      navigate('/notifications');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      marginTop: '12px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-color)'
                    }}
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Admin'}`}
                alt="profile"
                style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)' }}
              />
              <div className="profile-details">
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name || 'Staff User'}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{user?.role || 'Viewer'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Pane */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            height: '50px',
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}
          className="flex-between"
        >
          <div>© {new Date().getFullYear()} LifeFlow Blood Bank Management System. All rights reserved.</div>
          <div>Last updated: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </footer>
      </div>

      {/* Embedded CSS for responsive overrides */}
      <style>{`
        .sidebar-responsive {
          transform: translateX(0);
        }
        .sidebar-link-hover {
          transition: all var(--transition-fast) !important;
        }
        .sidebar-link-hover:hover {
          color: var(--color-primary) !important;
          background-color: var(--color-primary-light) !important;
          transform: translateX(4px);
        }
        .sidebar-link-hover.active-link:hover {
          color: var(--text-sidebar-active) !important;
          background-color: var(--bg-sidebar-active) !important;
          transform: none;
        }
        @media (max-width: 992px) {
          .sidebar-responsive {
            transform: translateX(-100%) !important;
            box-shadow: var(--shadow-lg);
          }
          .sidebar-responsive.sidebar-open {
            transform: translateX(0) !important;
          }
          .sidebar-close-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: 50%;
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
          }
          .sidebar-overlay-responsive {
            display: block !important;
          }
          .main-panel-responsive {
            padding-left: 0 !important;
          }
          .menu-toggle-btn {
            display: flex !important;
          }
          .profile-details, .header-search {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
