import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Membership from '../components/Membership';
import Programs from '../components/Programs';
import WhyChooseUs from '../components/WhyChooseUs';
import Contact from '../components/Contact';
import { useWebsiteContent } from '../context/WebsiteContentContext';

export default function HomePage({ plans }) {
  const { content } = useWebsiteContent();
  const visibility = content?.sectionVisibility || {};
  const customSections = content?.customSections || [];

  const isVisible = (key) => {
    if (visibility[key] === false) return false;
    if (content?.[key]?.visible === false) return false;
    return true;
  };

  return (
    <main>
      {isVisible('hero') && <Hero />}
      {isVisible('about') && <About />}
      {isVisible('services') && <Services />}
      {isVisible('membership') && <Membership plans={plans} />}
      {isVisible('programs') && <Programs />}
      {isVisible('whyUs') && <WhyChooseUs />}

      {/* Dynamic Custom Sections Added from Admin CMS */}
      {customSections && customSections.map((cs) => {
        if (cs.visible === false) return null;
        return (
          <section
            key={cs.id}
            id={cs.id}
            style={{
              padding: '80px 24px',
              backgroundColor: cs.bgColor || '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '44px' }}>
                {cs.eyebrow && (
                  <span
                    style={{
                      display: 'inline-block',
                      color: '#00B84A',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '10px',
                    }}
                  >
                    • {cs.eyebrow} •
                  </span>
                )}
                <h2
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                    fontWeight: 900,
                    color: '#0F172A',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  {cs.title}
                </h2>
                {cs.description && (
                  <p
                    style={{
                      fontSize: '0.98rem',
                      color: '#64748B',
                      maxWidth: '750px',
                      margin: '14px auto 0',
                      lineHeight: 1.6,
                    }}
                  >
                    {cs.description}
                  </p>
                )}
              </div>

              {cs.image && (
                <div style={{ marginBottom: '40px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 16px 36px rgba(0,0,0,0.06)' }}>
                  <img src={cs.image} alt={cs.title} style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }} />
                </div>
              )}

              {cs.items && cs.items.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {cs.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {item.badge && (
                        <span
                          style={{
                            alignSelf: 'flex-start',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            backgroundColor: '#ECFDF3',
                            color: '#008A38',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {item.title}
                      </h3>
                      {item.desc && (
                        <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                          {item.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {isVisible('contact') && <Contact />}
    </main>
  );
}
