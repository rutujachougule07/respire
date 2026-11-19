import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, MapPin, Phone } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      const sections = ['hero', 'about', 'services', 'membership', 'programs', 'features', 'why-us', 'contact'];
      const scrollPosition = window.scrollY + 180;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 104;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Programs', id: 'programs' },
    { label: 'Features', id: 'features' },
    { label: 'Contact', id: 'contact' },
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
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: isScrolled ? '1px solid rgba(0, 184, 74, 0.2)' : '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: isScrolled ? '0 10px 30px rgba(15, 23, 42, 0.08)' : '0 2px 10px rgba(15, 23, 42, 0.03)',
        }}
      >
        {/* Top Green Gradient Continuous Scrolling Marquee Banner */}
        <div
          className="topbar-marquee-wrapper"
          style={{
            background: 'linear-gradient(90deg, #006E2C 0%, #00B84A 52%, #008A38 100%)',
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, letterSpacing: '0.07em' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 0 8px rgba(255,255,255,0.85)',
                    }}
                  />
                  A MAHABAL GROUP VENTURE
                </span>
                <span style={{ opacity: 0.45 }}>|</span>
                <span style={{ fontWeight: 800 }}>Vishrambag Branch:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                  <MapPin size={13} color="#FFFFFF" />
                  7th Floor, R City Mall, Opp. Safa Bakery, Sangli
                </span>
                <a href="tel:+917798001777" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: '#FFFFFF' }}>
                  <Phone size={13} color="#FFFFFF" />
                  7798001777
                </a>
                <span style={{ opacity: 0.45 }}>•</span>
                <span style={{ fontWeight: 800 }}>Vijaynagar Branch:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                  <MapPin size={13} color="#FFFFFF" />
                  3rd Floor, Krishna Heights, Opp. KFC, Sangli-Miraj Road
                </span>
                <a href="tel:+919172848777" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: '#FFFFFF' }}>
                  <Phone size={13} color="#FFFFFF" />
                  9172848777
                </a>
                <span style={{ opacity: 0.45 }}>•</span>
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
          {/* Official Full-Color Logo on Crisp White */}
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, 'hero')}
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
          </a>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: isActive ? '#008F39' : '#334155',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    backgroundColor: isActive ? 'rgba(0, 184, 74, 0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.color = '#00B84A';
                      e.target.style.backgroundColor = 'rgba(0, 184, 74, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.color = '#334155';
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '16px',
                        right: '16px',
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
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, 'contact')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 800 }}
            >
              <span>Join Now</span>
              <ArrowRight size={15} />
            </a>

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
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  color: activeSection === link.id ? '#008A38' : '#1E293B',
                  borderRadius: '10px',
                  backgroundColor: activeSection === link.id ? '#ECFDF3' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>{link.label}</span>
                <ArrowRight size={16} color={activeSection === link.id ? '#00B84A' : '#94A3B8'} />
              </a>
            ))}

            <div style={{ marginTop: '12px', paddingTop: '14px', borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 600 }}>
                <MapPin size={14} color="#00B84A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Vishrambag:</strong> 7th Floor, R City Mall, Opp. Safa Bakery • <a href="tel:+917798001777" style={{ color: '#008A38', fontWeight: 800 }}>7798001777</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>
                <MapPin size={14} color="#172C83" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Vijaynagar:</strong> 3rd Floor, Krishna Heights, Opp. KFC, Sangli-Miraj Rd • <a href="tel:+919172848777" style={{ color: '#008A38', fontWeight: 800 }}>9172848777</a></span>
              </div>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, 'contact')}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Join Now
              </a>
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
          .topbar-address {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
