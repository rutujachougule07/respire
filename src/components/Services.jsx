import React, { useState } from 'react';
import { Dumbbell, Sparkles, Flame, Music, Heart, ArrowUpRight, Check, Waves } from 'lucide-react';
import { useWebsiteContent } from '../context/WebsiteContentContext';

export default function Services() {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const { content } = useWebsiteContent();

  const baseServices = [
    {
      id: 'pt',
      title: 'Personal Training',
      tag: '1-on-1 Dedicated Coaching',
      description: 'Customized training protocols designed for your physiology, body composition goals, and lifestyle with certified elite coaches.',
      features: ['Body assessment & posture analysis', 'Custom workout plan & periodization', 'Real-time form correction & safety', 'Nutrition & macro guidance'],
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop',
      icon: Dumbbell,
      accent: '#00B84A',
    },
    {
      id: 'massage',
      title: 'Massage',
      tag: 'Sports & Recovery Therapy',
      description: 'Professional sports massage and deep tissue therapy designed to accelerate muscular recovery, alleviate tension, and boost circulation.',
      features: ['Deep tissue & trigger point release', 'Reduces delayed muscle soreness (DOMS)', 'Improves joint range of motion', 'Restores neuromuscular balance'],
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop',
      icon: Sparkles,
      accent: '#172C83',
    },
    {
      id: 'steam',
      title: 'Steam Bath',
      tag: 'Thermal Detox & Relaxation',
      description: 'Luxury thermal steam sanctuary to flush metabolic toxins, soothe fatigued muscles, and rejuvenate skin after intense training.',
      features: ['Deep cellular metabolic detoxification', 'Cardiovascular & blood flow stimulation', 'Clears respiratory airways & skin pores', 'Promotes post-training relaxation'],
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop',
      icon: Waves,
      accent: '#00B84A',
    },
    {
      id: 'zumba',
      title: 'Zumba',
      tag: 'High-Energy Cardio Dance',
      description: 'Dynamic, infectious Latin and international dance choreography that torches calories, elevates endurance, and turns fitness into a celebration.',
      features: ['Burn 500-800 kcal per session', 'Full-body cardiovascular conditioning', 'Boosts coordination & rhythm', 'Euphoric, motivating group energy'],
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop',
      icon: Music,
      accent: '#172C83',
    },
    {
      id: 'yoga',
      title: 'Yoga',
      tag: 'Mind, Body & Flexibility',
      description: 'Holistic practice integrating Vinyasa flows, Hatha postures, and Pranayama breathwork to build lean strength, mental clarity, and mobility.',
      features: ['Deep spinal & hip mobility enhancement', 'Core stability & isometric strength', 'Pranayama stress reduction & breath control', 'Mental focus and meditative calm'],
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1000&auto=format&fit=crop',
      icon: Heart,
      accent: '#00B84A',
    },
  ];

  const services = baseServices.map((srv) => {
    const override = content?.services?.items?.find((item) => item.id === srv.id);
    return {
      ...srv,
      ...(override || {}),
      image: override?.image || srv.image,
      icon: srv.icon,
      accent: srv.accent,
    };
  });

  const scrollToContact = (serviceTitle) => {
    const el = document.getElementById('contact');
    if (el) {
      const navHeight = 104;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      const select = document.getElementById('preferredService');
      if (select) {
        select.value = serviceTitle;
      }
    }
  };

  return (
    <section
      id="services"
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
          <div className="section-eyebrow">
            <Flame size={14} />
            <span>World-Class Offerings</span>
          </div>
          <h2 className="section-title">
            OUR PREMIUM <span className="text-green">SERVICES</span>
          </h2>
          <p className="section-subtitle">
            From high-intensity personal training to restorative luxury thermal therapies, experience complete fitness and recovery under one roof at R City Mall, Sangli.
          </p>
        </div>

        {/* 5 Premium White Service Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={srv.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: isHovered
                    ? '1.5px solid #00B84A'
                    : '1.5px solid rgba(0, 184, 74, 0.14)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? '0 22px 42px rgba(0, 184, 74, 0.16)'
                    : '0 10px 28px rgba(15, 23, 42, 0.06)',
                }}
              >
                {/* Image Banner */}
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="img-cover"
                    style={{
                      transition: 'transform 0.6s ease',
                      transform: isHovered ? 'scale(1.07)' : 'scale(1)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0, 92, 37, 0.65) 100%)',
                    }}
                  />

                  {/* Icon Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} color={srv.accent} />
                  </div>

                  {/* Tag Pill */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                      padding: '5px 13px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {srv.tag}
                  </div>
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      marginBottom: '10px',
                      color: isHovered ? '#008A38' : '#0F172A',
                      transition: 'color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{srv.title}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#CBD5E1', fontFamily: 'monospace' }}>
                      0{idx + 1}
                    </span>
                  </h3>

                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: '#475569',
                      lineHeight: 1.6,
                      marginBottom: '20px',
                      flexGrow: 1,
                    }}
                  >
                    {srv.description}
                  </p>

                  {/* Features List */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '22px',
                      paddingTop: '14px',
                      borderTop: '1px solid rgba(15, 23, 42, 0.07)',
                    }}
                  >
                    {srv.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.84rem',
                          color: '#334155',
                          fontWeight: 500,
                        }}
                      >
                        <Check size={15} color="#00B84A" style={{ flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => scrollToContact(srv.title)}
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: '10px',
                      background: isHovered
                        ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)'
                        : '#F1FBF5',
                      color: isHovered ? '#FFFFFF' : '#007A31',
                      border: '1px solid rgba(0, 184, 74, 0.25)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <span>Inquire About {srv.title}</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
