import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, MapPin, Phone } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      if (isHomePage) {
        if (window.scrollY < 120) {
          setActiveSection('hero');
          return;
        }

        const sections = ['contact', 'programs', 'membership', 'services', 'about', 'hero'];
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            // Active if top of section is within focal viewing area
            if (rect.top <= 220 && rect.bottom > 120) {
              setActiveSection(section);
              return;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial active section
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const handleNavClick = (e, link) => {
    setMobileMenuOpen(false);

    if (isHomePage && link.id) {
      e.preventDefault();
      const element = document.getElementById(link.id);
      if (element) {
        const navHeight = 104;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    } else {
      // If on another page, navigate directly to route
      navigate(link.path);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/', id: 'hero' },
    { label: 'About', path: '/about', id: 'about' },
    { label: 'Services', path: '/services', id: 'services' },
    { label: 'Membership', path: '/membership', id: 'membership' },
    { label: 'Programs', path: '/programs', id: 'programs' },
    { label: 'Contact', path: '/contact', id: 'contact' },
  ];

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease',
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: isScrolled ? '1px solid rgba(0, 184, 74, 0.25)' : '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: isScrolled ? '0 10px 30px rgba(15, 23, 42, 0.08)' : '0 2px 10px rgba(15, 23, 42, 0.03)',
        }}
      >
        {/* Top Black Marquee Banner - Matching Footer Luxury Dark Theme */}
        <div
          className="topbar-marquee-wrapper"
          style={{
            background: 'linear-gradient(90deg, #040404 0%, #0E1116 50%, #040404 100%)',
            borderBottom: '1px solid rgba(0, 184, 74, 0.25)',
            padding: '7px 0',
            fontSize: '0.78rem',
            color: '#FFFFFF',
          }}
        >
          <div className="topbar-marquee-track">
            {[0, 1].map((dupIdx) => (
              <div
                key={dupIdx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '32px',
                  paddingRight: '32px',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, letterSpacing: '0.07em', color: '#FFFFFF' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#00D256',
                      boxShadow: '0 0 8px rgba(0,210,86,0.85)',
                    }}
                  />
                  A MAHABAL GROUP VENTURE
                </span>
                <span style={{ opacity: 0.35 }}>|</span>
                <span style={{ fontWeight: 800, color: '#F1F5F9' }}>Vishrambag Branch:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#CBD5E1' }}>
                  <MapPin size={13} color="#38BDF8" />
                  7th Floor, R City Mall, Opp. Safa Bakery, Sangli
                </span>
                <a href="tel:+917798001777" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: '#FFFFFF' }}>
                  <Phone size={13} color="#FFFFFF" />
                  7798001777
                </a>
                <span style={{ opacity: 0.35 }}>•</span>
                <span style={{ fontWeight: 800, color: '#F1F5F9' }}>Vijaynagar Branch:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#CBD5E1' }}>
                  <MapPin size={13} color="#38BDF8" />
                  3rd Floor, Krishna Heights, Opp. KFC, Sangli-Miraj Road
                </span>
                <a href="tel:+919172848777" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: '#FFFFFF' }}>
                  <Phone size={13} color="#FFFFFF" />
                  9172848777
                </a>
                <span style={{ opacity: 0.35 }}>•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main White Navbar */}
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '76px',
          }}
        >
          {/* Official Full-Color Logo */}
          <Link
            to="/"
            onClick={() => {
              if (isHomePage) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <img
              src="/respire_logo_web.png"
              alt="Respire Fitness - A Mahabal Group Venture"
              style={{
                height: '52px',
                width: 'auto',
                maxWidth: '185px',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/respire_logo_transparent.png';
              }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '4px',
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isCurrentRoute = isHomePage
                ? activeSection === link.id
                : location.pathname === link.path;

              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: isCurrentRoute ? '#008F39' : '#334155',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    backgroundColor: isCurrentRoute ? 'rgba(0, 184, 74, 0.08)' : 'transparent',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentRoute) {
                      e.currentTarget.style.color = '#00B84A';
                      e.currentTarget.style.backgroundColor = 'rgba(0, 184, 74, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentRoute) {
                      e.currentTarget.style.color = '#334155';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {link.label}
                  {isCurrentRoute && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '14px',
                        right: '14px',
                        height: '2.5px',
                        background: 'linear-gradient(90deg, #00D256, #007A31)',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action CTA & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/contact"
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 800 }}
            >
              <span>Join Now</span>
              <ArrowRight size={15} />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                border: '1px solid rgba(15, 23, 42, 0.1)',
                color: '#0F172A',
                cursor: 'pointer',
              }}
              className="mobile-nav-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} color="#00993D" /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid rgba(15, 23, 42, 0.08)',
              borderBottom: '2px solid #00B84A',
              padding: '18px 24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 20px 35px rgba(15, 23, 42, 0.1)',
            }}
          >
            {navLinks.map((link) => {
              const isCurrentRoute = isHomePage
                ? activeSection === link.id
                : location.pathname === link.path;

              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    color: isCurrentRoute ? '#008A38' : '#1E293B',
                    borderRadius: '10px',
                    backgroundColor: isCurrentRoute ? '#ECFDF3' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                  }}
                >
                  <span>{link.label}</span>
                  <ArrowRight size={16} color={isCurrentRoute ? '#00B84A' : '#94A3B8'} />
                </a>
              );
            })}


            <div style={{ marginTop: '12px', paddingTop: '14px', borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 600 }}>
                <MapPin size={14} color="#00B84A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Vishrambag:</strong> 7th Floor, R City Mall • <a href="tel:+917798001777" style={{ color: '#008A38', fontWeight: 800 }}>7798001777</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>
                <MapPin size={14} color="#172C83" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Vijaynagar:</strong> 3rd Floor, Krishna Heights • <a href="tel:+919172848777" style={{ color: '#008A38', fontWeight: 800 }}>9172848777</a></span>
              </div>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Join Now
              </Link>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
