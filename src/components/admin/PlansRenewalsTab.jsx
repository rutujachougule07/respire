import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Bell,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  Info,
  Dumbbell,
  Award,
} from 'lucide-react';
import { OFFICIAL_FEE_RULES, PERSONAL_TRAINING_RATES } from './initialData';
import { savePlanToFirestore, deletePlanFromFirestore, saveMemberToFirestore } from '../../services/firestoreService';

function getDaysRemaining(expiryDate) {
  const today = new Date('2026-11-18');
  const exp = new Date(expiryDate);
  return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
}

function addMonths(dateStr, months) {
  const base = new Date(dateStr);
  const today = new Date('2026-11-18');
  const start = base > today ? base : today;
  start.setMonth(start.getMonth() + Number(months || 1));
  return start.toISOString().split('T')[0];
}

export default function PlansRenewalsTab({ plans, setPlans, members, setMembers, showToast }) {
  const [renewalFilter, setRenewalFilter] = useState('Expiring');
  const [planBranchFilter, setPlanBranchFilter] = useState('all');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const [planForm, setPlanForm] = useState({
    branchId: 'vishrambag',
    durationLabel: '1 Month',
    name: '',
    durationMonths: 1,
    price: 5500,
    freezeDays: 0,
    badge: 'Limited Time Offer',
    featuresText: 'Full Gym Floor Access, Biometric Check-in, Locker Access',
    status: 'Active',
    isPopular: false,
  });

  const openAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({
      branchId: planBranchFilter !== 'all' ? planBranchFilter : 'vishrambag',
      durationLabel: '2 Months',
      name: '2 Months Membership',
      durationMonths: 2,
      price: 9500,
      freezeDays: 0,
      badge: 'Limited Time Offer',
      featuresText: 'Full Gym Floor Access, Biometric Check-in, Locker & Shower Access',
      status: 'Active',
      isPopular: false,
    });
    setIsPlanModalOpen(true);
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      branchId: plan.branchId || 'vishrambag',
      durationLabel:
        plan.durationLabel ||
        (plan.durationMonths === 12
          ? '1 Year'
          : `${plan.durationMonths} ${plan.durationMonths === 1 ? 'Month' : 'Months'}`),
      name: plan.name,
      durationMonths: plan.durationMonths,
      price: plan.price,
      freezeDays: plan.freezeDays || 0,
      badge: plan.badge || 'Limited Time Offer',
      featuresText: (plan.features || []).join(', '),
      status: plan.status || 'Active',
      isPopular: Boolean(plan.isPopular),
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (isSavingPlan) return; // Prevent double submission
    setIsSavingPlan(true);

    try {
      const featuresArr = planForm.featuresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingPlan) {
        const updatedPlan = {
          ...editingPlan,
          branchId: planForm.branchId || 'vishrambag',
          branchName: planForm.branchId === 'branch2' ? 'Vijaynagar Branch' : 'Vishrambag Branch',
          durationLabel: planForm.durationLabel,
          name: planForm.name || `${planForm.durationLabel} Membership`,
          durationMonths: Number(planForm.durationMonths),
          price: Number(planForm.price),
          freezeDays: Number(planForm.freezeDays),
          badge: planForm.badge,
          features: featuresArr,
          status: planForm.status,
          isPopular: planForm.isPopular,
        };

        await savePlanToFirestore(updatedPlan).catch((err) =>
          console.warn('Firestore plan update notice:', err.message)
        );

        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? updatedPlan : p)));
        showToast(`Updated "${planForm.durationLabel}" plan (₹${Number(planForm.price).toLocaleString('en-IN')}/-)`);
      } else {
        const newPlan = {
          id: `plan-${Date.now()}`,
          branchId: planForm.branchId || 'vishrambag',
          branchName: planForm.branchId === 'branch2' ? 'Vijaynagar Branch' : 'Vishrambag Branch',
          durationLabel: planForm.durationLabel,
          name: planForm.name || `${planForm.durationLabel} Membership`,
          durationMonths: Number(planForm.durationMonths),
          price: Number(planForm.price),
          freezeDays: Number(planForm.freezeDays),
          badge: planForm.badge,
          features: featuresArr,
          status: planForm.status,
          isPopular: planForm.isPopular,
        };

        await savePlanToFirestore(newPlan).catch((err) =>
          console.warn('Firestore plan insert notice:', err.message)
        );

        setPlans((prev) => [...prev, newPlan]);
        showToast(`Added "${planForm.durationLabel}" plan (₹${Number(planForm.price).toLocaleString('en-IN')}/-)`);
      }
      setIsPlanModalOpen(false);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async (plan) => {
    await deletePlanFromFirestore(plan.id).catch((err) =>
      console.warn('Firestore plan delete notice:', err.message)
    );
    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    showToast(`Deleted "${plan.durationLabel || plan.name}" from Fee Structure`);
  };

  const togglePlanStatus = async (plan) => {
    const next = plan.status === 'Active' ? 'Paused' : 'Active';
    const updated = { ...plan, status: next };
    await savePlanToFirestore(updated).catch((err) =>
      console.warn('Firestore plan status notice:', err.message)
    );
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
    showToast(`"${plan.durationLabel || plan.name}" marked as ${next}`);
  };

  const handleSendReminder = (member) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, reminderSentAt: `Sent today at ${timestamp}` } : m))
    );
    showToast(`WhatsApp renewal reminder sent to ${member.name} (${member.phone})`);
  };

  const handleQuickRenew = async (member) => {
    const matchedPlan = plans.find((p) => p.id === member.planId);
    const months = matchedPlan ? matchedPlan.durationMonths : 1;
    const newExpiry = addMonths(member.expiryDate, months);
    const updatedMember = {
      ...member,
      expiryDate: newExpiry,
      status: 'Active',
      reminderSentAt: null,
    };

    await saveMemberToFirestore(updatedMember).catch((err) =>
      console.warn('Firestore renewal sync notice:', err.message)
    );

    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? updatedMember : m))
    );
    showToast(`Renewed ${member.name}'s ${member.planName} until ${newExpiry}`);
  };

  const activeMembers = members.filter((m) => m.status === 'Active');
  const renewalsList = activeMembers
    .map((m) => ({ ...m, daysLeft: getDaysRemaining(m.expiryDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .filter((m) => {
      if (renewalFilter === 'Expiring') return m.daysLeft <= 15 && m.daysLeft >= 0;
      if (renewalFilter === 'Expired') return m.daysLeft < 0;
      return true;
    });

  const expiringCount = activeMembers.filter((m) => {
    const d = getDaysRemaining(m.expiryDate);
    return d <= 15 && d >= 0;
  }).length;

  const expiredCount = activeMembers.filter((m) => getDaysRemaining(m.expiryDate) < 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* SECTION 1: OFFICIAL MEMBERSHIP FEE STRUCTURE MANAGER (ADD / EDIT / DELETE) */}
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
              Membership Fee Structure & Renewals
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
              Add, Edit, or Delete official membership plans (changes sync live to the website).
            </p>
          </div>
          <button onClick={openAddPlan} className="btn btn-primary btn-sm" style={{ borderRadius: '10px' }}>
            <Plus size={16} />
            <span>Add New Plan</span>
          </button>
        </div>

        {/* Clean Fee Structure Table (Exact Standee Mirror + Edit/Delete Actions) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid rgba(0, 184, 74, 0.22)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #00C952 0%, #008A37 100%)',
              padding: '16px 22px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '1.08rem', fontWeight: 900 }}>RESPIRE FITNESS — Membership Fee Structure</div>
              <div style={{ fontSize: '0.76rem', color: '#D1FAE5', fontWeight: 600 }}>
                Live pricing table synced with your website • Edit, Delete, or Add tiers anytime
              </div>
            </div>
            <button
              onClick={openAddPlan}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#007A31',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={14} /> Add Fee Tier
            </button>
          </div>

          {/* Branch Filter Tabs for Plans */}
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginRight: '6px' }}>
              Filter By Branch:
            </span>
            <button
              onClick={() => setPlanBranchFilter('all')}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.76rem',
                fontWeight: 800,
                backgroundColor: planBranchFilter === 'all' ? '#0F172A' : '#E2E8F0',
                color: planBranchFilter === 'all' ? '#FFFFFF' : '#475569',
              }}
            >
              All Branches ({plans.length})
            </button>
            <button
              onClick={() => setPlanBranchFilter('vishrambag')}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.76rem',
                fontWeight: 800,
                backgroundColor: planBranchFilter === 'vishrambag' ? '#008A38' : '#E2E8F0',
                color: planBranchFilter === 'vishrambag' ? '#FFFFFF' : '#475569',
              }}
            >
              Vishrambag ({plans.filter((p) => p.branchId === 'vishrambag' || !p.branchId).length})
            </button>
            <button
              onClick={() => setPlanBranchFilter('branch2')}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.76rem',
                fontWeight: 800,
                backgroundColor: planBranchFilter === 'branch2' ? '#172C83' : '#E2E8F0',
                color: planBranchFilter === 'branch2' ? '#FFFFFF' : '#475569',
              }}
            >
              Vijaynagar ({plans.filter((p) => p.branchId === 'branch2' || p.branchId === 'vijaynagar').length})
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F4FBF7', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '13px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Branch</th>
                  <th style={{ padding: '13px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Duration</th>
                  <th style={{ padding: '13px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Plan Title</th>
                  <th style={{ padding: '13px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Charges (₹)</th>
                  <th style={{ padding: '13px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '13px 20px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: '#64748B' }}>
                      No plans added yet. Click "Add New Plan" to create one.
                    </td>
                  </tr>
                ) : (
                  plans
                    .filter((plan) => {
                      if (planBranchFilter === 'all') return true;
                      if (planBranchFilter === 'branch2') {
                        return plan.branchId === 'branch2' || plan.branchId === 'vijaynagar';
                      }
                      return plan.branchId === 'vishrambag' || !plan.branchId;
                    })
                    .map((plan) => {
                    const isVijaynagar = plan.branchId === 'branch2' || plan.branchId === 'vijaynagar';
                    const durationText =
                      plan.durationLabel ||
                      (plan.durationMonths === 12
                        ? '1 Year'
                        : plan.durationMonths < 1
                        ? '1 Day'
                        : `${plan.durationMonths} ${plan.durationMonths === 1 ? 'Month' : 'Months'}`);
                    const memberCount = members.filter((m) => m.planId === plan.id && m.status === 'Active').length;

                    return (
                      <tr key={plan.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            style={{
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              backgroundColor: isVijaynagar ? '#EEF2FF' : '#ECFDF3',
                              color: isVijaynagar ? '#172C83' : '#008A38',
                              border: isVijaynagar ? '1px solid #C7D2FE' : '1px solid #A7F3D0',
                            }}
                          >
                            {isVijaynagar ? 'Vijaynagar' : 'Vishrambag'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 900, fontSize: '0.96rem', color: '#0F172A' }}>
                          {durationText}
                          {plan.isPopular && (
                            <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#EEF2FF', color: '#172C83', fontSize: '0.68rem', fontWeight: 800 }}>
                              POPULAR
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>{plan.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{memberCount} active members</div>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 900, fontSize: '1.05rem', color: '#008A38' }}>
                          ₹{Number(plan.price).toLocaleString('en-IN')}/-
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <button
                            onClick={() => togglePlanStatus(plan)}
                            title="Click to toggle Active/Paused"
                            style={{
                              padding: '4px 11px',
                              borderRadius: '999px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              backgroundColor: plan.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                              color: plan.status === 'Active' ? '#15803D' : '#64748B',
                            }}
                          >
                            {plan.status}
                          </button>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => openEditPlan(plan)}
                              title="Edit Plan"
                              aria-label="Edit Plan"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: '#ECFDF3',
                                color: '#008A38',
                                border: '1px solid rgba(0, 184, 74, 0.25)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#008A38';
                                e.currentTarget.style.color = '#FFFFFF';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ECFDF3';
                                e.currentTarget.style.color = '#008A38';
                              }}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan)}
                              title="Delete Plan"
                              aria-label="Delete Plan"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#DC2626';
                                e.currentTarget.style.color = '#FFFFFF';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEF2F2';
                                e.currentTarget.style.color = '#DC2626';
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Official Standee Terms Footer Inside Table Card */}
          <div style={{ backgroundColor: '#F8FCFA', borderTop: '1px solid #E2E8F0', padding: '16px 22px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#008A38', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} /> Official Fee Rules & Gym Timings
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '6px 18px', fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
              {OFFICIAL_FEE_RULES.map((r, i) => (
                <div key={i}>* {r}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1.5: OFFICIAL BRANCH-WISE PERSONAL TRAINING (PT) CHARGES */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            padding: '16px 22px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 201, 82, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00D256',
              }}
            >
              <Dumbbell size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900 }}>
                Official Personal Training (PT) Fee Structure
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                Branch-specific 1-on-1 coaching rates for Vishrambag & Vijaynagar
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Vishrambag Branch Box */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '16px',
              backgroundColor: '#F4FBF7',
              border: '1.5px solid rgba(0, 184, 74, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#008A38' }}>
                Vishrambag Branch (R City Mall)
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ECFDF3', color: '#008A38' }}>
                Phone: 7798001777
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #D1FAE5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>GENERAL PERSONAL TRAINING</span>
                  <span style={{ fontSize: '0.72rem', color: '#008A38', fontWeight: 700 }}>Certified Coach</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                  <span>• Alternate Days: <strong>₹7,000/-</strong></span>
                  <span>• Daily Training: <strong>₹10,000/-</strong></span>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1.5px solid #00C952' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>PREMIUM PERSONAL TRAINING</span>
                  <span style={{ fontSize: '0.72rem', color: '#008A38', fontWeight: 800, backgroundColor: '#ECFDF3', padding: '2px 6px', borderRadius: '4px' }}>Elite Specialist</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                  <span>• Alternate Days: <strong>₹9,000/-</strong></span>
                  <span>• Daily Training: <strong>₹13,000/-</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Vijaynagar Branch Box */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '16px',
              backgroundColor: '#F5F7FD',
              border: '1.5px solid rgba(23, 44, 131, 0.22)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#172C83' }}>
                Vijaynagar Branch (Krishna Heights)
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#EEF2FF', color: '#172C83' }}>
                Phone: 9172848777
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E0E7FF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>JUNIOR PERSONAL TRAINER</span>
                  <span style={{ fontSize: '0.72rem', color: '#172C83', fontWeight: 700 }}>Junior Coach</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                  <span>• Alternate Days: <strong>₹4,500/-</strong></span>
                  <span>• Daily Training: <strong>₹8,000/-</strong></span>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1.5px solid #172C83' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>SENIOR PERSONAL TRAINER</span>
                  <span style={{ fontSize: '0.72rem', color: '#172C83', fontWeight: 800, backgroundColor: '#EEF2FF', padding: '2px 6px', borderRadius: '4px' }}>Senior Coach</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                  <span>• Alternate Days: <strong>₹5,500/-</strong></span>
                  <span>• Daily Training: <strong>₹10,000/-</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: RENEWAL DATES TRACKER & EXPIRING MEMBERSHIPS */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.22rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={19} color="#00B84A" />
              <span>Renewal Dates & Expiring Memberships</span>
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '2px' }}>
              Track whose membership is ending soon and send instant WhatsApp renewal reminders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'Expiring', label: `Expiring Soon (${expiringCount})` },
              { id: 'Expired', label: `Expired (${expiredCount})` },
              { id: 'All', label: `All Active (${activeMembers.length})` },
            ].map((tab) => {
              const active = renewalFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRenewalFilter(tab.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '9px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: active ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)' : '#F1F5F9',
                    color: active ? '#FFFFFF' : '#475569',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Member</th>
                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Current Plan</th>
                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Renewal Date</th>
                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Urgency</th>
                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {renewalsList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
                    No memberships in this category right now.
                  </td>
                </tr>
              ) : (
                renewalsList.map((m) => {
                  const isOverdue = m.daysLeft < 0;
                  const isSoon = m.daysLeft >= 0 && m.daysLeft <= 15;

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{m.name}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B' }}>{m.phone}</div>
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                        {m.planName}
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                        {m.expiryDate}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            backgroundColor: isOverdue ? '#FEE2E2' : isSoon ? '#FEF3C7' : '#DCFCE7',
                            color: isOverdue ? '#B91C1C' : isSoon ? '#B45309' : '#15803D',
                          }}
                        >
                          {(isOverdue || isSoon) && <AlertTriangle size={12} />}
                          {isOverdue
                            ? `Expired ${Math.abs(m.daysLeft)}d ago`
                            : isSoon
                            ? `Ends in ${m.daysLeft} days`
                            : `${m.daysLeft} days remaining`}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleSendReminder(m)}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              backgroundColor: m.reminderSentAt ? '#DCFCE7' : '#EEF2FF',
                              color: m.reminderSentAt ? '#15803D' : '#172C83',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Bell size={13} />
                            <span>{m.reminderSentAt ? 'Reminder Sent ✓' : 'Send Reminder'}</span>
                          </button>

                          <button
                            onClick={() => handleQuickRenew(m)}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                              color: '#FFFFFF',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <RefreshCw size={13} />
                            <span>Renew Now</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Plan Modal */}
      {isPlanModalOpen && (
        <div
          onClick={() => setIsPlanModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
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
              maxWidth: '500px',
              maxHeight: '90vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F4FBF7',
                flexShrink: 0,
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>
                {editingPlan ? 'Edit Membership Plan' : 'Add New Membership Plan'}
              </h3>
              <button onClick={() => setIsPlanModalOpen(false)} style={{ color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSavePlan}
              style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>
                  BRANCH *
                </label>
                <select
                  value={planForm.branchId}
                  onChange={(e) => setPlanForm({ ...planForm, branchId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFFFFF' }}
                >
                  <option value="vishrambag">Respire Vishrambag Branch (7th Floor, R City Mall)</option>
                  <option value="branch2">Respire Vijaynagar Branch (3rd Floor, Krishna Heights - Since 2012)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>
                    DURATION LABEL *
                  </label>
                  <input
                    required
                    value={planForm.durationLabel}
                    onChange={(e) => setPlanForm({ ...planForm, durationLabel: e.target.value })}
                    placeholder="e.g. 1 Day, 1 Month, 3 Months, 1 Year"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>
                    CHARGES (₹) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    placeholder="2000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>
                  PLAN TITLE
                </label>
                <input
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. 6 Months Membership"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>MONTHS</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    required
                    value={planForm.durationMonths}
                    onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>FREEZE DAYS</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={planForm.freezeDays}
                    onChange={(e) => setPlanForm({ ...planForm, freezeDays: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>BADGE</label>
                  <input
                    value={planForm.badge}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                    placeholder="Limited Time Offer"
                    style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>
                  INCLUDED FEATURES (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem' }}
                />
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={planForm.isPopular}
                  onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                  style={{ accentColor: '#00B84A', width: '16px', height: '16px' }}
                />
                <span>Highlight as "Most Popular" green card on website</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setIsPlanModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="btn btn-primary btn-sm"
                  style={{ opacity: isSavingPlan ? 0.75 : 1 }}
                >
                  <CheckCircle2 size={15} />
                  <span>{isSavingPlan ? 'Saving Plan...' : (editingPlan ? 'Save Changes' : 'Add Plan')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
