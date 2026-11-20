import React, { useState, useRef } from 'react';
import {
  UserPlus,
  Edit3,
  Users,
  Calendar,
  Star,
  Phone,
  Clock,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Dumbbell,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { saveTrainerToFirestore, deleteTrainerFromFirestore } from '../../services/firestoreService';
import { createTrainerAuthAccount } from '../../services/trainerAuthService';

export default function TrainersTab({ trainers, setTrainers, members, setMembers, activeBranchId = 'vishrambag', isSuperAdmin = false, showToast }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [assignModalTrainer, setAssignModalTrainer] = useState(null);
  const [scheduleModalTrainer, setScheduleModalTrainer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const photoInputRef = useRef(null);

  const defaultBranch = activeBranchId === 'all' ? 'vishrambag' : activeBranchId;

  const [form, setForm] = useState({
    branchId: defaultBranch,
    name: '',
    email: '',
    phone: '',
    specialty: 'Personal Training & Strength',
    experience: '4 Years',
    rating: 5.0,
    bio: '',
    photo: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
  });

  const [newShift, setNewShift] = useState({
    day: 'Mon – Sat',
    shift: 'Morning',
    time: '06:00 AM – 10:00 AM',
    slots: '4 Open Slots',
  });

  const openAddModal = () => {
    if (!isSuperAdmin) {
      if (showToast) showToast('Access denied: Only Super Admin can add trainers.');
      return;
    }
    setEditingTrainer(null);
    setFormError('');
    setShowPassword(false);
    setForm({
      branchId: activeBranchId === 'all' ? 'vishrambag' : activeBranchId,
      name: '',
      email: '',
      phone: '',
      specialty: 'Personal Training & Strength',
      experience: '4 Years',
      rating: 5.0,
      bio: '',
      photo: '',
      password: '',
      confirmPassword: '',
      status: 'Active',
    });
    setIsFormOpen(true);
  };

  const openEditModal = (t) => {
    if (!isSuperAdmin) {
      if (showToast) showToast('Access denied: Only Super Admin can edit trainer profiles.');
      return;
    }
    setEditingTrainer(t);
    setFormError('');
    setShowPassword(false);
    setForm({
      branchId: t.branchId || defaultBranch,
      name: t.name || '',
      email: t.email || '',
      specialty: t.specialty || 'Personal Training & Strength',
      experience: t.experience || '4 Years',
      phone: t.phone || '',
      rating: t.rating || 5.0,
      bio: t.bio || '',
      photo: t.photo || '',
      password: '',
      confirmPassword: '',
      status: t.status || 'Active',
    });
    setIsFormOpen(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 360;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          }
        } else {
          if (h > MAX) {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        setForm((prev) => ({ ...prev, photo: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTrainer = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      if (showToast) showToast('Access denied: Only Super Admin can add or edit trainers.');
      return;
    }
    if (isSaving) return;
    setFormError('');

    const cleanEmail = (form.email || '').trim().toLowerCase();

    // Validations
    if (!editingTrainer) {
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setFormError('Please enter a valid email address for the trainer account.');
        return;
      }

      // Check duplicate email among existing trainers
      const duplicateTrainer = trainers.find((t) => t.email && t.email.toLowerCase() === cleanEmail);
      if (duplicateTrainer) {
        setFormError(`A trainer with email "${cleanEmail}" already exists (${duplicateTrainer.name}).`);
        return;
      }

      if (!form.password || form.password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setFormError('Password and Confirm Password do not match.');
        return;
      }
    }

    setIsSaving(true);

    try {
      if (editingTrainer) {
        const updatedTrainer = {
          ...editingTrainer,
          name: form.name.trim(),
          phone: form.phone.trim(),
          specialty: form.specialty,
          experience: form.experience,
          branchId: form.branchId || defaultBranch,
          rating: Number(form.rating) || 5.0,
          bio: form.bio || '',
          photo: form.photo || '',
          status: form.status,
          role: 'trainer',
        };
        if (cleanEmail) {
          updatedTrainer.email = cleanEmail;
        }

        await saveTrainerToFirestore(updatedTrainer).catch((err) =>
          console.warn('Firestore trainer update notice:', err.message)
        );

        setTrainers((prev) =>
          prev.map((t) => (t.id === editingTrainer.id ? updatedTrainer : t))
        );
        showToast(`✓ Updated profile for Trainer ${form.name}`);
        setIsFormOpen(false);
      } else {
        // 1. Create real Firebase Authentication account using isolated secondary app
        const authUser = await createTrainerAuthAccount(cleanEmail, form.password);

        // 2. Build Firestore trainer document (NEVER save password to Firestore!)
        const newTrainer = {
          id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          uid: authUser.uid,
          name: form.name.trim(),
          email: cleanEmail,
          phone: form.phone.trim(),
          specialty: form.specialty || 'Personal Training & Strength',
          experience: form.experience || '4 Years',
          branchId: form.branchId || defaultBranch,
          rating: Number(form.rating) || 5.0,
          bio: form.bio || '',
          photo: form.photo || '',
          status: 'Active',
          role: 'trainer',
          schedule: [
            { day: 'Mon – Sat', shift: 'Morning', time: '06:00 AM – 11:00 AM', slots: '5 Open Slots' },
            { day: 'Mon – Sat', shift: 'Evening', time: '05:00 PM – 09:00 PM', slots: '5 Open Slots' },
          ],
          createdAt: new Date().toISOString(),
        };

        // 3. Save to Firestore
        await saveTrainerToFirestore(newTrainer);

        setTrainers((prev) => [...prev.filter((t) => t.id !== newTrainer.id), newTrainer]);
        showToast(`✓ Trainer ${form.name} created & registered in Firebase Authentication!`);
        setIsFormOpen(false);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save trainer account.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAssignMember = (memberId, trainerId) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, trainerId: m.trainerId === trainerId ? '' : trainerId }
          : m
      )
    );
  };

  const handleAddShift = (e) => {
    e.preventDefault();
    if (!scheduleModalTrainer) return;
    setTrainers((prev) =>
      prev.map((t) =>
        t.id === scheduleModalTrainer.id
          ? { ...t, schedule: [...t.schedule, { ...newShift }] }
          : t
      )
    );
    setScheduleModalTrainer((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { ...newShift }],
    }));
    showToast(`Added ${newShift.shift} shift to ${scheduleModalTrainer.name}'s schedule`);
  };

  const handleDeleteTrainer = async (trainer) => {
    if (!isSuperAdmin) {
      if (showToast) showToast('Access denied: Only Super Admin can delete trainers.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete trainer ${trainer.name}?`)) {
      try {
        await deleteTrainerFromFirestore(trainer.id);
        setTrainers((prev) => prev.filter((t) => t.id !== trainer.id));
        showToast(`Deleted ${trainer.name} from Firebase`);
      } catch (err) {
        showToast(`Error deleting trainer: ${err.message}`);
      }
    }
  };

  const handleRemoveShift = (idx) => {
    if (!scheduleModalTrainer) return;
    const updatedSchedule = scheduleModalTrainer.schedule.filter((_, i) => i !== idx);
    setTrainers((prev) =>
      prev.map((t) => (t.id === scheduleModalTrainer.id ? { ...t, schedule: updatedSchedule } : t))
    );
    setScheduleModalTrainer((prev) => ({ ...prev, schedule: updatedSchedule }));
    showToast(`Removed shift from ${scheduleModalTrainer.name}'s schedule`);
  };

  return (
    <div>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            Trainer Management
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Add new trainers, assign members, manage profiles, and configure daily shift schedules.
          </p>
        </div>
        {isSuperAdmin && (
          <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ borderRadius: '10px' }}>
            <UserPlus size={16} />
            <span>Add New Trainer</span>
          </button>
        )}
      </div>

      {/* Trainers Cards Grid */}
      {trainers.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '2px dashed #E2E8F0',
            color: '#64748B',
          }}
        >
          <Dumbbell size={36} color="#00C952" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
            No Trainers Registered Yet
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748B', marginBottom: '18px' }}>
            {isSuperAdmin
              ? 'Click the button below to add your certified gym trainers directly to Firebase.'
              : 'Trainers assigned to this branch will appear here once added by Super Admin.'}
          </p>
          {isSuperAdmin && (
            <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ borderRadius: '10px' }}>
              <UserPlus size={16} />
              <span>Add New Trainer</span>
            </button>
          )}
        </div>
      ) : (
        <div className="trainers-cards-grid">
          {trainers.map((t) => {
          const assignedMembers = members.filter((m) => m.trainerId === t.id && m.status === 'Active');

          return (
            <div
              key={t.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid rgba(0, 184, 74, 0.16)',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <div>
                {/* Top Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                        color: '#FFFFFF',
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {t.photo ? (
                        <img src={t.photo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        t.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>{t.name}</h3>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#008A38' }}>{t.specialty}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: '#FEF3C7',
                      color: '#B45309',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                    }}
                  >
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span>{t.rating || 5.0}</span>
                  </div>
                </div>

                {/* Bio */}
                {t.bio && (
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.55, marginBottom: '14px' }}>
                    {t.bio}
                  </p>
                )}

                {/* Meta Row */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '0.74rem',
                    color: '#334155',
                    fontWeight: 600,
                    marginBottom: '14px',
                  }}
                >
                  {t.email && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#F8FAFC', padding: '4px 9px', borderRadius: '8px', border: '1px solid #E2E8F0' }} title="Firebase Auth Email">
                      <Mail size={12} color="#00B84A" /> {t.email}
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#F8FAFC', padding: '4px 9px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <Dumbbell size={12} color="#00B84A" /> {t.experience || '4 Years'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#F8FAFC', padding: '4px 9px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <Phone size={12} color="#172C83" /> {t.phone}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#ECFDF3', color: '#008A38', padding: '4px 9px', borderRadius: '8px' }}>
                    <Users size={12} /> {assignedMembers.length} Assigned
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '4px 9px', borderRadius: '8px', fontWeight: 800 }}>
                    <ShieldCheck size={12} /> Trainer Role
                  </span>
                </div>

                {/* Schedule Preview */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} color="#00B84A" /> Current Schedule ({(t.schedule || []).length} Shifts)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(t.schedule || []).map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#334155' }}>
                        <span style={{ fontWeight: 700 }}>{s.shift} ({s.day})</span>
                        <span style={{ color: '#008A38', fontWeight: 700 }}>{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <button
                  onClick={() => setAssignModalTrainer(t)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Users size={12} /> Assign
                </button>
                <button
                  onClick={() => setScheduleModalTrainer(t)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    backgroundColor: '#EEF2FF',
                    color: '#172C83',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Calendar size={12} /> Schedule
                </button>
                {isSuperAdmin && (
                  <>
                    <button
                      onClick={() => openEditModal(t)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        backgroundColor: '#F1F5F9',
                        color: '#334155',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Edit3 size={12} /> Profile
                    </button>
                    <button
                      onClick={() => handleDeleteTrainer(t)}
                      title="Delete Trainer from Firebase"
                      style={{
                        padding: '8px 9px',
                        borderRadius: '8px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add / Edit Trainer Profile Modal */}
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
            style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', backgroundColor: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F4FBF7', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {editingTrainer ? 'Edit Trainer Profile' : 'Add New Trainer & Create Account'}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#008A38', fontWeight: 700 }}>
                  {editingTrainer ? 'Update coach information' : 'Creates real Firebase Authentication account for Trainer login'}
                </span>
              </div>
              <button onClick={() => setIsFormOpen(false)} style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveTrainer} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
              {formError && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Photo Upload Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF3',
                    border: '1.5px solid #00B84A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Dumbbell size={22} color="#008A38" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>TRAINER PHOTO (OPTIONAL)</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>PNG, JPG or WebP (auto-scaled)</div>
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current && photoInputRef.current.click()}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#334155',
                  }}
                >
                  {form.photo ? 'Change' : 'Upload'}
                </button>
                {form.photo && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, photo: '' })}
                    style={{
                      padding: '6px 8px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: '#DC2626',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>TRAINER FULL NAME *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aditya Sawant" style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>MOBILE NUMBER *</label>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98XXX XXXXX" style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
                  FIREBASE AUTH EMAIL ADDRESS * {editingTrainer && '(Registered Login)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="trainer@respirefitness.com"
                    style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Password Fields (Only for New Trainer creation) */}
              {!editingTrainer && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                      PASSWORD (MIN 6 CHARS) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Create password"
                        style={{ width: '100%', padding: '9px 34px 9px 10px', borderRadius: '8px', border: '1.5px solid #86EFAC', fontSize: '0.84rem', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: 0 }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
                      CONFIRM PASSWORD *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #86EFAC', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* Specialization & Branch */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>SPECIALIZATION *</label>
                  <input
                    required
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    placeholder="Personal Training, Strength, HIIT..."
                    style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>ASSIGNED BRANCH *</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="vishrambag">Vishrambag Branch</option>
                    <option value="branch2">Vijaynagar Branch</option>
                  </select>
                </div>
              </div>

              {/* Experience & Rating */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>EXPERIENCE</label>
                  <input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 4 Years" style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>RATING (1–5)</label>
                  <input type="number" step="0.1" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>PROFILE BIO & CERTIFICATIONS</label>
                <textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Certifications and coaching focus..." style={{ width: '100%', padding: '10px', borderRadius: '9px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary btn-sm" style={{ opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Members to Trainer Modal */}
      {assignModalTrainer && (
        <div
          onClick={() => setAssignModalTrainer(null)}
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
            style={{ width: '100%', maxWidth: '480px', maxHeight: '85vh', backgroundColor: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F4FBF7', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>Assign Members</h3>
                <div style={{ fontSize: '0.78rem', color: '#008A38', fontWeight: 700 }}>Trainer: {assignModalTrainer.name}</div>
              </div>
              <button onClick={() => setAssignModalTrainer(null)} style={{ color: '#64748B' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
              {members.filter((m) => m.status === 'Active').map((m) => {
                const isAssigned = m.trainerId === assignModalTrainer.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      toggleAssignMember(m.id, assignModalTrainer.id);
                      showToast(isAssigned ? `Unassigned ${m.name}` : `Assigned ${m.name} to ${assignModalTrainer.name}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isAssigned ? '1.5px solid #00B84A' : '1px solid #E2E8F0',
                      backgroundColor: isAssigned ? '#ECFDF3' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{m.planName} • {m.program}</div>
                    </div>
                    <span
                      style={{
                        padding: '5px 11px',
                        borderRadius: '999px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        backgroundColor: isAssigned ? '#00B84A' : '#F1F5F9',
                        color: isAssigned ? '#FFFFFF' : '#475569',
                      }}
                    >
                      {isAssigned ? 'Assigned ✓' : '+ Assign'}
                    </span>
                  </div>
                );
              })}
              <button onClick={() => setAssignModalTrainer(null)} className="btn btn-primary btn-sm" style={{ marginTop: '8px', width: '100%' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Trainer Schedule Modal */}
      {scheduleModalTrainer && (
        <div
          onClick={() => setScheduleModalTrainer(null)}
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
            style={{ width: '100%', maxWidth: '500px', maxHeight: '88vh', backgroundColor: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F4FBF7', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>Manage Trainer Schedule</h3>
                <div style={{ fontSize: '0.78rem', color: '#008A38', fontWeight: 700 }}>{scheduleModalTrainer.name}</div>
              </div>
              <button onClick={() => setScheduleModalTrainer(null)} style={{ color: '#64748B' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scheduleModalTrainer.schedule.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                        {s.shift} • {s.day}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#008A38', fontWeight: 700 }}>
                        {s.time} ({s.slots})
                      </div>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleRemoveShift(idx)}
                        style={{ padding: '6px 8px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isSuperAdmin ? (
                <form onSubmit={handleAddShift} style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>Add New Shift Slot</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input value={newShift.day} onChange={(e) => setNewShift({ ...newShift, day: e.target.value })} placeholder="Mon – Sat" style={{ padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }} />
                    <select value={newShift.shift} onChange={(e) => setNewShift({ ...newShift, shift: e.target.value })} style={{ padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', backgroundColor: '#FFFFFF' }}>
                      <option value="Morning">Morning</option>
                      <option value="Midday">Midday</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                    <input value={newShift.time} onChange={(e) => setNewShift({ ...newShift, time: e.target.value })} placeholder="05:00 PM – 09:00 PM" style={{ padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }} />
                    <input value={newShift.slots} onChange={(e) => setNewShift({ ...newShift, slots: e.target.value })} placeholder="4 Open Slots" style={{ padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    <Plus size={15} /> Add Shift to Schedule
                  </button>
                </form>
              ) : (
                <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', fontSize: '0.82rem', color: '#64748B', textAlign: 'center' }}>
                  Trainer schedule and shifts are managed centrally by Super Admin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .trainers-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        @media (max-width: 1240px) {
          .trainers-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }
        @media (max-width: 720px) {
          .trainers-cards-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>
    </div>
  );
}
