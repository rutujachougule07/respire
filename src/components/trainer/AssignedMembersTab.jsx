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
                  <div style={{ padding: '8px', backgroundColor: '#F1F5F9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>Weight</div>
                    <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.86rem' }}>{m.weight ? `${m.weight} kg` : '—'}</div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F1F5F9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>Height</div>
                    <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.86rem' }}>{m.height ? `${m.height} cm` : '—'}</div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F1F5F9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>Sessions Logged</div>
                    <div style={{ fontWeight: 900, color: '#008A38', fontSize: '0.86rem' }}>{memberSessions.length}</div>
                  </div>
                </div>

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
                    <span>View Details</span>
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

      {/* Individual Member Details Modal */}
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
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: '1.5px solid #E2E8F0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    border: '1.5px solid #A7F3D0',
                  }}
                >
                  {selectedMemberModal.name ? selectedMemberModal.name[0].toUpperCase() : 'M'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    {selectedMemberModal.name}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Member ID: {selectedMemberModal.id}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Status and Branch */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontWeight: 800, color: selectedMemberModal.status === 'Active' ? '#008A38' : '#DC2626', fontSize: '0.9rem' }}>
                    {selectedMemberModal.status || 'Active'}
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Branch Location</div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
                    {selectedMemberModal.branchId === 'branch2' ? 'Vijaynagar Branch' : 'Vishrambag Branch'}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Contact Information
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color="#008A38" />
                    <span><strong>Phone:</strong> {selectedMemberModal.phone || 'N/A'}</span>
                  </div>
                  {selectedMemberModal.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="#008A38" />
                      <span><strong>Email:</strong> {selectedMemberModal.email}</span>
                    </div>
                  )}
                  {selectedMemberModal.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color="#008A38" />
                      <span><strong>Address:</strong> {selectedMemberModal.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Workout & Training Program Information */}
              <div style={{ padding: '14px', backgroundColor: '#ECFDF3', borderRadius: '12px', border: '1.5px solid #A7F3D0' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#008A38', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Assigned Workout & Coaching Plan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                  <div><strong>Plan Title:</strong> {selectedMemberModal.planName || 'General Membership'}</div>
                  {selectedMemberModal.specialTrainingLabel && (
                    <div><strong>Special PT Track:</strong> {selectedMemberModal.specialTrainingLabel}</div>
                  )}
                  <div><strong>Curriculum Level:</strong> {selectedMemberModal.programLevel || 'Beginner / General Fitness'}</div>
                  {selectedMemberModal.fitnessGoals && (
                    <div><strong>Target Goals:</strong> {selectedMemberModal.fitnessGoals}</div>
                  )}
                </div>
              </div>

              {/* Physical Biometrics */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Recorded Physical Measurements
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Weight</div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>{selectedMemberModal.weight ? `${selectedMemberModal.weight} kg` : '—'}</div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Height</div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>{selectedMemberModal.height ? `${selectedMemberModal.height} cm` : '—'}</div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>BMI</div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>{selectedMemberModal.bmi || '—'}</div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Body Fat %</div>
                    <div style={{ fontWeight: 800, color: '#008A38', fontSize: '0.88rem' }}>{selectedMemberModal.bodyFat ? `${selectedMemberModal.bodyFat}%` : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Modal */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMemberModal;
                    setSelectedMemberModal(null);
                    onOpenScheduleModalWithMember(m);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#00B84A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Calendar size={14} />
                  <span>Book Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMemberModal;
                    setSelectedMemberModal(null);
                    onOpenNoteModalWithMember(m);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                    border: '1.5px solid #A7F3D0',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <FileText size={14} />
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
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1.5px solid #BFDBFE',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Activity size={14} />
                  <span>Update Progress</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
