import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout shell
import DashboardLayout from './layouts/DashboardLayout';

// Page components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BloodInventory from './pages/BloodInventory';
import Donors from './pages/Donors';
import Hospitals from './pages/Hospitals';
import EmergencyRequests from './pages/EmergencyRequests';
import DistrictMonitoring from './pages/DistrictMonitoring';
import Prediction from './pages/Prediction';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import UsersRoles from './pages/UsersRoles';
import Settings from './pages/Settings';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lifeflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lifeflow_theme') || 'light';
  });

  // Apply dark mode theme variable directly to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lifeflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('lifeflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lifeflow_user');
  };

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={<Login login={login} user={user} />}
        />

        {/* Private Shell Routes */}
        <Route
          path="/*"
          element={
            user ? (
              <DashboardLayout
                theme={theme}
                toggleTheme={toggleTheme}
                user={user}
                logout={logout}
              >
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={user} />} />
                  <Route path="/inventory" element={<BloodInventory user={user} />} />
                  <Route path="/donors" element={<Donors user={user} />} />
                  <Route path="/hospitals" element={<Hospitals user={user} />} />
                  <Route path="/requests" element={<EmergencyRequests user={user} />} />
                  <Route path="/monitoring" element={<DistrictMonitoring user={user} />} />
                  <Route path="/prediction" element={<Prediction user={user} />} />
                  <Route path="/notifications" element={<Notifications user={user} />} />
                  <Route path="/reports" element={<Reports user={user} />} />
                  <Route path="/users" element={<UsersRoles user={user} />} />
                  <Route path="/settings" element={<Settings user={user} logout={logout} />} />
                  
                  {/* Default dashboard redirect */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
