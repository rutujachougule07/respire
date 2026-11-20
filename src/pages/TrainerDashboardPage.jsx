import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  TrendingUp,
  UserCheck,
  LogOut,
  Bell,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  CalendarDays,
  FileText,
  Dumbbell,
  Phone,
  Mail,
  MapPin,
  Star,
  Activity,
  Award,
  ChevronRight,
  X,
  Edit3,
  Trash2,
  Lock,
  KeyRound,
  ShieldCheck,
  Check,
  Menu,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useTrainerAuth } from '../context/TrainerAuthContext';
import {
  subscribeToCollection,
  deduplicateById,
  saveTrainerSessionToFirestore,
  deleteTrainerSessionFromFirestore,
  updateTrainerSessionStatusInFirestore,
  saveTrainerNoteToFirestore,
  deleteTrainerNoteFromFirestore,
} from '../services/firestoreService';

export default function TrainerDashboardPage() {
  const {
    trainerProfile,
    trainerUser,
    logout,
    updateProfile,
    changePassword,
    sendPasswordReset,
  } = useTrainerAuth();
  const navigate = useNavigate();

  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'members' | 'schedule' | 'notes' | 'productivity' | 'profile'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Live Firestore collections
  const [allMembers, setAllMembers] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search & Filter States
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('All');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('All');
  const [selectedMemberForNote, setSelectedMemberForNote] = useState('All');

  // Modals
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00 AM',
    type: 'Strength & Hypertrophy',
    duration: '60 mins',
    status: 'Scheduled',
    notes: '',
  });

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    workoutRoutine: '',
    observations: '',
    dietHydrationNotes: '',
    rating: 5,
  });

  const [viewingMember, setViewingMember] = useState(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    phone: '',
    bio: '',
    specialty: '',
    experience: '',
    photo: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // Sync profile form when trainerProfile is available
  useEffect(() => {
    if (trainerProfile) {
      setProfileForm({
        phone: trainerProfile.phone || '',
        bio: trainerProfile.bio || '',
        specialty: trainerProfile.specialty || '',
        experience: trainerProfile.experience || '',
        photo: trainerProfile.photo || '',
      });
    }
  }, [trainerProfile]);

  // 1. Subscribe to members collection
  useEffect(() => {
    const unsub = subscribeToCollection('members', (data) => {
      setAllMembers(deduplicateById(data || []));
      setLoadingData(false);
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to trainer_sessions collection
  useEffect(() => {
    const unsub = subscribeToCollection('trainer_sessions', (data) => {
      setAllSessions(deduplicateById(data || []));
    });
    return () => unsub();
  }, []);

  // 3. Subscribe to trainer_notes collection
  useEffect(() => {
    const unsub = subscribeToCollection('trainer_notes', (data) => {
      setAllNotes(deduplicateById(data || []));
    });
    return () => unsub();
  }, []);

  // Filter assigned members for THIS logged-in trainer only!
  const myMembers = useMemo(() => {
    if (!trainerProfile) return [];
    return allMembers.filter((m) => {
      // Match by trainerId OR by trainer name fallback
      const matchId = m.trainerId && (m.trainerId === trainerProfile.id || m.trainerId === trainerProfile.uid);
      const matchName = m.assignedTrainer && m.assignedTrainer.toLowerCase() === trainerProfile.name.toLowerCase();
      return matchId || matchName;
    });
  }, [allMembers, trainerProfile]);

  // Filter sessions for this trainer
  const mySessions = useMemo(() => {
    if (!trainerProfile) return [];
    return allSessions
      .filter((s) => s.trainerId === trainerProfile.id || s.trainerId === trainerProfile.uid)
      .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
  }, [allSessions, trainerProfile]);

  // Filter notes for this trainer
  const myNotes = useMemo(() => {
    if (!trainerProfile) return [];
    return allNotes
      .filter((n) => n.trainerId === trainerProfile.id || n.trainerId === trainerProfile.uid)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allNotes, trainerProfile]);

  // Derived KPI metrics
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySessions = useMemo(() => {
    return mySessions.filter((s) => s.date === todayStr);
  }, [mySessions, todayStr]);

  const upcomingSessions = useMemo(() => {
    return mySessions.filter((s) => s.date >= todayStr && s.status !== 'Completed' && s.status !== 'Cancelled');
  }, [mySessions, todayStr]);

  const completedSessions = useMemo(() => {
    return mySessions.filter((s) => s.status === 'Completed');
  }, [mySessions]);

  // Filtered members list based on user search
  const filteredMembers = useMemo(() => {
    return myMembers.filter((m) => {
      const q = memberSearch.toLowerCase();
      const matchesSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.phone?.includes(q) ||
        m.id?.toLowerCase().includes(q) ||
        m.planName?.toLowerCase().includes(q);

      const matchesStatus =
        memberStatusFilter === 'All' ||
        m.status?.toLowerCase() === memberStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [myMembers, memberSearch, memberStatusFilter]);

  // Helpers
  const getMemberById = (mId) => myMembers.find((m) => m.id === mId) || { name: 'Assigned Member' };

  // Handle Save Session
  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.memberId) {
      alert('Please select an assigned member.');
      return;
    }

    const member = getMemberById(sessionForm.memberId);
    const payload = {
      ...(editingSession || {}),
      ...sessionForm,
      trainerId: trainerProfile.id,
      trainerName: trainerProfile.name,
      memberName: member.name,
      memberPhone: member.phone || '',
    };

    try {
      await saveTrainerSessionToFirestore(payload);
      showToast(editingSession ? '✓ Session updated successfully!' : '✓ New training session scheduled!');
      setShowSessionModal(false);
      setEditingSession(null);
    } catch (err) {
      alert('Failed to save session: ' + err.message);
    }
  };

  // Handle Save Note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.memberId) {
      alert('Please select an assigned member.');
      return;
    }

    const member = getMemberById(noteForm.memberId);
    const payload = {
      ...(editingNote || {}),
      ...noteForm,
      trainerId: trainerProfile.id,
      trainerName: trainerProfile.name,
      memberName: member.name,
    };

    try {
      await saveTrainerNoteToFirestore(payload);
      showToast(editingNote ? '✓ Workout note updated!' : '✓ Session note logged successfully!');
      setShowNoteModal(false);
      setEditingNote(null);
    } catch (err) {
      alert('Failed to save note: ' + err.message);
    }
  };

  // Handle Update Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile(profileForm);
      showToast('✓ Profile updated successfully in Firestore!');
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('New Password and Confirm Password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPassSuccess('✓ Password updated successfully in Firebase Authentication! Please use it on your next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out from Trainer Portal?')) {
      await logout();
      navigate('/trainer-login', { replace: true });
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'members', label: 'My Members', icon: Users, badge: myMembers.length },
    { id: 'schedule', label: 'Schedule Management', icon: Calendar, badge: upcomingSessions.length },
    { id: 'notes', label: 'Session Notes', icon: ClipboardList, badge: myNotes.length },
    { id: 'productivity', label: 'Productivity Tracking', icon: TrendingUp },
    { id: 'profile', label: 'My Profile & Security', icon: UserCheck },
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
            zIndex: 4000,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            border: '1.5px solid #00B84A',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} color="#00B84A" />
          <span>{toast}</span>
        </div>
      )}

      {/* =========================================================================
          SIDEBAR NAVIGATION (Responsive)
         ========================================================================= */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
        className="hidden md:flex"
      >
        {/* Brand Logo Header */}
        <div
          style={{
            padding: '24px 20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <img
            src="/respire_logo_web.png"
            alt="Respire Fitness"
            style={{
              height: '42px',
              width: 'auto',
              maxWidth: '180px',
              objectFit: 'contain',
              marginBottom: '10px',
              filter: 'brightness(1.1)',
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

        {/* Trainer Mini Profile Card */}
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
              fontWeight: 800,
              flexShrink: 0,
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            {trainerProfile?.photo ? (
              <img src={trainerProfile.photo} alt={trainerProfile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (trainerProfile?.name || 'T')[0].toUpperCase()
            )}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {trainerProfile?.name || 'Coach'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {trainerProfile?.specialty || 'Personal Trainer'}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
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
                  <Icon size={18} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      padding: '2px 7px',
                      borderRadius: '12px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout Button */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DC2626';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.color = '#F87171';
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
         ========================================================================= */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1.5px solid #E2E8F0',
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              style={{
                background: 'none',
                border: 'none',
                color: '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>
                Respire Fitness • {trainerProfile?.branchId === 'branch2' ? 'Vijaynagar Branch' : 'Vishrambag Branch'}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setSessionForm({
                  memberId: myMembers[0]?.id || '',
                  date: new Date().toISOString().split('T')[0],
                  time: '08:00 AM',
                  type: 'Strength & Hypertrophy',
                  duration: '60 mins',
                  status: 'Scheduled',
                  notes: '',
                });
                setEditingSession(null);
                setShowSessionModal(true);
              }}
              style={{
                backgroundColor: '#00B84A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0, 184, 74, 0.25)',
              }}
            >
              <Plus size={15} />
              <span>Schedule Session</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNoteForm({
                  memberId: myMembers[0]?.id || '',
                  date: new Date().toISOString().split('T')[0],
                  workoutRoutine: '',
                  observations: '',
                  dietHydrationNotes: '',
                  rating: 5,
                });
                setEditingNote(null);
                setShowNoteModal(true);
              }}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '9px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileText size={15} />
              <span>Add Note</span>
            </button>
          </div>
        </header>

        {/* Dynamic Section Rendering */}
        <div style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }}>
          {/* =================================================================
              SECTION A: DASHBOARD OVERVIEW
             ================================================================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Welcome Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #172C83 100%)',
                  borderRadius: '18px',
                  padding: '24px 28px',
                  color: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 184, 74, 0.2)', border: '1px solid rgba(0, 184, 74, 0.5)', padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 800, color: '#00D256', marginBottom: '8px' }}>
                    <Sparkles size={12} />
                    <span>Active Certified Coach</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 6px' }}>
                    Good day, {trainerProfile?.name || 'Coach'}!
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: '#CBD5E1', margin: 0, maxWidth: '520px', lineHeight: 1.5 }}>
                    You have <strong>{todaySessions.length} session(s)</strong> scheduled for today and <strong>{myMembers.length} active member(s)</strong> assigned to your coaching roster.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00D256' }}>{myMembers.length}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>My Members</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF' }}>{completedSessions.length}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>Completed</div>
                  </div>
                </div>
              </div>

              {/* 4 Quick KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
                {/* Total Assigned Members */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ECFDF3', color: '#008A38', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>{myMembers.length}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Assigned Members</div>
                  </div>
                </div>

                {/* Today's Sessions */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>{todaySessions.length}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Today's Sessions</div>
                  </div>
                </div>

                {/* Upcoming Sessions */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>{upcomingSessions.length}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Upcoming Sessions</div>
                  </div>
                </div>

                {/* Completed Sessions */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>{completedSessions.length}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Completed Sessions</div>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Today's Schedule & Recent Activities */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                {/* Today's Schedule Card */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="#00B84A" />
                      <span>Today's Sessions ({todaySessions.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('schedule')}
                      style={{ fontSize: '0.76rem', color: '#008A38', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      View All &rarr;
                    </button>
                  </div>

                  {todaySessions.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.84rem' }}>
                      No sessions scheduled for today. Click <strong>Schedule Session</strong> above to plan training.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      {todaySessions.map((sess) => (
                        <div
                          key={sess.id}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>{sess.memberName}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                              {sess.time} • {sess.type}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: sess.status === 'Completed' ? '#ECFDF3' : '#EFF6FF',
                              color: sess.status === 'Completed' ? '#008A38' : '#2563EB',
                            }}
                          >
                            {sess.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Session Notes Card */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ClipboardList size={18} color="#172C83" />
                      <span>Recent Workout Notes ({myNotes.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('notes')}
                      style={{ fontSize: '0.76rem', color: '#172C83', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      View All &rarr;
                    </button>
                  </div>

                  {myNotes.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.84rem' }}>
                      No workout notes logged yet. Record observations after each session to track client progress.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      {myNotes.slice(0, 3).map((note) => (
                        <div
                          key={note.id}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A' }}>{note.memberName}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{note.date}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.4, marginBottom: '4px' }}>
                            {note.workoutRoutine}
                          </div>
                          {note.observations && (
                            <div style={{ fontSize: '0.72rem', color: '#64748B', fontStyle: 'italic' }}>
                              &ldquo;{note.observations}&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION B: MY MEMBERS
             ================================================================= */}
          {activeTab === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header and Filter Row */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                {/* Search Input */}
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search assigned members by name, phone or ID..."
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569' }}>STATUS:</span>
                  {['All', 'Active', 'Expired'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMemberStatusFilter(st)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: memberStatusFilter === st ? '#00B84A' : '#CBD5E1',
                        backgroundColor: memberStatusFilter === st ? '#ECFDF3' : '#FFFFFF',
                        color: memberStatusFilter === st ? '#008A38' : '#64748B',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Members Count Badge */}
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>
                Showing {filteredMembers.length} of {myMembers.length} assigned member(s)
              </div>

              {/* Members Grid */}
              {filteredMembers.length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px dashed #CBD5E1',
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#64748B',
                  }}
                >
                  <Users size={42} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                    No Assigned Members Found
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, maxWidth: '420px', marginInline: 'auto' }}>
                    {myMembers.length === 0
                      ? 'The Admin has not yet assigned any members to your trainer profile. Once members are assigned, they will appear here automatically.'
                      : 'No members match the current search or status filter.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {filteredMembers.map((m) => {
                    const daysLeft = m.expiryDate
                      ? Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                      : 0;

                    return (
                      <div
                        key={m.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1.5px solid #E2E8F0',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        {/* Member Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '12px',
                              backgroundColor: '#ECFDF3',
                              color: '#008A38',
                              border: '1px solid rgba(0, 184, 74, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.15rem',
                              fontWeight: 900,
                              flexShrink: 0,
                            }}
                          >
                            {m.name ? m.name[0].toUpperCase() : 'M'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {m.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              ID: {m.id} • {m.phone || 'No phone'}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: m.status === 'Active' ? '#ECFDF3' : '#FEF2F2',
                              color: m.status === 'Active' ? '#008A38' : '#DC2626',
                            }}
                          >
                            {m.status}
                          </span>
                        </div>

                        {/* Plan and PT Info */}
                        <div
                          style={{
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            fontSize: '0.76rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B' }}>Membership:</span>
                            <span style={{ fontWeight: 800, color: '#0F172A' }}>{m.planName || 'Standard'}</span>
                          </div>
                          {m.specialTrainingLabel && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#008A38', fontWeight: 700 }}>
                              <span>PT Type:</span>
                              <span>{m.specialTrainingLabel}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B' }}>Expiry Date:</span>
                            <span style={{ fontWeight: 700, color: daysLeft > 7 ? '#0F172A' : '#DC2626' }}>
                              {m.expiryDate || 'N/A'} ({daysLeft > 0 ? `${daysLeft}d left` : 'Expired'})
                            </span>
                          </div>
                        </div>

                        {/* Physical Stats Chips */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
                          <div style={{ padding: '6px 4px', backgroundColor: '#F1F5F9', borderRadius: '6px', fontSize: '0.7rem' }}>
                            <div style={{ color: '#64748B' }}>Weight</div>
                            <div style={{ fontWeight: 800, color: '#0F172A' }}>{m.weight ? `${m.weight} kg` : '—'}</div>
                          </div>
                          <div style={{ padding: '6px 4px', backgroundColor: '#F1F5F9', borderRadius: '6px', fontSize: '0.7rem' }}>
                            <div style={{ color: '#64748B' }}>BMI</div>
                            <div style={{ fontWeight: 800, color: '#0F172A' }}>{m.bmi || '—'}</div>
                          </div>
                          <div style={{ padding: '6px 4px', backgroundColor: '#F1F5F9', borderRadius: '6px', fontSize: '0.7rem' }}>
                            <div style={{ color: '#64748B' }}>Level</div>
                            <div style={{ fontWeight: 800, color: '#008A38' }}>{m.programLevel || 'General'}</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                          <button
                            type="button"
                            onClick={() => setViewingMember(m)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#F8FAFC',
                              border: '1.5px solid #CBD5E1',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <Users size={14} />
                            <span>View Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNoteForm({
                                memberId: m.id,
                                date: new Date().toISOString().split('T')[0],
                                workoutRoutine: '',
                                observations: '',
                                dietHydrationNotes: '',
                                rating: 5,
                              });
                              setEditingNote(null);
                              setShowNoteModal(true);
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#ECFDF3',
                              border: '1px solid #A7F3D0',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              color: '#008A38',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <FileText size={14} />
                            <span>Log Workout</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SECTION C: SCHEDULE MANAGEMENT
             ================================================================= */}
          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header and Filter */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569' }}>FILTER STATUS:</span>
                  {['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSessionStatusFilter(st)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: sessionStatusFilter === st ? '#00B84A' : '#CBD5E1',
                        backgroundColor: sessionStatusFilter === st ? '#ECFDF3' : '#FFFFFF',
                        color: sessionStatusFilter === st ? '#008A38' : '#64748B',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSessionForm({
                      memberId: myMembers[0]?.id || '',
                      date: new Date().toISOString().split('T')[0],
                      time: '08:00 AM',
                      type: 'Strength & Hypertrophy',
                      duration: '60 mins',
                      status: 'Scheduled',
                      notes: '',
                    });
                    setEditingSession(null);
                    setShowSessionModal(true);
                  }}
                  style={{
                    backgroundColor: '#00B84A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={15} />
                  <span>Schedule New Session</span>
                </button>
              </div>

              {/* Sessions Table / Cards */}
              {mySessions.filter((s) => sessionStatusFilter === 'All' || s.status === sessionStatusFilter).length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px dashed #CBD5E1',
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#64748B',
                  }}
                >
                  <Calendar size={42} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                    No Sessions Scheduled
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 16px' }}>
                    Plan upcoming training sessions with your assigned members to keep routines organized.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSessionForm({
                        memberId: myMembers[0]?.id || '',
                        date: new Date().toISOString().split('T')[0],
                        time: '08:00 AM',
                        type: 'Strength & Hypertrophy',
                        duration: '60 mins',
                        status: 'Scheduled',
                        notes: '',
                      });
                      setEditingSession(null);
                      setShowSessionModal(true);
                    }}
                    style={{
                      backgroundColor: '#00B84A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    + Schedule First Session
                  </button>
                </div>
              ) : (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                          <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem' }}>Member</th>
                          <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem' }}>Date & Time</th>
                          <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem' }}>Session Type</th>
                          <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem' }}>Duration</th>
                          <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem' }}>Status</th>
                          <th style={{ padding: '14px 18px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mySessions
                          .filter((s) => sessionStatusFilter === 'All' || s.status === sessionStatusFilter)
                          .map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F172A' }}>
                                {s.memberName}
                                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 400 }}>{s.memberPhone}</div>
                              </td>
                              <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                                {s.date} • <span style={{ color: '#008A38' }}>{s.time}</span>
                              </td>
                              <td style={{ padding: '14px 18px', color: '#475569' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', fontWeight: 700, fontSize: '0.75rem' }}>
                                  {s.type}
                                </span>
                              </td>
                              <td style={{ padding: '14px 18px', color: '#64748B' }}>{s.duration || '60 mins'}</td>
                              <td style={{ padding: '14px 18px' }}>
                                <select
                                  value={s.status}
                                  onChange={async (e) => {
                                    const newSt = e.target.value;
                                    await updateTrainerSessionStatusInFirestore(s.id, newSt);
                                    showToast(`Session marked as ${newSt}!`);
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    border: '1px solid',
                                    borderColor: s.status === 'Completed' ? '#A7F3D0' : '#CBD5E1',
                                    backgroundColor: s.status === 'Completed' ? '#ECFDF3' : '#FFFFFF',
                                    color: s.status === 'Completed' ? '#008A38' : '#334155',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <option value="Scheduled">Scheduled</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSession(s);
                                      setSessionForm({
                                        memberId: s.memberId,
                                        date: s.date,
                                        time: s.time,
                                        type: s.type,
                                        duration: s.duration,
                                        status: s.status,
                                        notes: s.notes || '',
                                      });
                                      setShowSessionModal(true);
                                    }}
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #CBD5E1',
                                      backgroundColor: '#FFFFFF',
                                      color: '#475569',
                                      cursor: 'pointer',
                                    }}
                                    title="Edit Session"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (window.confirm('Delete this scheduled session?')) {
                                        await deleteTrainerSessionFromFirestore(s.id);
                                        showToast('Session deleted.');
                                      }
                                    }}
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #FCA5A5',
                                      backgroundColor: '#FEF2F2',
                                      color: '#DC2626',
                                      cursor: 'pointer',
                                    }}
                                    title="Delete Session"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SECTION D: SESSION NOTES
             ================================================================= */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header and Filter */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569' }}>FILTER BY MEMBER:</span>
                  <select
                    value={selectedMemberForNote}
                    onChange={(e) => setSelectedMemberForNote(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <option value="All">All Assigned Members ({myMembers.length})</option>
                    {myMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNoteForm({
                      memberId: myMembers[0]?.id || '',
                      date: new Date().toISOString().split('T')[0],
                      workoutRoutine: '',
                      observations: '',
                      dietHydrationNotes: '',
                      rating: 5,
                    });
                    setEditingNote(null);
                    setShowNoteModal(true);
                  }}
                  style={{
                    backgroundColor: '#00B84A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={15} />
                  <span>Log Workout / Note</span>
                </button>
              </div>

              {/* Notes Grid */}
              {myNotes.filter((n) => selectedMemberForNote === 'All' || n.memberId === selectedMemberForNote).length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px dashed #CBD5E1',
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#64748B',
                  }}
                >
                  <ClipboardList size={42} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                    No Session Notes Recorded
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 16px' }}>
                    Record detailed workout routines, sets, reps, and diet feedback for your clients.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteForm({
                        memberId: myMembers[0]?.id || '',
                        date: new Date().toISOString().split('T')[0],
                        workoutRoutine: '',
                        observations: '',
                        dietHydrationNotes: '',
                        rating: 5,
                      });
                      setEditingNote(null);
                      setShowNoteModal(true);
                    }}
                    style={{
                      backgroundColor: '#00B84A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    + Add First Session Note
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
                  {myNotes
                    .filter((n) => selectedMemberForNote === 'All' || n.memberId === selectedMemberForNote)
                    .map((n) => (
                      <div
                        key={n.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1.5px solid #E2E8F0',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>{n.memberName}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Date: {n.date}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <Star size={13} fill="#D97706" /> {n.rating || 5}/5
                            </span>
                          </div>
                        </div>

                        {/* Routine Details */}
                        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#008A38', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Workout Routine & Reps:
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#1E293B', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                            {n.workoutRoutine}
                          </p>
                        </div>

                        {/* Observations */}
                        {n.observations && (
                          <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                            <strong>Coach Notes:</strong> {n.observations}
                          </div>
                        )}

                        {/* Diet / Hydration */}
                        {n.dietHydrationNotes && (
                          <div style={{ fontSize: '0.74rem', color: '#0369A1', backgroundColor: '#F0F9FF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #BAE6FD' }}>
                            <strong>Nutrition & Diet:</strong> {n.dietHydrationNotes}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNote(n);
                              setNoteForm({
                                memberId: n.memberId,
                                date: n.date,
                                workoutRoutine: n.workoutRoutine,
                                observations: n.observations || '',
                                dietHydrationNotes: n.dietHydrationNotes || '',
                                rating: n.rating || 5,
                              });
                              setShowNoteModal(true);
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#475569',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm('Delete this session note?')) {
                                await deleteTrainerNoteFromFirestore(n.id);
                                showToast('Workout note deleted.');
                              }
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #FCA5A5',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              SECTION E: PRODUCTIVITY TRACKING
             ================================================================= */}
          {activeTab === 'productivity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Productivity Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1.5px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Completion Rate</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#008A38', margin: '4px 0' }}>
                    {mySessions.length > 0
                      ? `${Math.round((completedSessions.length / mySessions.length) * 100)}%`
                      : '100%'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{completedSessions.length} of {mySessions.length} sessions completed</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1.5px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Workout Notes Logged</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#172C83', margin: '4px 0' }}>
                    {myNotes.length}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Detailed client records</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1.5px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Pending Sessions</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', margin: '4px 0' }}>
                    {upcomingSessions.length}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Scheduled upcoming sessions</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1.5px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Trainer Rating</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{trainerProfile?.rating || 5.0}</span>
                    <Star size={20} fill="#D97706" color="#D97706" />
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Official Respire Rating</div>
                </div>
              </div>

              {/* Member Progress Tracking Table */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#00B84A" />
                  <span>Assigned Member Progress Tracking</span>
                </h3>

                {myMembers.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.84rem' }}>No members assigned to track yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                          <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569' }}>MEMBER</th>
                          <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569' }}>WEIGHT</th>
                          <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569' }}>BODY FAT %</th>
                          <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569' }}>BMI</th>
                          <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569' }}>SESSIONS LOGGED</th>
                          <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myMembers.map((m) => {
                          const memberSessionsCount = mySessions.filter((s) => s.memberId === m.id).length;
                          const memberNotesCount = myNotes.filter((n) => n.memberId === m.id).length;

                          return (
                            <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A' }}>{m.name}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>{m.weight ? `${m.weight} kg` : '—'}</td>
                              <td style={{ padding: '12px 14px', color: '#64748B' }}>{m.bodyFat ? `${m.bodyFat}%` : '—'}</td>
                              <td style={{ padding: '12px 14px', color: '#64748B' }}>{m.bmi || '—'}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ fontWeight: 800, color: '#008A38' }}>{memberSessionsCount}</span> sessions •{' '}
                                <span style={{ fontWeight: 700, color: '#172C83' }}>{memberNotesCount}</span> notes
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: m.status === 'Active' ? '#ECFDF3' : '#FEF2F2', color: m.status === 'Active' ? '#008A38' : '#DC2626' }}>
                                  {m.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              SECTION F: PROFILE & SECURITY MANAGEMENT
             ================================================================= */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* Profile Details Edit Card */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '24px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} color="#00B84A" />
                  <span>My Trainer Profile</span>
                </h3>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Read-only fields */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>
                      FULL NAME (MANAGED BY ADMIN)
                    </label>
                    <input
                      disabled
                      value={trainerProfile?.name || ''}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>
                      FIREBASE AUTH EMAIL (VERIFIED)
                    </label>
                    <input
                      disabled
                      value={trainerUser?.email || trainerProfile?.email || ''}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.84rem' }}
                    />
                  </div>

                  {/* Permitted editable personal details */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      MOBILE NUMBER *
                    </label>
                    <input
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98XXX XXXXX"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      SPECIALIZATION
                    </label>
                    <input
                      value={profileForm.specialty}
                      onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                      placeholder="e.g. Strength & Conditioning, HIIT, Functional"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      EXPERIENCE
                    </label>
                    <input
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                      placeholder="e.g. 5+ Years"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      ABOUT & BIO
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Share your coaching philosophy, certifications..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    style={{
                      padding: '11px 16px',
                      backgroundColor: '#00B84A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                      marginTop: '6px',
                    }}
                  >
                    {isSavingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </form>
              </div>

              {/* Password & Security Card */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '24px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="#172C83" />
                  <span>Security & Password Management</span>
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 16px' }}>
                  Update your Firebase Authentication password securely. Passwords are never stored in plain text or in Firestore.
                </p>

                {passSuccess && (
                  <div style={{ backgroundColor: '#ECFDF3', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} />
                    <span>{passSuccess}</span>
                  </div>
                )}

                {passError && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{passError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      CURRENT PASSWORD *
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      NEW PASSWORD (MIN 6 CHARACTERS) *
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                      CONFIRM NEW PASSWORD *
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      id="togglePassShow"
                      checked={showPass}
                      onChange={() => setShowPass(!showPass)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="togglePassShow" style={{ fontSize: '0.76rem', color: '#64748B', cursor: 'pointer' }}>
                      Show passwords in plain text
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass}
                    style={{
                      padding: '11px 16px',
                      backgroundColor: '#172C83',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      cursor: isChangingPass ? 'not-allowed' : 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    {isChangingPass ? 'Updating in Firebase...' : 'Update Password in Firebase'}
                  </button>

                  <div style={{ marginTop: '12px', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        const email = trainerUser?.email || trainerProfile?.email;
                        if (!email) {
                          alert('Email not found.');
                          return;
                        }
                        if (window.confirm(`Send a Firebase password reset email to ${email}?`)) {
                          try {
                            await sendPasswordReset(email);
                            showToast(`Password reset link dispatched to ${email}!`);
                          } catch (err) {
                            alert(err.message);
                          }
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#008A38',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Can't remember current password? Send password reset email &rarr;
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          MODAL 1: SCHEDULE / EDIT SESSION MODAL
         ========================================================================= */}
      {showSessionModal && (
        <div
          onClick={() => setShowSessionModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingSession ? 'Edit Training Session' : 'Schedule New Session'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSaveSession} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  SELECT ASSIGNED MEMBER *
                </label>
                <select
                  required
                  value={sessionForm.memberId}
                  onChange={(e) => setSessionForm({ ...sessionForm, memberId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem' }}
                >
                  <option value="">-- Choose Member --</option>
                  {myMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.planName || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                    DATE *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                    TIME *
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionForm.time}
                    onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                    placeholder="e.g. 07:00 AM"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                    SESSION TYPE
                  </label>
                  <select
                    value={sessionForm.type}
                    onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  >
                    <option value="Strength & Hypertrophy">Strength & Hypertrophy</option>
                    <option value="Cardio & HIIT">Cardio & HIIT</option>
                    <option value="Functional Fitness">Functional Fitness</option>
                    <option value="Flexibility & Core">Flexibility & Core</option>
                    <option value="Assessment & Metrics">Assessment & Metrics</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                    STATUS
                  </label>
                  <select
                    value={sessionForm.status}
                    onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  SESSION OBJECTIVE / NOTES
                </label>
                <textarea
                  rows={2}
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                  placeholder="Target muscle groups, intensity or focus..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#00B84A', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingSession ? 'Update Session' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD / EDIT WORKOUT NOTE MODAL
         ========================================================================= */}
      {showNoteModal && (
        <div
          onClick={() => setShowNoteModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingNote ? 'Edit Workout Note' : 'Log Session & Workout Details'}
              </h3>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                    ASSIGNED MEMBER *
                  </label>
                  <select
                    required
                    value={noteForm.memberId}
                    onChange={(e) => setNoteForm({ ...noteForm, memberId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  >
                    <option value="">-- Choose Member --</option>
                    {myMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                    DATE *
                  </label>
                  <input
                    type="date"
                    required
                    value={noteForm.date}
                    onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  WORKOUT ROUTINE, SETS & WEIGHTS *
                </label>
                <textarea
                  required
                  rows={3}
                  value={noteForm.workoutRoutine}
                  onChange={(e) => setNoteForm({ ...noteForm, workoutRoutine: e.target.value })}
                  placeholder="e.g.&#10;• Barbell Squats: 4 sets x 10 reps (60kg)&#10;• Leg Press: 3 sets x 12 reps (120kg)&#10;• Plank: 3 x 60s"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', lineHeight: 1.4 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  COACH OBSERVATIONS & ADVICE
                </label>
                <textarea
                  rows={2}
                  value={noteForm.observations}
                  onChange={(e) => setNoteForm({ ...noteForm, observations: e.target.value })}
                  placeholder="Form feedback, recovery needs, intensity..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                    DIET / HYDRATION NOTES
                  </label>
                  <input
                    type="text"
                    value={noteForm.dietHydrationNotes}
                    onChange={(e) => setNoteForm({ ...noteForm, dietHydrationNotes: e.target.value })}
                    placeholder="Protein intake, water..."
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                    SCORE (1–5 STARS)
                  </label>
                  <select
                    value={noteForm.rating}
                    onChange={(e) => setNoteForm({ ...noteForm, rating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Satisfactory)</option>
                    <option value={2}>⭐⭐ (2 - Needs Improvement)</option>
                    <option value={1}>⭐ (1 - Low Energy)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#00B84A', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingNote ? 'Update Note' : 'Save Session Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: VIEW MEMBER FULL PROFILE & HISTORY
         ========================================================================= */}
      {viewingMember && (
        <div
          onClick={() => setViewingMember(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ECFDF3', color: '#008A38', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900 }}>
                  {viewingMember.name ? viewingMember.name[0] : 'M'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    {viewingMember.name}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>ID: {viewingMember.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Membership details banner */}
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px', fontSize: '0.8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><strong>Plan:</strong> {viewingMember.planName}</div>
                  <div><strong>Status:</strong> <span style={{ color: '#008A38', fontWeight: 800 }}>{viewingMember.status}</span></div>
                  <div><strong>Join Date:</strong> {viewingMember.joinDate}</div>
                  <div><strong>Expiry Date:</strong> {viewingMember.expiryDate}</div>
                  {viewingMember.specialTrainingLabel && (
                    <div style={{ gridColumn: 'span 2', color: '#008A38', fontWeight: 800 }}>
                      ⚡ {viewingMember.specialTrainingLabel}
                    </div>
                  )}
                </div>
              </div>

              {/* Health stats */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Physical Fitness Metrics
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748B' }}>Weight</div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{viewingMember.weight ? `${viewingMember.weight} kg` : '—'}</div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748B' }}>Height</div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{viewingMember.height ? `${viewingMember.height} cm` : '—'}</div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748B' }}>BMI</div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{viewingMember.bmi || '—'}</div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                    <div style={{ color: '#64748B' }}>Body Fat %</div>
                    <div style={{ fontWeight: 800, color: '#008A38', fontSize: '0.9rem' }}>{viewingMember.bodyFat ? `${viewingMember.bodyFat}%` : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Past Session Notes for this member */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Workout Notes History ({myNotes.filter((n) => n.memberId === viewingMember.id).length})
                </h4>
                {myNotes.filter((n) => n.memberId === viewingMember.id).length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: 0 }}>No session notes logged for this member yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {myNotes
                      .filter((n) => n.memberId === viewingMember.id)
                      .map((n) => (
                        <div key={n.id} style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0F172A', marginBottom: '3px' }}>
                            <span>{n.date}</span>
                            <span style={{ color: '#D97706' }}>{n.rating || 5} ★</span>
                          </div>
                          <div style={{ color: '#334155' }}>{n.workoutRoutine}</div>
                          {n.observations && <div style={{ color: '#64748B', fontStyle: 'italic', marginTop: '2px' }}>{n.observations}</div>}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                style={{ padding: '8px 16px', backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
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
