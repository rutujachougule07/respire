import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  Clock,
  RefreshCw,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Info,
  Phone,
  Building2,
  Sparkles,
  Wind,
  MessageCircle,
  Quote,
  MapPin,
} from 'lucide-react';
import {
  INITIAL_PLANS,
  VISHRAMBAG_RULES,
  VIJAYNAGAR_RULES,
  VIJAYNAGAR_MANAGEMENT,
} from './admin/initialData';

export default function Membership({ plans = [] }) {
  const [selectedBranch, setSelectedBranch] = useState('vishrambag');

  const scrollToContact = (branchId = 'vishrambag') => {
    const el = document.getElementById('contact');
    if (el) {
      const navHeight = 104;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Attempt to select the branch in contact form if present
      setTimeout(() => {
        const branchSelect = document.querySelector('select[name="branch"]');
        if (branchSelect) {
          branchSelect.value =
            branchId === 'branch2' || branchId === 'vijaynagar'
              ? 'Respire Vijaynagar Branch'
              : 'Respire Vishrambag Branch';
          branchSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 500);
    }
  };

  // Branch data definitions
  const branchData = {
    vishrambag: {
      id: 'vishrambag',
      name: 'Respire Vishrambag Branch',
      shortName: 'Vishrambag Branch',
      tag: 'Flagship Luxury Sanctuary',
      floor: '7th Floor, R City Mall, Opp. Safa Bakery, Vishrambag, Sangli',
      phone: '7798001777',
      phoneFormatted: '+91 7798001777',
      waNumber: '917798001777',
      gymTiming: '05:30 AM to 10:00 PM',
      acTiming: 'Shut down daily from 12:00 PM to 04:00 PM',
      rules: VISHRAMBAG_RULES,
      motto: null,
    },
    branch2: {
      id: 'branch2',
      name: 'Respire Vijaynagar Branch',
      shortName: 'Vijaynagar Branch',
      tag: 'Since 2012 • Sangli-Miraj Road',
      floor: '3rd Floor, Krishna Heights, Opp. KFC, Vijaynagar, Sangli',
      phone: '9172848777',
      phoneFormatted: '+91 9172848777',
      waNumber: '919172848777',
      gymTiming: '05:30 AM to 10:00 PM',
      acTiming: '06:00 AM to 09:30 AM & 05:00 PM to 09:00 PM',
      rules: VIJAYNAGAR_RULES,
      motto: VIJAYNAGAR_MANAGEMENT,
    },
  };

  const currentBranch = branchData[selectedBranch] || branchData.vishrambag;

  // Active plans matching selected branch
  const effectivePlans = plans && plans.length > 0 ? plans : INITIAL_PLANS;
  const filteredPlans = effectivePlans.filter((p) => {
    if (p.status === 'Paused') return false;
    if (selectedBranch === 'branch2' || selectedBranch === 'vijaynagar') {
      return p.branchId === 'branch2' || p.branchId === 'vijaynagar';
    }
    // Default to Vishrambag if branchId is vishrambag or missing
    return p.branchId === 'vishrambag' || !p.branchId;
  });

  // Fallback to initial if no plans in filtered list
  const activePlans =
    filteredPlans.length > 0
      ? filteredPlans
      : INITIAL_PLANS.filter((p) =>
          selectedBranch === 'branch2' || selectedBranch === 'vijaynagar'
            ? p.branchId === 'branch2'
            : p.branchId === 'vishrambag'
        );

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
            Transparent, official membership plans for Respire Fitness in Sangli. Select your preferred branch below to view duration, charges, and guidelines.
          </p>
        </div>

        {/* Branch Selector Tabs (Vishrambag vs Vijaynagar) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '36px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '6px',
              borderRadius: '20px',
              backgroundColor: '#F1F5F9',
              border: '1.5px solid rgba(0, 184, 74, 0.2)',
              gap: '8px',
              maxWidth: '100%',
              overflowX: 'auto',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Vishrambag Branch Tab */}
            <button
              onClick={() => setSelectedBranch('vishrambag')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 22px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                background:
                  selectedBranch === 'vishrambag'
                    ? 'linear-gradient(135deg, #00C952 0%, #008A37 100%)'
                    : 'transparent',
                color: selectedBranch === 'vishrambag' ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '0.92rem',
                boxShadow:
                  selectedBranch === 'vishrambag'
                    ? '0 8px 20px rgba(0, 184, 74, 0.35)'
                    : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              <Building2 size={18} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ lineHeight: 1.2 }}>Vishrambag Branch</div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    opacity: selectedBranch === 'vishrambag' ? 0.92 : 0.7,
                  }}
                >
                  7th Floor, R City Mall • 7798001777
                </div>
              </div>
            </button>

            {/* Vijaynagar Branch Tab */}
            <button
              onClick={() => setSelectedBranch('branch2')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 22px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                background:
                  selectedBranch === 'branch2'
                    ? 'linear-gradient(135deg, #172C83 0%, #1E3AA8 100%)'
                    : 'transparent',
                color: selectedBranch === 'branch2' ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '0.92rem',
                boxShadow:
                  selectedBranch === 'branch2'
                    ? '0 8px 20px rgba(23, 44, 131, 0.35)'
                    : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              <Sparkles size={18} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ lineHeight: 1.2 }}>
                  Vijaynagar Branch{' '}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '999px',
                      backgroundColor:
                        selectedBranch === 'branch2'
                          ? 'rgba(255, 255, 255, 0.25)'
                          : '#E2E8F0',
                      color: selectedBranch === 'branch2' ? '#FFFFFF' : '#0F172A',
                      fontWeight: 900,
                    }}
                  >
                    Since 2012
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    opacity: selectedBranch === 'branch2' ? 0.92 : 0.7,
                  }}
                >
                  3rd Floor, Krishna Heights • 9172848777
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Selected Branch Active Info Header Strip */}
        <div
          style={{
            backgroundColor: selectedBranch === 'branch2' ? '#EEF2FF' : '#F0FDF4',
            border:
              selectedBranch === 'branch2'
                ? '1px solid rgba(23, 44, 131, 0.2)'
                : '1px solid rgba(0, 184, 74, 0.22)',
            borderRadius: '16px',
            padding: '14px 20px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin
              size={18}
              color={selectedBranch === 'branch2' ? '#172C83' : '#008A38'}
            />
            <div>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '0.94rem',
                  color: selectedBranch === 'branch2' ? '#172C83' : '#007A31',
                }}
              >
                Showing Official Plans for {currentBranch.name}
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  color: '#64748B',
                  marginLeft: '8px',
                }}
              >
                ({currentBranch.floor})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href={`tel:+91${currentBranch.phone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#0F172A',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <Phone size={14} color="#008A38" />
              <span>{currentBranch.phone}</span>
            </a>
            <a
              href={`https://wa.me/${currentBranch.waNumber}?text=Hello%20${encodeURIComponent(
                currentBranch.name
              )},%20I%20would%20like%20to%20inquire%20about%20membership%20plans.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '10px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 800,
                boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
              }}
            >
              <MessageCircle size={14} />
              <span>WhatsApp Desk</span>
            </a>
          </div>
        </div>

        {/* Dynamic Official Fee Structure Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              activePlans.length === 5
                ? 'repeat(auto-fit, minmax(230px, 1fr))'
                : 'repeat(auto-fit, minmax(260px, 1fr))',
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
                : tier.durationMonths < 1
                ? '1 Day'
                : `${tier.durationMonths} ${
                    tier.durationMonths === 1 ? 'Month' : 'Months'
                  }`);

            const isVijaynagar = selectedBranch === 'branch2';
            const popularGradient = isVijaynagar
              ? 'linear-gradient(155deg, #1E3AA8 0%, #172C83 60%, #0D1B54 100%)'
              : 'linear-gradient(155deg, #00C952 0%, #009B3E 52%, #006B2B 100%)';
            const popularBorder = isVijaynagar
              ? '2px solid #2563EB'
              : '2px solid #00B84A';
            const popularShadow = isVijaynagar
              ? '0 22px 45px rgba(23, 44, 131, 0.35)'
              : '0 22px 45px rgba(0, 148, 59, 0.30)';

            const waDirectLink = `https://wa.me/${currentBranch.waNumber}?text=Hello%20${encodeURIComponent(
              currentBranch.name
            )},%20I%20am%20interested%20in%20joining%20the%20${encodeURIComponent(
              durationText
            )}%20plan%20(₹${Number(tier.price).toLocaleString('en-IN')}/-).%20Please%20share%20joining%20details.`;

            return (
              <div
                key={tier.id}
                style={{
                  background: isPopular ? popularGradient : '#FFFFFF',
                  borderRadius: '22px',
                  border: isPopular
                    ? popularBorder
                    : '1.5px solid rgba(0, 184, 74, 0.18)',
                  padding: '30px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: isPopular
                    ? popularShadow
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
                      backgroundColor: isVijaynagar ? '#00C952' : '#172C83',
                      color: '#FFFFFF',
                      padding: '5px 16px',
                      borderRadius: '999px',
                      fontSize: '0.73rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
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
                    {tier.badge || currentBranch.shortName}
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
                      color: isPopular
                        ? 'rgba(255, 255, 255, 0.88)'
                        : '#64748B',
                      fontWeight: 600,
                    }}
                  >
                    {tier.name}
                  </div>
                </div>

                {/* Official Fee Price Block */}
                <div
                  style={{
                    backgroundColor: isPopular
                      ? 'rgba(255, 255, 255, 0.16)'
                      : '#F2FBF6',
                    border: isPopular
                      ? '1px solid rgba(255, 255, 255, 0.3)'
                      : '1px solid rgba(0, 184, 74, 0.25)',
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
                    Official Fee
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

                {/* CTAs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href={waDirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${isPopular ? 'btn-white' : 'btn-primary'}`}
                    style={{
                      width: '100%',
                      fontSize: '0.84rem',
                      padding: '12px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                    }}
                  >
                    <MessageCircle size={15} />
                    <span>Join {durationText} Plan</span>
                  </a>

                  <button
                    onClick={() => scrollToContact(currentBranch.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isPopular ? 'rgba(255, 255, 255, 0.85)' : '#64748B',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '6px',
                      textDecoration: 'underline',
                    }}
                  >
                    Or Send Web Inquiry
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Fee Structure Terms, Timings & AC Rules Box */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border:
              selectedBranch === 'branch2'
                ? '1.5px solid rgba(23, 44, 131, 0.25)'
                : '1.5px solid rgba(0, 184, 74, 0.25)',
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
                  background:
                    selectedBranch === 'branch2'
                      ? 'linear-gradient(135deg, #1E3AA8 0%, #172C83 100%)'
                      : 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Info size={19} color="#FFFFFF" />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: '#0F172A',
                  }}
                >
                  Important Membership Terms & Timings
                </h3>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: selectedBranch === 'branch2' ? '#172C83' : '#008A38',
                    fontWeight: 800,
                  }}
                >
                  {currentBranch.name} • Official Operating Guidelines
                </div>
              </div>
            </div>

            <a
              href={`tel:+91${currentBranch.phone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor:
                  selectedBranch === 'branch2' ? '#EEF2FF' : '#ECFDF3',
                border:
                  selectedBranch === 'branch2'
                    ? '1px solid rgba(23, 44, 131, 0.3)'
                    : '1px solid rgba(0, 184, 74, 0.3)',
                color: selectedBranch === 'branch2' ? '#172C83' : '#007A31',
                fontSize: '0.88rem',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              <Phone size={15} />
              <span>Contact: {currentBranch.phone}</span>
            </a>
          </div>

          {/* Quick Highlight Cards: Gym Timing & AC Timing */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#F8FCFA',
                border: '1.5px solid rgba(0, 184, 74, 0.25)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#008A38',
                  flexShrink: 0,
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Gym Timing
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0F172A' }}>
                  {currentBranch.gymTiming}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F0F9FF',
                border: '1.5px solid rgba(14, 165, 233, 0.25)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                  flexShrink: 0,
                }}
              >
                <Wind size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  AC Timings
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0F172A' }}>
                  {currentBranch.acTiming}
                </div>
              </div>
            </div>
          </div>

          {/* Rules Bullet Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
              marginBottom: currentBranch.motto ? '24px' : '0',
            }}
          >
            {currentBranch.rules.map((rule, idx) => (
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
                <span
                  style={{
                    color: selectedBranch === 'branch2' ? '#172C83' : '#00B84A',
                    fontWeight: 900,
                    fontSize: '1rem',
                    lineHeight: 1.2,
                  }}
                >
                  *
                </span>
                <span>{rule}</span>
              </div>
            ))}
          </div>

          {/* Special Authentic Motivational Board from Vijaynagar Branch Standee */}
          {currentBranch.motto && (
            <div
              style={{
                marginTop: '20px',
                padding: '20px 24px',
                borderRadius: '16px',
                background:
                  'linear-gradient(135deg, #0F172A 0%, #1E293B 70%, #172C83 100%)',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Quote size={20} color="#00C952" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      marginBottom: '4px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    ❖ {currentBranch.motto.quote1}
                  </div>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#00D256',
                      letterSpacing: '0.02em',
                    }}
                  >
                    ❖ {currentBranch.motto.quote2}
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                }}
              >
                <div>— {currentBranch.motto.signature}</div>
                <div style={{ color: '#00D256', fontSize: '0.72rem' }}>
                  {currentBranch.motto.since}
                </div>
              </div>
            </div>
          )}
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
              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: '#0F172A',
                }}
              >
                Membership Status, Renewals & Freeze Information
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                Unified across Vishrambag & Vijaynagar branches with biometric attendance and automated WhatsApp updates
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
                  <h4
                    style={{
                      fontSize: '1.04rem',
                      fontWeight: 800,
                      color: '#0F172A',
                    }}
                  >
                    {feat.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: '#475569',
                      lineHeight: 1.6,
                    }}
                  >
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Vibrant Green Gradient CTA Banner */}
          <div
            style={{
              background:
                'linear-gradient(135deg, #00C952 0%, #008A37 60%, #006629 100%)',
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
              <div
                style={{
                  fontSize: '1.22rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginBottom: '4px',
                }}
              >
                Ready to Begin Your Transformation?
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.92)',
                }}
              >
                Vishrambag: <strong>7798001777</strong> &nbsp;|&nbsp; Vijaynagar (Since 2012): <strong>9172848777</strong>
              </div>
            </div>

            <button
              onClick={() => scrollToContact(selectedBranch)}
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