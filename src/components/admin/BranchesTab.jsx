import React from 'react';
import { Building2, MapPin, Phone, Users, Dumbbell, IndianRupee, ArrowRight, UserCheck, Mail } from 'lucide-react';
import { BRANCHES } from './initialData';

export default function BranchesTab({ members, trainers, plans, onSelectBranch }) {
  return (
    <div>
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
          All Branches & Branch Managers
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
          Super Admin master view of both Respire Fitness branches and their respective branch managers.
        </p>
      </div>

      <div className="branches-cards-grid">
        {BRANCHES.map((branch) => {
          const branchMembers = members.filter((m) => m.branchId === branch.id);
          const activeMembers = branchMembers.filter((m) => m.status === 'Active');
          const branchTrainers = trainers.filter((t) => t.branchId === branch.id);
          const branchRev = activeMembers.reduce((sum, m) => {
            const p = plans.find((pl) => pl.id === m.planId);
            return sum + (p ? p.price : 5500);
          }, 0);

          return (
            <div
              key={branch.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid rgba(0, 184, 74, 0.22)',
                borderRadius: '22px',
                overflow: 'hidden',
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Top Gradient Header */}
              <div
                style={{
                  background:
                    branch.id === 'vishrambag'
                      ? 'linear-gradient(135deg, #00C952 0%, #008A37 100%)'
                      : 'linear-gradient(135deg, #172C83 0%, #2440B5 100%)',
                  padding: '22px 24px',
                  color: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(255,255,255,0.18)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <Building2 size={12} /> {branch.id === 'vishrambag' ? 'Branch 1 (HQ)' : 'Branch 2'}
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, opacity: 0.9 }}>Active</span>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '6px' }}>
                  {branch.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)' }}>
                  <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{branch.address}</span>
                </div>
              </div>

              {/* Body Stats & Manager Info */}
              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Branch Manager Card */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <UserCheck size={13} color="#00B84A" /> Assigned Branch Manager
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                    {branch.managerName}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={12} color="#00B84A" /> {branch.managerEmail}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={12} color="#172C83" /> {branch.phone}
                    </span>
                  </div>
                </div>

                {/* Quick KPI Mini Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ backgroundColor: '#F4FBF7', padding: '12px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(0,184,74,0.16)' }}>
                    <Users size={16} color="#008A38" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>{activeMembers.length}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Members</div>
                  </div>
                  <div style={{ backgroundColor: '#EEF2FF', padding: '12px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(23,44,131,0.14)' }}>
                    <Dumbbell size={16} color="#172C83" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A' }}>{branchTrainers.length}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Trainers</div>
                  </div>
                  <div style={{ backgroundColor: '#F4FBF7', padding: '12px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(0,184,74,0.16)' }}>
                    <IndianRupee size={16} color="#008A38" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#008A38' }}>₹{Math.round(branchRev / 1000)}k</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Plan Value</div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectBranch(branch.id)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <span>Open {branch.shortName} Dashboard</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .branches-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }
        @media (max-width: 860px) {
          .branches-cards-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
