import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Briefcase, Phone, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import heroImage from '../components/createaccount.png';

const SRI_LANKA_DISTRICTS = [
  'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha',
  'Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala',
  'Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa',
  'Puttalam','Ratnapura','Trincomalee','Vavuniya'
];

const SECTOR_TYPES = ['Government', 'Private', 'Semi-Government', 'Teaching Hospital', 'Base Hospital'];

const WaveDivider = () => (
  <div style={{
    position: 'absolute', top: 0, left: '-1px', bottom: 0,
    width: '110px', height: '100%', zIndex: 4, pointerEvents: 'none'
  }}>
    <svg width="110" height="100%" viewBox="0 0 110 620" preserveAspectRatio="none" fill="none">
      <path d="M 0,0 L 96,0 C 50,130 18,340 56,620 L 0,620 Z" fill="#991B1B" />
      <path d="M 0,0 L 92,0 C 46,130 14,340 52,620 L 0,620 Z" fill="#FFFFFF" />
      <path d="M 0,0 L 80,0 C 34,130 2,340 40,620 L 0,620 Z" fill="#FFFFFF" />
    </svg>
  </div>
);

const LogoHeader = ({ onBack }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
    <button
      type="button"
      onClick={onBack}
      style={{
        position: 'absolute', left: 0,
        background: 'none', border: 'none', color: '#991B1B',
        cursor: 'pointer', padding: '6px',
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '0.82rem', fontWeight: 600
      }}
    >
      <ArrowLeft size={18} color="#991B1B" />
      <span>Back</span>
    </button>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="32" height="36" viewBox="0 0 34 38" fill="none">
        <path d="M17 0C17 0 34 16.5 34 25.5C34 30.196 30.196 34 25.5 34C22.25 34 19.45 32.17 18.06 29.5C17.65 28.71 16.35 28.71 15.94 29.5C14.55 32.17 11.75 34 8.5 34C3.804 34 0 30.196 0 25.5C0 16.5 17 0 17 0Z" fill="#991B1B" />
        <path d="M17 14C17 14 23 20 23 24C23 27.31 20.31 30 17 30C13.69 30 11 27.31 11 24C11 20 17 14 17 14Z" fill="#FFFFFF" opacity="0.3" />
        <path d="M17 20C15.5 18.5 13 18.5 13 21C13 23 17 25.5 17 25.5C17 25.5 21 23 21 21C21 18.5 18.5 18.5 17 20Z" fill="#FFFFFF" />
      </svg>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#1F2937', lineHeight: 1.1 }}>LifeFlow</div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991B1B' }}>Blood Bank</div>
      </div>
    </div>
  </div>
);

const StepProgress = ({ step }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
      Step <strong style={{ color: '#991B1B' }}>{step}</strong> of 2
    </span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '28px', height: '8px', borderRadius: '4px', backgroundColor: '#991B1B', transition: 'all 0.3s' }} />
      <div style={{ width: '28px', height: '8px', borderRadius: '4px', backgroundColor: step >= 2 ? '#991B1B' : '#E5E7EB', transition: 'all 0.3s' }} />
    </div>
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '10px 10px 10px 36px',
  border: '1.5px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '0.88rem',
  color: '#1F2937',
  background: '#FAFAFA',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s'
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer'
};

