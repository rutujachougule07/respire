import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Dumbbell,
  ShieldCheck,
  Building2,
  KeyRound,
  Lock,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useTrainerAuth } from '../../context/TrainerAuthContext';

function formatSchedule(val) {
  if (!val) return 'Morning (Mon – Sat) • 06:00 AM – 11:00 AM, Evening • 05:00 PM – 09:00 PM';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    if (val.length === 0) return 'Morning (Mon – Sat) • 06:00 AM – 11:00 AM, Evening • 05:00 PM – 09:00 PM';
    return val
      .map((s) => {
        if (!s) return '';
        if (typeof s === 'string') return s;
        if (typeof s === 'object') {
          const parts = [];
          if (s.shift) parts.push(s.shift);
          if (s.day) parts.push(`(${s.day})`);
          if (s.time) parts.push(`• ${s.time}`);
          if (s.slots) parts.push(`[${s.slots}]`);
          return parts.join(' ');
        }
        return String(s);
      })
      .filter(Boolean)
      .join(', ');
  }
  if (typeof val === 'object') {
    const parts = [];
    if (val.shift) parts.push(val.shift);
    if (val.day) parts.push(`(${val.day})`);
    if (val.time) parts.push(`• ${val.time}`);
    if (val.slots) parts.push(`[${val.slots}]`);
    return parts.join(' ') || 'Morning (Mon – Sat) • 06:00 AM – 11:00 AM, Evening • 05:00 PM – 09:00 PM';
  }
  return String(val);
}

