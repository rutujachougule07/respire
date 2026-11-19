import React, { useState } from 'react';
import { Activity, TrendingUp, Camera, Calendar, LineChart, Sparkles, UserCheck } from 'lucide-react';

export default function FitnessTracking() {
  const [selectedMetric, setSelectedMetric] = useState('bodyFat');

  const metricsData = {
    bodyFat: {
      name: 'Body Fat Percentage',
      current: '14.2%',
      start: '22.8%',
      change: '-8.6%',
      status: 'Optimal Athletic Range',
      history: [
        { month: 'Month 1', value: 22.8 },
        { month: 'Month 2', value: 20.4 },
        { month: 'Month 3', value: 18.1 },
        { month: 'Month 4', value: 16.5 },
        { month: 'Month 5', value: 15.0 },
        { month: 'Month 6', value: 14.2 },
      ],
    },
    muscleMass: {
      name: 'Skeletal Muscle Mass',
      current: '36.8 kg',
      start: '31.2 kg',
      change: '+5.6 kg',
      status: 'Lean Hypertrophy Peak',
      history: [
        { month: 'Month 1', value: 31.2 },
        { month: 'Month 2', value: 32.5 },
        { month: 'Month 3', value: 33.9 },
        { month: 'Month 4', value: 35.1 },
        { month: 'Month 5', value: 36.0 },
        { month: 'Month 6', value: 36.8 },
      ],
    },
    bmi: {
      name: 'Body Mass Index (BMI)',
      current: '22.4',
      start: '26.8',
      change: '-4.4',
      status: 'Healthy BMI Standard',
      history: [
        { month: 'Month 1', value: 26.8 },
        { month: 'Month 2', value: 25.6 },
        { month: 'Month 3', value: 24.5 },
        { month: 'Month 4', value: 23.8 },
        { month: 'Month 5', value: 23.0 },
        { month: 'Month 6', value: 22.4 },
      ],
    },
  };

  const trackingFeatures = [
    {
      icon: Activity,
      title: 'Body Composition History',
      desc: 'In-depth tracking of Body Fat %, Skeletal Muscle, Visceral Fat, BMI, and metabolic water hydration measured consistently over time.',
      badge: 'Scientific Metrics',
    },
    {
      icon: TrendingUp,
      title: 'Fitness Progress Tracking',
      desc: 'Visualize your strength progressions, 1-Rep Max curves, cardiovascular endurance gains, and milestone streaks with intuitive graphical charts.',
      badge: 'Data-Backed Analytics',
    },
    {
      icon: Camera,
      title: 'Transformation Photos',
      desc: 'Compare visual physical progress side-by-side with private, secure milestone capture to witness real muscle definition and posture refinement.',
      badge: 'Visual Milestones',
    },
    {
      icon: Calendar,
      title: 'Workout Schedule & Timetable',
      desc: 'Synchronized weekly timetable with personal trainer slot appointments, group Zumba and Yoga schedules, and planned rest-day recovery.',
      badge: 'Automated Routine',
    },
    {
      icon: UserCheck,
      title: 'Progress Monitoring & Biometrics',
      desc: 'Seamless biometric check-in integration combined with trainer session feedback notes and WhatsApp automated achievement alerts.',
      badge: 'Trainer Supervision',
    },
  ];

  return (
    <section
      id="features"
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
          <div className="section-eyebrow">
            <LineChart size={14} />
            <span>Digital Fitness Ecosystem</span>
          </div>
          <h2 className="section-title">
            SMART FITNESS <span className="text-green">TRACKING</span>
          </h2>
          <p className="section-subtitle">
            Say goodbye to guesswork. Respire Fitness leverages structured body composition analysis, biometric integration, and milestone tracking to validate every drop of sweat.
          </p>
        </div>

        {/* 5 Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px',
            marginBottom: '50px',
          }}
        >
          {trackingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid rgba(0, 184, 74, 0.14)',
                  borderRadius: '18px',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00B84A';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 184, 74, 0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 184, 74, 0.14)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.05)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={21} color="#FFFFFF" />
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#172C83',
                      backgroundColor: '#EEF2FF',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {feat.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, flexGrow: 1 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Promotional Visualizer */}
        <div
          style={{
            background: 'linear-gradient(145deg, #F4FBF7 0%, #FFFFFF 100%)',
            border: '1.5px solid rgba(0, 184, 74, 0.25)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 18px 42px rgba(0, 148, 59, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              borderBottom: '1px solid rgba(0, 184, 74, 0.14)',
              paddingBottom: '22px',
              marginBottom: '28px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#008A38',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '6px',
                }}
              >
                <Sparkles size={15} />
                <span>Promotional Progress Showcase</span>
              </div>
              <h3 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0F172A' }}>
                Body Composition Analytics Preview
              </h3>
            </div>

            {/* Metric Selector Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'bodyFat', label: 'Body Fat %' },
                { id: 'muscleMass', label: 'Muscle Mass' },
                { id: 'bmi', label: 'BMI Trend' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMetric(tab.id)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedMetric === tab.id
                      ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)'
                      : '#FFFFFF',
                    color: selectedMetric === tab.id ? '#FFFFFF' : '#334155',
                    border: selectedMetric === tab.id
                      ? '1px solid #00B84A'
                      : '1px solid rgba(15, 23, 42, 0.12)',
                    boxShadow: selectedMetric === tab.id ? '0 6px 16px rgba(0, 184, 74, 0.25)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Stats Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
              gap: '18px',
              marginBottom: '34px',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Baseline Value
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#334155' }}>
                {metricsData[selectedMetric].start}
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                padding: '18px',
                borderRadius: '14px',
                boxShadow: '0 10px 24px rgba(0, 184, 74, 0.24)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#D1FAE5', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                Current Milestone
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF' }}>
                {metricsData[selectedMetric].current}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#EEF2FF',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid rgba(23, 44, 131, 0.18)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#172C83', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                Total Recomposition
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#172C83' }}>
                {metricsData[selectedMetric].change}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Evaluation
              </div>
              <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#008A38', marginTop: '6px' }}>
                {metricsData[selectedMetric].status}
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div>
            <div style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '14px', fontWeight: 700 }}>
              6-Month Progress Trend ({metricsData[selectedMetric].name})
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '185px',
                gap: '12px',
                paddingTop: '20px',
                borderBottom: '1.5px solid rgba(0, 184, 74, 0.18)',
                paddingBottom: '12px',
              }}
            >
              {metricsData[selectedMetric].history.map((pt, i) => {
                const values = metricsData[selectedMetric].history.map((h) => h.value);
                const min = Math.min(...values) * 0.8;
                const max = Math.max(...values) * 1.1;
                const heightPct = Math.round(((pt.value - min) / (max - min)) * 100);
                const isLast = i === metricsData[selectedMetric].history.length - 1;

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isLast ? '#008A38' : '#334155' }}>
                      {pt.value}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '46px',
                        height: `${Math.max(22, heightPct)}%`,
                        background: isLast
                          ? 'linear-gradient(180deg, #00D256 0%, #007A31 100%)'
                          : 'linear-gradient(180deg, #86EFAC 0%, #22C55E 100%)',
                        borderRadius: '8px 8px 3px 3px',
                        boxShadow: isLast ? '0 8px 18px rgba(0, 184, 74, 0.35)' : 'none',
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textAlign: 'center' }}>
                      {pt.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
