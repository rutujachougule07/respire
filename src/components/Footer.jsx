import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUp, MapPin, Building2, ArrowRight, Lock, X, Eye, EyeOff, ShieldCheck, Mail, KeyRound, Phone, AlertCircle } from 'lucide-react';
import { LOGIN_ACCOUNTS } from './admin/initialData';
import { useAuth } from '../context/AuthContext';

export default function Footer({ onAdminLogin }) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 104;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoginError('');

    try {
      const res = await login(adminUser, adminPass);
      setShowAdminModal(false);
      setAdminUser('');
      setAdminPass('');
      if (onAdminLogin) {
        onAdminLogin(res.session);
      }
      navigate('/admin');
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowAdminModal(false);
    setLoginError('');
  };

  return (
    <>
      <footer
        style={{
          background: 'linear-gradient(145deg, #040404 0%, #0E1116 48%, #1C212A 100%)',
          color: '#FFFFFF',
          paddingTop: '72px',
          paddingBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Green Gradient Highlight Strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #007A31 0%, #00D256 50%, #007A31 100%)',
          }}
        />

        {/* Subtle Ambient Charcoal-Green Radial Sheen */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-80px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 184, 74, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '40px',
              marginBottom: '56px',
            }}
          >
            {/* Column 1: Brand & Official Logo */}
            <div style={{ maxWidth: '340px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
                <img
                  src="/logo_white_text_header.png"
                  alt="Respire Fitness - A Mahabal Group Venture"
                  style={{
                    height: '54px',
                    width: 'auto',
                    maxWidth: '195px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 10px rgba(0, 184, 74, 0.25))',
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
                  gap: '8px',
                  padding: '5px 12px',
                  backgroundColor: 'rgba(0, 184, 74, 0.14)',
                  border: '1px solid rgba(0, 184, 74, 0.35)',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#00D256',
                  letterSpacing: '0.07em',
                  marginBottom: '18px',
                }}
              >
                <Building2 size={14} />
                <span>A MAHABAL GROUP VENTURE</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#9CA3AF', lineHeight: 1.65 }}>
                Sangli's premier luxury gym and wellness sanctuary, located at R City Mall, Vishrambag. Elevating fitness through certified sports science and luxury recovery.
              </p>
            </div>

            {/* Column 2: Quick Navigation */}
            <div>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '20px',
                  borderLeft: '3px solid #00B84A',
                  paddingLeft: '10px',
                }}
              >
                Quick Navigation
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Home', path: '/' },
                  { label: 'About Us', path: '/about' },
                  { label: 'Our Services', path: '/services' },
                  { label: 'Membership Plans', path: '/membership' },
                  { label: 'Workout Programs', path: '/programs' },
                  { label: 'Contact Us', path: '/contact' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      style={{
                        fontSize: '0.88rem',
                        color: '#9CA3AF',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#00D256';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9CA3AF';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <span>›</span> {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/login"
                    style={{
                      fontSize: '0.88rem',
                      color: '#00D256',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span>›</span> Staff & Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Core Services */}
            <div>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '20px',
                  borderLeft: '3px solid #00B84A',
                  paddingLeft: '10px',
                }}
              >
                Our Services
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Personal Training',
                  'Massage',
                  'Steam Bath',
                  'Zumba',
                  'Yoga',
                  'Body Composition History',
                  'Fitness Progress Monitoring',
                ].map((srv, idx) => (
                  <li key={idx} style={{ fontSize: '0.88rem', color: '#D1D5DB', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00B84A' }} />
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Official Contact Address */}
            <div>
              <h4
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '20px',
                  borderLeft: '3px solid #00B84A',
                  paddingLeft: '10px',
                }}
              >
                Our Branches
              </h4>

              {/* Branch 1: Vishrambag */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <MapPin size={18} color="#00D256" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '3px' }}>
                      Respire Vishrambag Branch
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#D1D5DB', lineHeight: 1.5 }}>
                      7th Floor, R City Mall, Opp. Safa Bakery, Vishrambag, Sangli.
                    </div>
                  </div>
                </div>
                <a
                  href="tel:+917798001777"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    width: '100%',
                    color: '#00D256',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                  }}
                >
                  <Phone size={14} color="#00D256" />
                  <span>+91 7798001777</span>
                </a>
              </div>

              {/* Branch 2: Vijaynagar */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <MapPin size={18} color="#60A5FA" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '3px' }}>
                      Respire Vijaynagar Branch
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#D1D5DB', lineHeight: 1.5 }}>
                      3rd Floor, Krishna Heights, Opp. KFC, Sangli-Miraj Road, Vijaynagar, Sangli.
                    </div>
                  </div>
                </div>
                <a
                  href="tel:+919172848777"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    width: '100%',
                    color: '#00D256',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                  }}
                >
                  <Phone size={14} color="#00D256" />
                  <span>+91 9172848777</span>
                </a>
              </div>

              <button
                onClick={() => scrollTo('contact')}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', fontSize: '0.84rem' }}
              >
                <span>Join Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              fontSize: '0.84rem',
              color: '#9CA3AF',
            }}
          >
            <div>
              © {new Date().getFullYear()} <strong style={{ color: '#FFFFFF' }}>Respire Fitness</strong> – A Mahabal Group Venture. All rights reserved.
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px', paddingRight: '68px' }}>
              <span>Vishrambag & Vijaynagar, Sangli</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Sleek, Compact, Crystal-Clear Admin Login Modal */}
      {showAdminModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(10, 15, 24, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'adminBackdropFade 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '410px',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '22px',
              boxShadow: '0 25px 65px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(0, 184, 74, 0.18)',
              position: 'relative',
              animation: 'adminModalPop 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
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

            {/* Close Button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 3,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ECFDF3';
                e.currentTarget.style.borderColor = '#00B84A';
                e.currentTarget.style.color = '#008A38';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
              aria-label="Close Admin Login"
            >
              <X size={16} />
            </button>

            {/* Clean White Branded Header — Official Full-Color Logo Crystal Clear */}
            <div
              style={{
                padding: '24px 26px 14px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, #F4FBF7 0%, #FFFFFF 100%)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <img
                  src="/respire_logo_web.png"
                  alt="Respire Fitness"
                  style={{
                    height: '50px',
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/respire_logo_transparent.png';
                  }}
                />
              </div>

              <h3 style={{ fontSize: '1.32rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                Admin & Manager Login
              </h3>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#008A38',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                <ShieldCheck size={13} color="#00B84A" />
                <span>Auto-Routes to Your Dashboard</span>
              </div>
            </div>

            {/* Unified Single Login Form Body */}
            <div style={{ padding: '14px 24px 22px' }}>
              <form onSubmit={handleAdminLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                {/* Decoys */}
                <input type="text" name="decoy_email" tabIndex="-1" autoComplete="off" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />
                <input type="password" name="decoy_pass" tabIndex="-1" autoComplete="new-password" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />
                {loginError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#B91C1C',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '5px',
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail
                      size={16}
                      color={focusedField === 'user' ? '#00B84A' : '#94A3B8'}
                      style={{ position: 'absolute', left: '13px', pointerEvents: 'none', transition: 'color 0.2s' }}
                    />
                    <input
                      type="text"
                      name="respire_portal_email_desk"
                      autoComplete="off"
                      required
                      placeholder="admin@gmail.com / manager1 / manager2"
                      value={adminUser}
                      onChange={(e) => {
                        setAdminUser(e.target.value);
                        setLoginError('');
                      }}
                      onFocus={() => setFocusedField('user')}
                      onBlur={() => setFocusedField('')}
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        borderRadius: '10px',
                        border: focusedField === 'user' ? '1.5px solid #00B84A' : '1.5px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        outline: 'none',
                        boxShadow: focusedField === 'user' ? '0 0 0 3px rgba(0, 184, 74, 0.14)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '5px',
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <KeyRound
                      size={16}
                      color={focusedField === 'pass' ? '#00B84A' : '#94A3B8'}
                      style={{ position: 'absolute', left: '13px', pointerEvents: 'none', transition: 'color 0.2s' }}
                    />
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="respire_portal_pass_desk"
                      autoComplete="new-password"
                      required
                      placeholder="Enter your password"
                      value={adminPass}
                      onChange={(e) => {
                        setAdminPass(e.target.value);
                        setLoginError('');
                      }}
                      onFocus={() => setFocusedField('pass')}
                      onBlur={() => setFocusedField('')}
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 38px',
                        borderRadius: '10px',
                        border: focusedField === 'pass' ? '1.5px solid #00B84A' : '1.5px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        outline: 'none',
                        boxShadow: focusedField === 'pass' ? '0 0 0 3px rgba(0, 184, 74, 0.14)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: 'absolute',
                        right: '11px',
                        color: showPass ? '#00B84A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                      }}
                      aria-label="Toggle Password Visibility"
                    >
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#00B84A', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                    <span>Keep me signed in</span>
                  </label>
                  <span style={{ color: '#172C83', fontWeight: 700, fontSize: '0.74rem' }}>
                    1 Unified Portal
                  </span>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: '11px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    marginTop: '4px',
                  }}
                >
                  <Lock size={15} />
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={15} />
                </button>

                <div
                  style={{
                    textAlign: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid #F1F5F9',
                    fontSize: '0.73rem',
                    color: '#64748B',
                    fontWeight: 600,
                  }}
                >
                  Respire Fitness • A Mahabal Group Venture
                </div>
              </form>
            </div>
          </div>

          <style>{`
            @keyframes adminBackdropFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes adminModalPop {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
