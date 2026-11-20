import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Dumbbell,
  Award,
  ChevronRight,
  X,
  FileText,
  Activity,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AssignedMembersTab({
  myMembers = [],
  mySessions = [],
  myNotes = [],
  onOpenScheduleModalWithMember,
  onOpenNoteModalWithMember,
  onOpenProgressModalWithMember,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);

  // Filter members by search query and status
  const filteredMembers = useMemo(() => {
    return myMembers.filter((m) => {
      const matchSearch =
        !searchQuery ||
        (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.phone && m.phone.includes(searchQuery)) ||
        (m.id && m.id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && m.status === 'Active') ||
        (statusFilter === 'Expired' && m.status !== 'Active');

      return matchSearch && matchStatus;
    });
  }, [myMembers, searchQuery, statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Filters Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assigned members by name, phone or ID..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
            }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
            Filter:
          </span>
          {['All', 'Active', 'Expired'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === st ? '#00B84A' : '#CBD5E1',
                backgroundColor: statusFilter === st ? '#ECFDF3' : '#FFFFFF',
                color: statusFilter === st ? '#008A38' : '#64748B',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Summary Subtext */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>
        <span>Showing {filteredMembers.length} of {myMembers.length} assigned member(s)</span>
        <span style={{ fontSize: '0.74rem', color: '#008A38' }}>• Showing only members assigned to your trainer profile</span>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px dashed #CBD5E1',
            padding: '56px 24px',
            textAlign: 'center',
            color: '#64748B',
          }}
        >
          <Users size={46} color="#CBD5E1" style={{ marginBottom: '14px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
            No Assigned Members Found
          </h4>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '0 auto', maxWidth: '440px', lineHeight: 1.5 }}>
            {myMembers.length === 0
              ? 'You do not have any members assigned to your trainer profile yet. Once the Gym Admin assigns members to you, they will appear here automatically.'
              : 'No members matched the search or filter criteria. Try clearing the search query.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '18px' }}>
          {filteredMembers.map((m) => {
            const memberSessions = mySessions.filter((s) => s.memberId === m.id);
            const memberNotes = myNotes.filter((n) => n.memberId === m.id);
            const daysRemaining = m.expiryDate
              ? Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E2E8F0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Header: Photo / Avatar + Name + Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#ECFDF3',
                      color: '#008A38',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.15rem',
                      fontWeight: 900,
                      flexShrink: 0,
                      border: '1.5px solid #A7F3D0',
                    }}
                  >
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                    ) : (
                      m.name ? m.name[0].toUpperCase() : 'M'
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      <span>{m.phone || 'No phone'}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      backgroundColor: m.status === 'Active' ? '#DCFCE7' : '#FEF2F2',
                      color: m.status === 'Active' ? '#15803D' : '#DC2626',
                    }}
                  >
                    {m.status || 'Active'}
                  </span>
                </div>

                {/* Membership & Assigned Training Information */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B' }}>Membership Plan:</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{m.planName || 'General Membership'}</span>
                  </div>
                  {m.specialTrainingLabel && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#008A38', fontWeight: 700 }}>PT Protocol:</span>
                      <span style={{ fontWeight: 800, color: '#008A38' }}>{m.specialTrainingLabel}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B' }}>Assigned Workout Level:</span>
                    <span style={{ fontWeight: 800, color: '#172C83' }}>{m.programLevel || 'Beginner / General'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B' }}>Valid Until:</span>
                    <span style={{ fontWeight: 700, color: daysRemaining > 7 ? '#0F172A' : '#DC2626' }}>
                      {m.expiryDate || 'N/A'} ({daysRemaining > 0 ? `${daysRemaining}d left` : 'Expired'})
                    </span>
                  </div>
                </div>

                {/* Key Biometrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>Weight</div>
                    <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.86rem' }}>
                      {m.bodyMetrics?.weight || (m.weight ? `${m.weight} kg` : '—')}
                    </div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>Body Fat</div>
                    <div style={{ fontWeight: 900, color: '#008A38', fontSize: '0.86rem' }}>
                      {m.bodyMetrics?.bodyFat || (m.bodyFat ? `${m.bodyFat}%` : '—')}
                    </div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>BMI</div>
                    <div style={{ fontWeight: 900, color: '#172C83', fontSize: '0.86rem' }}>
                      {m.bodyMetrics?.bmi || m.bmi || '—'}
                    </div>
                  </div>
                </div>

                {/* Enrolled Add-ons tags if present */}
                {m.addOns && m.addOns.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {m.addOns.map((ao, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          backgroundColor: '#ECFDF3',
                          color: '#008A38',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          border: '1px solid #A7F3D0',
                        }}
                      >
                        ✓ {ao}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons Row */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedMemberModal(m)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00B84A';
                      e.currentTarget.style.color = '#008A38';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.color = '#334155';
                    }}
                  >
                    <Users size={14} />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenScheduleModalWithMember(m)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      backgroundColor: '#00B84A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    <Calendar size={14} />
                    <span>Schedule</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Individual Member Details Modal (Matches Admin Panel Profile Modal Exactly) */}
      {selectedMemberModal && (
        <div
          onClick={() => setSelectedMemberModal(null)}
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
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Modal Header: Green Gradient */}
            <div
              style={{
                background: 'linear-gradient(135deg, #00C952 0%, #008A37 65%, #055E29 100%)',
                padding: '22px 24px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  {selectedMemberModal.name ? selectedMemberModal.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>{selectedMemberModal.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#D1FAE5', fontWeight: 600 }}>
                    {selectedMemberModal.id} • {selectedMemberModal.gender || 'Male'}, {selectedMemberModal.age || 25} yrs • {selectedMemberModal.status || 'Active'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Phone & Email Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={12} color="#00B84A" /> Phone
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>{selectedMemberModal.phone || '—'}</div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={12} color="#00B84A" /> Email
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginTop: '3px', wordBreak: 'break-all' }}>{selectedMemberModal.email || '—'}</div>
                </div>
              </div>

              {/* Active Plan Card */}
              <div style={{ backgroundColor: '#F4FBF7', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(0,184,74,0.22)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#008A38', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={14} /> Active Plan
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#172C83' }}>{selectedMemberModal.program || selectedMemberModal.programLevel || 'Intermediate'} Tier</span>
                </div>
                <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
                  {selectedMemberModal.planName || selectedMemberModal.plan || '1 Month Membership'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} /> Joined: {selectedMemberModal.joinDate || '2026-11-25'}
                  </span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>Expires: {selectedMemberModal.expiryDate || '2026-12-25'}</span>
                </div>
              </div>

              {/* Assigned Trainer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#EEF2FF' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172C83', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <Dumbbell size={15} /> Assigned Trainer
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                  {selectedMemberModal.assignedTrainer || selectedMemberModal.trainerName || 'sibaan'}
                </span>
              </div>

              {/* Special Training / Personal Training (PT) Amber Banner */}
              {selectedMemberModal.specialTraining && selectedMemberModal.specialTraining !== 'none' && (
                <div style={{ backgroundColor: '#FEF3C7', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: '3px' }}>
                    ⚡ Special Training (Personal Training)
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#78350F' }}>
                    {selectedMemberModal.specialTrainingLabel || selectedMemberModal.specialTraining}
                  </div>
                </div>
              )}

              {/* Body Composition Metrics */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={13} color="#00B84A" /> Body Composition Metrics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>WEIGHT</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>
                      {selectedMemberModal.bodyMetrics?.weight || (selectedMemberModal.weight ? `${selectedMemberModal.weight} kg` : '—')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>BODY FAT</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#008A38' }}>
                      {selectedMemberModal.bodyMetrics?.bodyFat || (selectedMemberModal.bodyFat ? `${selectedMemberModal.bodyFat}%` : '—')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>BMI</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#172C83' }}>
                      {selectedMemberModal.bodyMetrics?.bmi || selectedMemberModal.bmi || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Add-on Services */}
              {selectedMemberModal.addOns && selectedMemberModal.addOns.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Enrolled Add-on Services
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedMemberModal.addOns.map((ao, idx) => (
                      <span key={idx} style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#ECFDF3', color: '#008A38', fontSize: '0.76rem', fontWeight: 700 }}>
                        {ao}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Profile Button */}
              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  backgroundColor: '#00B84A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 14px rgba(0, 184, 74, 0.35)',
                  transition: 'background 0.15s ease',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#009E3F'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#00B84A'; }}
              >
                CLOSE PROFILE
              </button>

              {/* Trainer Action Shortcuts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMemberModal;
                    setSelectedMemberModal(null);
                    onOpenScheduleModalWithMember(m);
                  }}
                  style={{
                    padding: '8px',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Calendar size={13} color="#008A38" />
                  <span>Schedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMemberModal;
                    setSelectedMemberModal(null);
                    onOpenNoteModalWithMember(m);
                  }}
                  style={{
                    padding: '8px',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <FileText size={13} color="#008A38" />
                  <span>Log Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMemberModal;
                    setSelectedMemberModal(null);
                    onOpenProgressModalWithMember(m);
                  }}
                  style={{
                    padding: '8px',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Activity size={13} color="#008A38" />
                  <span>Progress</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
