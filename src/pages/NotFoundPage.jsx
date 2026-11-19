import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Dumbbell } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 20px 80px',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 184, 74, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#008A38',
          marginBottom: '20px',
        }}
      >
        <Dumbbell size={36} />
      </div>

      <div
        style={{
          fontSize: '4.5rem',
          fontWeight: 900,
          lineHeight: 1,
          color: '#008A38',
          marginBottom: '10px',
        }}
      >
        404
      </div>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>
        Page Not Found
      </h1>

      <p style={{ color: '#64748B', maxWidth: '440px', lineHeight: 1.6, marginBottom: '28px' }}>
        The fitness page or resource you are looking for does not exist or may have been relocated.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          <span>Back to Home</span>
        </Link>
        <Link to="/membership" className="btn btn-secondary">
          <span>View Membership Plans</span>
        </Link>
      </div>
    </div>
  );
}
