import React, { useState } from 'react';
import { Layers, Play, Clock, CheckCircle2, Video, ArrowRight } from 'lucide-react';
import { useWebsiteContent } from '../context/WebsiteContentContext';

export default function Programs() {
  const [activeTab, setActiveTab] = useState('beginner');
  const { content } = useWebsiteContent();
  const programsData = content?.programs || {};

  if (programsData?.visible === false || content?.sectionVisibility?.programs === false) {
    return null;
  }

  const eyebrow = programsData.eyebrow ?? 'Structured Training Regimens';
  const title = programsData.title ?? 'WORKOUT PROGRAMS BY CATEGORY';
  const subtitle =
    programsData.subtitle ??
    'Whether taking your first steps into strength training or chasing elite athletic milestones, our progressive curriculums guide your evolution with certified expertise.';

  const programs = {
    beginner: {
      category: 'Beginner',
      subtitle: programsData.beginner?.subtitle ?? 'Foundation, Mobility & Proper Lifting Form',
      description: programsData.beginner?.description ?? 'Ideal for newcomers or those returning to fitness after a hiatus. We focus on building neuromuscular mind-muscle connection, joint stability, core resilience, and safe movement mechanics under certified trainer supervision.',
      schedule: '3-4 Days / Week (45-60 Mins)',
      focus: ['Safe Movement Mechanics', 'Compound Lift Foundations', 'Core & Mobility Conditioning', 'Metabolic Aerobic Conditioning'],
      image: programsData.beginner?.image ?? 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop',
      lectures: [
        { title: 'Foundational Squat & Deadlift Form Masterclass', duration: '18 min', trainer: 'Head Trainer Respire' },
        { title: 'Full Body Mobility & Warmup Protocol', duration: '14 min', trainer: 'Recovery Specialist' },
      ],
    },
    intermediate: {
      category: 'Intermediate',
      subtitle: programsData.intermediate?.subtitle ?? 'Hypertrophy, Strength & Progressive Overload',
      description: programsData.intermediate?.description ?? 'Structured for members with at least 6 months of training experience. We utilize scientific periodization, push-pull-legs or upper-lower splits, time under tension, and progressive overload to sculpt lean muscle and maximize power output.',
      schedule: '4-5 Days / Week (60-75 Mins)',
      focus: ['Progressive Overload Tracking', 'Hypertrophy Muscle Splits', 'Strength Plateau Breakers', 'Recovery & Nutrition Sync'],
      image: programsData.intermediate?.image ?? 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop',
      lectures: [
        { title: 'Hypertrophy Periodization & Overload Strategy', duration: '22 min', trainer: 'Strength Coach Respire' },
        { title: 'Upper-Lower Power Split Execution', duration: '20 min', trainer: 'Lead Bodybuilding Coach' },
      ],
    },
    advanced: {
      category: 'Advanced',
      subtitle: programsData.advanced?.subtitle ?? 'Elite Conditioning, Powerlifting & Athletic Output',
      description: programsData.advanced?.description ?? 'Engineered for athletes, powerlifters, and high-performance fitness enthusiasts. Features complex compound training, high-intensity functional circuits, plyometrics, and periodized deload weeks to reach the pinnacle of human capability.',
      schedule: '5-6 Days / Week (75-90 Mins)',
      focus: ['Maximal Power & 1RM Periodization', 'Athletic Conditioning & Plyometrics', 'Neurological CNS Recovery', 'Bespoke Macro Cycling'],
      image: programsData.advanced?.image ?? 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1000&auto=format&fit=crop',
      lectures: [
        { title: 'Elite Powerlifting CNS Priming & Mechanics', duration: '25 min', trainer: 'Elite Performance Director' },
        { title: 'Advanced Deload & Supercompensation Science', duration: '16 min', trainer: 'Sports Scientist' },
      ],
    },
  };

  const current = programs[activeTab];

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

  return (
    <section
      id="programs"
      className="section-padding"
      style={{
        background: 'linear-gradient(180deg, #F2FBF6 0%, #FFFFFF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div className="section-header">
          {eyebrow ? (
            <div className="section-eyebrow">
              <Layers size={14} />
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

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}
        >
          {['beginner', 'intermediate', 'advanced'].map((key) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '12px 30px',
                  borderRadius: '999px',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  background: isActive ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  border: isActive ? '1.5px solid #00B84A' : '1.5px solid rgba(15, 23, 42, 0.12)',
                  boxShadow: isActive ? '0 8px 22px rgba(0, 184, 74, 0.28)' : '0 4px 12px rgba(15, 23, 42, 0.04)',
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            );
          })}
        </div>

        {/* White Elevated Program Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid rgba(0, 184, 74, 0.18)',
            overflow: 'hidden',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'stretch',
            }}
          >
            {/* Left: Workout Image & Video Preview Overlay */}
            <div
              style={{
                position: 'relative',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '28px',
                backgroundImage: `linear-gradient(180deg, rgba(0, 130, 52, 0.16) 0%, rgba(0, 82, 33, 0.90) 85%), url(${current.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Category Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '22px',
                  left: '22px',
                  backgroundColor: '#FFFFFF',
                  color: '#007A31',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
                }}
              >
                {current.category} TIER
              </div>

              {/* Recorded Video Lectures Preview Box */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  padding: '18px 20px',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.16)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.78rem',
                    color: '#008A38',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    letterSpacing: '0.06em',
                  }}
                >
                  <Video size={16} />
                  <span>On-Demand Member Video Previews</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {current.lectures.map((lec, lIdx) => (
                    <div
                      key={lIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: '#F4FBF7',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0, 184, 74, 0.16)',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Play size={15} fill="#FFFFFF" />
                      </div>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            color: '#0F172A',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {lec.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 500 }}>
                          {lec.duration} • By {lec.trainer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Program Details */}
            <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    color: '#008A38',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {current.subtitle}
                </span>

                <h3
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    marginTop: '8px',
                    marginBottom: '16px',
                  }}
                >
                  {current.category} Program Curriculum
                </h3>

                <p
                  style={{
                    fontSize: '0.98rem',
                    color: '#475569',
                    lineHeight: 1.7,
                    marginBottom: '24px',
                  }}
                >
                  {current.description}
                </p>

                {/* Schedule badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#EEF2FF',
                    border: '1px solid rgba(23, 44, 131, 0.2)',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    marginBottom: '26px',
                  }}
                >
                  <Clock size={16} color="#172C83" />
                  <span style={{ fontSize: '0.86rem', color: '#172C83', fontWeight: 700 }}>
                    Recommended Cadence: {current.schedule}
                  </span>
                </div>

                {/* Focus areas */}
                <div style={{ marginBottom: '30px' }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '14px',
                    }}
                  >
                    Core Training Focus Areas:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                    {current.focus.map((item, fIdx) => (
                      <div
                        key={fIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.9rem',
                          color: '#0F172A',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={17} color="#00B84A" style={{ flexShrink: 0 }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', paddingTop: '24px' }}>
                <button onClick={scrollToContact} className="btn btn-primary" style={{ fontWeight: 800 }}>
                  <span>Start Your {current.category} Program</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
