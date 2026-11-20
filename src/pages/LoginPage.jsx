import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // Ensure fields are completely empty on mount, resisting aggressive browser autofill
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    const t = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 150);
    return () => clearTimeout(t);
  }, []);

  // If already authenticated, redirect to /admin
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0F18',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        color: '#0F172A',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image Layer — Clear, Bright & Fully Visible */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/login_bg_hd.jpg?v=2')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      {/* Subtle Transparent Vignette Overlay — Keeps Image 100% Clearly Visible */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.45) 100%)',
          zIndex: 1,
        }}
      />

      {/* Return to Home Link */}
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '14px', position: 'relative', zIndex: 2 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '7px 16px',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00D256';
            e.currentTarget.style.borderColor = 'rgba(0, 210, 86, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Respire Fitness Home</span>
        </Link>
      </div>

      {/* Main Luxury White Login Card — Exact Crisp Styling from Yesterday */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 184, 74, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top Vibrant Green Gradient Accent Strip */}
        <div
          style={{
            height: '6px',
            width: '100%',
            background: 'linear-gradient(90deg, #007A31 0%, #00D256 50%, #172C83 100%)',
          }}
        />

        {/* Clean Branded Header */}
        <div
          style={{
            padding: '26px 28px 16px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #F4FBF7 0%, #FFFFFF 100%)',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          {/* Official Full-Color Logo — Pin Sharp & Completely Unclipped */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <img
              src="/respire_logo_web.png"
              alt="Respire Fitness - A Part of Mahabal Group"
              style={{
                height: '52px',
                width: 'auto',
                maxWidth: '220px',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/respire_logo_transparent.png';
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: '#ECFDF3',
              border: '1px solid rgba(0, 184, 74, 0.3)',
              color: '#008A38',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
            }}
          >
            <ShieldCheck size={14} color="#00B84A" />
            <span>Staff & Admin Portal</span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>
            Management Sign In
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
            Unified Management Portal for Sangli Hubs
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '22px 28px 28px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                padding: '12px 14px',
                borderRadius: '12px',
                color: '#B91C1C',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '18px',
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Decoy hidden inputs to divert aggressive browser password autofill */}
            <input
              type="text"
              name="fake_autofill_email"
              tabIndex="-1"
              autoComplete="off"
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: 'none' }}
            />
            <input
              type="password"
              name="fake_autofill_password"
              tabIndex="-1"
              autoComplete="new-password"
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: 'none' }}
            />

            {/* Email Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#334155',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Email Address
              </label>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Mail
                  size={17}
                  color={focusedField === 'email' ? '#00B84A' : '#94A3B8'}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    pointerEvents: 'none',
                    transition: 'color 0.2s',
                  }}
                />
                <input
                  type="text"
                  name="respire_mgmt_usr"
                  id="respire_mgmt_usr"
                  autoComplete="off"
                  readOnly={!isEditing}
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onFocus={() => {
                    setIsEditing(true);
                    setFocusedField('email');
                  }}
                  onMouseDown={() => setIsEditing(true)}
                  onTouchStart={() => setIsEditing(true)}
                  onBlur={() => setFocusedField('')}
                  placeholder="admin@gmail.com / manager1 / manager2"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: focusedField === 'email' ? '1.5px solid #00B84A' : '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    outline: 'none',
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(0, 184, 74, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#334155',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Password
              </label>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <KeyRound
                  size={17}
                  color={focusedField === 'password' ? '#00B84A' : '#94A3B8'}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    pointerEvents: 'none',
                    transition: 'color 0.2s',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="respire_mgmt_pwd"
                  id="respire_mgmt_pwd"
                  autoComplete="new-password"
                  readOnly={!isEditing}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onFocus={() => {
                    setIsEditing(true);
                    setFocusedField('password');
                  }}
                  onMouseDown={() => setIsEditing(true)}
                  onTouchStart={() => setIsEditing(true)}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 42px',
                    borderRadius: '12px',
                    border: focusedField === 'password' ? '1.5px solid #00B84A' : '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    outline: 'none',
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(0, 184, 74, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: showPassword ? '#00B84A' : '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#00B84A', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span>Keep me signed in</span>
              </label>
              <span style={{ color: '#008A38', fontWeight: 800, fontSize: '0.74rem' }}>
                Instant Access
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.96rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(0, 184, 74, 0.35)',
                marginTop: '4px',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isSubmitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Authorized Roles Badges */}
            <div
              style={{
                marginTop: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                }}
              >
                Authorized Portal Accounts
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@gmail.com');
                    setError('');
                  }}
                  style={{
                    border: '1px solid rgba(0, 184, 74, 0.3)',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Admin (All Branches)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('manager1@gmail.com');
                    setError('');
                  }}
                  style={{
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Manager 1 (Vishrambag)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('manager2@gmail.com');
                    setError('');
                  }}
                  style={{
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Manager 2 (Vijaynagar)
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Override browser autofill blue background */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
          -webkit-text-fill-color: #0F172A !important;
          transition: background-color 50000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
