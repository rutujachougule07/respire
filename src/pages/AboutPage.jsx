import React from 'react';
import { Building2, ShieldCheck, Award, Users, CheckCircle2, MapPin, ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import About from '../components/About';
import WhyChooseUs from '../components/WhyChooseUs';

export default function AboutPage() {
  return (
    <div style={{ paddingTop: '104px', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #04080F 0%, #0B192C 60%, #004D1F 100%)',
          color: '#FFFFFF',
          padding: '80px 0 60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
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
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            <Building2 size={15} />
            <span>A Mahabal Group Venture</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            ABOUT <span className="text-green">RESPIRE FITNESS</span>
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
            Sangli's premier luxury fitness institution, delivering world-class sports science, Olympic-grade equipment, and certified recovery across Vishrambag & Vijaynagar.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/membership" className="btn btn-primary">
              <span>View Membership Plans</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              <span>Visit Our 2 Branches</span>
              <MapPin size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main About Component */}
      <About />

      {/* Why Choose Us & Credibility Section */}
      <WhyChooseUs />

      {/* 2 Official Branches Callout Banner */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '60px 0', borderTop: '1px solid #E2E8F0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '14px', color: '#0F172A' }}>
            READY TO BEGIN YOUR JOURNEY?
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Experience the difference of a luxury gym backed by the Mahabal Group. Connect with our certified personal trainers today.
          </p>
          <div style={{ display: 'inline-flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="tel:+917798001777" className="btn btn-primary">
              <Phone size={16} />
              <span>Call Vishrambag (7798001777)</span>
            </a>
            <a href="tel:+919172848777" className="btn btn-secondary" style={{ backgroundColor: '#172C83', color: '#FFFFFF', borderColor: '#172C83' }}>
              <Phone size={16} />
              <span>Call Vijaynagar (9172848777)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
