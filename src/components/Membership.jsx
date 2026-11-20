import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
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
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Membership({ plans = [] }) {
  const { content } = useWebsiteContent();
  const [selectedBranch, setSelectedBranch] = useState('vishrambag');
  const [livePTRates, setLivePTRates] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'ptFeeStructure'), (snap) => {
      if (snap.exists()) {
        setLivePTRates(snap.data());
      }
    });
    return () => unsub();
  }, []);

  if (content?.membership?.visible === false || content?.sectionVisibility?.membership === false) {
    return null;
  }

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
                <div style={{ marginTop: 'auto' }}>
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
                </div>
              </div>
            );
          })}
        </div>

        {/* --- 1-ON-1 PERSONAL TRAINING (PT) FEE STRUCTURE SECTION --- */}
        {(() => {
          const ptBranchKey =
            selectedBranch === 'branch2' || selectedBranch === 'vijaynagar' ? 'branch2' : 'vishrambag';
          const defaultPtData = PERSONAL_TRAINING_RATES[ptBranchKey] || PERSONAL_TRAINING_RATES.vishrambag;
          const liveBranch = livePTRates?.[ptBranchKey];
          const rawCategories = liveBranch?.categories || defaultPtData.categories || [];
          const categories = rawCategories.map((c) => {
            const altP = Number(c.alternatePrice) || 0;
            const dayP = Number(c.dailyPrice) || 0;
            const pricing = c.pricing && c.pricing.length > 0 ? c.pricing : [
              { planName: 'Alternate Days', price: altP, priceDisplay: `₹${altP.toLocaleString('en-IN')}/-`, duration: '1 Month' },
              { planName: 'Daily Personal Training', price: dayP, priceDisplay: `₹${dayP.toLocaleString('en-IN')}/-`, duration: '1 Month' },
            ];
            return {
              ...c,
              pricing,
            };
          });
          const ptData = {
            ...defaultPtData,
            categories,
          };
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

        {/* Important Membership Terms & Timings - Cards Section (Modeled after About Pillars) */}
        {(() => {
          const isVijaynagar = selectedBranch === 'branch2' || selectedBranch === 'vijaynagar';

          // Explicit mapping for each branch strictly using official rules & details
          const termsCards = isVijaynagar
            ? [
                {
                  icon: Clock,
                  title: 'Gym Timings',
                  desc: 'Gym Timing :- 05:30AM to 10:00PM.',
                },
                {
                  icon: Wind,
                  title: 'AC Timings',
                  desc: 'Ac Timing :- 06AM to 09:30AM & 05PM to 09:00PM.',
                },
                {
                  icon: Ticket,
                  title: 'Daily Workout Pass',
                  desc: 'Daily 1 Day Membership / Workout Pass :- ₹200/-.',
                },
                {
                  icon: CreditCard,
                  title: 'Advance Payment',
                  desc: 'All fees will be received strictly in advance.',
                },
                {
                  icon: ShieldAlert,
                  title: 'Refund & Transfer Policy',
                  desc: 'Membership fees are Non-refundable & Non-transferable.',
                },
                {
                  icon: PhoneCall,
                  title: 'Desk Helpline',
                  desc: 'For more details contact 9172848777.',
                  phone: '9172848777',
                },
              ]
            : [
                {
                  icon: Clock,
                  title: 'Gym Timings',
                  desc: 'Gym Timings :- 05.30 AM to 10.00 PM.',
                },
                {
                  icon: Wind,
                  title: 'AC Timings',
                  desc: 'AC Will Be Shut Down Daily From 12PM To 4PM.',
                },
                {
                  icon: Ticket,
                  title: 'Trial Workout Charge',
                  desc: 'The One Day charge for a Trial is Rs. 500/-. There is No Free Trial.',
                },
                {
                  icon: CreditCard,
                  title: 'Advance Payment',
                  desc: 'All fees will be received strictly in advance.',
                },
                {
                  icon: ShieldAlert,
                  title: 'Refund Policy',
                  desc: 'Membership fees are Non-refundable.',
                },
                {
                  icon: Sparkles,
                  title: 'Special Pricing',
                  desc: 'Limited Time Offer.',
                },
                {
                  icon: PhoneCall,
                  title: 'Desk Helpline',
                  desc: 'For more details contact 7798001777.',
                  phone: '7798001777',
                },
              ];

          const brandGreen = '#008A38';
          const brandBlue = '#172C83';
          const accentColor = isVijaynagar ? brandBlue : brandGreen;

          return (
            <div style={{ marginBottom: '44px' }}>
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: accentColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '4px',
                    }}
                  >
                    <Info size={14} />
                    <span>{currentBranch.shortName} • Official Operating Guidelines</span>
                  </div>
                  <h3
                    style={{
                      fontSize: '1.42rem',
                      fontWeight: 900,
                      color: '#0F172A',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Important Membership Terms & Timings
                  </h3>
                </div>

                <a
                  href={`tel:+91${currentBranch.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '999px',
                    backgroundColor: isVijaynagar
                      ? 'rgba(23, 44, 131, 0.07)'
                      : 'rgba(0, 184, 74, 0.08)',
                    border: isVijaynagar
                      ? '1px solid rgba(23, 44, 131, 0.22)'
                      : '1px solid rgba(0, 184, 74, 0.22)',
                    color: accentColor,
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Phone size={14} />
                  <span>Contact: {currentBranch.phone}</span>
                </a>
              </div>

              {/* Cards Grid: Matching Image 2 (About Pillars Card Style) */}
              <div className="terms-pillars-grid">
                {termsCards.map((item, idx) => {
                  const Icon = item.icon;
                  const CardWrapper = item.phone ? 'a' : 'div';
                  const wrapperProps = item.phone
                    ? {
                        href: `tel:+91${item.phone}`,
                        style: { textDecoration: 'none' },
                      }
                    : {};

                  return (
                    <CardWrapper
                      key={idx}
                      {...wrapperProps}
                      className={`terms-pillar-card ${isVijaynagar ? 'vijaynagar' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        padding: '20px 18px',
                        background: isVijaynagar
                          ? 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)'
                          : 'linear-gradient(135deg, #F8FCFA 0%, #F1FBF5 100%)',
                        borderRadius: '16px',
                        border: isVijaynagar
                          ? '1.5px solid rgba(23, 44, 131, 0.2)'
                          : '1.5px solid rgba(0, 184, 74, 0.2)',
                        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
                        cursor: item.phone ? 'pointer' : 'default',
                        ...wrapperProps.style,
                      }}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: isVijaynagar
                            ? 'rgba(23, 44, 131, 0.12)'
                            : 'rgba(0, 184, 74, 0.12)',
                          border: isVijaynagar
                            ? '1px solid rgba(23, 44, 131, 0.25)'
                            : '1px solid rgba(0, 184, 74, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: accentColor,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.94rem',
                            fontWeight: 800,
                            color: '#0F172A',
                            marginBottom: '4px',
                            lineHeight: 1.25,
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.84rem',
                            color: '#475569',
                            lineHeight: 1.48,
                            fontWeight: 500,
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>

              {/* Management Motto Banner for Vijaynagar */}
              {isVijaynagar && currentBranch.motto && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '16px 22px',
                    background: 'linear-gradient(135deg, #090E21 0%, #172C83 100%)',
                    borderRadius: '16px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    boxShadow: '0 8px 24px rgba(23, 44, 131, 0.16)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.14)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#67E8F9',
                        flexShrink: 0,
                      }}
                    >
                      <Quote size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF' }}>
                        ❖ {currentBranch.motto.quote1}
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#38BDF8' }}>
                        ❖ {currentBranch.motto.quote2}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: 'rgba(255, 255, 255, 0.85)',
                      textTransform: 'uppercase',
                    }}
                  >
                    — {currentBranch.motto.signature} • {currentBranch.motto.since}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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

        .terms-pillars-grid {
          display: grid;
          width: 100%;
          gap: 14px;
        }
        @media (min-width: 1024px) {
          .terms-pillars-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
        }
        @media (min-width: 600px) and (max-width: 1023px) {
          .terms-pillars-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
        }
        @media (max-width: 599px) {
          .terms-pillars-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        .terms-pillar-card {
          transition: all 0.25s ease;
        }
        .terms-pillar-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 184, 74, 0.14) !important;
          border-color: rgba(0, 184, 74, 0.45) !important;
        }
        .terms-pillar-card.vijaynagar:hover {
          box-shadow: 0 10px 24px rgba(23, 44, 131, 0.16) !important;
          border-color: rgba(23, 44, 131, 0.45) !important;
        }
      `}</style>
    </section>
  );
}
