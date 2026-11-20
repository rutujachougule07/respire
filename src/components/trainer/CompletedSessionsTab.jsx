import React, { useState, useMemo } from 'react';
import { normalizeDuration } from './SessionScheduleTab';
import {
  CheckCircle2,
  Search,
  Calendar,
  Clock,
  Dumbbell,
  FileText,
  User,
  Filter,
  Eye,
  X,
  Phone,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function CompletedSessionsTab({
  trainerProfile,
  completedSessions = [],
  myNotes = [],
  myMembers = [],
  onOpenNoteModalForSession,
}) {
  const [searchMember, setSearchMember] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [customDate, setCustomDate] = useState('');
  const [workoutTypeFilter, setWorkoutTypeFilter] = useState('All');
  const [viewingSession, setViewingSession] = useState(null);

  // Available workout types present in completed sessions
  const availableTypes = useMemo(() => {
    const types = new Set(completedSessions.map((s) => s.type).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [completedSessions]);

  // Filter Completed Sessions
  const filteredCompletedSessions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    return completedSessions.filter((s) => {
      // 1. Search by member name
      const matchName =
        !searchMember ||
        (s.memberName && s.memberName.toLowerCase().includes(searchMember.toLowerCase())) ||
        (s.memberPhone && s.memberPhone.includes(searchMember));

      // 2. Filter by workout type
      const matchType = workoutTypeFilter === 'All' || s.type === workoutTypeFilter;

      // 3. Filter by date
      let matchDate = true;
      if (customDate) {
        matchDate = s.date === customDate;
      } else if (dateFilter === 'Today') {
        matchDate = s.date === todayStr;
      } else if (dateFilter === 'This Week') {
        const sDate = new Date(s.date);
        const dayOfWeek = now.getDay() || 7;
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek + 1);
        monday.setHours(0, 0, 0, 0);
        matchDate = sDate >= monday;
      } else if (dateFilter === 'This Month') {
        const yearMonth = todayStr.substring(0, 7);
        matchDate = (s.date || '').startsWith(yearMonth);
      }

      return matchName && matchType && matchDate;
    });
  }, [completedSessions, searchMember, workoutTypeFilter, dateFilter, customDate]);

  // Find linked note for a session
  const getLinkedNote = (session) => {
    if (!session) return null;
    return myNotes.find(
      (n) => n.sessionId === session.id || (n.memberId === session.memberId && n.date === session.date)
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Filter Controls */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 22px',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Completed Training Sessions ({completedSessions.length})
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
              Historical archive of all completed workout sessions and client performance notes.
            </p>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#008A38', fontWeight: 800, backgroundColor: '#ECFDF3', padding: '4px 12px', borderRadius: '20px', border: '1px solid #A7F3D0' }}>
            ✓ Verified Completed Sessions
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search by Member Name */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              placeholder="Search by client name or phone..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Date Range Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['All', 'Today', 'This Week', 'This Month'].map((df) => (
              <button
                key={df}
                type="button"
                onClick={() => {
                  setDateFilter(df);
                  setCustomDate('');
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: dateFilter === df && !customDate ? '#00B84A' : '#CBD5E1',
                  backgroundColor: dateFilter === df && !customDate ? '#ECFDF3' : '#FFFFFF',
                  color: dateFilter === df && !customDate ? '#008A38' : '#64748B',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {df}
              </button>
            ))}

            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter('');
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.76rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Workout Type Selector */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={workoutTypeFilter}
              onChange={(e) => setWorkoutTypeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                outline: 'none',
              }}
            >
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Workout Types' : t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Completed Sessions Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>MEMBER NAME</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>SESSION DATE</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>SESSION TIME</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>WORKOUT TYPE</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>SESSION STATUS</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569' }}>SESSION NOTES</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompletedSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '52px 24px', textAlign: 'center', color: '#64748B' }}>
                    <CheckCircle2 size={40} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.96rem' }}>
                      No Completed Sessions Found
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
                      {completedSessions.length === 0
                        ? 'Completed sessions will appear here as you conduct and finish workouts with your assigned members.'
                        : 'No completed sessions match your current search or date filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCompletedSessions.map((session) => {
                  const linkedNote = getLinkedNote(session);

                  return (
                    <tr key={session.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* Member Name */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                          {session.memberName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {session.memberPhone || 'No mobile'}
                        </div>
                      </td>

                      {/* Session Date */}
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>
                        {session.date}
                      </td>

                      {/* Session Time */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: 800, color: '#008A38', backgroundColor: '#ECFDF3', padding: '3px 8px', borderRadius: '6px' }}>
                          {session.time}
                        </span>
                      </td>

                      {/* Workout Type */}
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#334155' }}>
                        {session.type || 'Personal Training'}
                      </td>

                      {/* Session Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                            border: '1px solid #A7F3D0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Completed</span>
                        </span>
                      </td>

                      {/* Session Notes */}
                      <td style={{ padding: '14px 18px', maxWidth: '240px' }}>
                        {linkedNote ? (
                          <div style={{ fontSize: '0.74rem', color: '#334155' }}>
                            <div style={{ fontWeight: 700, color: '#008A38' }}>
                              ✓ Note Recorded ({linkedNote.exercises?.length || 0} exercises)
                            </div>
                            <div style={{ color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {linkedNote.observations || linkedNote.workoutRoutine || 'Workout details logged'}
                            </div>
                          </div>
                        ) : session.notes ? (
                          <div style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {session.notes}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenNoteModalForSession(session)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              color: '#1D4ED8',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Plus size={11} /> Add Note
                          </button>
                        )}
                      </td>

                      {/* View Details Button */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setViewingSession(session)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            color: '#0F172A',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#00B84A';
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#00B84A';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                            e.currentTarget.style.color = '#0F172A';
                            e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                        >
                          <Eye size={13} />
                          <span>View Details</span>
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

      {/* Complete Session Details Modal */}
      {viewingSession && (
        <div
          onClick={() => setViewingSession(null)}
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
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#008A38', backgroundColor: '#ECFDF3', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  Completed Session Record
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '6px 0 0' }}>
                  {viewingSession.memberName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingSession(null)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Session Overview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Session Date</div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>{viewingSession.date}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Session Time & Duration</div>
                  <div style={{ fontWeight: 800, color: '#008A38', fontSize: '0.92rem' }}>
                    {viewingSession.time} ({normalizeDuration(viewingSession.duration)})
                  </div>
                </div>
              </div>

              {/* Workout Type */}
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Workout Type</div>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                  {viewingSession.type || 'Personal Training'}
                </div>
              </div>

              {/* Attached Session Note (if any) */}
              {(() => {
                const note = getLinkedNote(viewingSession);
                if (note) {
                  return (
                    <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1.5px solid #BBF7D0', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FileText size={14} /> Attached Session Notes
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>
                          ★ {note.rating || 5}/5
                        </span>
                      </div>

                      {/* Exercises List */}
                      {Array.isArray(note.exercises) && note.exercises.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>Exercises:</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {note.exercises.map((ex, i) => (
                              <div key={i} style={{ fontSize: '0.78rem', color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {ex.name}</span>
                                <span style={{ fontWeight: 800, color: '#008A38' }}>
                                  {ex.sets} sets x {ex.reps} reps {ex.weight && `@ ${ex.weight}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {note.observations && (
                        <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                          <strong>Performance Observations:</strong> {note.observations}
                        </div>
                      )}

                      {note.dietHydrationNotes && (
                        <div style={{ fontSize: '0.76rem', color: '#008A38', marginTop: '6px' }}>
                          <strong>Diet / Hydration:</strong> {note.dietHydrationNotes}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1.5px dashed #CBD5E1', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 10px' }}>
                      No detailed exercise notes linked to this completed session yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const s = viewingSession;
                        setViewingSession(null);
                        onOpenNoteModalForSession(s);
                      }}
                      style={{
                        backgroundColor: '#00B84A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Plus size={13} />
                      <span>Log Session Notes Now</span>
                    </button>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => setViewingSession(null)}
                style={{
                  marginTop: '10px',
                  padding: '11px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
