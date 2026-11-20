import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  Activity,
  LogOut,
  Bell,
  Menu,
  X,
  Dumbbell,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { useTrainerAuth } from '../context/TrainerAuthContext';
import {
  subscribeToCollection,
  deduplicateById,
  updateTrainerSessionStatusInFirestore,
} from '../services/firestoreService';

import DashboardOverviewTab from '../components/trainer/DashboardOverviewTab';
import AssignedMembersTab from '../components/trainer/AssignedMembersTab';
import SessionScheduleTab from '../components/trainer/SessionScheduleTab';
import SessionNotesTab from '../components/trainer/SessionNotesTab';
import ProductivityTab from '../components/trainer/ProductivityTab';
import CompletedSessionsTab from '../components/trainer/CompletedSessionsTab';
import MemberProgressTab from '../components/trainer/MemberProgressTab';

export default function TrainerDashboardPage() {
  const { trainerProfile, trainerUser, logout } = useTrainerAuth();
  const navigate = useNavigate();

  // Navigation:
  // 1. Dashboard ('dashboard')
  // 2. Assigned Members ('assigned_members')
  // 3. Class & Session Schedule ('schedules')
  // 4. Session Notes ('session_notes')
  // 5. Productivity Tracking ('productivity')
  // 6. Completed Sessions ('completed_sessions')
  // 7. Member Progress ('member_progress')
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Live Firestore collections
  const [allMembers, setAllMembers] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [allProgress, setAllProgress] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Cross-tab interaction prefill state
  const [progressMemberId, setProgressMemberId] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // 1. Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubMembers = subscribeToCollection('members', (data) => {
      setAllMembers(deduplicateById(data || []));
      setLoadingData(false);
    });

    const unsubSessions = subscribeToCollection('trainer_sessions', (data) => {
      setAllSessions(deduplicateById(data || []));
    });

    const unsubNotes = subscribeToCollection('trainer_notes', (data) => {
      setAllNotes(deduplicateById(data || []));
    });

    const unsubProgress = subscribeToCollection('member_progress', (data) => {
      setAllProgress(deduplicateById(data || []));
    });

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubSessions) unsubSessions();
      if (unsubNotes) unsubNotes();
      if (unsubProgress) unsubProgress();
    };
  }, []);

  // Filter assigned members for THIS logged-in trainer only!
  const myMembers = useMemo(() => {
    if (!trainerProfile) return [];
    return allMembers.filter((m) => {
      const matchId =
        m.trainerId &&
        (m.trainerId === trainerProfile.id || m.trainerId === trainerProfile.uid);
      const matchName =
        m.assignedTrainer &&
        m.assignedTrainer.toLowerCase() === (trainerProfile.name || '').toLowerCase();
      return matchId || matchName;
    });
  }, [allMembers, trainerProfile]);

  // Filter sessions for this trainer
  const mySessions = useMemo(() => {
    if (!trainerProfile) return [];
    return allSessions
      .filter((s) => s.trainerId === trainerProfile.id || s.trainerId === trainerProfile.uid)
      .sort((a, b) => new Date(`${b.date} ${b.time || '00:00'}`) - new Date(`${a.date} ${a.time || '00:00'}`));
  }, [allSessions, trainerProfile]);

  // Filter notes for this trainer
  const myNotes = useMemo(() => {
    if (!trainerProfile) return [];
    return allNotes
      .filter((n) => n.trainerId === trainerProfile.id || n.trainerId === trainerProfile.uid)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allNotes, trainerProfile]);

  // Filter progress updates for this trainer's members
  const myProgress = useMemo(() => {
    if (!trainerProfile) return [];
    return allProgress
      .filter(
        (p) =>
          p.trainerId === trainerProfile.id ||
          p.trainerId === trainerProfile.uid ||
          myMembers.some((m) => m.id === p.memberId)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allProgress, trainerProfile, myMembers]);

  // Derived Session Metrics
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySessions = useMemo(() => {
    return mySessions.filter((s) => s.date === todayStr);
  }, [mySessions, todayStr]);

  const upcomingSessions = useMemo(() => {
    return mySessions.filter((s) => s.status === 'Scheduled');
  }, [mySessions]);

  const completedSessions = useMemo(() => {
    return mySessions.filter((s) => s.status === 'Completed');
  }, [mySessions]);

  const cancelledSessions = useMemo(() => {
    return mySessions.filter((s) => s.status === 'Cancelled');
  }, [mySessions]);

  // Logout handler
  const handleLogout = async () => {
    if (window.confirm('Sign out from Trainer Dashboard?')) {
      await logout();
      navigate('/trainer-login', { replace: true });
    }
  };

  // Quick mark complete from dashboard
  const handleQuickComplete = async (session) => {
    try {
      await updateTrainerSessionStatusInFirestore(session.id, 'Completed');
      showToast(`✓ Session with ${session.memberName} marked as Completed`);
    } catch {
      showToast('Error updating status.');
    }
  };

  // Navigation Items matching the exact requirement:
  // 1. Dashboard
  // 2. Assigned Members
  // 3. Class & Session Schedule
  // 4. Session Notes
  // 5. Productivity Tracking
  // 6. Completed Sessions
  // 7. Member Progress
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'assigned_members',
      label: 'Assigned Members',
      icon: Users,
      badge: myMembers.length,
    },
    {
      id: 'schedules',
      label: 'Class & Session Schedule',
      icon: Calendar,
      badge: upcomingSessions.length,
    },
    {
      id: 'session_notes',
      label: 'Session Notes',
      icon: ClipboardList,
      badge: myNotes.length,
    },
    {
      id: 'productivity',
      label: 'Productivity Tracking',
      icon: TrendingUp,
    },
    {
      id: 'completed_sessions',
      label: 'Completed Sessions',
      icon: CheckCircle2,
      badge: completedSessions.length,
    },
    {
      id: 'member_progress',
      label: 'Member Progress',
      icon: Activity,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.86rem',
            fontWeight: 700,
            borderLeft: '4px solid #00B84A',
            animation: 'slideIn 0.2s ease-out',
          }}
        >
          <Check size={18} color="#00D256" />
          <span>{toast}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SIDEBAR NAVIGATION                                                   */}
      {/* ==================================================================== */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
        }}
        className="respire-trainer-sidebar"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 22px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <img
            src="/respire_logo_perfect_hd.png"
            alt="Respire Fitness"
            style={{
              height: '40px',
              width: 'auto',
              maxWidth: '190px',
              objectFit: 'contain',
              marginBottom: '10px',
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/respire_spin_logo_transparent.png';
            }}
          />
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
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Dumbbell size={12} />
            <span>Trainer Dashboard</span>
          </div>
        </div>

        {/* Logged-In Coach Profile Badge */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#00B84A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.05rem',
              fontWeight: 900,
              flexShrink: 0,
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            {trainerProfile?.photo ? (
              <img
                src={trainerProfile.photo}
                alt={trainerProfile.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (trainerProfile?.name || 'C')[0].toUpperCase()
            )}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {trainerProfile?.name || 'Coach'}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#94A3B8',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {trainerProfile?.specialty || 'Personal Trainer'}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav
          style={{
            padding: '16px 12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? '#00B84A' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '999px',
                      backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.12)',
                      color: isActive ? '#FFFFFF' : '#CBD5E1',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Sign Out */}
        <div
          style={{
            padding: '16px 14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#F87171',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DC2626';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
              e.currentTarget.style.color = '#F87171';
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* MAIN CONTENT AREA                                                    */}
      {/* ==================================================================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Top Navbar */}
        <header
          style={{
            height: '70px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              style={{
                display: 'none',
                padding: '8px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
              className="respire-mobile-toggle"
            >
              <Menu size={18} />
            </button>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#008A38', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Respire Fitness • Trainer Portal
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Branch Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: '#ECFDF3',
                border: '1px solid #A7F3D0',
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#008A38',
              }}
            >
              <span>📍 {trainerProfile?.branchId === 'branch2' ? 'Vijaynagar Branch' : 'Vishrambag Branch'}</span>
            </div>

            {/* Coach Profile Tag */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#00B84A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                }}
              >
                {(trainerProfile?.name || 'C')[0]}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                {trainerProfile?.name || 'Coach'}
              </span>
            </div>
          </div>
        </header>

        {/* Tab Body */}
        <main style={{ padding: '28px', flex: 1 }}>
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <DashboardOverviewTab
              trainerProfile={trainerProfile}
              myMembers={myMembers}
              mySessions={mySessions}
              myNotes={myNotes}
              completedSessions={completedSessions}
              upcomingSessions={upcomingSessions}
              cancelledSessions={cancelledSessions}
              todaySessions={todaySessions}
              onNavigateTab={(tabKey) => setActiveTab(tabKey)}
              onOpenScheduleModal={() => setActiveTab('schedules')}
              onOpenNoteModal={() => setActiveTab('session_notes')}
              onQuickCompleteSession={handleQuickComplete}
            />
          )}

          {/* TAB 2: ASSIGNED MEMBERS */}
          {activeTab === 'assigned_members' && (
            <AssignedMembersTab
              myMembers={myMembers}
              mySessions={mySessions}
              myNotes={myNotes}
              onOpenScheduleModalWithMember={(member) => {
                setActiveTab('schedules');
              }}
              onOpenNoteModalWithMember={(member) => {
                setActiveTab('session_notes');
              }}
              onOpenProgressModalWithMember={(member) => {
                setProgressMemberId(member.id);
                setActiveTab('member_progress');
              }}
            />
          )}

          {/* TAB 3: CLASS & SESSION SCHEDULE */}
          {activeTab === 'schedules' && (
            <SessionScheduleTab
              trainerProfile={trainerProfile}
              myMembers={myMembers}
              mySessions={mySessions}
              showToast={showToast}
              onOpenNoteModalForSession={(session) => {
                setActiveTab('session_notes');
              }}
            />
          )}

          {/* TAB 4: SESSION NOTES */}
          {activeTab === 'session_notes' && (
            <SessionNotesTab
              trainerProfile={trainerProfile}
              myMembers={myMembers}
              mySessions={mySessions}
              myNotes={myNotes}
              showToast={showToast}
            />
          )}

          {/* TAB 5: PRODUCTIVITY TRACKING */}
          {activeTab === 'productivity' && (
            <ProductivityTab
              trainerProfile={trainerProfile}
              myMembers={myMembers}
              mySessions={mySessions}
              completedSessions={completedSessions}
              upcomingSessions={upcomingSessions}
              cancelledSessions={cancelledSessions}
              todaySessions={todaySessions}
            />
          )}

          {/* TAB 6: COMPLETED SESSIONS */}
          {activeTab === 'completed_sessions' && (
            <CompletedSessionsTab
              trainerProfile={trainerProfile}
              completedSessions={completedSessions}
              myNotes={myNotes}
              myMembers={myMembers}
              onOpenNoteModalForSession={(session) => {
                setActiveTab('session_notes');
              }}
            />
          )}

          {/* TAB 7: MEMBER PROGRESS */}
          {activeTab === 'member_progress' && (
            <MemberProgressTab
              trainerProfile={trainerProfile}
              myMembers={myMembers}
              allProgress={myProgress}
              showToast={showToast}
              initialSelectedMemberId={progressMemberId}
            />
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .respire-trainer-sidebar {
            display: ${mobileSidebarOpen ? 'flex' : 'none'} !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 1000 !important;
            width: 280px !important;
          }
          .respire-mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
