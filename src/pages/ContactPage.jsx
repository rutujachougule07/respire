import React from 'react';
import { MapPin, Phone, Clock, MessageSquare, Building2, ExternalLink } from 'lucide-react';
import Contact from '../components/Contact';

export default function ContactPage() {
  return (
    <div style={{ paddingTop: '104px', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #090B10 0%, #171E2B 60%, #004D1F 100%)',
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
            <MapPin size={15} />
            <span>2 Strategic Locations in Sangli</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            VISIT <span className="text-green">RESPIRE FITNESS</span>
          </h1>

          <p
            style={{
              fontSize: '1.18rem',
              color: '#CBD5E1',
              maxWidth: '720px',
              lineHeight: 1.65,
            }}
          >
            Conveniently situated in Sangli's two most accessible commercial hubs: R City Mall (Vishrambag) and Krishna Heights (Vijaynagar). Open daily from 5:30 AM to 10:00 PM.
          </p>
        </div>
      </section>

      {/* Main Contact Form & 2 Branch Cards */}
      <Contact />
    </div>
  );
}
