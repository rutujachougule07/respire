import React from 'react';
import { ArrowRight, Compass, Shield, Award, Activity, Sparkles } from 'lucide-react';

export default function Hero() {
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

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '148px',
        paddingBottom: '90px',
        overflow: 'hidden',
        backgroundColor: '#009E40',
      }}
    >
      {/* Background Gym Photograph with Rich Emerald Green Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(125deg, rgba(0, 108, 43, 0.92) 0%, rgba(0, 184, 74, 0.80) 48%, rgba(23, 44, 131, 0.72) 100%),
                            url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        }}
      />

      {/* Soft Luminous White-Green Decorative Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '620px',
          height: '620px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(0, 184, 74, 0) 70%)',
          filter: 'blur(50px)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
        className="animate-pulse-glow"
      />

      {/* Bottom Smooth White Curve / Fade into Page */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '90px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 100%)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Hero Content Container */}
      <div className="container" style={{ position: 'relative', zIndex: 5 }}>
        <div style={{ maxWidth: '880px' }}>
          {/* Eyebrow Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.42)',
              borderRadius: '999px',
              marginBottom: '26px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Sparkles size={15} color="#FFFFFF" />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              A MAHABAL GROUP VENTURE • SANGLI
            </span>
          </div>

          {/* Main Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.6rem, 5.8vw, 4.9rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              marginBottom: '22px',
              color: '#FFFFFF',
              textShadow: '0 6px 28px rgba(0, 60, 24, 0.28)',
            }}
          >
            TRANSFORM YOUR BODY.<br />
            <span
              style={{
                color: '#D1FAE5',
                display: 'inline-block',
              }}
            >
              ELEVATE YOUR LIFE.
            </span>
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: 'rgba(255, 255, 255, 0.94)',
              maxWidth: '670px',
              marginBottom: '38px',
              lineHeight: 1.65,
              fontWeight: 500,
            }}
          >
            Push Your Limits. Build Your Strength. Experience a Better Fitness Lifestyle.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '56px',
            }}
          >
            <button
              onClick={() => scrollTo('contact')}
              className="btn btn-white btn-lg"
              style={{ fontWeight: 800 }}
            >
              <span>Join Now</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => scrollTo('about')}
              className="btn btn-outline-white btn-lg"
              style={{ fontWeight: 700 }}
            >
              <span>Explore More</span>
              <Compass size={18} color="#FFFFFF" />
            </button>
          </div>

          {/* Crisp White Elevated Highlight Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              maxWidth: '840px',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 14px 32px rgba(0, 70, 28, 0.16)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Award size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>Mahabal Group</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>Unmatched Trust & Legacy</div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 14px 32px rgba(0, 70, 28, 0.16)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #172C83 0%, #2440B5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Shield size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>2 Sangli Branches</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>Vishrambag & Vijaynagar</div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 14px 32px rgba(0, 70, 28, 0.16)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Activity size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>Smart Tracking</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>Biometric & Body Comp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
