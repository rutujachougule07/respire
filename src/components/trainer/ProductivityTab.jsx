import React, { useMemo } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Award,
  Calendar,
  Activity,
  BarChart2,
  PieChart,
  Target,
} from 'lucide-react';

export default function ProductivityTab({
  trainerProfile,
  myMembers = [],
  mySessions = [],
  completedSessions = [],
  upcomingSessions = [],
  cancelledSessions = [],
  todaySessions = [],
}) {
  // 1. Total Members Trained (Unique members with at least 1 completed session)
  const totalMembersTrained = useMemo(() => {
    const trainedIds = new Set(
      mySessions.filter((s) => s.status === 'Completed').map((s) => s.memberId)
    );
    return trainedIds.size;
  }, [mySessions]);

  // Overall Completion Rate
  const overallCompletionRate = mySessions.length > 0
    ? Math.round((completedSessions.length / mySessions.length) * 100)
    : 100;

  // 2. Daily Productivity (Today's metrics)
  const todayCompleted = useMemo(() => {
    return todaySessions.filter((s) => s.status === 'Completed').length;
  }, [todaySessions]);

  const todayCompletionRate = todaySessions.length > 0
    ? Math.round((todayCompleted / todaySessions.length) * 100)
    : todayCompleted > 0 ? 100 : 0;

  // 3. Weekly Productivity (Current Mon - Sun)
  const currentWeekStats = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // Sunday = 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekSessions = mySessions.filter((s) => {
      const sDate = new Date(s.date);
      return sDate >= monday && sDate <= sunday;
    });

    const completedInWeek = weekSessions.filter((s) => s.status === 'Completed').length;
    const rate = weekSessions.length > 0 ? Math.round((completedInWeek / weekSessions.length) * 100) : 100;

    // Day-by-day counts (Mon through Sun)
    const dayCounts = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const count = weekSessions.filter((s) => s.date === dStr && s.status === 'Completed').length;
      return {
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date: dStr,
        count,
      };
    });

    return {
      total: weekSessions.length,
      completed: completedInWeek,
      rate,
      dayCounts,
    };
  }, [mySessions]);

  // 4. Monthly Productivity (Current calendar month)
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const yearMonth = now.toISOString().substring(0, 7); // 'YYYY-MM'

    const monthSessions = mySessions.filter((s) => (s.date || '').startsWith(yearMonth));
    const completedInMonth = monthSessions.filter((s) => s.status === 'Completed').length;
    const rate = monthSessions.length > 0 ? Math.round((completedInMonth / monthSessions.length) * 100) : 100;

    return {
      total: monthSessions.length,
      completed: completedInMonth,
      rate,
    };
  }, [mySessions]);

  // Workout Type Breakdown
  const typeBreakdown = useMemo(() => {
    const counts = {};
    mySessions.forEach((s) => {
      const t = s.type || 'General Workout';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [mySessions]);

  const maxWeeklyCount = Math.max(...currentWeekStats.dayCounts.map((d) => d.count), 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Heading */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Trainer Productivity & Performance Analytics
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0' }}>
            Live performance calculated directly from official Firestore session records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: '#ECFDF3',
              border: '1px solid #A7F3D0',
              color: '#008A38',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Activity size={14} />
            <span>Overall Success Rate: {overallCompletionRate}%</span>
          </div>
        </div>
      </div>

      {/* 4 Core Work Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Total Sessions Completed */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Total Sessions Completed
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFDF3', color: '#008A38', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#008A38', lineHeight: 1 }}>
            {completedSessions.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '8px' }}>
            Successfully trained clients
          </div>
        </div>

        {/* Total Upcoming Sessions */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Total Upcoming Sessions
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#1E40AF', lineHeight: 1 }}>
            {upcomingSessions.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '8px' }}>
            Pending client workout slots
          </div>
        </div>

        {/* Total Cancelled Sessions */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Total Cancelled Sessions
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#DC2626', lineHeight: 1 }}>
            {cancelledSessions.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '8px' }}>
            Cancelled by client or coach
          </div>
        </div>

        {/* Total Members Trained */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Total Members Trained
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F8FAFC', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
            {totalMembersTrained}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '8px' }}>
            Across {myMembers.length} assigned clients
          </div>
        </div>
      </div>

      {/* Daily, Weekly & Monthly Productivity Trio */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Daily Productivity Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1.5px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Calendar size={18} color="#00B84A" />
            <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A' }}>Daily Productivity</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#008A38' }}>
              {todayCompleted} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>/ {todaySessions.length} done</span>
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#008A38' }}>{todayCompletionRate}%</span>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', borderRadius: '999px', backgroundColor: '#E2E8F0', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${todayCompletionRate}%`, height: '100%', backgroundColor: '#00B84A', borderRadius: '999px', transition: 'width 0.4s ease' }} />
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
            <span>Target: Complete all today slots</span>
            <span>{todaySessions.length - todayCompleted} remaining today</span>
          </div>
        </div>

        {/* Weekly Productivity Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1.5px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Target size={18} color="#2563EB" />
            <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A' }}>Weekly Productivity</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E40AF' }}>
              {currentWeekStats.completed} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>/ {currentWeekStats.total} done</span>
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#2563EB' }}>{currentWeekStats.rate}%</span>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', borderRadius: '999px', backgroundColor: '#E2E8F0', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${currentWeekStats.rate}%`, height: '100%', backgroundColor: '#2563EB', borderRadius: '999px', transition: 'width 0.4s ease' }} />
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
            <span>Current Week (Mon - Sun)</span>
            <span>{currentWeekStats.total - currentWeekStats.completed} open</span>
          </div>
        </div>

        {/* Monthly Productivity Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1.5px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <TrendingUp size={18} color="#D97706" />
            <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A' }}>Monthly Productivity</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#B45309' }}>
              {currentMonthStats.completed} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>/ {currentMonthStats.total} done</span>
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#D97706' }}>{currentMonthStats.rate}%</span>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', borderRadius: '999px', backgroundColor: '#E2E8F0', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${currentMonthStats.rate}%`, height: '100%', backgroundColor: '#D97706', borderRadius: '999px', transition: 'width 0.4s ease' }} />
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
            <span>Calendar Month Progress</span>
            <span>{currentMonthStats.total - currentMonthStats.completed} pending</span>
          </div>
        </div>
      </div>

      {/* Visual Charts: Weekly Activity Bar Chart & Workout Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Weekly Activity Bar Chart */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="#00B84A" />
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Weekly Completed Sessions (Mon – Sun)
              </h3>
            </div>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#008A38' }}>
              Total: {currentWeekStats.completed}
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', paddingBottom: '10px', borderBottom: '1.5px solid #E2E8F0' }}>
            {currentWeekStats.dayCounts.map((d) => {
              const heightPercent = maxWeeklyCount > 0 ? Math.max((d.count / maxWeeklyCount) * 100, 8) : 8;
              const hasCount = d.count > 0;

              return (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: hasCount ? '#008A38' : '#94A3B8' }}>
                    {d.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '38px',
                      height: `${heightPercent}%`,
                      backgroundColor: hasCount ? '#00B84A' : '#E2E8F0',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease, background-color 0.2s',
                    }}
                  />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: hasCount ? '#0F172A' : '#64748B' }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workout Type Distribution Breakdown */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} color="#2563EB" />
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Workout Types Distribution
              </h3>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
              {mySessions.length} total sessions
            </span>
          </div>

          {typeBreakdown.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.84rem', textAlign: 'center', padding: '30px 0' }}>
              No workout session data recorded yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {typeBreakdown.slice(0, 5).map(([type, count]) => {
                const percent = mySessions.length > 0 ? Math.round((count / mySessions.length) * 100) : 0;
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>{type}</span>
                      <span style={{ color: '#64748B' }}>
                        {count} sessions ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: '7px', borderRadius: '999px', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#00B84A', borderRadius: '999px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
