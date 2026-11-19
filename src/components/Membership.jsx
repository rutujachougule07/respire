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
  Dumbbell,
  Award,
  Zap,
  Flame,
  CreditCard,
  ShieldAlert,
  Ticket,
  PhoneCall,
} from 'lucide-react';
import {
  INITIAL_PLANS,
  VISHRAMBAG_RULES,
  VIJAYNAGAR_RULES,
  VIJAYNAGAR_MANAGEMENT,
  PERSONAL_TRAINING_RATES,
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

  const is5Cols = activePlans.length === 5;

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
      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1440px',
        }}
      >
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

        {/* Dynamic Official Fee Structure Cards - Guaranteed Single Line on Desktop */}
        <div
          className={`membership-cards-grid ${is5Cols ? 'cols-5' : 'cols-4'}`}
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
                  borderRadius: '20px',
                  border: isPopular
                    ? popularBorder
                    : '1.5px solid rgba(0, 184, 74, 0.18)',
                  padding: is5Cols ? '24px 14px' : '30px 22px',
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
                      top: '-13px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: isVijaynagar ? '#00C952' : '#172C83',
                      color: '#FFFFFF',
                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Duration & Plan Name */}
                <div style={{ marginBottom: is5Cols ? '12px' : '16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: isPopular ? '#D1FAE5' : '#008A38',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '4px',
                    }}
                  >
                    {tier.badge || currentBranch.shortName}
                  </span>
                  <h3
                    style={{
                      fontSize: is5Cols ? '1.38rem' : '1.5rem',
                      fontWeight: 900,
                      color: isPopular ? '#FFFFFF' : '#0F172A',
                      marginBottom: '4px',
                      lineHeight: 1.2,
                    }}
                  >
                    {durationText}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: isPopular
                        ? 'rgba(255, 255, 255, 0.88)'
                        : '#64748B',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={tier.name}
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
                    borderRadius: '12px',
                    padding: is5Cols ? '12px 10px' : '16px 18px',
                    marginBottom: is5Cols ? '16px' : '22px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: isPopular ? '#D1FAE5' : '#008A38',
                      marginBottom: '2px',
                    }}
                  >
                    Official Fee
                  </div>
                  <div
                    style={{
                      fontSize: is5Cols ? '1.78rem' : '2.1rem',
                      fontWeight: 900,
                      color: isPopular ? '#FFFFFF' : '#0F172A',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
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
                    gap: is5Cols ? '8px' : '10px',
                    marginBottom: is5Cols ? '18px' : '26px',
                    flexGrow: 1,
                  }}
                >
                  {(tier.features || []).map((item, hIdx) => (
                    <div
                      key={hIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: is5Cols ? '0.8rem' : '0.86rem',
                        color: isPopular ? '#FFFFFF' : '#334155',
                        fontWeight: 500,
                        lineHeight: 1.35,
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        color={isPopular ? '#D1FAE5' : '#00B84A'}
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <a
                    href={waDirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${isPopular ? 'btn-white' : 'btn-primary'}`}
                    style={{
                      width: '100%',
                      fontSize: is5Cols ? '0.78rem' : '0.84rem',
                      padding: is5Cols ? '10px 8px' : '12px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>Join {durationText} Plan</span>
                  </a>

                  <button
                    onClick={() => scrollToContact(currentBranch.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isPopular ? 'rgba(255, 255, 255, 0.85)' : '#64748B',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px',
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

        {/* --- 1-ON-1 PERSONAL TRAINING (PT) FEE STRUCTURE SECTION --- */}
        {(() => {
          const ptBranchKey =
            selectedBranch === 'branch2' || selectedBranch === 'vijaynagar' ? 'branch2' : 'vishrambag';
          const ptData = PERSONAL_TRAINING_RATES[ptBranchKey] || PERSONAL_TRAINING_RATES.vishrambag;
          const isVjn = ptBranchKey === 'branch2';

          return (
            <div
              style={{
                marginBottom: '46px',
                padding: '36px 30px',
                borderRadius: '26px',
                backgroundColor: isVjn ? '#F5F7FD' : '#F4FBF7',
                border: isVjn ? '1.5px solid rgba(23, 44, 131, 0.22)' : '1.5px solid rgba(0, 184, 74, 0.25)',
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.05)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  marginBottom: '28px',
                  paddingBottom: '20px',
                  borderBottom: isVjn ? '1px solid rgba(23, 44, 131, 0.16)' : '1px solid rgba(0, 184, 74, 0.18)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      backgroundColor: isVjn ? 'rgba(23, 44, 131, 0.12)' : 'rgba(0, 184, 74, 0.14)',
                      border: isVjn ? '1px solid rgba(23, 44, 131, 0.3)' : '1px solid rgba(0, 184, 74, 0.35)',
                      color: isVjn ? '#172C83' : '#008A38',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      marginBottom: '10px',
                    }}
                  >
                    <Dumbbell size={14} />
                    <span>Personal Training (PT) Charges • {currentBranch.shortName}</span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'clamp(1.4rem, 3vw, 1.95rem)',
                      fontWeight: 900,
                      color: '#0F172A',
                      margin: '0 0 6px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    1-ON-1 CERTIFIED{' '}
                    <span style={{ color: isVjn ? '#172C83' : '#008A38' }}>
                      PERSONAL TRAINING PACKAGES
                    </span>
                  </h3>

                  <p style={{ fontSize: '0.92rem', color: '#475569', margin: 0, maxWidth: '780px' }}>
                    Personalized one-on-one fitness mentoring, progressive overload tracking, and nutrition guidance at{' '}
                    <strong>{ptData.branchName}</strong>. Choose between flexible alternate-day or daily sessions.
                  </p>
                </div>

                <a
                  href={`tel:+91${ptData.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    backgroundColor: isVjn ? '#172C83' : '#008A38',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    boxShadow: isVjn
                      ? '0 6px 18px rgba(23, 44, 131, 0.3)'
                      : '0 6px 18px rgba(0, 184, 74, 0.3)',
                  }}
                >
                  <Phone size={15} />
                  <span>Call Branch: {ptData.phone}</span>
                </a>
              </div>

              {/* 2 Packages Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {ptData.categories.map((cat) => {
                  const isPremium = Boolean(cat.isPremium);
                  const waText = encodeURIComponent(
                    `Hello ${ptData.branchName} (Mahabal Group Venture),\nI would like to inquire about ${cat.title} (${cat.pricing.map((p) => `${p.planName}: ${p.priceDisplay}`).join(' / ')}) at your ${currentBranch.shortName}. Please guide me on trainer slot availability.`
                  );
                  const waLink = `https://wa.me/${ptData.waNumber}?text=${waText}`;

                  return (
                    <div
                      key={cat.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '22px',
                        border: isPremium
                          ? isVjn
                            ? '2px solid #172C83'
                            : '2px solid #00C952'
                          : '1px solid #E2E8F0',
                        boxShadow: isPremium
                          ? isVjn
                            ? '0 16px 36px rgba(23, 44, 131, 0.16)'
                            : '0 16px 36px rgba(0, 184, 74, 0.16)'
                          : '0 8px 24px rgba(15, 23, 42, 0.05)',
                        padding: '28px 26px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                      }}
                    >
                      {/* Top Highlight Tag for Premium/Senior */}
                      {isPremium && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-13px',
                            right: '24px',
                            background: isVjn
                              ? 'linear-gradient(135deg, #172C83 0%, #1E3AA8 100%)'
                              : 'linear-gradient(135deg, #00D256 0%, #007A31 100%)',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            padding: '4px 14px',
                            borderRadius: '999px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }}
                        >
                          {isVjn ? '★ Senior Master Coach' : '★ Elite Transformation'}
                        </div>
                      )}

                      <div>
                        {/* Eyebrow Badge */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            backgroundColor: isPremium
                              ? isVjn
                                ? 'rgba(23, 44, 131, 0.1)'
                                : 'rgba(0, 184, 74, 0.12)'
                              : '#F1F5F9',
                            color: isPremium
                              ? isVjn
                                ? '#172C83'
                                : '#008A38'
                              : '#475569',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '10px',
                          }}
                        >
                          <Award size={13} />
                          <span>{cat.badge}</span>
                        </div>

                        <h4
                          style={{
                            fontSize: '1.4rem',
                            fontWeight: 900,
                            color: '#0F172A',
                            margin: '0 0 8px',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {cat.title}
                        </h4>

                        <p
                          style={{
                            fontSize: '0.86rem',
                            color: '#64748B',
                            lineHeight: 1.5,
                            margin: '0 0 20px',
                          }}
                        >
                          {cat.description}
                        </p>

                        {/* Pricing Tiers Box (Alternate Days vs Daily) */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginBottom: '24px',
                          }}
                        >
                          {cat.pricing.map((tier, pIdx) => {
                            const isAlt = tier.planName === 'Alternate Days';
                            return (
                              <div
                                key={pIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '14px 18px',
                                  borderRadius: '14px',
                                  backgroundColor: isAlt ? '#F8FAFC' : isVjn ? '#EEF2FF' : '#ECFDF3',
                                  border: isAlt
                                    ? '1px solid #E2E8F0'
                                    : isVjn
                                    ? '1.5px solid rgba(23, 44, 131, 0.35)'
                                    : '1.5px solid rgba(0, 184, 74, 0.35)',
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.86rem',
                                      fontWeight: 800,
                                      color: '#0F172A',
                                      marginBottom: '2px',
                                    }}
                                  >
                                    <span>{tier.planName}</span>
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: isAlt ? '#E2E8F0' : isVjn ? '#172C83' : '#008A38',
                                        color: isAlt ? '#475569' : '#FFFFFF',
                                        fontWeight: 700,
                                      }}
                                    >
                                      {tier.tag}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                                    {tier.sessions}
                                  </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <div
                                    style={{
                                      fontSize: '1.45rem',
                                      fontWeight: 900,
                                      color: isAlt ? '#0F172A' : isVjn ? '#172C83' : '#008A38',
                                      letterSpacing: '-0.02em',
                                    }}
                                  >
                                    {tier.priceDisplay}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>
                                    per month
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Feature Bullet Points */}
                        <div style={{ marginBottom: '24px' }}>
                          <div
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#94A3B8',
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                              marginBottom: '10px',
                            }}
                          >
                            What's Included:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                            {cat.features.map((feat, fIdx) => (
                              <div
                                key={fIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px',
                                  fontSize: '0.84rem',
                                  color: '#334155',
                                  fontWeight: 600,
                                  lineHeight: 1.4,
                                }}
                              >
                                <CheckCircle2
                                  size={15}
                                  color={isVjn ? '#172C83' : '#00B84A'}
                                  style={{ flexShrink: 0, marginTop: '2px' }}
                                />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* CTAs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            fontSize: '0.86rem',
                            padding: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            backgroundColor: isVjn ? '#172C83' : '#008A38',
                            borderColor: isVjn ? '#172C83' : '#008A38',
                          }}
                        >
                          <MessageCircle size={15} />
                          <span>Book {cat.title}</span>
                        </a>

                        <button
                          onClick={() => scrollToContact(currentBranch.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '6px',
                            textDecoration: 'underline',
                          }}
                        >
                          Send Web Inquiry for PT Trial
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Official Fee Structure Terms, Timings & Guidelines Box */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border:
              selectedBranch === 'branch2'
                ? '1.5px solid rgba(23, 44, 131, 0.22)'
                : '1.5px solid rgba(0, 184, 74, 0.22)',
            borderRadius: '24px',
            padding: '32px 30px',
            marginBottom: '44px',
            boxShadow:
              selectedBranch === 'branch2'
                ? '0 20px 48px rgba(23, 44, 131, 0.08)'
                : '0 20px 48px rgba(0, 184, 74, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative background gradient accent */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background:
                selectedBranch === 'branch2'
                  ? 'linear-gradient(90deg, #172C83 0%, #2563EB 50%, #60A5FA 100%)'
                  : 'linear-gradient(90deg, #007A31 0%, #00C952 50%, #34D399 100%)',
            }}
          />

          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '26px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background:
                    selectedBranch === 'branch2'
                      ? 'linear-gradient(135deg, #1E3AA8 0%, #172C83 100%)'
                      : 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow:
                    selectedBranch === 'branch2'
                      ? '0 8px 20px rgba(23, 44, 131, 0.28)'
                      : '0 8px 20px rgba(0, 184, 74, 0.28)',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      backgroundColor: selectedBranch === 'branch2' ? 'rgba(23, 44, 131, 0.1)' : 'rgba(0, 184, 74, 0.12)',
                      color: selectedBranch === 'branch2' ? '#172C83' : '#008A38',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Official Operating Guidelines
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    {currentBranch.shortName}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '1.34rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  Important Membership Terms & Timings
                </h3>
              </div>
            </div>

            {/* Quick Action Contacts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={`tel:+91${currentBranch.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  backgroundColor: selectedBranch === 'branch2' ? '#EEF2FF' : '#ECFDF3',
                  border: selectedBranch === 'branch2' ? '1.5px solid rgba(23, 44, 131, 0.3)' : '1.5px solid rgba(0, 184, 74, 0.3)',
                  color: selectedBranch === 'branch2' ? '#172C83' : '#007A31',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                <Phone size={15} />
                <span>Call Desk: {currentBranch.phone}</span>
              </a>

              <a
                href={`https://wa.me/${currentBranch.waNumber}?text=Hello%20${encodeURIComponent(currentBranch.name)},%20I%20have%20an%20inquiry%20regarding%20membership%20timings%20and%20guidelines.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#00B84A',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 184, 74, 0.25)',
                }}
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Top 3 Bento Cards: Timings & Daily Pass */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '26px',
            }}
          >
            {/* Card 1: Gym Timings */}
            <div
              style={{
                backgroundColor: selectedBranch === 'branch2' ? '#F8FAFC' : '#F8FCFA',
                border: selectedBranch === 'branch2' ? '1.5px solid rgba(23, 44, 131, 0.2)' : '1.5px solid rgba(0, 184, 74, 0.25)',
                borderRadius: '16px',
                padding: '20px 22px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: selectedBranch === 'branch2' ? '#EEF2FF' : '#ECFDF3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedBranch === 'branch2' ? '#172C83' : '#008A38',
                  flexShrink: 0,
                }}
              >
                <Clock size={20} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                  Facility Operating Hours
                </div>
                <div style={{ fontSize: '1.14rem', fontWeight: 900, color: '#0F172A', marginBottom: '2px' }}>
                  {currentBranch.gymTiming}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#008A38', fontWeight: 700 }}>
                  Open 7 Days a Week • Morning & Evening
                </div>
              </div>
            </div>

            {/* Card 2: AC Timings */}
            <div
              style={{
                backgroundColor: '#F0F9FF',
                border: '1.5px solid rgba(14, 165, 233, 0.28)',
                borderRadius: '16px',
                padding: '20px 22px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.06)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                  flexShrink: 0,
                }}
              >
                <Wind size={20} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                  Air Conditioning (AC) Schedule
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0F172A', marginBottom: '2px', lineHeight: 1.3 }}>
                  {currentBranch.acTiming}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 700 }}>
                  Active Climate-Controlled Workout Floor
                </div>
              </div>
            </div>

            {/* Card 3: Daily Pass / Trial Rate */}
            <div
              style={{
                backgroundColor: selectedBranch === 'branch2' ? '#EFF6FF' : '#F2FBF6',
                border: selectedBranch === 'branch2' ? '1.5px solid rgba(37, 99, 235, 0.3)' : '1.5px solid rgba(0, 184, 74, 0.3)',
                borderRadius: '16px',
                padding: '20px 22px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: selectedBranch === 'branch2' ? '#DBEAFE' : '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedBranch === 'branch2' ? '#1D4ED8' : '#15803D',
                  flexShrink: 0,
                }}
              >
                <Ticket size={20} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: selectedBranch === 'branch2' ? '#1D4ED8' : '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                  {selectedBranch === 'branch2' ? 'Daily Workout Pass' : 'Trial Workout Session'}
                </div>
                <div style={{ fontSize: '1.24rem', fontWeight: 900, color: '#0F172A', marginBottom: '2px' }}>
                  {selectedBranch === 'branch2' ? '₹200 / Day' : '₹500 / Session'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                  {selectedBranch === 'branch2'
                    ? 'Single-day complete guest workout pass'
                    : '1-Day complete trial pass (No free trial)'}
                </div>
              </div>
            </div>
          </div>

          {/* Modern Policy & Guideline Cards Grid */}
          <div style={{ marginBottom: '26px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              Standard Membership Guidelines & Terms
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px',
              }}
            >
              {/* Policy 1: Advance Payment */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
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
                  <CreditCard size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '3px' }}>
                    100% Advance Payment
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                    All membership fees & subscriptions must be received strictly in advance prior to workout floor access.
                  </div>
                </div>
              </div>

              {/* Policy 2: Non-Refundable & Non-Transferable */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF2F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '3px' }}>
                    Non-Refundable Policy
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                    Membership fees once paid are strictly non-refundable and non-transferable under all circumstances.
                  </div>
                </div>
              </div>

              {/* Policy 3: Single Day Pass / Trial Rule */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    flexShrink: 0,
                  }}
                >
                  <Dumbbell size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '3px' }}>
                    {selectedBranch === 'branch2' ? 'Daily Pass Access' : 'Trial Session Rule'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                    {selectedBranch === 'branch2'
                      ? 'Guest workout / 1-day pass is available at ₹200/- per person with full gym facility access.'
                      : 'The 1-day charge for a trial session is ₹500/-. Complimentary free trials are strictly not permitted.'}
                  </div>
                </div>
              </div>

              {/* Policy 4: Direct Desk Assistance */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    flexShrink: 0,
                  }}
                >
                  <PhoneCall size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '3px' }}>
                    Direct Desk Support
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                    For package inquiries, renewal guidance, or membership freeze queries, call{' '}
                    <strong style={{ color: '#0F172A' }}>{currentBranch.phone}</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inspirational Fitness Manifesto / Management Board */}
          <div
            style={{
              padding: '24px 28px',
              borderRadius: '18px',
              background:
                selectedBranch === 'branch2'
                  ? 'linear-gradient(135deg, #090E21 0%, #172C83 60%, #1E3A8A 100%)'
                  : 'linear-gradient(135deg, #051F10 0%, #006E2C 60%, #00993D 100%)',
              color: '#FFFFFF',
              boxShadow:
                selectedBranch === 'branch2'
                  ? '0 12px 30px rgba(23, 44, 131, 0.25)'
                  : '0 12px 30px rgba(0, 110, 44, 0.25)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background glowing quote watermark */}
            <div
              style={{
                position: 'absolute',
                right: '20px',
                top: '-15px',
                opacity: 0.08,
                fontSize: '120px',
                fontWeight: 900,
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              “
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1, flex: '1 1 320px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                }}
              >
                <Quote size={24} color="#00FF66" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    marginBottom: '4px',
                    letterSpacing: '0.01em',
                    lineHeight: 1.3,
                  }}
                >
                  {selectedBranch === 'branch2'
                    ? '“You Get Fit With Us...”'
                    : '“Transform Your Body. Elevate Your Mind.”'}
                </div>
                <div
                  style={{
                    fontSize: '0.96rem',
                    fontWeight: 800,
                    color: '#00FF66',
                    letterSpacing: '0.02em',
                  }}
                >
                  {selectedBranch === 'branch2'
                    ? 'Will You Start "One Day"... Or Will Today Be "DAY 1"?'
                    : 'Consistency beats intensity every single time.'}
                </div>
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                paddingLeft: '16px',
                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                {selectedBranch === 'branch2' ? '— MANAGEMENT' : '— RESPIRE EXECUTIVE'}
              </div>
              <div
                style={{
                  color: '#00FF66',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {selectedBranch === 'branch2' ? 'SINCE 2012 • 12+ YEARS' : '7TH FLOOR, R CITY MALL'}
              </div>
            </div>
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

      <style>{`
        .membership-cards-grid {
          display: grid;
          width: 100%;
          margin-bottom: 44px;
        }
        @media (min-width: 1024px) {
          .membership-cards-grid.cols-5 {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
          .membership-cards-grid.cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 20px !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .membership-cards-grid.cols-5 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
          .membership-cards-grid.cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 640px) {
          .membership-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