const CreateAccount = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Step 1 fields
  const [hospitalName, setHospitalName] = useState('');
  const [district, setDistrict] = useState('');
  const [sectorType, setSectorType] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Step 2 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleStep1Continue = (e) => {
    e.preventDefault();
    setError('');
    if (!hospitalName.trim()) return setError('Hospital name is required.');
    if (!district) return setError('Please select a district.');
    if (!sectorType) return setError('Please select a sector type.');
    if (!contactNumber.trim()) return setError('Contact number is required.');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Email address is required.');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters.');
    if (!agreed) return setError('Please agree to the Terms & Conditions.');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register-hospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalName, district, sectorType, contactNumber, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const HeroPanel = () => (
    <div style={{
      position: 'relative',
      backgroundImage: `url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '40px 48px 48px',
      overflow: 'hidden'
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(60,0,0,0.3) 0%, rgba(35,0,0,0.9) 100%)',
        zIndex: 1
      }} />
      <WaveDivider />
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', color: '#FFF' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1.2, margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Every Drop Counts.<br />Every <span style={{ color: '#F87171' }}>Life Matters.</span>
        </h3>
        <div style={{ width: '40px', height: '3px', backgroundColor: '#EF4444', margin: '12px auto 14px', borderRadius: '2px' }} />
        <p style={{ fontSize: '0.82rem', color: '#F3F4F6', maxWidth: '300px', margin: '0 auto 28px', lineHeight: 1.5, opacity: 0.95 }}>
          Together, we can create<br />a healthier and stronger community.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
          {[
            { icon: '❤️', label: 'Safe Donation' },
            { icon: '💧', label: 'Save Lives' },
            { icon: '🛡️', label: 'Trusted Care' }
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem'
              }}>{icon}</div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#E5E7EB' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F0F0 0%, #FDF2F2 50%, #F0E8E8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, Outfit, sans-serif'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Success overlay */}
      {success && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '40px 48px',
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', color: '#1F2937', margin: '0 0 8px' }}>
              Account Created!
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.88rem', margin: '0 0 20px' }}>
              Your hospital account has been registered.<br />Redirecting to login…
            </p>
            <div style={{
              width: '100%', height: '4px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', background: '#991B1B', borderRadius: '2px',
                animation: 'progressBar 3s linear forwards'
              }} />
            </div>
          </div>
        </div>
      )}

      <div style={{
        width: '100%',
        maxWidth: '880px',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(139,0,0,0.18)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '520px'
      }}>

        {/* LEFT FORM PANEL */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '32px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <LogoHeader onBack={() => step === 2 ? setStep(1) : navigate('/login')} />

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1Continue}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: '#1F2937', margin: 0 }}>
                  Create <span style={{ color: '#991B1B' }}>New</span> Account
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: '6px 0 0' }}>
                  Register your hospital to continue
                </p>
              </div>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem', color: '#DC2626' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Hospital Name */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Hospital Name</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Enter hospital name"
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* District */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>District</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
                  <select value={district} onChange={e => setDistrict(e.target.value)} style={selectStyle}>
                    <option value="">Select district</option>
                    {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>

              {/* Sector Type */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Sector Type</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
                  <select value={sectorType} onChange={e => setSectorType(e.target.value)} style={selectStyle}>
                    <option value="">Select sector type</option>
                    {SECTOR_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>

              {/* Contact Number */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Contact Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="tel"
                    placeholder="Enter contact number"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '12px',
                  background: 'linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)',
                  color: '#FFFFFF', border: 'none', borderRadius: '10px',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 16px rgba(153,27,27,0.4)',
                  fontFamily: 'Outfit, sans-serif'
                }}
              >
                Continue →
              </button>

              <StepProgress step={1} />
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: '#1F2937', margin: 0 }}>
                  Create <span style={{ color: '#991B1B' }}>Your</span> Account
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: '6px 0 0' }}>
                  Set your login details to access your account
                </p>
              </div>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem', color: '#DC2626' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#991B1B', cursor: 'pointer' }}
                />
                <label htmlFor="terms" style={{ fontSize: '0.78rem', color: '#6B7280', cursor: 'pointer' }}>
                  I agree to the{' '}
                  <span style={{ color: '#991B1B', fontWeight: 600 }}>Terms &amp; Conditions</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px',
                  background: loading ? '#B91C1C99' : 'linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)',
                  color: '#FFFFFF', border: 'none', borderRadius: '10px',
                  fontSize: '0.9rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 16px rgba(153,27,27,0.4)',
                  fontFamily: 'Outfit, sans-serif'
                }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                    Creating Account…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create Account
                  </>
                )}
              </button>

              <StepProgress step={2} />
            </form>
          )}
        </div>

        {/* RIGHT HERO PANEL */}
        <HeroPanel />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progressBar { from { width: 0% } to { width: 100% } }
        input:focus, select:focus { border-color: #991B1B !important; background: #FFF !important; }
      `}</style>
    </div>
  );
};

export default CreateAccount;
