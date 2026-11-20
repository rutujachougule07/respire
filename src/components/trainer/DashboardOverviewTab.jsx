import React from 'react';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight,
  Dumbbell,
  CalendarDays,
  Activity,
  Award,
} from 'lucide-react';

export default function DashboardOverviewTab({
  trainerProfile,
  myMembers = [],
  mySessions = [],
  myNotes = [],
  completedSessions = [],
  upcomingSessions = [],
  cancelledSessions = [],
  todaySessions = [],
  onNavigateTab,
  onOpenScheduleModal,
  onOpenNoteModal,
  onQuickCompleteSession,
}) {
  const uniqueTrainedMembersCount = React.useMemo(() => {
    const trainedIds = new Set(
      mySessions.filter((s) => s.status === 'Completed').map((s) => s.memberId)
    );
    return trainedIds.size;
  }, [mySessions]);

  const completionRate = mySessions.length > 0
    ? Math.round((completedSessions.length / mySessions.length) * 100)
    : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '18px',
          padding: '24px 28px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(0, 184, 74, 0.15)',
              border: '1px solid rgba(0, 184, 74, 0.4)',
              color: '#00D256',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            <Dumbbell size={13} />
            <span>Respire Fitness Coach Hub</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Welcome back, {trainerProfile?.name || 'Coach'}!
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: 0, maxWidth: '620px', lineHeight: 1.5 }}>
            You have <strong style={{ color: '#00D256' }}>{todaySessions.length} session(s)</strong> scheduled today and <strong style={{ color: '#FFFFFF' }}>{myMembers.length} active client(s)</strong> assigned to your training roster.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onOpenScheduleModal}
            style={{
              backgroundColor: '#00B84A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 184, 74, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00A342')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00B84A')}
          >
            <Plus size={16} />
            <span>Schedule Session</span>
          </button>

          <button
            type="button"
            onClick={onOpenNoteModal}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
          >
            <FileText size={16} />
            <span>Log Session Note</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Completed Sessions */}
        <div
          onClick={() => onNavigateTab('completed_sessions')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00B84A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Sessions Completed
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#ECFDF3', color: '#008A38', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#008A38', lineHeight: 1 }}>
            {completedSessions.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px' }}>
            {completionRate}% completion rate
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div
          onClick={() => onNavigateTab('schedules')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#2563EB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Upcoming Sessions
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1E40AF', lineHeight: 1 }}>
            {upcomingSessions.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px' }}>
            {todaySessions.length} session(s) scheduled today
          </div>
        </div>

        {/* Cancelled Sessions */}
        <div
          onClick={() => onNavigateTab('schedules')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#DC2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Cancelled Sessions
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#DC2626', lineHeight: 1 }}>
            {cancelledSessions.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px' }}>
            Rescheduled or cancelled
          </div>
        </div>

        {/* Assigned Members */}
        <div
          onClick={() => onNavigateTab('assigned_members')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#00B84A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Assigned Members
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#ECFDF3', color: '#008A38', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
            {myMembers.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px' }}>
            {uniqueTrainedMembersCount} trained in sessions
          </div>
        </div>

        {/* Workout Notes */}
        <div
          onClick={() => onNavigateTab('session_notes')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#D97706';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Session Notes
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#D97706', lineHeight: 1 }}>
            {myNotes.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px' }}>
            Detailed exercise logs saved
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Quick Member Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Today's Schedule */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #E2E8F0',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#00B84A" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Today's Sessions ({todaySessions.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('schedules')}
              style={{
                fontSize: '0.78rem',
                color: '#008A38',
                fontWeight: 800,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View Full Calendar</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {todaySessions.length === 0 ? (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                padding: '36px 20px',
                textAlign: 'center',
                color: '#64748B',
                margin: 'auto 0',
              }}
            >
              <CalendarDays size={36} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', marginBottom: '4px' }}>
                No sessions booked for today
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 14px' }}>
                Schedule workout sessions for your assigned members to keep their routine on track.
              </p>
              <button
                type="button"
                onClick={onOpenScheduleModal}
                style={{
                  backgroundColor: '#00B84A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={14} />
                <span>Book Session for Today</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: session.status === 'Completed' ? '#F4FBF7' : '#F8FAFC',
                    border: session.status === 'Completed' ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        textAlign: 'center',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        minWidth: '65px',
                      }}
                    >
                      {session.time}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                        {session.memberName || 'Client'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {session.type || 'Personal Training'} • {session.duration || '60 mins'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
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

                    {session.status === 'Scheduled' && (
                      <button
                        type="button"
                        onClick={() => onQuickCompleteSession(session)}
                        title="Mark Completed"
                        style={{
                          backgroundColor: '#008A38',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
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

        {/* Assigned Clients Quick Glance */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #E2E8F0',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#00B84A" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                My Assigned Members ({myMembers.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('assigned_members')}
              style={{
                fontSize: '0.78rem',
                color: '#008A38',
                fontWeight: 800,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {myMembers.length === 0 ? (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                padding: '36px 20px',
                textAlign: 'center',
                color: '#64748B',
                margin: 'auto 0',
              }}
            >
              <Users size={36} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', marginBottom: '4px' }}>
                No members assigned yet
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                When your Gym Admin assigns members to your coach profile, they will appear here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myMembers.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#ECFDF3',
                        color: '#008A38',
                        fontWeight: 900,
                        fontSize: '0.92rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      {m.name ? m.name[0].toUpperCase() : 'M'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {m.phone || 'No mobile'} • {m.planName || 'General Membership'}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: m.status === 'Active' ? '#DCFCE7' : '#FEF2F2',
                      color: m.status === 'Active' ? '#15803D' : '#DC2626',
                    }}
                  >
                    {m.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
