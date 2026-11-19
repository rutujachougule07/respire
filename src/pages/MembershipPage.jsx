import React from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Clock, AlertTriangle, ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Membership from '../components/Membership';
import { OFFICIAL_FEE_RULES } from '../components/admin/initialData';

export default function MembershipPage({ plans }) {
  return (
    <div style={{ paddingTop: '104px', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #090A0F 0%, #171923 60%, #005A24 100%)',
          color: '#FFFFFF',
          padding: '80px 0 60px',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 201, 82, 0.18)',
              border: '1px solid rgba(0, 201, 82, 0.4)',
              color: '#00D256',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            <CreditCard size={15} />
            <span>Official Fee Structure</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            TRANSPARENT <span className="text-green">MEMBERSHIP TIERS</span>
          </h1>

          <p
            style={{
              fontSize: '1.18rem',
              color: '#CBD5E1',
              maxWidth: '720px',
              lineHeight: 1.65,
              marginBottom: '32px',
            }}
          >
            Simple, honest pricing backed by Mahabal Group. All plans include full gym floor access, biometric check-in, luxury steam bath privileges, and continuous fitness coaching.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">
              <span>Join Today</span>
              <ArrowRight size={16} />
            </Link>
            <a href="tel:+917798001777" className="btn btn-secondary">
              <Phone size={16} />
              <span>Vishrambag: 7798001777</span>
            </a>
            <a href="tel:+919172848777" className="btn btn-secondary">
              <Phone size={16} />
              <span>Vijaynagar: 9172848777</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Membership Plans Grid */}
      <Membership plans={plans} />

      {/* Official Rules & Policies Card */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '60px 0', borderTop: '1px solid #E2E8F0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 184, 74, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#008A38',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A' }}>
                  Official Respire Rules & Guidelines
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  A Mahabal Group Venture • Operating Policy
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {OFFICIAL_FEE_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.88rem',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={16} color="#00B84A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
