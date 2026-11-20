import React from 'react';
import { UserCheck, Award, Target, Activity, Sparkles, Building2, Shield } from 'lucide-react';
import { useWebsiteContent } from '../context/WebsiteContentContext';

export default function WhyChooseUs() {
  const { content } = useWebsiteContent();
  const whyUsData = content?.whyUs || {};

  if (whyUsData?.visible === false || content?.sectionVisibility?.whyUs === false) {
    return null;
  }

  const eyebrow = whyUsData.eyebrow ?? 'The Respire Standard';
  const title = whyUsData.title ?? 'WHY CHOOSE RESPIRE FITNESS';
  const subtitle =
    whyUsData.subtitle ??
    'A harmonious fusion of elite sports science, luxury recovery amenities, and the uncompromised trust of the Mahabal Group.';

  const defaultReasons = [
    {
      icon: UserCheck,
      title: 'Dedicated Trainer Support',
      desc: 'Our trainers are ranked and reviewed by members with verified certifications. Enjoy flexible weekly slot booking to receive dedicated 1-on-1 coaching when it fits your schedule.',
      badge: 'Certified Experts',
    },
    {
      icon: Target,
      title: 'Hyper-Personalized Training',
      desc: 'No cookie-cutter routines. Every member receives custom exercise selection tailored to joint mechanics, lifestyle demands, and aesthetic or athletic aspirations.',
      badge: 'Bespoke Regimens',
    },
    {
      icon: Activity,
      title: 'Data-Backed Progress Monitoring',
      desc: 'Periodic body composition analyses track your exact muscle mass gains and fat loss trajectory, synchronized seamlessly with biometric check-in attendance streaks.',
      badge: 'Scientific Tracking',
    },
    {
      icon: Award,
      title: 'Structured Workout Programs',
      desc: 'Progress smoothly from foundational Beginner stability to Intermediate hypertrophy, through to Advanced athletic powerlifting with on-demand video masterclasses.',
      badge: 'Curated Roadmaps',
    },
    {
      icon: Building2,
      title: 'Unrivaled Member Experience',
      desc: 'Backed by the Mahabal Group legacy and situated on the 7th Floor of R City Mall, enjoy panoramic views, high-ceiling ventilation, and integrated thermal Steam & Massage spa recovery.',
      badge: 'Luxury Sanctuary',
    },
  ];

  const reasonIcons = [UserCheck, Target, Activity, Award, Building2];
  const rawReasons = (whyUsData.reasons && Array.isArray(whyUsData.reasons))
    ? whyUsData.reasons
    : defaultReasons;

  const reasons = rawReasons.map((r, i) => ({
    ...r,
    icon: reasonIcons[i % reasonIcons.length] || Sparkles,
    badge: r.badge || 'Respire Standard',
  }));

  return (
    <section
      id="why-us"
      className="section-padding"
      style={{
        background: 'linear-gradient(180deg, #F2FBF6 0%, #FFFFFF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div className="section-header">
          {eyebrow ? (
            <div className="section-eyebrow">
              <Sparkles size={14} />
              <span>{eyebrow}</span>
            </div>
          ) : null}
          {title ? (
            <h2 className="section-title">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="section-subtitle">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* 5 Reasons White Elevated Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '56px',
          }}
        >
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            const isGreen = idx % 2 === 0;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid rgba(0, 184, 74, 0.14)',
                  borderRadius: '20px',
                  padding: '30px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00B84A';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 18px 36px rgba(0, 184, 74, 0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 184, 74, 0.14)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(15, 23, 42, 0.05)';
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '20px',
                    fontSize: '2.4rem',
                    fontWeight: 900,
                    color: 'rgba(0, 184, 74, 0.08)',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}
                >
                  0{idx + 1}
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginBottom: '18px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: isGreen
                        ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)'
                        : 'linear-gradient(135deg, #172C83 0%, #2440B5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: isGreen
                        ? '0 8px 18px rgba(0, 184, 74, 0.25)'
                        : '0 8px 18px rgba(23, 44, 131, 0.25)',
                    }}
                  >
                    <Icon size={23} color="#FFFFFF" />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: isGreen ? '#008A38' : '#172C83',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {item.badge}
                    </span>
                    <h3 style={{ fontSize: '1.22rem', fontWeight: 800, color: '#0F172A' }}>
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.65, flexGrow: 1 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Vibrant Emerald Green Gradient Brand Promise Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #00C952 0%, #008A37 55%, #065F29 100%)',
            borderRadius: '22px',
            padding: '34px 36px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            boxShadow: '0 18px 40px rgba(0, 148, 59, 0.25)',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D1FAE5', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.08em' }}>
              <Shield size={16} />
              <span>Mahabal Group Commitment</span>
            </div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '6px' }}>
              Sangli's Most Trusted Fitness Institution
            </h4>
            <p style={{ fontSize: '0.94rem', color: 'rgba(255, 255, 255, 0.92)', lineHeight: 1.6 }}>
              Every piece of equipment, every trainer onboarded, and every hygiene protocol is maintained according to strict corporate excellence standards.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '26px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF' }}>100%</div>
              <div style={{ fontSize: '0.76rem', color: '#D1FAE5', fontWeight: 700, textTransform: 'uppercase' }}>Certified Staff</div>
            </div>
            <div style={{ width: '1px', height: '42px', backgroundColor: 'rgba(255,255,255,0.28)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF' }}>2</div>
              <div style={{ fontSize: '0.76rem', color: '#D1FAE5', fontWeight: 700, textTransform: 'uppercase' }}>Sangli Branches</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
