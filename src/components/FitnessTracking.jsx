import React from 'react';
import { Activity, TrendingUp, Camera, Calendar, LineChart, UserCheck } from 'lucide-react';

export default function FitnessTracking() {
  const trackingFeatures = [
    {
      icon: Activity,
      title: 'Body Composition History',
      desc: 'In-depth tracking of Body Fat %, Skeletal Muscle, Visceral Fat, BMI, and metabolic water hydration measured consistently over time.',
      badge: 'Scientific Metrics',
    },
    {
      icon: TrendingUp,
      title: 'Fitness Progress Tracking',
      desc: 'Visualize your strength progressions, 1-Rep Max curves, cardiovascular endurance gains, and milestone streaks with intuitive graphical charts.',
      badge: 'Data-Backed Analytics',
    },
    {
      icon: Camera,
      title: 'Transformation Photos',
      desc: 'Compare visual physical progress side-by-side with private, secure milestone capture to witness real muscle definition and posture refinement.',
      badge: 'Visual Milestones',
    },
    {
      icon: Calendar,
      title: 'Workout Schedule & Timetable',
      desc: 'Synchronized weekly timetable with personal trainer slot appointments, group Zumba and Yoga schedules, and planned rest-day recovery.',
      badge: 'Automated Routine',
    },
    {
      icon: UserCheck,
      title: 'Progress Monitoring & Biometrics',
      desc: 'Seamless biometric check-in integration combined with trainer session feedback notes and WhatsApp automated achievement alerts.',
      badge: 'Trainer Supervision',
    },
  ];

  return (
    <section
      id="features"
      className="section-padding"
      style={{
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div className="section-header">
          <div className="section-eyebrow">
            <LineChart size={14} />
            <span>Digital Fitness Ecosystem</span>
          </div>
          <h2 className="section-title">
            SMART FITNESS <span className="text-green">TRACKING</span>
          </h2>
          <p className="section-subtitle">
            Say goodbye to guesswork. Respire Fitness leverages structured body composition analysis, biometric integration, and milestone tracking to validate every drop of sweat.
          </p>
        </div>

        {/* 5 Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px',
          }}
        >
          {trackingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid rgba(0, 184, 74, 0.14)',
                  borderRadius: '18px',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00B84A';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 184, 74, 0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 184, 74, 0.14)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.05)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
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
                    }}
                  >
                    <Icon size={21} color="#FFFFFF" />
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#172C83',
                      backgroundColor: '#EEF2FF',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {feat.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, flexGrow: 1 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
