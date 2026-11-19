import React, { useState } from 'react';
import {
  IndianRupee,
  TrendingUp,
  UserMinus,
  Sparkles,
  Download,
  BarChart3,
  Plus,
  Users,
} from 'lucide-react';
import { MONTHLY_ANALYTICS, BRANCH_MONTHLY_ANALYTICS } from './initialData';

export default function AnalyticsTab({ members, plans, addonRevenue, setAddonRevenue, activeBranchId = 'all', showToast }) {
  const [selectedService, setSelectedService] = useState('Massage');
  const [logAmount, setLogAmount] = useState('1500');

  const chartSeries =
    activeBranchId === 'all'
      ? MONTHLY_ANALYTICS
      : BRANCH_MONTHLY_ANALYTICS[activeBranchId] || MONTHLY_ANALYTICS;

  // Group add-ons by service name so 'all' combines both branches cleanly
  const aggregatedAddons = Object.values(
    addonRevenue.reduce((acc, item) => {
      if (!acc[item.service]) {
        acc[item.service] = { ...item };
      } else {
        acc[item.service] = {
          ...acc[item.service],
          sessions: acc[item.service].sessions + item.sessions,
          revenue: acc[item.service].revenue + item.revenue,
        };
      }
      return acc;
    }, {})
  );

  // Dynamic numbers combined with branch monthly baseline
  const activeMembers = members.filter((m) => m.status === 'Active');
  const deactivatedMembers = members.filter((m) => m.status === 'Deactivated');

  const livePlanRevenue = activeMembers.reduce((sum, m) => {
    const p = plans.find((pl) => pl.id === m.planId);
    return sum + (p ? p.price : 5500);
  }, 0);

  const latestMonth = chartSeries[chartSeries.length - 1];
  const totalSubscriptionRev = latestMonth.subscriptionRev + livePlanRevenue;
  const totalAddonRev = aggregatedAddons.reduce((sum, a) => sum + a.revenue, 0);
  const totalNewMembersThisMonth = latestMonth.newMembers;
  const churnedCount = latestMonth.churned + deactivatedMembers.length;
  const churnRate = ((churnedCount / Math.max(1, 70 + activeMembers.length)) * 100).toFixed(1);

  const maxMonthlyRev = Math.max(...chartSeries.map((d) => d.subscriptionRev + d.addonRev));
  const maxGrowth = Math.max(...chartSeries.map((d) => d.newMembers));
  const maxAddon = Math.max(1, ...aggregatedAddons.map((a) => a.revenue));

  const handleLogAddon = (e) => {
    e.preventDefault();
    const amt = Number(logAmount);
    if (!amt || amt <= 0) return;
    const targetBranch = activeBranchId === 'all' ? 'vishrambag' : activeBranchId;
    setAddonRevenue((prev) =>
      prev.map((item) =>
        item.service === selectedService && item.branchId === targetBranch
          ? { ...item, sessions: item.sessions + 1, revenue: item.revenue + amt }
          : item
      )
    );
    showToast(`Logged ₹${amt.toLocaleString('en-IN')} under ${selectedService} add-on revenue`);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Month', 'Subscription Revenue (INR)', 'Add-on Revenue (INR)', 'New Members', 'Churned Members'],
      ...chartSeries.map((r) => [r.month, r.subscriptionRev, r.addonRev, r.newMembers, r.churned]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Respire_Fitness_${activeBranchId}_Analytics_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Revenue & Analytics Report (CSV)');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            Revenue & Analytics Reporting
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Track Subscription Revenue, Add-on Services (Massage, Zumba, Yoga, Steam Bath), Member Growth, and Churn.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-primary btn-sm" style={{ borderRadius: '10px' }}>
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* 4 Core KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
            borderRadius: '18px',
            padding: '22px',
            color: '#FFFFFF',
            boxShadow: '0 14px 28px rgba(0, 184, 74, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D1FAE5' }}>
              Subscription Revenue
            </span>
            <IndianRupee size={18} color="#FFFFFF" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, marginBottom: '4px' }}>
            ₹{totalSubscriptionRev.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#ECFDF5', fontWeight: 600 }}>
            +14.8% vs last month (Memberships)
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid rgba(23, 44, 131, 0.2)',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#172C83' }}>
              Add-on Revenue
            </span>
            <Sparkles size={18} color="#172C83" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            ₹{totalAddonRev.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#008A38', fontWeight: 700 }}>
            Massage, Steam Bath, Zumba, Yoga & PT
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid rgba(0, 184, 74, 0.2)',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#008A38' }}>
              Member Growth
            </span>
            <TrendingUp size={18} color="#00B84A" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            +{totalNewMembersThisMonth}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#008A38', fontWeight: 700 }}>
            New members joined this month
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid rgba(220, 38, 38, 0.2)',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#DC2626' }}>
              Member Churn
            </span>
            <UserMinus size={18} color="#DC2626" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            {churnedCount} <span style={{ fontSize: '0.95rem', color: '#DC2626', fontWeight: 800 }}>({churnRate}%)</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
            Members deactivated / left this month
          </div>
        </div>
      </div>

      {/* Charts Row: Revenue Chart + Add-on Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 6-Month Subscription vs Add-on Revenue Bar Chart */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#00B84A" /> Monthly Revenue Trend
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Subscription vs Add-on Services (INR)</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#008A38' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#00B84A' }} /> Subscription
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#172C83' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#172C83' }} /> Add-ons
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '210px',
              gap: '12px',
              paddingTop: '16px',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '10px',
            }}
          >
            {chartSeries.map((d) => {
              const subH = Math.round((d.subscriptionRev / maxMonthlyRev) * 100);
              const addH = Math.round((d.addonRev / maxMonthlyRev) * 100);
              return (
                <div
                  key={d.month}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F172A' }}>
                    ₹{Math.round((d.subscriptionRev + d.addonRev) / 1000)}k
                  </span>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '145px', width: '100%', justifyContent: 'center' }}>
                    <div
                      title={`Subscription: ₹${d.subscriptionRev.toLocaleString('en-IN')}`}
                      style={{
                        width: '16px',
                        height: `${Math.max(15, subH)}%`,
                        background: 'linear-gradient(180deg, #00D256 0%, #008A37 100%)',
                        borderRadius: '5px 5px 2px 2px',
                      }}
                    />
                    <div
                      title={`Add-ons: ₹${d.addonRev.toLocaleString('en-IN')}`}
                      style={{
                        width: '16px',
                        height: `${Math.max(12, addH)}%`,
                        background: 'linear-gradient(180deg, #2440B5 0%, #172C83 100%)',
                        borderRadius: '5px 5px 2px 2px',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B' }}>{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add-on Services Revenue Breakdown */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
              Add-on Services Revenue Breakdown
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '18px' }}>
              Income generated from Massage, Zumba, Yoga, Steam Bath & PT
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              {aggregatedAddons.map((item) => {
                const pct = Math.round((item.revenue / maxAddon) * 100);
                return (
                  <div key={item.service}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>
                        {item.service} <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>({item.sessions} bookings)</span>
                      </span>
                      <span style={{ fontWeight: 900, color: '#008A38' }}>
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '999px', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: '999px',
                          backgroundColor: item.color,
                          transition: 'width 0.35s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Add-on Payment Logger */}
          <form
            onSubmit={handleLogAddon}
            style={{
              display: 'flex',
              gap: '8px',
              paddingTop: '14px',
              borderTop: '1px solid #F1F5F9',
              flexWrap: 'wrap',
            }}
          >
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              style={{ flex: '1 1 130px', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.82rem', backgroundColor: '#FFFFFF' }}
            >
              {aggregatedAddons.map((a) => (
                <option key={a.service} value={a.service}>{a.service}</option>
              ))}
            </select>
            <input
              type="number"
              min="100"
              value={logAmount}
              onChange={(e) => setLogAmount(e.target.value)}
              placeholder="Amount ₹"
              style={{ width: '95px', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.82rem' }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00D256 0%, #008A37 100%)',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} /> Log ₹
            </button>
          </form>
        </div>
      </div>

      {/* Member Growth vs Churn Chart */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#00B84A" /> Member Growth vs Churn Analysis
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Compare monthly new member enrollments against members leaving the gym
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.76rem', fontWeight: 700 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#008A38' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#00B84A' }} /> New Members
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#DC2626' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#EF4444' }} /> Churned
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '14px' }}>
          {chartSeries.map((row) => {
            const growthPct = Math.round((row.newMembers / maxGrowth) * 100);
            const churnPct = Math.round((row.churned / maxGrowth) * 100);
            return (
              <div
                key={row.month}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>{row.month} 2026</div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#008A38', marginBottom: '4px' }}>
                    <span>Growth</span>
                    <span>+{row.newMembers}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '99px', backgroundColor: '#E2E8F0' }}>
                    <div style={{ width: `${growthPct}%`, height: '100%', borderRadius: '99px', backgroundColor: '#00B84A' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#DC2626', marginBottom: '4px' }}>
                    <span>Churn</span>
                    <span>-{row.churned}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '99px', backgroundColor: '#E2E8F0' }}>
                    <div style={{ width: `${Math.max(8, churnPct)}%`, height: '100%', borderRadius: '99px', backgroundColor: '#EF4444' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
