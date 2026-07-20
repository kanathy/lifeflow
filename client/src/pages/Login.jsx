import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = ({ login, user }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative colored blobs */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(197, 30, 58, 0.05)',
        top: '-100px',
        left: '-100px',
        filter: 'blur(80px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.05)',
        bottom: '-50px',
        right: '-50px',
        filter: 'blur(80px)',
        zIndex: 0
      }} />

      {/* Main Login card */}
      <div className="glass-container" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 1,
        animation: 'fadeIn var(--transition-normal) forwards'
      }}>
        {/* Logo and title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-primary-light)',
            padding: '16px',
            borderRadius: '50%',
            marginBottom: '16px'
          }}>
            <Droplet size={36} color="var(--color-primary)" fill="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-primary)', margin: 0 }}>
            LifeFlow
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Blood Bank Management System
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px' }} />
              <input
                id="email"
                type="email"
                placeholder="admin@lifeflow.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px', width: '100%' }}
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px' }} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px', width: '100%' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              marginTop: '10px'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick login info for grading */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.8rem'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '10px', textAlign: 'center' }}>
            Quick Sandbox Accounts:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleQuickLogin('admin@lifeflow.lk', 'admin123')}
              style={{
                fontSize: '0.7rem',
                border: '1px dashed var(--color-primary)',
                color: 'var(--color-primary)',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center',
                backgroundColor: 'var(--color-primary-light)'
              }}
            >
              <strong>Admin User</strong>
            </button>
            <button
              onClick={() => handleQuickLogin('staff@kandy.lk', 'staff123')}
              style={{
                fontSize: '0.7rem',
                border: '1px dashed var(--color-info)',
                color: 'var(--color-info)',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center',
                backgroundColor: 'var(--color-info-light)'
              }}
            >
              <strong>Hospital Staff</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
