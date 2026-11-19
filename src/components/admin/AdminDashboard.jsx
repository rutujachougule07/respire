import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  BRANCHES,
  INITIAL_MEMBERS,
  INITIAL_TRAINERS,
  INITIAL_ADDON_REVENUE,
} from './initialData';
import BranchesTab from './BranchesTab';
import MembersTab from './MembersTab';
import PlansRenewalsTab from './PlansRenewalsTab';
import TrainersTab from './TrainersTab';
import AnalyticsTab from './AnalyticsTab';

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function AdminDashboard({ adminInfo, onLogout, plans, setPlans }) {
  const isSuperAdmin = adminInfo?.role === 'Super Admin';
  const [selectedBranch, setSelectedBranch] = useState(isSuperAdmin ? 'all' : adminInfo?.branchId || 'vishrambag');
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'branches' : 'members');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [members, setMembers] = useState(() => loadState('rf_admin_members_v3', INITIAL_MEMBERS));
  const [trainers, setTrainers] = useState(() => loadState('rf_admin_trainers_v3', INITIAL_TRAINERS));
  const [addonRevenue, setAddonRevenue] = useState(() => loadState('rf_admin_addons_v3', INITIAL_ADDON_REVENUE));

  useEffect(() => {
    try {
      localStorage.setItem('rf_admin_members_v3', JSON.stringify(members));
      localStorage.setItem('rf_admin_trainers_v3', JSON.stringify(trainers));
      localStorage.setItem('rf_admin_addons_v3', JSON.stringify(addonRevenue));
    } catch {
      // ignore storage errors
    }
  }, [members, trainers, addonRevenue]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  // Scope records to selectedBranch (Super Admin can choose 'all', 'vishrambag', or 'branch2'; Managers are locked to their branch)
  const effectiveBranchId = isSuperAdmin ? selectedBranch : adminInfo?.branchId || 'vishrambag';
  const currentBranchMeta = BRANCHES.find((b) => b.id === effectiveBranchId);

  const scopedMembers =
    effectiveBranchId === 'all' ? members : members.filter((m) => m.branchId === effectiveBranchId);
  const scopedTrainers =
    effectiveBranchId === 'all' ? trainers : trainers.filter((t) => t.branchId === effectiveBranchId);
  const scopedAddons =
    effectiveBranchId === 'all' ? addonRevenue : addonRevenue.filter((a) => a.branchId === effectiveBranchId);

  const activeMembersCount = scopedMembers.filter((m) => m.status === 'Active').length;
  const expiringCount = scopedMembers.filter((m) => {
    if (m.status !== 'Active') return false;
    const diff = Math.ceil((new Date(m.expiryDate) - new Date('2026-11-18')) / (1000 * 60 * 60 * 24));
    return diff <= 15;
  }).length;

  const navItems = [
    ...(isSuperAdmin ? [{ id: 'branches', label: 'Branches & Managers', icon: Building2, badge: BRANCHES.length }] : []),
    { id: 'members', label: 'Member Management', icon: Users, badge: activeMembersCount },
    { id: 'plans', label: 'Plans & Renewals', icon: CreditCard, badge: expiringCount > 0 ? `${expiringCount} Due` : null },
    { id: 'trainers', label: 'Trainer Management', icon: Dumbbell, badge: scopedTrainers.length },
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
        <div style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
              backgroundColor: isSuperAdmin ? 'rgba(23, 44, 131, 0.45)' : 'rgba(0, 184, 74, 0.18)',
              border: isSuperAdmin ? '1px solid rgba(99, 132, 255, 0.5)' : '1px solid rgba(0, 184, 74, 0.4)',
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
                  background: active ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)' : 'transparent',
                  color: active ? '#FFFFFF' : '#CBD5E1',
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.86rem',
                  textAlign: 'left',
                  boxShadow: active ? '0 8px 18px rgba(0, 184, 74, 0.28)' : 'none',
                  transition: 'all 0.2s ease',
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
                      backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
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

      {/* Logged-in User & Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '2px' }}>Logged in as</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF' }}>{adminInfo?.name || 'Admin'}</div>
        <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '14px', wordBreak: 'break-all' }}>
          {adminInfo?.email || adminInfo?.user}
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            color: '#FFFFFF',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <LogOut size={15} color="#00D256" />
          <span>Logout & Back to Site</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F4F8F6' }}>
      {/* Desktop Gradient Black Sidebar */}
      <aside
        className="admin-desktop-sidebar"
        style={{
          width: '280px',
          flexShrink: 0,
          background: 'linear-gradient(160deg, #050505 0%, #0E1218 52%, #1A202A 100%)',
          color: '#FFFFFF',
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid rgba(0, 184, 74, 0.2)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2400,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              height: '100%',
              background: 'linear-gradient(160deg, #050505 0%, #0E1218 52%, #1A202A 100%)',
              color: '#FFFFFF',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setMobileSidebarOpen(false)}
              style={{ position: 'absolute', top: '18px', right: '16px', color: '#FFFFFF' }}
            >
              <X size={20} />
            </button>
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
              }}
            >
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#008A38', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {currentBranchMeta
                  ? `${currentBranchMeta.name} • ${currentBranchMeta.phone}`
                  : 'Super Admin Master Control • All Branches Combined'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>
                {isSuperAdmin ? 'Super Admin Dashboard' : `${currentBranchMeta?.shortName || 'Branch'} Manager Dashboard`}
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
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        background: active ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)' : 'transparent',
                        color: active ? '#FFFFFF' : '#475569',
                        transition: 'all 0.2s',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {expiringCount > 0 && (
              <button
                onClick={() => setActiveTab('plans')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 13px',
                  borderRadius: '999px',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                }}
              >
                <Bell size={14} />
                <span>{expiringCount} Due</span>
              </button>
            )}

            <button
              onClick={onLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                color: '#0F172A',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Active Module Area */}
        <main style={{ padding: '26px 28px 60px', maxWidth: '1320px', width: '100%', margin: '0 auto' }}>
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
            zIndex: 3000,
            background: 'linear-gradient(135deg, #00C952 0%, #007A31 100%)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '0.86rem',
            fontWeight: 700,
            boxShadow: '0 14px 32px rgba(0, 148, 59, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      <style>{`
        .admin-desktop-sidebar {
          display: block;
        }
        .admin-mobile-toggle {
          display: none;
        }
        @media (max-width: 960px) {
          .admin-desktop-sidebar {
            display: none !important;
          }
          .admin-mobile-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}
