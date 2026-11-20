import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Edit3,
  Eye,
  UserX,
  UserCheck,
  X,
  Phone,
  Mail,
  Calendar,
  Dumbbell,
  Activity,
  Award,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { saveMemberToFirestore, updateMemberStatusInFirestore, deleteMemberFromFirestore } from '../../services/firestoreService';

function getDaysRemaining(expiryDate) {
  const today = new Date('2026-11-18');
  const exp = new Date(expiryDate);
  return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Number(months || 1));
  return d.toISOString().split('T')[0];
}

export default function MembersTab({ members, setMembers, plans, trainers, activeBranchId = 'vishrambag', isSuperAdmin = false, showToast }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultBranch = activeBranchId === 'all' ? 'vishrambag' : activeBranchId;

  const emptyForm = {
    branchId: defaultBranch,
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    age: 25,
    planId: plans[0]?.id || '',
    trainerId: trainers[0]?.id || '',
    joinDate: '2026-11-18',
    expiryDate: addMonths('2026-11-18', plans[0]?.durationMonths || 1),
    program: 'Beginner',
    addOns: [],
    weight: '70 kg',
    bodyFat: '18%',
    bmi: '22.5',
  };

  const [form, setForm] = useState(emptyForm);

  const openAddModal = () => {
    setEditingMember(null);
    const defaultPlan = plans.find((p) => p.status === 'Active') || plans[0];
    setForm({
      ...emptyForm,
      branchId: activeBranchId === 'all' ? 'vishrambag' : activeBranchId,
      planId: defaultPlan?.id || '',
      trainerId: trainers[0]?.id || '',
      expiryDate: addMonths('2026-11-18', defaultPlan?.durationMonths || 1),
    });
    setIsFormOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMember(m);
    setForm({
      branchId: m.branchId || defaultBranch,
      name: m.name,
      phone: m.phone,
      email: m.email,
      gender: m.gender,
      age: m.age,
      planId: m.planId,
      trainerId: m.trainerId || '',
      joinDate: m.joinDate,
      expiryDate: m.expiryDate,
      program: m.program,
      addOns: m.addOns || [],
      weight: m.bodyMetrics?.weight || '',
      bodyFat: m.bodyMetrics?.bodyFat || '',
      bmi: m.bodyMetrics?.bmi || '',
    });
    setIsFormOpen(true);
  };

  const handlePlanChange = (newPlanId) => {
    const selectedPlan = plans.find((p) => p.id === newPlanId);
    setForm((prev) => ({
      ...prev,
      planId: newPlanId,
      expiryDate: selectedPlan ? addMonths(prev.joinDate, selectedPlan.durationMonths) : prev.expiryDate,
    }));
  };

  const handleToggleAddon = (addon) => {
    setForm((prev) => {
      const exists = prev.addOns.includes(addon);
      return {
        ...prev,
        addOns: exists ? prev.addOns.filter((a) => a !== addon) : [...prev.addOns, addon],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return; // Prevent double click / duplicate creation

    // Duplicate check on phone number
    if (form.phone) {
      const cleanPhone = form.phone.replace(/\D/g, '');
      const duplicate = members.find(
        (m) => (!editingMember || m.id !== editingMember.id) && m.phone && m.phone.replace(/\D/g, '') === cleanPhone
      );
      if (duplicate) {
        showToast(`⚠️ Member already exists with this phone: ${duplicate.name} (${duplicate.id})`);
        return;
      }
    }

    setIsSaving(true);
    const selectedPlan = plans.find((p) => p.id === form.planId);

    try {
      if (editingMember) {
        const updatedMember = {
          ...editingMember,
          branchId: form.branchId || editingMember.branchId,
          name: form.name,
          phone: form.phone,
          email: form.email,
          gender: form.gender,
          age: Number(form.age),
          planId: form.planId,
          planName: selectedPlan ? selectedPlan.name : editingMember.planName,
          trainerId: form.trainerId,
          joinDate: form.joinDate,
          expiryDate: form.expiryDate,
          program: form.program,
          addOns: form.addOns,
          bodyMetrics: { weight: form.weight, bodyFat: form.bodyFat, bmi: form.bmi },
        };

        await saveMemberToFirestore(updatedMember, members).catch((err) =>
          console.warn('Firestore member update notice:', err.message)
        );

        setMembers((prev) => prev.map((m) => (m.id === editingMember.id ? updatedMember : m)));
        showToast(`Updated profile for ${form.name}`);
      } else {
        const prefix = form.branchId === 'branch2' ? 'RF-2' : 'RF-1';
        const uniqueId = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        const newMember = {
          id: uniqueId,
          branchId: form.branchId || defaultBranch,
          name: form.name,
          phone: form.phone,
          email: form.email,
          gender: form.gender,
          age: Number(form.age),
          planId: form.planId,
          planName: selectedPlan ? selectedPlan.name : '1 Month Membership',
          trainerId: form.trainerId,
          joinDate: form.joinDate,
          expiryDate: form.expiryDate,
          status: 'Active',
          program: form.program,
          addOns: form.addOns,
          bodyMetrics: { weight: form.weight, bodyFat: form.bodyFat, bmi: form.bmi },
          reminderSentAt: null,
        };

        await saveMemberToFirestore(newMember, members).catch((err) =>
          console.warn('Firestore member insert notice:', err.message)
        );

        setMembers((prev) => [newMember, ...prev]);
        showToast(`Registered new member ${form.name} (${newMember.id})`);
      }
      setIsFormOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (member) => {
    if (window.confirm(`Are you sure you want to permanently delete member ${member.name} (${member.id})?`)) {
      try {
        await deleteMemberFromFirestore(member.id);
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
        showToast(`Deleted ${member.name} from Firebase`);
      } catch (err) {
        showToast(`Error deleting member: ${err.message}`);
      }
    }
  };

  const toggleMemberStatus = async (member) => {
    const nextStatus = member.status === 'Active' ? 'Deactivated' : 'Active';
    await updateMemberStatusInFirestore(member.id, nextStatus).catch((err) =>
      console.warn('Firestore member status notice:', err.message)
    );
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m)));
    showToast(`${member.name} account ${nextStatus === 'Active' ? 'reactivated' : 'deactivated'}`);
  };

  const getTrainerName = (trainerId) => {
    const tr = trainers.find((t) => t.id === trainerId);
    return tr ? tr.name : 'Unassigned';
  };

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.planName.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    const days = getDaysRemaining(m.expiryDate);
    if (statusFilter === 'Active') return m.status === 'Active';
    if (statusFilter === 'Deactivated') return m.status === 'Deactivated';
    if (statusFilter === 'Expiring Soon') return m.status === 'Active' && days <= 15;
    return true;
  });

  const addonOptions = ['Personal Training', 'Massage', 'Steam Bath', 'Zumba', 'Yoga'];

  return (
    <div>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '22px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            Member Management
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Add new members, edit records, view full profiles, or deactivate accounts.
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ borderRadius: '10px' }}>
          <UserPlus size={16} />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, ID, phone, or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              fontSize: '0.88rem',
              outline: 'none',
              backgroundColor: '#F8FAFC',
              color: '#0F172A',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Active', 'Expiring Soon', 'Deactivated'].map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: active ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)' : '#F1F5F9',
                  color: active ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Members Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4FBF7', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Member</th>
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Membership Plan</th>
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Assigned Trainer</th>
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Expiry Date</th>
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '0.92rem' }}>
                    No members match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const days = getDaysRemaining(m.expiryDate);
                  const isExpiring = m.status === 'Active' && days <= 15 && days >= 0;
                  const isExpired = m.status === 'Active' && days < 0;

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '15px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: m.status === 'Active' ? 'linear-gradient(135deg, #00D256 0%, #008A37 100%)' : '#94A3B8',
                              color: '#FFFFFF',
                              fontWeight: 900,
                              fontSize: '0.88rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>{m.name}</div>
                            <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                              {m.id} • {m.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '15px 18px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>{m.planName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#008A38', fontWeight: 600 }}>{m.program} Level</div>
                      </td>

                      <td style={{ padding: '15px 18px', fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                        {getTrainerName(m.trainerId)}
                      </td>

                      <td style={{ padding: '15px 18px' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isExpired ? '#DC2626' : isExpiring ? '#D97706' : '#0F172A' }}>
                          {m.expiryDate}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: isExpired ? '#DC2626' : isExpiring ? '#D97706' : '#64748B', fontWeight: 600 }}>
                          {m.status === 'Deactivated'
                            ? 'Account Closed'
                            : isExpired
                            ? `Expired ${Math.abs(days)}d ago`
                            : `${days} days left`}
                        </div>
                      </td>

                      <td style={{ padding: '15px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 11px',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            backgroundColor: m.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                            color: m.status === 'Active' ? '#15803D' : '#B91C1C',
                          }}
                        >
                          {m.status}
                        </span>
                      </td>

                      <td style={{ padding: '15px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => setViewingMember(m)}
                            title="View Full Profile"
                            style={{
                              padding: '7px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#EEF2FF',
                              color: '#172C83',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => openEditModal(m)}
                            title="Edit Member"
                            style={{
                              padding: '7px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#ECFDF3',
                              color: '#008A38',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => toggleMemberStatus(m)}
                            title={m.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                            style={{
                              padding: '7px 10px',
                              borderRadius: '8px',
                              backgroundColor: m.status === 'Active' ? '#FEF2F2' : '#DCFCE7',
                              color: m.status === 'Active' ? '#DC2626' : '#15803D',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            {m.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                            <span>{m.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMember(m)}
                            title="Delete Member from Firebase"
                            style={{
                              padding: '7px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
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

      {/* Add / Edit Member Modal */}
      {isFormOpen && (
        <div
          onClick={() => setIsFormOpen(false)}
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
              maxWidth: '560px',
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
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #F4FBF7 0%, #FFFFFF 100%)',
                flexShrink: 0,
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>
                {editingMember ? `Edit Member (${editingMember.id})` : 'Add New Gym Member'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} style={{ color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
              {isSuperAdmin && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>BRANCH *</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="vishrambag">Respire Vishrambag Branch (R City Mall)</option>
                    <option value="branch2">Respire Vijaynagar Branch (Krishna Heights, Opp. KFC)</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>FULL NAME *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rohan Patil"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>MOBILE NUMBER *</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98XXX XXXXX"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.6fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>EMAIL</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="member@email.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>GENDER</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    style={{ width: '100%', padding: '10px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>AGE</label>
                  <input
                    type="number"
                    min="14"
                    max="90"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    style={{ width: '100%', padding: '10px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>MEMBERSHIP PLAN</label>
                  <select
                    value={form.planId}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFFFFF' }}
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.durationMonths}M - ₹{p.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>ASSIGN TRAINER</label>
                  <select
                    value={form.trainerId}
                    onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="">Unassigned</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>JOIN DATE</label>
                  <input
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>EXPIRY DATE</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '5px' }}>PROGRAM LEVEL</label>
                  <select
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Add-on Services */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>ADD-ON SERVICES</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {addonOptions.map((ao) => {
                    const checked = form.addOns.includes(ao);
                    return (
                      <button
                        type="button"
                        key={ao}
                        onClick={() => handleToggleAddon(ao)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: checked ? '#00B84A' : '#F1F5F9',
                          color: checked ? '#FFFFFF' : '#475569',
                          border: checked ? '1px solid #00B84A' : '1px solid #E2E8F0',
                        }}
                      >
                        {checked ? '✓ ' : '+ '}
                        {ao}
                      </button>
                    );
                  })}
                </div>

                {form.addOns.includes('Personal Training') && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: form.branchId === 'branch2' ? '#EEF2FF' : '#ECFDF3',
                      border:
                        form.branchId === 'branch2'
                          ? '1px solid #C7D2FE'
                          : '1px solid #A7F3D0',
                      fontSize: '0.78rem',
                      color: form.branchId === 'branch2' ? '#1E1B4B' : '#065F46',
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: '4px' }}>
                      Official Personal Training (PT) Charges for{' '}
                      {form.branchId === 'branch2' ? 'Vijaynagar Branch' : 'Vishrambag Branch'}:
                    </div>
                    {form.branchId === 'branch2' ? (
                      <div style={{ lineHeight: 1.5 }}>
                        • <strong>Junior Personal Trainer:</strong> Alternate: ₹4,500/- | Daily: ₹8,000/-<br />
                        • <strong>Senior Personal Trainer:</strong> Alternate: ₹5,500/- | Daily: ₹10,000/-
                      </div>
                    ) : (
                      <div style={{ lineHeight: 1.5 }}>
                        • <strong>General Personal Training:</strong> Alternate: ₹7,000/- | Daily: ₹10,000/-<br />
                        • <strong>Premium Personal Training:</strong> Alternate: ₹9,000/- | Daily: ₹13,000/-
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Body Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>WEIGHT</label>
                  <input
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    placeholder="72 kg"
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>BODY FAT %</label>
                  <input
                    value={form.bodyFat}
                    onChange={(e) => setForm({ ...form, bodyFat: e.target.value })}
                    placeholder="18.2%"
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>BMI</label>
                  <input
                    value={form.bmi}
                    onChange={(e) => setForm({ ...form, bmi: e.target.value })}
                    placeholder="22.4"
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary btn-sm"
                  style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                >
                  <CheckCircle2 size={15} />
                  <span>{isSaving ? 'Saving to Cloud...' : editingMember ? 'Save Changes' : 'Register Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Full Member Profile Modal */}
      {viewingMember && (
        <div
          onClick={() => setViewingMember(null)}
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
              borderRadius: '22px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #00C952 0%, #008A37 65%, #055E29 100%)',
                padding: '22px 24px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {viewingMember.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{viewingMember.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#D1FAE5', fontWeight: 600 }}>
                    {viewingMember.id} • {viewingMember.gender}, {viewingMember.age} yrs • {viewingMember.status}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingMember(null)} style={{ color: '#FFFFFF' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={12} color="#00B84A" /> Phone
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>{viewingMember.phone}</div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={12} color="#00B84A" /> Email
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginTop: '3px', wordBreak: 'break-all' }}>{viewingMember.email || '—'}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F4FBF7', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(0,184,74,0.22)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#008A38', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={14} /> Active Plan
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#172C83' }}>{viewingMember.program} Tier</span>
                </div>
                <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>{viewingMember.planName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> Joined: {viewingMember.joinDate}</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>Expires: {viewingMember.expiryDate}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#EEF2FF' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172C83', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <Dumbbell size={15} /> Assigned Trainer
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{getTrainerName(viewingMember.trainerId)}</span>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={13} color="#00B84A" /> Body Composition Metrics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>WEIGHT</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>{viewingMember.bodyMetrics?.weight || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>BODY FAT</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#008A38' }}>{viewingMember.bodyMetrics?.bodyFat || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>BMI</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: '#172C83' }}>{viewingMember.bodyMetrics?.bmi || '—'}</div>
                  </div>
                </div>
              </div>

              {viewingMember.addOns && viewingMember.addOns.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Enrolled Add-on Services
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {viewingMember.addOns.map((ao, idx) => (
                      <span key={idx} style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#ECFDF3', color: '#008A38', fontSize: '0.76rem', fontWeight: 700 }}>
                        {ao}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setViewingMember(null)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
