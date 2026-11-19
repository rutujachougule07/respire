import React from 'react';
import { ShieldCheck, Bell, Clock, RefreshCw, Calendar, ArrowRight, CheckCircle2, Info, Phone } from 'lucide-react';
import { OFFICIAL_FEE_RULES } from './admin/initialData';

export default function Membership({ plans = [] }) {
  const scrollToContact = () => {
    const el = document.getElementById('contact');
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

  const activePlans = plans.filter((p) => p.status !== 'Paused');

  const features = [
    {
      icon: Clock,
      title: 'Real-Time Membership Status',
      desc: 'Track your active membership validity, days remaining, and attendance log anytime through smart biometric sync and automated WhatsApp notifications.',
    },
    {
      icon: Bell,
      title: 'Automated Renewal Reminders',
      desc: 'Receive proactive alerts prior to expiry via official WhatsApp notifications, ensuring uninterrupted gym access without manual follow-up.',
    },
    {
      icon: RefreshCw,
      title: 'Hassle-Free Renewals & Upgrades',
      desc: 'Seamlessly renew or upgrade to a higher tier with instant biometric profile continuity. No biometric re-enrolment needed.',
    },
    {
      icon: Calendar,
      title: 'Flexible Freeze Policies',
      desc: 'Structured freeze options available on select long-term plans so you stay supported through travel or recovery.',
    },
  ];

  return (
    <section
      id="membership"
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
            <ShieldCheck size={14} />
            <span>Official Membership Fee Structure</span>
          </div>
          <h2 className="section-title">
            MEMBERSHIP <span className="text-green">FEE STRUCTURE</span>
          </h2>
          <p className="section-subtitle">
            Transparent, limited-time membership plans for Respire Fitness – Vishrambag Branch, Sangli. Choose the duration that aligns with your fitness goals.
          </p>
        </div>

        {/* Dynamic Official Fee Structure Cards (Synced Live with Admin Dashboard) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '44px',
          }}
        >
          {activePlans.map((tier) => {
            const isPopular = Boolean(tier.isPopular);
            const durationText =
              tier.durationLabel ||
              (tier.durationMonths === 12
                ? '1 Year'
                : `${tier.durationMonths} ${tier.durationMonths === 1 ? 'Month' : 'Months'}`);

            return (
              <div
                key={tier.id}
                style={{
                  background: isPopular
                    ? 'linear-gradient(155deg, #00C952 0%, #009B3E 52%, #006B2B 100%)'
                    : '#FFFFFF',
                  borderRadius: '22px',
                  border: isPopular
                    ? '2px solid #00B84A'
                    : '1.5px solid rgba(0, 184, 74, 0.18)',
                  padding: '30px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: isPopular
                    ? '0 22px 45px rgba(0, 148, 59, 0.30)'
                    : '0 10px 28px rgba(15, 23, 42, 0.06)',
                  transform: isPopular ? 'translateY(-6px)' : 'none',
                  transition: 'transform 0.3s ease',
                }}
              >
                {isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#172C83',
                      color: '#FFFFFF',
                      padding: '5px 16px',
                      borderRadius: '999px',
                      fontSize: '0.73rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      boxShadow: '0 6px 16px rgba(23, 44, 131, 0.35)',
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Duration & Plan Name */}
                <div style={{ marginBottom: '16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: isPopular ? '#D1FAE5' : '#008A38',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '6px',
                    }}
                  >
                    {tier.badge || 'Limited Time Offer'}
                  </span>
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      color: isPopular ? '#FFFFFF' : '#0F172A',
                      marginBottom: '6px',
                    }}
                  >
                    {durationText}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      color: isPopular ? 'rgba(255, 255, 255, 0.88)' : '#64748B',
                      fontWeight: 600,
                    }}
                  >
                    {tier.name}
                  </div>
                </div>

                {/* Official Fee Price Block */}
                <div
                  style={{
                    backgroundColor: isPopular ? 'rgba(255, 255, 255, 0.16)' : '#F2FBF6',
                    border: isPopular ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 184, 74, 0.25)',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    marginBottom: '22px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: isPopular ? '#D1FAE5' : '#008A38',
                      marginBottom: '4px',
                    }}
                  >
                    Charges
                  </div>
                  <div
                    style={{
                      fontSize: '2.1rem',
                      fontWeight: 900,
                      color: isPopular ? '#FFFFFF' : '#0F172A',
                      lineHeight: 1.1,
                    }}
                  >
                    ₹{Number(tier.price).toLocaleString('en-IN')}/-
                  </div>
                </div>

                {/* Included Highlights */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '26px',
                    flexGrow: 1,
                  }}
                >
                  {(tier.features || []).map((item, hIdx) => (
                    <div
                      key={hIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '0.86rem',
                        color: isPopular ? '#FFFFFF' : '#334155',
                        fontWeight: 500,
                        lineHeight: 1.45,
                      }}
                    >
                      <CheckCircle2
                        size={16}
                        color={isPopular ? '#D1FAE5' : '#00B84A'}
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={scrollToContact}
                  className={`btn ${isPopular ? 'btn-white' : 'btn-primary'}`}
                  style={{
                    width: '100%',
                    fontSize: '0.84rem',
                    padding: '12px 16px',
                  }}
                >
                  <span>Join {durationText} Plan</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Official Fee Structure Terms, Trial Charge & Gym Timings Box */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid rgba(0, 184, 74, 0.25)',
            borderRadius: '22px',
            padding: '28px 30px',
            marginBottom: '40px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(0, 184, 74, 0.16)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Info size={19} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                  Important Membership Terms & Timings
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#008A38', fontWeight: 700 }}>
                  Respire Vishrambag Branch • Official Policy
                </div>
              </div>
            </div>

            <a
              href="tel:+917798001777"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF3',
                border: '1px solid rgba(0, 184, 74, 0.3)',
                color: '#007A31',
                fontSize: '0.88rem',
                fontWeight: 800,
              }}
            >
              <Phone size={15} />
              <span>Contact: 7798001777</span>
            </a>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {OFFICIAL_FEE_RULES.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FCFA',
                  border: '1px solid rgba(0, 184, 74, 0.12)',
                  fontSize: '0.88rem',
                  color: '#1E293B',
                  fontWeight: 600,
                  lineHeight: 1.45,
                }}
              >
                <span style={{ color: '#00B84A', fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>*</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Membership Status & Renewals Panel */}
        <div
          style={{
            background: 'linear-gradient(145deg, #F6FCF9 0%, #EDF9F2 100%)',
            border: '1.5px solid rgba(0, 184, 74, 0.2)',
            borderRadius: '24px',
            padding: '38px 32px',
            boxShadow: '0 14px 36px rgba(0, 140, 56, 0.07)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '28px',
              borderBottom: '1px solid rgba(0, 184, 74, 0.16)',
              paddingBottom: '20px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <RefreshCw size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A' }}>
                Membership Status, Renewals & Freeze Information
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                Powered by smart biometric attendance and official WhatsApp reminders
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0, 184, 74, 0.15)',
                    borderRadius: '16px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#ECFDF3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color="#008A38" />
                  </div>
                  <h4 style={{ fontSize: '1.04rem', fontWeight: 800, color: '#0F172A' }}>
                    {feat.title}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Vibrant Green Gradient CTA Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #00C952 0%, #008A37 60%, #006629 100%)',
              borderRadius: '18px',
              padding: '26px 28px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              boxShadow: '0 14px 30px rgba(0, 148, 59, 0.24)',
            }}
          >
            <div>
              <div style={{ fontSize: '1.22rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '4px' }}>
                Ready to Begin Your Transformation?
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.92)' }}>
                Vishrambag Branch: <strong>7798001777</strong> &nbsp;|&nbsp; Vijaynagar Branch: <strong>9172848777</strong>
              </div>
            </div>

            <button
              onClick={scrollToContact}
              className="btn btn-white"
              style={{ fontWeight: 800, fontSize: '0.94rem' }}
            >
              <span>Contact Us for Membership Details</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
