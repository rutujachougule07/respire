import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  User,
  Dumbbell,
  FileText,
  CalendarDays,
} from 'lucide-react';
import {
  saveTrainerSessionToFirestore,
  updateTrainerSessionStatusInFirestore,
  deleteTrainerSessionFromFirestore,
} from '../../services/firestoreService';

const WORKOUT_TYPES = [
  'Strength & Hypertrophy',
  'Personal Training (1-on-1)',
  'Cardio & HIIT Protocol',
  'Functional Fitness',
  'Core & Posture Conditioning',
  'Mobility & Flexibility',
  'Weight Loss & Conditioning',
  'Rehabilitation & Recovery',
];

export const DURATION_OPTIONS = ['1 Hour', '2 Hours', '3 Hours', '4 Hours'];

export const normalizeDuration = (dur) => {
  if (!dur) return '1 Hour';
  const lower = String(dur).toLowerCase().trim();
  if (lower === '60 mins' || lower === '60 min' || lower === '1 hour' || lower === '1 hr' || lower === '1 hours') return '1 Hour';
  if (lower === '120 mins' || lower === '120 min' || lower === '2 hours' || lower === '2 hrs' || lower === '2 hour') return '2 Hours';
  if (lower === '180 mins' || lower === '180 min' || lower === '3 hours' || lower === '3 hrs' || lower === '3 hour') return '3 Hours';
  if (lower === '240 mins' || lower === '240 min' || lower === '4 hours' || lower === '4 hrs' || lower === '4 hour') return '4 Hours';
  if (lower === '30 mins' || lower === '45 mins' || lower === '90 mins') return '1 Hour';
  return dur;
};

const STANDARD_TIME_SLOTS = [
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
];

