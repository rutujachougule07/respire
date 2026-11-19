import React from 'react';
import { Dumbbell, Target, Flame, Activity, Zap, ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Programs from '../components/Programs';
import FitnessTracking from '../components/FitnessTracking';

export default function ProgramsPage() {
  return (
    <div style={{ paddingTop: '104px', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #090B10 0%, #151A24 60%, #005F27 100%)',
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
            <Target size={15} />
            <span>Targeted Fitness Coaching</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            RESULTS-DRIVEN <span className="text-green">TRAINING PROGRAMS</span>
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
            Customized sports science programs designed for real physiological progress — from beginner body transformations to competitive bodybuilding and athletic conditioning.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">
              <span>Start Your Transformation</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/membership" className="btn btn-secondary">
              <span>View Pricing Plans</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Programs Component */}
      <Programs />

      {/* Fitness Tracking Component */}
      <FitnessTracking />
    </div>
  );
}
