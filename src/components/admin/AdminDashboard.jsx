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
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        userSelect: 'none',
      }}
    >
      {/* 1. FIXED BRAND HEADER — Never clipped, never scrolled away */}
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
            onClick={() => setMobileSidebarOpen(false)}
            className="admin-mobile-toggle"
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
              backgroundColor: isSuperAdmin
                ? 'rgba(23, 44, 131, 0.08)'
                : 'rgba(0, 184, 74, 0.08)',
              border: isSuperAdmin
                ? '1px solid rgba(23, 44, 131, 0.25)'
                : '1px solid rgba(0, 184, 74, 0.25)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: isSuperAdmin ? '#172C83' : '#008A38',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <ShieldCheck size={12} />
            <span>{isSuperAdmin ? 'Super Admin' : 'Branch Manager'}</span>
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
            {isSuperAdmin && selectedBranch === 'all'
              ? 'All Branches (Vishrambag & Vijaynagar)'
              : currentBranchMeta?.name || adminInfo?.branchName || 'Respire Fitness'}
          </span>
        </div>
      </div>

      {/* 2. SCROLLABLE NAVIGATION LINKS */}
      <div
        className="admin-sidebar-scroll"
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
            const isDueBadge = item.id === 'plans' && String(item.badge || '').includes('Due');
            const isNewBadge = item.id === 'inquiries' && String(item.badge || '').includes('New');

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

                {item.badge !== null && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      letterSpacing: '0.02em',
                      ...(isDueBadge
                        ? {
                            backgroundColor: '#FEF3C7',
                            border: '1px solid #FDE68A',
                            color: '#B45309',
                          }
                        : isNewBadge
                        ? {
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1D4ED8',
                          }
                        : active
                        ? {
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            color: '#FFFFFF',
                          }
                        : {
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#64748B',
                          }),
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
        {/* Logout Option Only */}
        <button
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Desktop Persistent White Executive Sidebar */}
      <aside
        style={{
          width: '264px',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'none',
          borderRight: '1px solid #E2E8F0',
          zIndex: 90,
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
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
          }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: '280px',
              backgroundColor: '#FFFFFF',
              height: '100%',
              boxShadow: '4px 0 28px rgba(15, 23, 42, 0.15)',
              display: 'flex',
              flexDirection: 'column',
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
        .admin-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 4px;
        }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.16);
        }
      `}</style>
    </div>
  );
}