export default function TrainerProfileTab({
  trainerProfile: initialProfile,
  showToast = () => {},
}) {
  const {
    trainerProfile: authProfile,
    updateProfile,
    changePassword,
    sendPasswordReset,
  } = useTrainerAuth();

  const profile = authProfile || initialProfile || {};

  const branchName =
    profile?.branchId === 'branch2'
      ? 'Respire Vijaynagar Branch'
      : 'Respire Vishrambag Branch';

  const branchAddress =
    profile?.branchId === 'branch2'
      ? '3rd Floor, Krishna Heights, Opp. KFC, Sangli-Miraj Road, Vijaynagar, Sangli'
      : '7th Floor, R City Mall, Opp. Safa Bakery, Vishrambag, Sangli';

  const shiftTime = formatSchedule(profile?.shifts || profile?.schedule);

  const trainerName =
    typeof profile?.name === 'string' && profile.name.trim()
      ? profile.name
      : 'Trainer';

  const trainerSpecialty =
    typeof profile?.specialty === 'string' && profile.specialty.trim()
      ? profile.specialty
      : 'Personal Training & Strength';

  const trainerPhone =
    typeof profile?.phone === 'string' && profile.phone.trim()
      ? profile.phone
      : '+91 9960904626';

  const trainerEmail =
    typeof profile?.email === 'string' && profile.email.trim()
      ? profile.email
      : 'trainer@respirefitness.com';

  const trainerExperience =
    profile?.experience != null ? String(profile.experience) : '4+ Years';

  const trainerBio =
    typeof profile?.bio === 'string' && profile.bio.trim()
      ? profile.bio
      : '';

  // --- EDIT PROFILE MODAL STATE ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    specialty: '',
    experience: '',
    shifts: '',
    bio: '',
    photo: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editError, setEditError] = useState('');

  const openEditModal = () => {
    setEditForm({
      name: trainerName,
      phone: trainerPhone,
      specialty: trainerSpecialty,
      experience: trainerExperience,
      shifts: shiftTime,
      bio: trainerBio,
      photo: profile?.photo || '',
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setEditError('');

    if (!editForm.name.trim()) {
      setEditError('Trainer name is required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        specialty: editForm.specialty.trim(),
        experience: editForm.experience.trim(),
        shifts: editForm.shifts.trim(),
        bio: editForm.bio.trim(),
        photo: editForm.photo.trim(),
      });
      setIsEditModalOpen(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      setEditError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- PASSWORD MANAGEMENT STATE ---
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Forgot password email state
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });

  const handleSendForgotPasswordReset = async () => {
    if (isSendingReset) return;
    if (!trainerEmail) {
      setResetMessage({
        text: 'No email address registered with this trainer profile.',
        type: 'error',
      });
      return;
    }

    setIsSendingReset(true);
    setResetMessage({ text: '', type: '' });

    try {
      await sendPasswordReset(trainerEmail);
      setResetMessage({
        text: `✓ Password reset link successfully sent to ${trainerEmail}. Please check your inbox or spam folder to reset your password.`,
        type: 'success',
      });
      showToast(`Password reset link sent to ${trainerEmail}`, 'success');
    } catch (err) {
      setResetMessage({
        text: err.message || 'Unable to send password reset link. Please try again.',
        type: 'error',
      });
      showToast(err.message || 'Password reset failed', 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isSavingPass) return;
    setPassError('');
    setPassSuccess('');

    if (!passForm.currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }

    if (!passForm.newPassword || passForm.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    setIsSavingPass(true);
    try {
      await changePassword(passForm.currentPassword, passForm.newPassword);
      setPassSuccess('✓ Password changed successfully! Use your new password on your next login.');
      showToast('Password changed successfully!', 'success');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsChangePassModalOpen(false);
        setPassSuccess('');
      }, 1800);
    } catch (err) {
      setPassError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsSavingPass(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. HERO PROFILE CARD - White & Green Respire Theme */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#0F172A',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
          border: '1.5px solid #E2E8F0',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
          {/* Avatar Photo */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #00D256 0%, #008A38 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              fontWeight: 900,
              boxShadow: '0 6px 20px rgba(0, 184, 74, 0.28)',
              flexShrink: 0,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {profile?.photo && typeof profile.photo === 'string' ? (
              <img
                src={profile.photo}
                alt={trainerName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              trainerName[0].toUpperCase()
            )}
          </div>

          {/* Identity info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  backgroundColor: '#ECFDF3',
                  border: '1px solid #A7F3D0',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#008A38',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <ShieldCheck size={14} />
                <span>Certified Respire Coach</span>
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  backgroundColor: '#ECFDF3',
                  color: '#008A38',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  border: '1px solid #A7F3D0',
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00B84A' }}></span>
                Active Duty
              </span>
            </div>

            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              {trainerName}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.88rem', color: '#64748B' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#008A38', fontWeight: 800 }}>
                <Dumbbell size={16} />
                {trainerSpecialty}
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <Building2 size={16} color="#64748B" />
                {branchName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: ONLY Edit Profile (No duplicate Change Password button here) */}
        <div>
          <button
            onClick={openEditModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00B84A 0%, #008A38 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 184, 74, 0.28)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2. TWO COLUMN SECTION: COACH INFO & ACCOUNT PASSWORD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Column: Official Coach Details & Contact */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Coach Information & Contact
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Full Name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <User size={18} color="#008A38" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Full Name
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                  {trainerName}
                </div>
              </div>
            </div>

            {/* Specialty */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <Dumbbell size={18} color="#008A38" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Specialty & Role
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                  {trainerSpecialty}
                </div>
              </div>
            </div>

            {/* Experience */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <ShieldCheck size={18} color="#008A38" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Experience
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                  {trainerExperience}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <Phone size={18} color="#008A38" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Contact Phone
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                  {trainerPhone}
                </div>
              </div>
            </div>

            {/* Email */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <Mail size={18} color="#008A38" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Portal Login Email
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', wordBreak: 'break-all' }}>
                  {trainerEmail}
                </div>
              </div>
            </div>

            {/* Branch */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <MapPin size={18} color="#008A38" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Assigned Branch & Location
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{branchName}</div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>{branchAddress}</div>
              </div>
            </div>

            {/* Schedule */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <Clock size={18} color="#008A38" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Working Shifts & Schedule
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{shiftTime}</div>
              </div>
            </div>

            {/* Bio */}
            {trainerBio && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF3',
                  border: '1px solid #A7F3D0',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Coach Biography & Philosophy
                </div>
                <div style={{ fontSize: '0.86rem', color: '#064E3B', lineHeight: 1.5 }}>
                  {trainerBio}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Account Login & Password (Dedicated Single Section) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Account Login & Password
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                    Manage your Trainer Dashboard authentication credentials
                  </p>
                </div>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: '#ECFDF3',
                  color: '#008A38',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  border: '1px solid #A7F3D0',
                }}
              >
                <Lock size={12} />
                Protected
              </span>
            </div>

            {/* Email notice */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Registered Portal Email
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                  {trainerEmail}
                </div>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#008A38',
                  backgroundColor: '#DCFCE7',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                Firebase Verified
              </div>
            </div>

            {/* FORGOT PASSWORD RESET TRIGGER */}
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                    Forgot Dashboard Password?
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                    Send an official password reset link directly to your email address: <strong>{trainerEmail}</strong>.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendForgotPasswordReset}
                  disabled={isSendingReset}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#008A38',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    border: 'none',
                    cursor: isSendingReset ? 'not-allowed' : 'pointer',
                    opacity: isSendingReset ? 0.7 : 1,
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 138, 56, 0.25)',
                  }}
                >
                  <Send size={14} />
                  <span>{isSendingReset ? 'Sending...' : 'Send Reset Link'}</span>
                </button>
              </div>

              {resetMessage.text && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    backgroundColor: resetMessage.type === 'success' ? '#ECFDF3' : '#FEF2F2',
                    color: resetMessage.type === 'success' ? '#065F46' : '#991B1B',
                    border: `1px solid ${resetMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  {resetMessage.type === 'success' ? (
                    <CheckCircle2 size={16} color="#008A38" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <span>{resetMessage.text}</span>
                </div>
              )}
            </div>

            {/* DIRECT PASSWORD CHANGE */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: '#ECFDF3',
                border: '1.5px solid #A7F3D0',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#064E3B' }}>
                  Update Password Directly
                </div>
                <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '2px' }}>
                  Change your password immediately inside your dashboard.
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsChangePassModalOpen(true);
                  setPassError('');
                  setPassSuccess('');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#008A38',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  border: '1.5px solid #00B84A',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 184, 74, 0.15)',
                }}
              >
                <KeyRound size={15} />
                <span>Change Password Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingProfile) {
              setIsEditModalOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #E2E8F0',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                backgroundColor: '#FFFFFF',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Edit Trainer Profile
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>
                    Update your official personal and coaching details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingProfile}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {editError && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Trainer Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. sibaan"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />
              </div>

              {/* Phone & Specialty */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+91 9960904626"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Specialty / Role
                  </label>
                  <input
                    type="text"
                    value={editForm.specialty}
                    onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                    placeholder="e.g. Personal Training & Strength"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  />
                </div>
              </div>

              {/* Experience & Shifts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Experience
                  </label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    placeholder="e.g. 4 Years"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Shift / Timing
                  </label>
                  <input
                    type="text"
                    value={editForm.shifts}
                    onChange={(e) => setEditForm({ ...editForm, shifts: e.target.value })}
                    placeholder="e.g. Morning 06:00 AM – 11:00 AM"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={editForm.photo}
                  onChange={(e) => setEditForm({ ...editForm, photo: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />
              </div>

              {/* Coach Bio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Coach Bio & Philosophy
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell your clients about your training approach, philosophy, and specializations..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingProfile}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00B84A 0%, #008A38 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 184, 74, 0.3)',
                    opacity: isSavingProfile ? 0.75 : 1,
                  }}
                >
                  <Save size={16} />
                  <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CHANGE PASSWORD MODAL */}
      {/* ========================================================================= */}
      {isChangePassModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingPass) {
              setIsChangePassModalOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #E2E8F0',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Change Login Password
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>
                    Update your Respire Trainer Portal login credentials
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChangePassModalOpen(false)}
                disabled={isSavingPass}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePasswordSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {passError && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div
                  style={{
                    backgroundColor: '#ECFDF3',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{passSuccess}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Current Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={passForm.currentPassword}
                    onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  New Password * (Min 6 Characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                    placeholder="Enter new strong password"
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Confirm New Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00B84A')}
                    onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsChangePassModalOpen(false)}
                  disabled={isSavingPass}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingPass}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00B84A 0%, #008A38 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: isSavingPass ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 184, 74, 0.3)',
                    opacity: isSavingPass ? 0.75 : 1,
                  }}
                >
                  <Lock size={16} />
                  <span>{isSavingPass ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
