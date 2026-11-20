import React, { useState, useMemo } from 'react';
import {
  Activity,
  Plus,
  Calendar,
  TrendingDown,
  TrendingUp,
  User,
  Scale,
  Ruler,
  Award,
  ChevronRight,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  saveMemberProgressToFirestore,
  deleteMemberProgressFromFirestore,
} from '../../services/firestoreService';

export default function MemberProgressTab({
  trainerProfile,
  myMembers = [],
  allProgress = [],
  showToast,
  initialSelectedMemberId = '',
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(() => {
    return initialSelectedMemberId || myMembers[0]?.id || '';
  });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [form, setForm] = useState({
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    fitnessGoals: '',
    workoutPerformance: '',
    observations: '',
  });

  // Selected Member
  const currentMember = useMemo(() => {
    return myMembers.find((m) => m.id === selectedMemberId) || myMembers[0] || null;
  }, [myMembers, selectedMemberId]);

  // Historical progress records for this member (sorted chronologically ascending for charts, descending for list)
  const memberProgressListAsc = useMemo(() => {
    if (!currentMember?.id) return [];
    return allProgress
      .filter((p) => p.memberId === currentMember.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allProgress, currentMember]);

  const memberProgressListDesc = useMemo(() => {
    return [...memberProgressListAsc].reverse();
  }, [memberProgressListAsc]);

  // Comparison: Latest vs Previous entry
  const comparison = useMemo(() => {
    if (memberProgressListAsc.length === 0) return null;
    if (memberProgressListAsc.length === 1) {
      const single = memberProgressListAsc[0];
      return {
        latest: single,
        previous: null,
        weightDiff: 0,
        waistDiff: 0,
        chestDiff: 0,
        armsDiff: 0,
      };
    }

    const latest = memberProgressListAsc[memberProgressListAsc.length - 1];
    const previous = memberProgressListAsc[memberProgressListAsc.length - 2];

    const weightDiff = (Number(latest.weight) || 0) - (Number(previous.weight) || 0);
    const waistDiff = (Number(latest.measurements?.waist || latest.waist) || 0) - (Number(previous.measurements?.waist || previous.waist) || 0);
    const chestDiff = (Number(latest.measurements?.chest || latest.chest) || 0) - (Number(previous.measurements?.chest || previous.chest) || 0);
    const armsDiff = (Number(latest.measurements?.arms || latest.arms) || 0) - (Number(previous.measurements?.arms || previous.arms) || 0);

    return {
      latest,
      previous,
      weightDiff: Math.round(weightDiff * 10) / 10,
      waistDiff: Math.round(waistDiff * 10) / 10,
      chestDiff: Math.round(chestDiff * 10) / 10,
      armsDiff: Math.round(armsDiff * 10) / 10,
    };
  }, [memberProgressListAsc]);

  // Open Add Progress Modal
  const openAddProgressModal = () => {
    setFormError('');
    setForm({
      memberId: currentMember?.id || myMembers[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      weight: comparison?.latest?.weight || currentMember?.bodyMetrics?.weight?.replace(/[^\d.]/g, '') || currentMember?.weight || '',
      height: comparison?.latest?.height || currentMember?.height || '',
      chest: comparison?.latest?.measurements?.chest || comparison?.latest?.chest || '',
      waist: comparison?.latest?.measurements?.waist || comparison?.latest?.waist || '',
      hips: comparison?.latest?.measurements?.hips || comparison?.latest?.hips || '',
      arms: comparison?.latest?.measurements?.arms || comparison?.latest?.arms || '',
      thighs: comparison?.latest?.measurements?.thighs || comparison?.latest?.thighs || '',
      fitnessGoals: comparison?.latest?.fitnessGoals || currentMember?.fitnessGoals || '',
      workoutPerformance: '',
      observations: '',
    });
    setShowAddModal(true);
  };

  // Submit new Progress Update (NEVER overwrites old progress records!)
  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!form.memberId) {
      setFormError('Please select a member.');
      return;
    }
    if (!form.weight) {
      setFormError('Current weight is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const selectedM = myMembers.find((m) => m.id === form.memberId);
      const w = Number(form.weight) || 0;
      const h = Number(form.height) || 0;
      const bmi = h > 0 ? Math.round((w / ((h / 100) * (h / 100))) * 10) / 10 : null;

      const progressPayload = {
        trainerId: trainerProfile?.id || 'trainer',
        trainerName: trainerProfile?.name || 'Coach',
        memberId: form.memberId,
        memberName: selectedM?.name || 'Client',
        date: form.date,
        weight: w,
        height: h || null,
        bmi,
        measurements: {
          chest: form.chest || null,
          waist: form.waist || null,
          hips: form.hips || null,
          arms: form.arms || null,
          thighs: form.thighs || null,
        },
        fitnessGoals: form.fitnessGoals,
        workoutPerformance: form.workoutPerformance,
        observations: form.observations,
      };

      await saveMemberProgressToFirestore(progressPayload);
      showToast(`✓ New progress record saved for ${selectedM?.name || 'client'}`);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Error saving progress update. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete historical progress entry
  const handleDeleteProgress = async (p) => {
    if (window.confirm(`Delete progress record of ${p.date}?`)) {
      try {
        await deleteMemberProgressFromFirestore(p.id);
        showToast('✓ Progress entry deleted.');
      } catch (err) {
        console.error(err);
        showToast('Error deleting entry.');
      }
    }
  };

  // Calculate SVG Line Chart coordinates for weight
  const chartCoordinates = useMemo(() => {
    if (memberProgressListAsc.length < 2) return null;
    const weights = memberProgressListAsc.map((p) => Number(p.weight) || 0).filter((w) => w > 0);
    if (weights.length < 2) return null;

    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;
    const range = maxWeight - minWeight || 1;

    const points = memberProgressListAsc.map((p, idx) => {
      const x = (idx / (memberProgressListAsc.length - 1)) * 460 + 20;
      const y = 140 - (((Number(p.weight) || minWeight) - minWeight) / range) * 110;
      return { x, y, weight: p.weight, date: p.date };
    });

    const pathString = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
    const areaString = `${pathString} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

    return { points, pathString, areaString, minWeight, maxWeight };
  }, [memberProgressListAsc]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header & Member Selection Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 22px',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Member Progress Tracking & Biometrics
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
            Track weight, body measurements, performance benchmarks, and historical adaptation curves.
          </p>
        </div>

        {/* Member Selector + Add Progress Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              Select Client:
            </span>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                outline: 'none',
              }}
            >
              {myMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.phone || 'No mobile'})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={openAddProgressModal}
            disabled={myMembers.length === 0}
            style={{
              backgroundColor: '#00B84A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 18px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: myMembers.length === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0, 184, 74, 0.3)',
            }}
          >
            <Plus size={16} />
            <span>Add Progress Update</span>
          </button>
        </div>
      </div>

      {myMembers.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '48px', border: '1.5px dashed #CBD5E1', textAlign: 'center', color: '#64748B' }}>
          <User size={40} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>No Assigned Clients</h4>
          <p style={{ fontSize: '0.84rem', margin: 0 }}>Progress tracking is available once the Gym Admin assigns members to your coach profile.</p>
        </div>
      ) : (
        <>
          {/* Comparison Cards: Current vs Previous Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Weight Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Current Weight</span>
                <Scale size={18} color="#00B84A" />
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {comparison?.latest?.weight ? `${comparison.latest.weight} kg` : (currentMember?.bodyMetrics?.weight || (currentMember?.weight ? `${currentMember.weight} kg` : '—'))}
              </div>
              {comparison?.previous && (
                <div style={{ marginTop: '8px', fontSize: '0.74rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {comparison.weightDiff < 0 ? (
                    <span style={{ color: '#008A38', backgroundColor: '#ECFDF3', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <TrendingDown size={12} /> {Math.abs(comparison.weightDiff)} kg Loss
                    </span>
                  ) : comparison.weightDiff > 0 ? (
                    <span style={{ color: '#B45309', backgroundColor: '#FFFBEB', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <TrendingUp size={12} /> +{comparison.weightDiff} kg Gain
                    </span>
                  ) : (
                    <span style={{ color: '#64748B' }}>0.0 kg (Maintained)</span>
                  )}
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>vs previous entry</span>
                </div>
              )}
            </div>

            {/* Waist Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Waist Measurement</span>
                <Ruler size={18} color="#2563EB" />
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {comparison?.latest?.measurements?.waist || comparison?.latest?.waist
                  ? `${comparison.latest.measurements?.waist || comparison.latest.waist} in`
                  : '—'}
              </div>
              {comparison?.previous && (
                <div style={{ marginTop: '8px', fontSize: '0.74rem', fontWeight: 800 }}>
                  {comparison.waistDiff !== 0 ? (
                    <span style={{ color: comparison.waistDiff < 0 ? '#008A38' : '#B45309' }}>
                      {comparison.waistDiff > 0 ? `+${comparison.waistDiff}` : comparison.waistDiff} in vs previous
                    </span>
                  ) : (
                    <span style={{ color: '#94A3B8' }}>No change</span>
                  )}
                </div>
              )}
            </div>

            {/* Chest & Arms */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Chest & Arms</span>
                <Activity size={18} color="#D97706" />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                Chest: {comparison?.latest?.measurements?.chest || comparison?.latest?.chest || '—'} in
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>
                Arms: {comparison?.latest?.measurements?.arms || comparison?.latest?.arms || '—'} in
              </div>
            </div>

            {/* Total Records Recorded */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Progress Records</span>
                <Clock size={18} color="#0F172A" />
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {memberProgressListAsc.length}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '8px' }}>
                Historical checkpoints saved
              </div>
            </div>
          </div>

          {/* Interactive Progress Chart (Weight Over Time) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color="#00B84A" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Weight Adaptation Curve for {currentMember.name}
                </h3>
              </div>
              <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                {memberProgressListAsc.length} checkpoints
              </span>
            </div>

            {chartCoordinates ? (
              <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                <svg viewBox="0 0 500 170" style={{ width: '100%', minWidth: '400px', height: '180px' }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00B84A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00B84A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline */}
                  <line x1="20" y1="140" x2="480" y2="140" stroke="#E2E8F0" strokeWidth="1.5" />
                  <line x1="20" y1="85" x2="480" y2="85" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                  <line x1="20" y1="30" x2="480" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />

                  {/* Area fill */}
                  <path d={chartCoordinates.areaString} fill="url(#chartGradient)" />

                  {/* Stroke path */}
                  <path d={chartCoordinates.pathString} fill="none" stroke="#00B84A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Point markers */}
                  {chartCoordinates.points.map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#00B84A" stroke="#FFFFFF" strokeWidth="2.5" />
                      <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F172A">
                        {pt.weight} kg
                      </text>
                      <text x={pt.x} y="162" textAnchor="middle" fontSize="9" fontWeight="600" fill="#94A3B8">
                        {pt.date.substring(5)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div style={{ padding: '36px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', color: '#64748B' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.84rem' }}>
                  At least 2 progress records are needed to plot the visual progress curve.
                </p>
                <button
                  type="button"
                  onClick={openAddProgressModal}
                  style={{ padding: '7px 14px', borderRadius: '8px', backgroundColor: '#00B84A', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  + Add Progress Checkpoint
                </button>
              </div>
            )}
          </div>

          {/* Historical Progress Records List / Timeline */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0F172A' }}>
                Previous Progress Records ({memberProgressListDesc.length})
              </div>
              <span style={{ fontSize: '0.74rem', color: '#008A38', fontWeight: 800 }}>
                • Historical logs permanently preserved
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 800, color: '#475569' }}>DATE</th>
                    <th style={{ padding: '12px 18px', fontWeight: 800, color: '#475569' }}>WEIGHT & BMI</th>
                    <th style={{ padding: '12px 18px', fontWeight: 800, color: '#475569' }}>BODY MEASUREMENTS</th>
                    <th style={{ padding: '12px 18px', fontWeight: 800, color: '#475569' }}>GOALS & BENCHMARKS</th>
                    <th style={{ padding: '12px 18px', fontWeight: 800, color: '#475569' }}>OBSERVATIONS</th>
                    <th style={{ padding: '12px 18px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {memberProgressListDesc.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                        No historical progress updates logged yet for {currentMember.name}.
                      </td>
                    </tr>
                  ) : (
                    memberProgressListDesc.map((rec) => {
                      const m = rec.measurements || {};

                      return (
                        <tr key={rec.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 18px', fontWeight: 800, color: '#0F172A' }}>
                            {rec.date}
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ fontWeight: 800, color: '#008A38' }}>{rec.weight} kg</div>
                            {rec.bmi && <div style={{ fontSize: '0.72rem', color: '#64748B' }}>BMI: {rec.bmi}</div>}
                          </td>
                          <td style={{ padding: '12px 18px', fontSize: '0.76rem', color: '#334155' }}>
                            {m.waist && <span>Waist: <strong>{m.waist}"</strong> • </span>}
                            {m.chest && <span>Chest: <strong>{m.chest}"</strong> • </span>}
                            {m.arms && <span>Arms: <strong>{m.arms}"</strong></span>}
                            {!m.waist && !m.chest && !m.arms && <span style={{ color: '#94A3B8' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 18px', maxWidth: '200px' }}>
                            {rec.fitnessGoals && <div style={{ fontWeight: 700, color: '#172C83' }}>{rec.fitnessGoals}</div>}
                            {rec.workoutPerformance && <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{rec.workoutPerformance}</div>}
                            {!rec.fitnessGoals && !rec.workoutPerformance && <span style={{ color: '#94A3B8' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 18px', maxWidth: '220px', fontSize: '0.76rem', color: '#334155' }}>
                            {rec.observations || <span style={{ color: '#94A3B8' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteProgress(rec)}
                              title="Delete Record"
                              style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Progress Record Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Add Member Progress Record
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                  Log current weight, measurements, and coaching observations. Historical logs remain preserved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitProgress} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Member Selector & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Assigned Member *
                  </label>
                  <select
                    required
                    value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none' }}
                  >
                    {myMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone || 'No phone'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Record Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Weight & Height */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Current Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 74.5"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 175"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Body Measurements (Optional) */}
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Body Circumference Measurements (Inches)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Chest</label>
                    <input
                      type="text"
                      placeholder='e.g. 40"'
                      value={form.chest}
                      onChange={(e) => setForm({ ...form, chest: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Waist</label>
                    <input
                      type="text"
                      placeholder='e.g. 32"'
                      value={form.waist}
                      onChange={(e) => setForm({ ...form, waist: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Hips</label>
                    <input
                      type="text"
                      placeholder='e.g. 38"'
                      value={form.hips}
                      onChange={(e) => setForm({ ...form, hips: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Arms / Biceps</label>
                    <input
                      type="text"
                      placeholder='e.g. 15"'
                      value={form.arms}
                      onChange={(e) => setForm({ ...form, arms: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Thighs</label>
                    <input
                      type="text"
                      placeholder='e.g. 23"'
                      value={form.thighs}
                      onChange={(e) => setForm({ ...form, thighs: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Fitness Goals & Workout Performance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Updated Fitness Goals
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reduce body fat to 14%, 10 pullups"
                    value={form.fitnessGoals}
                    onChange={(e) => setForm({ ...form, fitnessGoals: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Workout Performance Benchmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Squat 100kg x 5, 2 min plank"
                    value={form.workoutPerformance}
                    onChange={(e) => setForm({ ...form, workoutPerformance: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Progress Observations */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Progress Observations & Coach Feedback
                </label>
                <textarea
                  rows={2}
                  placeholder="Physique observations, diet compliance, stamina progress, posture improvements..."
                  value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#00B84A', color: '#FFFFFF', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 184, 74, 0.3)' }}
                >
                  {isSubmitting ? 'Saving Record...' : 'Save Progress Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
