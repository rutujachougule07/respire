import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Dumbbell,
  BarChart3,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  ShieldCheck,
  Bell,
  ArrowLeft,
  Building2,
  MessageSquare,
  Globe,
} from 'lucide-react';
import {
  BRANCHES,
  INITIAL_MEMBERS,
  INITIAL_PLANS,
  INITIAL_TRAINERS,
  INITIAL_ADDON_REVENUE,
} from './initialData';
import {
  seedInitialDataIfEmpty,
  subscribeToCollection,
  deduplicateById,
} from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import BranchesTab from './BranchesTab';
import MembersTab from './MembersTab';
import PlansRenewalsTab from './PlansRenewalsTab';
import TrainersTab from './TrainersTab';
import AnalyticsTab from './AnalyticsTab';
import InquiriesTab from './InquiriesTab';

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function AdminDashboard({ adminInfo: propAdminInfo, onLogout: propOnLogout, plans: propPlans, setPlans: propSetPlans }) {
  const { adminSession: contextAdminSession, logout } = useAuth();
  const navigate = useNavigate();

  const adminInfo = propAdminInfo || contextAdminSession;
  const isSuperAdmin = adminInfo?.role === 'Super Admin';

  const [selectedBranch, setSelectedBranch] = useState(
    isSuperAdmin ? 'all' : adminInfo?.branchId || 'vishrambag'
  );
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'branches' : 'members');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Synchronized state with localStorage fallback
  const [members, setMembers] = useState(() => loadState('rf_admin_members_v3', INITIAL_MEMBERS));
  const [trainers, setTrainers] = useState(() => loadState('rf_admin_trainers_v3', INITIAL_TRAINERS));
  const [addonRevenue, setAddonRevenue] = useState(() => loadState('rf_admin_addons_v3', INITIAL_ADDON_REVENUE));
  const [inquiries, setInquiries] = useState([]);

  // Managed plans (either from props or local state synced to Firestore)
  const [localPlans, setLocalPlans] = useState(() => loadState('rf_official_plans_v2', INITIAL_PLANS));
  const plans = propPlans || localPlans;
  const setPlans = propSetPlans || setLocalPlans;

  // Real-time Firestore sync & idempotent database seeding
  useEffect(() => {
    // 1. Seed initial gym data if Firestore collection is fresh (seed lock prevents duplicates)
    seedInitialDataIfEmpty().catch(console.warn);

    // 2. Subscribe to Firestore members collection
    const unsubMembers = subscribeToCollection('members', (data) => {
      if (data && data.length > 0) {
        setMembers((prev) => deduplicateById([...data]));
      }
    }, null, INITIAL_MEMBERS);

    // 3. Subscribe to Firestore trainers collection
    const unsubTrainers = subscribeToCollection('trainers', (data) => {
      if (data && data.length > 0) {
        setTrainers((prev) => deduplicateById([...data]));
      }
    }, null, INITIAL_TRAINERS);

    // 4. Subscribe to Firestore plans collection
    const unsubPlans = subscribeToCollection('plans', (data) => {
      if (data && data.length > 0) {
        setPlans((prev) => deduplicateById([...data]));
      }
    }, null, INITIAL_PLANS);

    // 5. Subscribe to Firestore addons collection
    const unsubAddons = subscribeToCollection('addons', (data) => {
      if (data && data.length > 0) {
        setAddonRevenue((prev) => deduplicateById([...data]));
      }
    }, null, INITIAL_ADDON_REVENUE);

    // 6. Subscribe to Firestore inquiries collection (real-time website leads)
    const unsubInquiries = subscribeToCollection('inquiries', (data) => {
      setInquiries(deduplicateById(data));
    }, null, []);

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubTrainers) unsubTrainers();
      if (unsubPlans) unsubPlans();
      if (unsubAddons) unsubAddons();
      if (unsubInquiries) unsubInquiries();
    };
  }, []);

  // Sync to local cache
  useEffect(() => {
    try {
      localStorage.setItem('rf_admin_members_v3', JSON.stringify(deduplicateById(members)));
      localStorage.setItem('rf_admin_trainers_v3', JSON.stringify(deduplicateById(trainers)));
      localStorage.setItem('rf_admin_addons_v3', JSON.stringify(deduplicateById(addonRevenue)));
    } catch {
      // ignore
    }
  }, [members, trainers, addonRevenue]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const handleLogout = async () => {
    if (propOnLogout) {
      propOnLogout();
    }
    await logout();
    navigate('/login', { replace: true });
  };

  // Scope records to selectedBranch
  const effectiveBranchId = isSuperAdmin ? selectedBranch : adminInfo?.branchId || 'vishrambag';
  const currentBranchMeta = BRANCHES.find((b) => b.id === effectiveBranchId);

  const scopedMembers =
    effectiveBranchId === 'all'
      ? members
      : members.filter((m) => m.branchId === effectiveBranchId);
  const scopedTrainers =
    effectiveBranchId === 'all'
      ? trainers
      : trainers.filter((t) => t.branchId === effectiveBranchId);
  const scopedAddons =
    effectiveBranchId === 'all'
      ? addonRevenue
      : addonRevenue.filter((a) => a.branchId === effectiveBranchId);

  const activeMembersCount = scopedMembers.filter((m) => m.status === 'Active').length;
  const expiringCount = scopedMembers.filter((m) => {
    if (m.status !== 'Active') return false;
    const diff = Math.ceil(
      (new Date(m.expiryDate) - new Date('2026-11-18')) / (1000 * 60 * 60 * 24)
    );
    return diff <= 15;
  }).length;

  const newInquiriesCount = inquiries.filter((inq) => inq.status === 'New').length;

  const navItems = [
    ...(isSuperAdmin
      ? [{ id: 'branches', label: 'Branches & Managers', icon: Building2, badge: BRANCHES.length }]
      : []),
    { id: 'members', label: 'Member Management', icon: Users, badge: activeMembersCount },
    {
      id: 'plans',
      label: 'Plans & Renewals',
      icon: CreditCard,
      badge: expiringCount > 0 ? `${expiringCount} Due` : null,
    },
    { id: 'trainers', label: 'Trainer Management', icon: Dumbbell, badge: scopedTrainers.length },
    {
      id: 'inquiries',
      label: 'Website Inquiries',
      icon: MessageSquare,
      badge: newInquiriesCount > 0 ? `${newInquiriesCount} New` : null,
    },
    { id: 'analytics', label: 'Revenue & Analytics', icon: BarChart3, badge: null },
  ];

  const handleInspectBranch = (branchId) => {
    setSelectedBranch(branchId);
    setActiveTab('members');
    const b = BRANCHES.find((br) => br.id === branchId);
    showToast(`Switched view to ${b?.name || branchId}`);
  };

  const SidebarContent = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '24px 18px',
      }}
    >
      <div>
        {/* Logo & Role Badge */}
        <div
          style={{
            paddingBottom: '20px',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <img
            src="/logo_white_text_header.png"
            alt="Respire Fitness"
            style={{ height: '44px', width: 'auto', objectFit: 'contain', marginBottom: '10px' }}
          />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: isSuperAdmin
                ? 'rgba(23, 44, 131, 0.45)'
                : 'rgba(0, 184, 74, 0.18)',
              border: isSuperAdmin
                ? '1px solid rgba(99, 132, 255, 0.5)'
                : '1px solid rgba(0, 184, 74, 0.4)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: isSuperAdmin ? '#93C5FD' : '#00D256',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <ShieldCheck size={12} />
            <span>{isSuperAdmin ? 'Super Admin Panel' : 'Branch Manager'}</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#CBD5E1', fontWeight: 700, marginTop: '8px' }}>
            {adminInfo?.branchName || 'Respire Fitness'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: active
                    ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)'
                    : 'transparent',
                  color: active ? '#FFFFFF' : '#CBD5E1',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.86rem',
                  textAlign: 'left',
                  boxShadow: active ? '0 8px 18px rgba(0, 184, 74, 0.28)' : 'none',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </span>
                {item.badge !== null && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: active
                        ? 'rgba(255,255,255,0.22)'
                        : 'rgba(255,255,255,0.08)',
                      color: active ? '#FFFFFF' : '#00D256',
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

      {/* Logged-in User, View Public Site & Logout */}
      <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: '#94A3B8',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '14px',
          }}
        >
          <Globe size={15} color="#00D256" />
          <span>View Public Website</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FFFFFF' }}>
              {adminInfo?.name || 'Manager'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{adminInfo?.email}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Desktop Persistent Dark Sidebar */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          display: 'none',
        }}
        className="admin-desktop-sidebar"
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
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
          }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: '280px',
              backgroundColor: '#0F172A',
              height: '100%',
              boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Crisp White Top Header Bar */}
        <header
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '14px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="admin-mobile-toggle"
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#F1F5F9',
                color: '#0F172A',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#008A38',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                {currentBranchMeta
                  ? `${currentBranchMeta.name} • ${currentBranchMeta.phone}`
                  : 'Super Admin Master Control • All Branches Combined'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>
                {isSuperAdmin
                  ? 'Super Admin Dashboard'
                  : `${currentBranchMeta?.shortName || 'Branch'} Manager Dashboard`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Super Admin Live Branch Switcher */}
            {isSuperAdmin && (
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#F1F5F9',
                  padding: '4px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  gap: '4px',
                }}
              >
                {[
                  { id: 'all', label: 'All Branches' },
                  ...BRANCHES.map((b) => ({ id: b.id, label: b.shortName })),
                ].map((opt) => {
                  const active = selectedBranch === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedBranch(opt.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        backgroundColor: active ? '#008A38' : 'transparent',
                        color: active ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
              }}
            >
              <Globe size={14} color="#008A38" />
              <span>Public Website</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Active Module Area */}
        <main
          style={{
            padding: '26px 28px 60px',
            maxWidth: '1320px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {activeTab === 'branches' && isSuperAdmin && (
            <BranchesTab
              members={members}
              trainers={trainers}
              plans={plans}
              onSelectBranch={handleInspectBranch}
            />
          )}

          {activeTab === 'members' && (
            <MembersTab
              members={scopedMembers}
              setMembers={setMembers}
              plans={plans}
              trainers={scopedTrainers}
              activeBranchId={effectiveBranchId}
              isSuperAdmin={isSuperAdmin}
              showToast={showToast}
            />
          )}

          {activeTab === 'plans' && (
            <PlansRenewalsTab
              plans={plans}
              setPlans={setPlans}
              members={scopedMembers}
              setMembers={setMembers}
              showToast={showToast}
            />
          )}

          {activeTab === 'trainers' && (
            <TrainersTab
              trainers={scopedTrainers}
              setTrainers={setTrainers}
              members={scopedMembers}
              setMembers={setMembers}
              activeBranchId={effectiveBranchId}
              isSuperAdmin={isSuperAdmin}
              showToast={showToast}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesTab
              inquiries={inquiries}
              setInquiries={setInquiries}
              activeBranchId={effectiveBranchId}
              showToast={showToast}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              members={scopedMembers}
              plans={plans}
              addonRevenue={scopedAddons}
              setAddonRevenue={setAddonRevenue}
              activeBranchId={effectiveBranchId}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Live Toast Feedback */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            zIndex: 2000,
            borderLeft: '4px solid #00C952',
            fontSize: '0.88rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} color="#00C952" />
          <span>{toast}</span>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .admin-desktop-sidebar {
            display: block !important;
          }
          .admin-mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
