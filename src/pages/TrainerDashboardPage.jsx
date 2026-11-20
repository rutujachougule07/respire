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
  Building2,
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
import TrainerProfileTab from '../components/trainer/TrainerProfileTab';

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
    {
      id: 'profile',
      label: 'Trainer Profile',
      icon: User,
    },
  ];

  const SidebarContent = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        userSelect: 'none',
      }}
    >
      {/* 1. FIXED BRAND HEADER */}
      <div
        style={{
          flexShrink: 0,
          padding: '20px 18px 16px',
          borderBottom: '1px solid #F1F5F9',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <img
            src="/respire_logo_web.png"
            alt="Respire Fitness"
            style={{
              height: '42px',
              width: 'auto',
              maxWidth: '185px',
              objectFit: 'contain',
              display: 'block',
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/respire_logo_transparent.png';
            }}
          />
          {/* Mobile drawer close button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="trainer-mobile-toggle"
            aria-label="Close sidebar"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '8px',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Pill */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 184, 74, 0.08)',
              border: '1px solid rgba(0, 184, 74, 0.25)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#008A38',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <ShieldCheck size={12} />
            <span>Trainer Dashboard</span>
          </div>
        </div>

        {/* Active Branch Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            fontSize: '0.74rem',
            color: '#334155',
            fontWeight: 700,
          }}
        >
          <Building2 size={13} color="#008A38" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {trainerProfile?.branchId === 'branch2' ? 'Respire Vijaynagar Branch' : 'Respire Vishrambag Branch'}
          </span>
        </div>
      </div>



      {/* 2. SCROLLABLE NAVIGATION LINKS */}
      <div
        className="trainer-sidebar-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#94A3B8',
            textTransform: 'uppercase',
            padding: '0 8px 10px',
          }}
        >
          Navigation
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: active
                    ? 'linear-gradient(135deg, #00D256 0%, #008A38 100%)'
                    : 'transparent',
                  color: active ? '#FFFFFF' : '#475569',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.86rem',
                  textAlign: 'left',
                  border: 'none',
                  boxShadow: active ? '0 4px 14px rgba(0, 184, 74, 0.28)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Icon
                    size={17}
                    color={active ? '#FFFFFF' : '#64748B'}
                    style={{ flexShrink: 0 }}
                  />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                </span>

                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      letterSpacing: '0.02em',
                      backgroundColor: active
                        ? 'rgba(255, 255, 255, 0.25)'
                        : '#F1F5F9',
                      border: active
                        ? '1px solid rgba(255, 255, 255, 0.4)'
                        : '1px solid #E2E8F0',
                      color: active ? '#FFFFFF' : '#64748B',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. PINNED BOTTOM FOOTER */}
      <div
        style={{
          flexShrink: 0,
          padding: '14px 14px 18px',
          borderTop: '1px solid #F1F5F9',
          backgroundColor: '#FFFFFF',
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
            padding: '11px 16px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '0.86rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DC2626';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = '#DC2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FEF2F2';
            e.currentTarget.style.color = '#DC2626';
            e.currentTarget.style.borderColor = '#FECACA';
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

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
      {/* DESKTOP PERSISTENT WHITE EXECUTIVE SIDEBAR (Matches Admin Dashboard) */}
      {/* ==================================================================== */}
      <aside
        style={{
          width: '264px',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
        className="trainer-desktop-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
          }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: '280px',
              backgroundColor: '#FFFFFF',
              height: '100%',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

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
            zIndex: 30,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                padding: '8px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
              className="trainer-mobile-toggle"
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

          {/* TAB 8: TRAINER PROFILE */}
          {activeTab === 'profile' && (
            <TrainerProfileTab
              trainerProfile={trainerProfile}
              myMembers={myMembers}
              mySessions={mySessions}
              completedSessions={completedSessions}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .trainer-desktop-sidebar {
            display: block !important;
          }
          .trainer-mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 991px) {
          .trainer-desktop-sidebar {
            display: none !important;
          }
          .trainer-mobile-toggle {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
        }
        .trainer-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .trainer-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .trainer-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 4px;
        }
        .trainer-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.16);
        }
      `}</style>
    </div>
  );
}
