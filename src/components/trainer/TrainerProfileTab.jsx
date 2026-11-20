import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
  Clock,
  Calendar,
  Dumbbell,
  ShieldCheck,
  CheckCircle2,
  Users,
  TrendingUp,
  Activity,
  Building2,
} from 'lucide-react';

function formatSchedule(val) {
  if (!val) return 'Morning (Mon – Sat) • 06:00 AM – 11:00 AM';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    if (val.length === 0) return 'Morning (Mon – Sat) • 06:00 AM – 11:00 AM';
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
    return parts.join(' ') || 'Morning (Mon – Sat) • 06:00 AM – 11:00 AM';
  }
  return String(val);
}

export default function TrainerProfileTab({
  trainerProfile,
  myMembers = [],
  mySessions = [],
  completedSessions = [],
  showToast,
}) {
  const branchName =
    trainerProfile?.branchId === 'branch2'
      ? 'Respire Vijaynagar Branch'
      : 'Respire Vishrambag Branch';

  const branchAddress =
    trainerProfile?.branchId === 'branch2'
      ? '3rd Floor, Krishna Heights, Opp. KFC, Sangli-Miraj Road, Vijaynagar, Sangli'
      : '7th Floor, R City Mall, Opp. Safa Bakery, Vishrambag, Sangli';

  const shiftTime = formatSchedule(
    trainerProfile?.shifts || trainerProfile?.schedule
  );

  const trainerName =
    typeof trainerProfile?.name === 'string' && trainerProfile.name.trim()
      ? trainerProfile.name
      : 'sibaan';

  const trainerSpecialty =
    typeof trainerProfile?.specialty === 'string' && trainerProfile.specialty.trim()
      ? trainerProfile.specialty
      : 'Personal Training & Strength';

  const trainerPhone =
    typeof trainerProfile?.phone === 'string' && trainerProfile.phone.trim()
      ? trainerProfile.phone
      : '+91 9960904626';

  const trainerEmail =
    typeof trainerProfile?.email === 'string' && trainerProfile.email.trim()
      ? trainerProfile.email
      : 'trainer@respire.com';

  const trainerExperience =
    trainerProfile?.experience != null
      ? String(trainerProfile.experience)
      : '4+ Years';

  const trainerRating =
    trainerProfile?.rating != null
      ? String(trainerProfile.rating)
      : '4.8';

  const trainerBio =
    typeof trainerProfile?.bio === 'string' && trainerProfile.bio.trim()
      ? trainerProfile.bio
      : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. HERO PROFILE BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #064E3B 100%)',
          borderRadius: '22px',
          padding: '30px 32px',
          color: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: '0 16px 36px rgba(15, 23, 42, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
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
              fontSize: '2.2rem',
              fontWeight: 900,
              boxShadow: '0 8px 24px rgba(0, 184, 74, 0.4)',
              flexShrink: 0,
              overflow: 'hidden',
              border: '3px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            {trainerProfile?.photo && typeof trainerProfile.photo === 'string' ? (
              <img
                src={trainerProfile.photo}
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
                  padding: '3px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(0, 210, 86, 0.2)',
                  border: '1px solid rgba(0, 210, 86, 0.4)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#4ADE80',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <ShieldCheck size={13} />
                <span>Certified Respire Coach</span>
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(250, 204, 21, 0.2)',
                  border: '1px solid rgba(250, 204, 21, 0.4)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#FDE047',
                }}
              >
                <Star size={12} fill="#FDE047" />
                <span>{trainerRating} Rating</span>
              </span>
            </div>

            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              {trainerName}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.86rem', color: '#CBD5E1' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#86EFAC', fontWeight: 700 }}>
                <Dumbbell size={15} />
                {trainerSpecialty}
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={15} color="#94A3B8" />
                {branchName}
              </span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 210, 86, 0.15)',
              color: '#4ADE80',
              fontWeight: 800,
              fontSize: '0.8rem',
              border: '1px solid rgba(0, 210, 86, 0.3)',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ADE80' }}></span>
            Active Duty
          </span>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Assigned Members
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#ECFDF3', color: '#008A38' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0F172A' }}>{myMembers.length}</div>
          <div style={{ fontSize: '0.74rem', color: '#008A38', fontWeight: 700, marginTop: '2px' }}>
            Active 1-on-1 Clients
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Experience
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#EEF2FF', color: '#172C83' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0F172A' }}>
            {trainerExperience}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
            Strength & Conditioning
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Sessions Done
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0F172A' }}>
            {completedSessions.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
            Logged Completed Sessions
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Current Shift
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#F3E8FF', color: '#7E22CE' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
            {shiftTime}
          </div>
        </div>
      </div>

      {/* 3. TWO COLUMN DETAIL SECTION */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Column: Official Coach Details */}
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
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Coach Information & Contact
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  Portal Email
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', wordBreak: 'break-all' }}>
                  {trainerEmail}
                </div>
              </div>
            </div>

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
                  Working Schedule
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{shiftTime}</div>
              </div>
            </div>

            {trainerBio && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF3',
                  border: '1px solid #A7F3D0',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', marginBottom: '3px' }}>
                  Coach Bio
                </div>
                <div style={{ fontSize: '0.84rem', color: '#064E3B', lineHeight: 1.45 }}>
                  {trainerBio}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assigned Clients Roster Preview */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Assigned Client Roster
            </h3>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '999px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
              }}
            >
              {myMembers.length} Members
            </span>
          </div>

          {myMembers.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#64748B',
                fontSize: '0.88rem',
                border: '1.5px dashed #CBD5E1',
                borderRadius: '14px',
                margin: 'auto 0',
              }}
            >
              <Users size={32} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 800, color: '#0F172A' }}>No Members Assigned Yet</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                Members assigned to you by the Admin will appear here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '440px' }}>
              {myMembers.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #00D256 0%, #008A38 100%)',
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
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{m.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {m.planName || 'Gym Member'} • {m.phone || 'No phone'}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: m.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                      color: m.status === 'Active' ? '#15803D' : '#DC2626',
                    }}
                  >
                    {m.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