export default function SessionScheduleTab({
  trainerProfile,
  myMembers = [],
  mySessions = [],
  showToast,
  onOpenNoteModalForSession,
}) {
  // View mode: 'day' | 'week' | 'month' | 'list'
  const [viewMode, setViewMode] = useState('list');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00 AM',
    type: 'Strength & Hypertrophy',
    duration: '1 Hour',
    status: 'Scheduled',
    notes: '',
  });

  // Open modal for new session
  const openNewSessionModal = (prefill = {}) => {
    setEditingSession(null);
    setFormError('');
    setForm({
      memberId: prefill.memberId || myMembers[0]?.id || '',
      date: prefill.date || selectedDate || new Date().toISOString().split('T')[0],
      time: prefill.time || '08:00 AM',
      type: 'Strength & Hypertrophy',
      duration: '1 Hour',
      status: 'Scheduled',
      notes: '',
    });
    setShowModal(true);
  };

  // Open modal to edit / reschedule session
  const openEditModal = (session) => {
    setEditingSession(session);
    setFormError('');
    setForm({
      memberId: session.memberId,
      date: session.date,
      time: session.time,
      type: session.type || 'Strength & Hypertrophy',
      duration: normalizeDuration(session.duration),
      status: session.status || 'Scheduled',
      notes: session.notes || '',
    });
    setShowModal(true);
  };

  // Handle Form Submit with Strict Duplicate Prevention
  const handleSubmitSession = async (e) => {
    e.preventDefault();
    if (!form.memberId) {
      setFormError('Please select an assigned member.');
      return;
    }
    if (!form.date || !form.time) {
      setFormError('Please select both date and time slot.');
      return;
    }

    // DUPLICATE PREVENTION:
    // Check if trainer already has an active session on this date & time (excluding current session when editing)
    const duplicate = mySessions.find((s) => {
      const isDifferentSession = editingSession ? s.id !== editingSession.id : true;
      const isSameDateTime = s.date === form.date && s.time === form.time;
      const isNotCancelled = s.status !== 'Cancelled';
      return isDifferentSession && isSameDateTime && isNotCancelled;
    });

    if (duplicate) {
      setFormError(
        `Duplicate Timing Conflict: You already have a session booked with "${duplicate.memberName || 'a member'}" at ${form.time} on ${form.date}. Please select another time slot.`
      );
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const selectedMember = myMembers.find((m) => m.id === form.memberId);
      const sessionPayload = {
        id: editingSession ? editingSession.id : undefined,
        trainerId: trainerProfile?.id || 'trainer',
        trainerName: trainerProfile?.name || 'Coach',
        memberId: form.memberId,
        memberName: selectedMember?.name || 'Client',
        memberPhone: selectedMember?.phone || '',
        date: form.date,
        time: form.time,
        type: form.type,
        duration: form.duration,
        status: form.status,
        notes: form.notes,
      };

      await saveTrainerSessionToFirestore(sessionPayload);
      showToast(
        editingSession
          ? `✓ Session rescheduled with ${sessionPayload.memberName}`
          : `✓ Workout session scheduled for ${sessionPayload.memberName} on ${sessionPayload.date}`
      );
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Error saving session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Change (Completed or Cancelled)
  const handleUpdateStatus = async (sessionId, newStatus, memberName) => {
    try {
      await updateTrainerSessionStatusInFirestore(sessionId, newStatus);
      showToast(`✓ Session with ${memberName || 'member'} marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      showToast('Error updating session status.');
    }
  };

  // Delete Session
  const handleDeleteSession = async (session) => {
    if (window.confirm(`Are you sure you want to delete session for ${session.memberName} on ${session.date}?`)) {
      try {
        await deleteTrainerSessionFromFirestore(session.id);
        showToast('✓ Session deleted successfully.');
      } catch (err) {
        console.error(err);
        showToast('Error deleting session.');
      }
    }
  };

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return mySessions.filter((s) => {
      if (statusFilter === 'All') return true;
      return s.status === statusFilter;
    });
  }, [mySessions, statusFilter]);

  // Day View Sessions
  const daySessions = useMemo(() => {
    return mySessions.filter((s) => s.date === selectedDate);
  }, [mySessions, selectedDate]);

  // Week View Calculations
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const firstDay = curr.getDate() - curr.getDay() + 1; // Monday start
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(curr.setDate(firstDay + i));
      days.push(nextDate.toISOString().split('T')[0]);
    }
    return days;
  }, [selectedDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Bar */}
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
        {/* Schedule View Toggles: Day, Week, Month, List */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
          {[
            { id: 'list', label: 'All Sessions' },
            { id: 'day', label: 'Daily' },
            { id: 'week', label: 'Weekly' },
            { id: 'month', label: 'Monthly' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setViewMode(mode.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === mode.id ? '#00B84A' : 'transparent',
                color: viewMode === mode.id ? '#FFFFFF' : '#475569',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === st ? '#00B84A' : '#CBD5E1',
                backgroundColor: statusFilter === st ? '#ECFDF3' : '#FFFFFF',
                color: statusFilter === st ? '#008A38' : '#64748B',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Create Session Button */}
        <button
          type="button"
          onClick={() => openNewSessionModal()}
          style={{
            backgroundColor: '#00B84A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 18px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0, 184, 74, 0.3)',
          }}
        >
          <Plus size={16} />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* VIEW 1: ALL SESSIONS LIST VIEW                                       */}
      {/* ==================================================================== */}
      {viewMode === 'list' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>MEMBER</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>DATE & TIME</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>WORKOUT TYPE</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>DURATION</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>STATUS</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                      <Calendar size={36} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem' }}>No Sessions Found</div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Click "Schedule New Session" to plan workout sessions.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>{session.memberName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{session.memberPhone || 'No phone'}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{session.date}</div>
                        <div style={{ fontSize: '0.74rem', color: '#008A38', fontWeight: 800 }}>{session.time}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: 700, color: '#334155' }}>{session.type}</span>
                        {session.notes && (
                          <div style={{ fontSize: '0.7rem', color: '#64748B', maxWidth: '200px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {session.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>{normalizeDuration(session.duration)}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            backgroundColor:
                              session.status === 'Completed'
                                ? '#DCFCE7'
                                : session.status === 'Cancelled'
                                ? '#FEF2F2'
                                : '#EFF6FF',
                            color:
                              session.status === 'Completed'
                                ? '#15803D'
                                : session.status === 'Cancelled'
                                ? '#DC2626'
                                : '#1D4ED8',
                          }}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {session.status === 'Scheduled' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(session.id, 'Completed', session.memberName)}
                                title="Mark Completed"
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  backgroundColor: '#DCFCE7',
                                  color: '#15803D',
                                  border: '1px solid #A7F3D0',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                Complete ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(session.id, 'Cancelled', session.memberName)}
                                title="Cancel Session"
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FECACA',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(session)}
                            title="Reschedule / Edit"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSession(session)}
                            title="Delete"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FCA5A5',
                              color: '#DC2626',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 2: DAILY SCHEDULE                                               */}
      {/* ==================================================================== */}
      {viewMode === 'day' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Day Navigation Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '12px 20px',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0F172A' }}>
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <button
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #00B84A', backgroundColor: '#ECFDF3', color: '#008A38', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Today
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Daily Slots */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '20px' }}>
            {daySessions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                <Clock size={36} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>No sessions for this date</div>
                <button
                  type="button"
                  onClick={() => openNewSessionModal({ date: selectedDate })}
                  style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#00B84A', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  + Add Session for This Day
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {daySessions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: s.status === 'Completed' ? '#F4FBF7' : '#F8FAFC',
                      border: s.status === 'Completed' ? '1.5px solid #A7F3D0' : '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#0F172A',
                          color: '#00D256',
                          fontWeight: 900,
                          fontSize: '0.88rem',
                          textAlign: 'center',
                        }}
                      >
                        {s.time}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>{s.memberName}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                          {s.type} • {normalizeDuration(s.duration)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: s.status === 'Completed' ? '#DCFCE7' : s.status === 'Cancelled' ? '#FEF2F2' : '#EFF6FF',
                          color: s.status === 'Completed' ? '#15803D' : s.status === 'Cancelled' ? '#DC2626' : '#1D4ED8',
                        }}
                      >
                        {s.status}
                      </span>
                      {s.status === 'Scheduled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(s.id, 'Completed', s.memberName)}
                          style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#008A38', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer' }}
                        >
                          Complete ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 3: WEEKLY SCHEDULE                                              */}
      {/* ==================================================================== */}
      {viewMode === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {weekDays.map((dStr) => {
            const dateObj = new Date(dStr);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.getDate();
            const isToday = dStr === new Date().toISOString().split('T')[0];
            const sessionsForDay = mySessions.filter((s) => s.date === dStr);

            return (
              <div
                key={dStr}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: isToday ? '2px solid #00B84A' : '1.5px solid #E2E8F0',
                  padding: '14px',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: isToday ? '#008A38' : '#64748B' }}>{dayName}</span>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: isToday ? '#008A38' : '#0F172A' }}>{dayNum}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openNewSessionModal({ date: dStr })}
                    title="Add session on this date"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: '#ECFDF3',
                      color: '#008A38',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  {sessionsForDay.length === 0 ? (
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                      No sessions
                    </div>
                  ) : (
                    sessionsForDay.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => openEditModal(s)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: s.status === 'Completed' ? '#F0FDF4' : '#F8FAFC',
                          border: s.status === 'Completed' ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{s.time}</div>
                        <div style={{ fontWeight: 700, color: '#008A38' }}>{s.memberName}</div>
                        <div style={{ color: '#64748B', fontSize: '0.68rem' }}>{s.type}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 4: MONTHLY SCHEDULE                                             */}
      {/* ==================================================================== */}
      {viewMode === 'month' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Monthly Calendar Overview
            </h3>
            <div style={{ fontSize: '0.84rem', color: '#64748B' }}>
              Total {mySessions.length} sessions logged
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', padding: '6px 0', textTransform: 'uppercase' }}>
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const datePad = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const yearMonth = selectedDate.substring(0, 7);
              const thisDate = `${yearMonth}-${datePad}`;
              const count = mySessions.filter((s) => s.date === thisDate).length;
              const isToday = thisDate === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setSelectedDate(thisDate);
                    setViewMode('day');
                  }}
                  style={{
                    minHeight: '70px',
                    padding: '8px',
                    borderRadius: '10px',
                    border: isToday ? '2px solid #00B84A' : '1px solid #E2E8F0',
                    backgroundColor: isToday ? '#F0FDF4' : count > 0 ? '#F8FAFC' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.84rem', color: isToday ? '#008A38' : '#0F172A' }}>{dayNum}</span>
                  {count > 0 && (
                    <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '999px', backgroundColor: '#00B84A', color: '#FFFFFF', fontWeight: 800 }}>
                      {count} sess
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CREATE / RESCHEDULE SESSION MODAL                                    */}
      {/* ==================================================================== */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
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
              maxWidth: '520px',
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
                  {editingSession ? 'Reschedule / Edit Session' : 'Schedule Workout Session'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                  Assign workout timing for your client. Conflicts are prevented automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitSession} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Select Member */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Select Assigned Member *
                </label>
                <select
                  required
                  value={form.memberId}
                  onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none' }}
                >
                  <option value="">-- Choose Assigned Client --</option>
                  {myMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone || 'No mobile'}) - {m.planName || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Session Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Time Slot *
                  </label>
                  <select
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none' }}
                  >
                    {STANDARD_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Workout Type & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Workout Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none' }}
                  >
                    {WORKOUT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Duration
                  </label>
                  <select
                    value={normalizeDuration(form.duration)}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Selector (When Editing) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Session Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none' }}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Focus / Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Session Focus / Plan Notes
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Upper body compound movements, 5RM bench press test, hydration reminder..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#00B84A', color: '#FFFFFF', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 184, 74, 0.3)' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
