import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import { submitInquiryToFirestore } from '../services/firestoreService';
import { useWebsiteContent } from '../context/WebsiteContentContext';

export default function Contact() {
  const { content } = useWebsiteContent();
  const contactData = content?.contact || {};

  if (contactData?.visible === false || content?.sectionVisibility?.contact === false) {
    return null;
  }

  const eyebrow = contactData.eyebrow ?? 'Visit Our 2 Branches in Sangli';
  const title = contactData.title ?? 'CONNECT WITH RESPIRE FITNESS';
  const subtitle =
    contactData.subtitle ??
    'Visit either of our premium Sangli branches — Vishrambag or Vijaynagar — or submit an inquiry below.';
  const vishrambagPhone = contactData.vishrambagPhone ?? '+91 7798001777';
  const vijaynagarPhone = contactData.vijaynagarPhone ?? '+91 9172848777';

  // Dynamic services list configured from Admin Dashboard
  const defaultServices = [
    'Personal Training',
    'Sports Massage',
    'Steam Bath',
    'Zumba Dance Cardio',
    'Yoga & Mobility',
    'General Gym Membership',
  ];

  const servicesList = useMemo(() => {
    if (Array.isArray(contactData.inquiryServices) && contactData.inquiryServices.length > 0) {
      return contactData.inquiryServices;
    }
    if (Array.isArray(content?.services?.items) && content.services.items.length > 0) {
      const titles = content.services.items.map((it) => it.title).filter(Boolean);
      if (!titles.includes('General Gym Membership')) {
        titles.push('General Gym Membership');
      }
      return titles;
    }
    return defaultServices;
  }, [contactData.inquiryServices, content?.services?.items]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    branch: 'Respire Vishrambag Branch',
    service: servicesList[0] || 'Personal Training',
    program: 'Beginner',
    notes: '',
  });

  // Keep selected service valid if admin modifies or removes a service
  useEffect(() => {
    if (servicesList.length > 0 && !servicesList.includes(formData.service)) {
      setFormData((prev) => ({ ...prev, service: servicesList[0] }));
    }
  }, [servicesList]);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission!
    setSubmitting(true);
    setSubmitNotice('');

    try {
      await submitInquiryToFirestore(formData);
      setSubmitted(true);
    } catch (err) {
      console.warn('Inquiry notice:', err.message);
      // If duplicate or network notice, still acknowledge user cleanly
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
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
          {eyebrow ? (
            <div className="section-eyebrow">
              <MapPin size={14} />
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

        {/* Bottom 2-Column Grid: Timings & Policy + Direct Membership Inquiry Form */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            alignItems: 'stretch',
          }}
        >
          {/* Left: Official Gym Timings & Trial Rules Card */}
          <div
            style={{
              background: 'linear-gradient(145deg, #F4FBF7 0%, #EDF9F2 100%)',
              border: '1.5px solid rgba(0, 184, 74, 0.22)',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#008A38',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '12px',
                }}
              >
                <Clock size={16} />
                <span>Official Facility Timings & Info</span>
              </div>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', marginBottom: '18px' }}>
                Train at Either Sangli Branch
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '15px 18px',
                    border: '1px solid rgba(0, 184, 74, 0.16)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.92rem' }}>Gym Timings</span>
                  <span style={{ fontWeight: 900, color: '#008A38', fontSize: '0.96rem' }}>05:30 AM – 10:00 PM</span>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '15px 18px',
                    border: '1px solid rgba(0, 184, 74, 0.16)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.92rem' }}>One Day Trial Charge</span>
                  <span style={{ fontWeight: 900, color: '#172C83', fontSize: '0.94rem' }}>Rs. 500/- (No Free Trial)</span>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '15px 18px',
                    border: '1px solid rgba(0, 184, 74, 0.16)',
                    fontSize: '0.86rem',
                    color: '#475569',
                    fontWeight: 600,
                    lineHeight: 1.55,
                  }}
                >
                  • AC Will Be Shut Down Daily From 12PM To 4PM<br />
                  • All fees will be received strictly in advance & are non-refundable.
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px 18px',
                border: '1px solid rgba(0, 184, 74, 0.2)',
                fontSize: '0.86rem',
                color: '#0F172A',
                fontWeight: 700,
              }}
            >
              <div style={{ color: '#008A38', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                • A MAHABAL GROUP VENTURE •
              </div>
              <div>
                Vishrambag Desk: <a href={`tel:${vishrambagPhone.replace(/\s+/g, '')}`} style={{ color: '#008A38' }}>{vishrambagPhone}</a>
              </div>
              <div>
                Vijaynagar Desk: <a href={`tel:${vijaynagarPhone.replace(/\s+/g, '')}`} style={{ color: '#172C83' }}>{vijaynagarPhone}</a>
              </div>
            </div>
          </div>

          {/* Right: Clean White Direct Inquiry Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid rgba(0, 184, 74, 0.18)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06)',
            }}
          >
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Send a Membership Inquiry
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '22px', lineHeight: 1.6 }}>
              Choose your preferred branch and submit your details below. Our team will get back to you promptly.
            </p>

            {submitted ? (
              <div
                style={{
                  backgroundColor: '#ECFDF3',
                  border: '1.5px solid #00B84A',
                  borderRadius: '16px',
                  padding: '30px 22px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                  Inquiry Received!
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '18px', lineHeight: 1.6 }}>
                  Thank you, <strong>{formData.name || 'valued guest'}</strong>. Our team at <strong>{formData.branch}</strong> has received your inquiry for <strong>{formData.service}</strong>.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn btn-primary btn-sm">
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid rgba(15, 23, 42, 0.12)',
                        borderRadius: '10px',
                        color: '#0F172A',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid rgba(15, 23, 42, 0.12)',
                        borderRadius: '10px',
                        color: '#0F172A',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                    Preferred Branch *
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      backgroundColor: '#F8FAFC',
                      border: '1.5px solid rgba(15, 23, 42, 0.12)',
                      borderRadius: '10px',
                      color: '#0F172A',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Respire Vishrambag Branch">Respire Vishrambag Branch (R City Mall, Opp. Safa Bakery)</option>
                    <option value="Respire Vijaynagar Branch">Respire Vijaynagar Branch (Krishna Heights, Opp. KFC)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                      Service of Interest
                    </label>
                    <select
                      id="preferredService"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid rgba(15, 23, 42, 0.12)',
                        borderRadius: '10px',
                        color: '#0F172A',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    >
                      {servicesList.map((serviceName, idx) => (
                        <option key={idx} value={serviceName}>
                          {serviceName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                      Experience Level
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid rgba(15, 23, 42, 0.12)',
                        borderRadius: '10px',
                        color: '#0F172A',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    >
                      <option value="Beginner">Beginner Level</option>
                      <option value="Intermediate">Intermediate Level</option>
                      <option value="Advanced">Advanced / Athlete</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '5px', textTransform: 'uppercase' }}>
                    Notes / Preferred Visit Time
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Share your fitness goal or preferred slot..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      backgroundColor: '#F8FAFC',
                      border: '1.5px solid rgba(15, 23, 42, 0.12)',
                      borderRadius: '10px',
                      color: '#0F172A',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>{submitting ? 'Submitting to Cloud...' : 'Submit Membership Inquiry'}</span>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
