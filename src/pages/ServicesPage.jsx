import React from 'react';
import { Dumbbell, ShieldCheck, HeartPulse, Sparkles, Flame, Users, ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Services from '../components/Services';
import FitnessTracking from '../components/FitnessTracking';

export default function ServicesPage() {
  return (
    <div style={{ paddingTop: '104px', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0F172A 60%, #064E3B 100%)',
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
            <Sparkles size={15} />
            <span>World-Class Amenities</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            ELITE FITNESS <span className="text-green">SERVICES & AMENITIES</span>
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
            From imported bio-mechanical resistance machinery and high-energy cardio theaters to rejuvenating steam baths and certified nutritionist consultations.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/membership" className="btn btn-primary">
              <span>Explore Fee Structure</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              <span>Book a Trial Day (₹500)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <Services />

      {/* Fitness & Body Composition Tracking Component */}
      <FitnessTracking />
    </div>
  );
}
