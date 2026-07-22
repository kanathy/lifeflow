import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import heroImage from '../components/login.png';

const Login = ({ login, user }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin@lifeflow.lk');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickUser, quickPass) => {
    setUsername(quickUser);
    setPassword(quickPass);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F1F5F9',
      padding: '24px',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Outer Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '980px',
        minHeight: '620px',
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.18), 0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        position: 'relative'
      }}>

        {/* --- LEFT FORM PANEL --- */}
        <div style={{
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
          backgroundColor: '#FFFFFF'
        }}>
          <div>
            {/* Top Back Arrow & Logo — back arrow left, logo centered */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  position: 'absolute',
                  left: 0,
                  background: 'none',
                  border: 'none',
                  color: '#991B1B',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowLeft size={22} color="#991B1B" />
              </button>

              {/* Logo Header — centered */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="34" height="38" viewBox="0 0 34 38" fill="none">
                  <path d="M17 0C17 0 34 16.5 34 25.5C34 30.196 30.196 34 25.5 34C22.25 34 19.45 32.17 18.06 29.5C17.65 28.71 16.35 28.71 15.94 29.5C14.55 32.17 11.75 34 8.5 34C3.804 34 0 30.196 0 25.5C0 16.5 17 0 17 0Z" fill="#991B1B" />
                  <path d="M17 14C17 14 23 20 23 24C23 27.31 20.31 30 17 30C13.69 30 11 27.31 11 24C11 20 17 14 17 14Z" fill="#FFFFFF" opacity="0.3" />
                  <path d="M17 20C15.5 18.5 13 18.5 13 21C13 23 17 25.5 17 25.5C17 25.5 21 23 21 21C21 18.5 18.5 18.5 17 20Z" fill="#FFFFFF" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', color: '#1F2937', lineHeight: 1.1 }}>
                    LifeFlow
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B' }}>
                    Blood Bank
                  </span>
                </div>
              </div>
            </div>

            {/* Welcome Text */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'Outfit', color: '#1F2937', margin: 0 }}>
                Welcome <span style={{ color: '#991B1B' }}>Back!</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '6px', margin: 0 }}>
                Glad to see you again<br />
                Login to access your account
              </p>
            </div>

            {/* Section Sub-header */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: '#1F2937',
                borderBottom: '3px solid #991B1B',
                paddingBottom: '4px',
                display: 'inline-block'
              }}>
                Sign In
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '16px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Username Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                  Username
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 42px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.85rem',
                      color: '#1F2937',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 42px 11px 42px',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.85rem',
                      color: '#1F2937',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setError('Password reset instructions sent to your registered email.')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#991B1B',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Log In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#8B0000',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(139, 0, 0, 0.3)',
                  transition: 'all 0.2s ease',
                  marginTop: '4px'
                }}
              >
                {loading ? 'Authenticating...' : 'Log In'}
              </button>
            </form>

            {/* OR Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              color: '#9CA3AF',
              fontSize: '0.78rem'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
              <span style={{ padding: '0 12px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            </div>

            {/* Sign in with Google Button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@lifeflow.lk', 'admin123')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* Google multicolored G icon */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Bottom Create Account Link */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#6B7280' }}>
              <span>Don’t have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/create-account')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#991B1B',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Create New Account →
              </button>
            </div>

          </div>

        </div>

        {/* --- RIGHT HERO PANEL WITH login.png IMAGE & DOUBLE-LAYER S-CURVE DIVIDER --- */}
        <div style={{
          position: 'relative',
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '40px 48px 48px 48px',
          overflow: 'hidden'
        }}>
          {/* Dark Crimson Gradient Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(60, 0, 0, 0.35) 0%, rgba(35, 0, 0, 0.92) 100%)',
            zIndex: 1
          }} />

          {/* Double-Layered S-Curve Fluid Divider SVG matching user screenshot */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-1px',
            bottom: 0,
            width: '110px',
            height: '100%',
            zIndex: 4,
            pointerEvents: 'none'
          }}>
            <svg width="110" height="100%" viewBox="0 0 110 620" preserveAspectRatio="none" fill="none">
              {/* Outer Layer: Deep Red Accent Wave Ribbon */}
              <path d="M 0,0 L 96,0 C 50,130 18,340 56,620 L 0,620 Z" fill="#991B1B" />
              
              {/* Middle Layer: 2px Thin White Separator Line */}
              <path d="M 0,0 L 92,0 C 46,130 14,340 52,620 L 0,620 Z" fill="#FFFFFF" />

              {/* Inner Layer: Solid White Left Panel Background */}
              <path d="M 0,0 L 80,0 C 34,130 2,340 40,620 L 0,620 Z" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Hero Content Overlay Text */}
          <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', color: '#FFFFFF' }}>
            <h3 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              fontFamily: 'Outfit',
              lineHeight: 1.2,
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              Donate Blood, <span style={{ color: '#F87171' }}>Save Lives.</span>
            </h3>

            {/* Red Accent Bar */}
            <div style={{
              width: '40px',
              height: '3px',
              backgroundColor: '#EF4444',
              margin: '12px auto 14px auto',
              borderRadius: '2px'
            }} />

            <p style={{
              fontSize: '0.82rem',
              color: '#F3F4F6',
              maxWidth: '300px',
              margin: '0 auto 28px auto',
              lineHeight: 1.5,
              opacity: 0.95
            }}>
              Together, we can create<br />
              a healthier and stronger community.
            </p>

            {/* 3 Feature Badges Row matching screenshot */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '8px'
            }}>
              {/* Badge 1: Safe Donation */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#E5E7EB' }}>Safe Donation</span>
              </div>

              {/* Badge 2: Save Lives */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#E5E7EB' }}>Save Lives</span>
              </div>

              {/* Badge 3: Trusted Care */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#E5E7EB' }}>Trusted Care</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
