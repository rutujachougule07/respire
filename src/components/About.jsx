import React from 'react';
import { CheckCircle2, Building2, Award, ArrowRight } from 'lucide-react';

export default function About() {
  const points = [
    {
      title: 'A Venture of Mahabal Group',
      desc: 'Backed by the visionary leadership and high trust of the renowned Mahabal Group, setting new benchmarks in health and fitness.',
    },
    {
      title: '2 Prime Sangli Branches',
      desc: 'Visit us at Vishrambag (7th Floor, R City Mall, Opp. Safa Bakery) or Vijaynagar (3rd Floor, Krishna Heights, Opp. KFC, Sangli-Miraj Road).',
    },
    {
      title: 'Complete Integrated Wellness',
      desc: 'Beyond heavy lifting: full restorative experience including luxury Steam Bath, sports massage, Zumba, and restorative Yoga.',
    },
    {
      title: 'Connected Smart Ecosystem',
      desc: 'Seamless biometric attendance, automated WhatsApp milestone reminders, and trainer-guided body composition tracking.',
    },
  ];

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
      id="about"
      className="section-padding"
      style={{
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Soft Mint Decorative Blob */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          right: '-8%',
          width: '480px',
          height: '480px',
          background: 'radial-gradient(circle, rgba(0, 184, 74, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '52px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Image Showcase */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(0, 184, 74, 0.2)',
                boxShadow: '0 24px 50px rgba(15, 23, 42, 0.12)',
                position: 'relative',
                height: '490px',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop"
                alt="Respire Fitness Interior - A Mahabal Group Venture"
                className="img-cover"
                style={{ transition: 'transform 0.6s ease' }}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,184,74,0.05) 35%, rgba(0, 82, 33, 0.85) 100%)',
                }}
              />

              {/* Crisp White Floating Card Pinned Inside Image */}
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
                  <div style={{ fontSize: '0.74rem', color: '#008A38', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    2 Premier Sangli Branches
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>
                    Vishrambag (R City Mall) & Vijaynagar (Krishna Heights)
                  </div>
                </div>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                    color: '#FFFFFF',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  PREMIUM
                </div>
              </div>
            </div>

            {/* Overlapping Navy + Green Badge */}
            <div
              style={{
                position: 'absolute',
                top: '-22px',
                right: '-14px',
                background: 'linear-gradient(135deg, #172C83 0%, #2440B5 100%)',
                border: '3px solid #FFFFFF',
                borderRadius: '18px',
                padding: '15px 22px',
                boxShadow: '0 14px 32px rgba(23, 44, 131, 0.28)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Award size={28} color="#FFFFFF" />
              <div>
                <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
                  Mahabal Group
                </div>
                <div style={{ fontSize: '0.75rem', color: '#DBEAFE', letterSpacing: '0.04em' }}>
                  A Legacy of Excellence
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div>
            <div className="section-eyebrow">
              <Building2 size={14} />
              <span>Mahabal Group Venture</span>
            </div>

            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '20px' }}>
              MORE THAN <span className="text-green">JUST A GYM</span>
            </h2>

            <p style={{ fontSize: '1.08rem', color: '#1E293B', marginBottom: '18px', lineHeight: 1.7 }}>
              <strong>Respire Fitness</strong> is not an ordinary training space—it is an elevated fitness sanctuary founded under the prestigious umbrella of the <strong>Mahabal Group</strong>. We bridge the gap between rigorous athletic training and restorative wellness, offering Sangli an international-caliber gym experience.
            </p>

            <p style={{ fontSize: '0.98rem', color: '#475569', marginBottom: '30px', lineHeight: 1.7 }}>
              Perched on the 7th Floor of R City Mall, Vishrambag, our facility pairs cutting-edge equipment with certified personal trainers, restorative spa therapies, energetic group classes, and smart digital health tracking. We empower you to redefine your personal boundaries every single day.
            </p>

            {/* Points List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '34px' }}>
              {points.map((pt, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 18px',
                    background: 'linear-gradient(135deg, #F8FCFA 0%, #EFFAF3 100%)',
                    borderRadius: '14px',
                    border: '1px solid rgba(0, 184, 74, 0.16)',
                  }}
                >
                  <CheckCircle2 size={20} color="#00B84A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                      {pt.title}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                      {pt.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => scrollTo('services')} className="btn btn-primary">
                <span>View All Services</span>
                <ArrowRight size={16} />
              </button>

              <button onClick={() => scrollTo('contact')} className="btn btn-secondary">
                <span>Schedule A Tour</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
