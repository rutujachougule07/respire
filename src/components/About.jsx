import React from 'react';
import { Building2, Award, ShieldCheck, HeartHandshake, CheckCircle2, Landmark } from 'lucide-react';

export default function About() {
  const companyPillars = [
    {
      icon: Award,
      title: 'Decades of Trusted Corporate Heritage',
      desc: 'Backed by the prestigious Mahabal Group—one of Sangli and Western Maharashtra’s most respected business houses, built on uncompromising ethics and community trust.',
    },
    {
      icon: Landmark,
      title: 'Vision for Sangli’s Wellness Evolution',
      desc: 'Founded with the visionary objective of elevating Sangli’s fitness landscape, bringing metro-standard sports science and luxury wellness to local athletes and families.',
    },
    {
      icon: ShieldCheck,
      title: 'Uncompromising Quality & Institutional Standards',
      desc: 'Operated under strict corporate governance: world-class biomechanical equipment, certified staff, certified hygiene protocols, and 100% transparent fee policies.',
    },
    {
      icon: HeartHandshake,
      title: 'Deep Regional Roots Across 2 Strategic Hubs',
      desc: 'A permanent civic commitment to Sangli with two flagship premises: Vishrambag (7th Floor, R City Mall) and Vijaynagar (3rd Floor, Krishna Heights).',
    },
  ];

  return (
    <section
      id="about"
      className="section-padding"
      style={{
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Soft Decorative Ambient Sheen */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          right: '-6%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0, 184, 74, 0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* TOP ROW: Image on Left + Company Information on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          {/* Left Column: Authentic Mahabal Group Visual Presentation */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1.5px solid rgba(0, 184, 74, 0.22)',
                boxShadow: '0 24px 50px rgba(15, 23, 42, 0.12)',
                position: 'relative',
                height: '460px',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop"
                alt="Respire Fitness - A Part of Mahabal Group"
                className="img-cover"
                style={{ transition: 'transform 0.6s ease' }}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(5, 30, 15, 0.88) 100%)',
                }}
              />

              {/* Bottom Pinned Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '22px',
                  left: '22px',
                  right: '22px',
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(12px)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 184, 74, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: '#008A38',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Institutional Stewardship
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>
                    A Part of Mahabal Group
                  </div>
                </div>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  SANGLI
                </div>
              </div>
            </div>

            {/* Overlapping Corporate Heritage Badge */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-12px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #172C83 100%)',
                border: '3px solid #FFFFFF',
                borderRadius: '18px',
                padding: '14px 20px',
                boxShadow: '0 14px 32px rgba(15, 23, 42, 0.28)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Award size={26} color="#00D256" />
              <div>
                <div style={{ fontSize: '1.02rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15 }}>
                  Mahabal Group
                </div>
                <div style={{ fontSize: '0.74rem', color: '#93C5FD', fontWeight: 700, letterSpacing: '0.04em' }}>
                  A Legacy of Excellence
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Company Background & Information */}
          <div>
            <div className="section-eyebrow">
              <Building2 size={14} />
              <span>• A PART OF MAHABAL GROUP •</span>
            </div>

            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '18px' }}>
              ABOUT <span className="text-green">MAHABAL GROUP & RESPIRE</span>
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#1E293B',
                marginBottom: '16px',
                lineHeight: 1.7,
                fontWeight: 500,
              }}
            >
              <strong>Respire Fitness</strong> is proudly founded and steered under the esteemed banner of the{' '}
              <strong>Mahabal Group</strong>—a distinguished corporate enterprise that has earned high standing and
              widespread public trust across Sangli and Western Maharashtra.
            </p>

            <p style={{ fontSize: '0.94rem', color: '#475569', marginBottom: '24px', lineHeight: 1.68 }}>
              Rooted in the group’s foundational philosophy that economic growth and societal health go hand-in-hand,
              Respire Fitness was conceptualized to provide Sangli with a world-class health sanctuary. Combining modern
              sports science with transparent, professional management, the Mahabal Group ensures that every member benefits
              from corporate reliability, safety, and long-term commitment.
            </p>

            {/* Company Credentials Strip */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 20px',
                padding: '14px 18px',
                borderRadius: '14px',
                backgroundColor: '#F8FCFA',
                border: '1px solid rgba(0, 184, 74, 0.22)',
                fontSize: '0.84rem',
                color: '#0F172A',
                fontWeight: 700,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#008A38" />
                <span>A Part of Mahabal Group</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#008A38" />
                <span>2 Sangli Branches (Vishrambag & Vijaynagar)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#008A38" />
                <span>100% Institutional Governance</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 4 Pillar Boxes Placed Side-by-Side Under Image & Information */}
        <div className="about-pillars-grid">
          {companyPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="about-pillar-card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '22px 20px',
                  background: 'linear-gradient(135deg, #F8FCFA 0%, #F1FBF5 100%)',
                  borderRadius: '18px',
                  border: '1.5px solid rgba(0, 184, 74, 0.2)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0, 184, 74, 0.12)',
                    border: '1px solid rgba(0, 184, 74, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#008A38',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      marginBottom: '6px',
                      lineHeight: 1.3,
                    }}
                  >
                    {p.title}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55 }}>
                    {p.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .about-pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .about-pillars-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 22px !important;
          }
        }
        @media (min-width: 1280px) {
          .about-pillars-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 18px !important;
          }
        }
        .about-pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 32px rgba(0, 184, 74, 0.15) !important;
          border-color: rgba(0, 184, 74, 0.45) !important;
        }
      `}</style>
    </section>
  );
}