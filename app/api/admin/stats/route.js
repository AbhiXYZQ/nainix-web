import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// ─── Admin guard helper ────────────────────────────────────────
function isAdmin(request) {
  const session = getSessionFromRequest(request);
  return session?.role === 'ADMIN';
}

// ─── Date helpers ──────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const supabase = getSupabase();

    // ── Run all queries in parallel ────────────────────────────
    const [
      usersRes,
      jobsRes,
      proposalsRes,
      collabRes,
      recentUsersRes,
      newUsersTodayRes,
      openJobsRes,
      aiProRes,
      paymentsRes,
      userGrowthRes,
      jobsWeeklyRes,
      waitlistRes,
    ] = await Promise.all([
      // Use select('id') instead of head:true for accurate Supabase counts
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('jobs').select('id', { count: 'exact' }),
      supabase.from('proposals').select('id', { count: 'exact' }),
      // Wrap optional tables so they don't crash Promise.all
      supabase.from('collab_rooms').select('id', { count: 'exact' }).then(r => r).catch(() => ({ count: 0, data: [] })),

      // Last 10 users (recent signups)
      supabase.from('users')
        .select('id, name, email, role, created_at, monetization')
        .order('created_at', { ascending: false })
        .limit(10),

      // New users today (IST-aware: use last 24h instead of midnight)
      supabase.from('users')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

      // Open jobs count
      supabase.from('jobs')
        .select('id', { count: 'exact' })
        .eq('status', 'OPEN'),

      // AI Pro users
      supabase.from('users')
        .select('id', { count: 'exact' })
        .eq('monetization->>plan', 'AI_PRO'),

      // Payments — optional table
      supabase.from('payments').select('amount').then(r => r).catch(() => ({ data: [] })),

      // User growth — last 14 days
      supabase.from('users')
        .select('created_at')
        .gte('created_at', daysAgo(14))
        .order('created_at', { ascending: true }),

      // Jobs per week — last 8 weeks
      supabase.from('jobs')
        .select('created_at')
        .gte('created_at', daysAgo(56))
        .order('created_at', { ascending: true }),

      // Waitlist count
      supabase.from('waitlist').select('id', { count: 'exact' }).then(r => r).catch(() => ({ count: 0 })),
    ]);

    // ── Total revenue ──────────────────────────────────────────
    const totalRevenue = (paymentsRes.data || []).reduce(
      (sum, p) => sum + (Number(p.amount) || 0), 0
    );

    // ── Role split for pie chart ───────────────────────────────
    const [clientCountRes, freelancerCountRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'FREELANCER'),
    ]);

    const roleSplit = [
      { name: 'Clients',     value: clientCountRes.count || 0 },
      { name: 'Freelancers', value: freelancerCountRes.count || 0 },
    ];

    // ── User growth chart (last 14 days, group by day) ─────────
    const growthMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      growthMap[key] = 0;
    }
    (userGrowthRes.data || []).forEach(u => {
      const day = u.created_at?.split('T')[0];
      if (day && growthMap[day] !== undefined) growthMap[day]++;
    });
    const userGrowth = Object.entries(growthMap).map(([date, users]) => ({
      date: formatDate(date),
      users,
    }));

    // ── Jobs per week ──────────────────────────────────────────
    const weekMap = {};
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const weekLabel = `W${8 - i}`;
      weekMap[weekLabel] = 0;
    }
    (jobsWeeklyRes.data || []).forEach(j => {
      if (!j.created_at) return;
      const diffDays = Math.floor((Date.now() - new Date(j.created_at)) / 86400000);
      const weekNum  = 8 - Math.floor(diffDays / 7);
      const key      = `W${Math.max(1, Math.min(8, weekNum))}`;
      if (weekMap[key] !== undefined) weekMap[key]++;
    });
    const jobsPerWeek = Object.entries(weekMap).map(([week, jobs]) => ({ week, jobs }));

    // ── Revenue chart (last 14 days) ───────────────────────────
    // If no payments table yet, return zeros
    const revenueChart = Object.entries(growthMap).map(([date]) => ({
      date: formatDate(date),
      revenue: 0,
    }));

    // ── Recent users with plan extracted ──────────────────────
    const recentUsers = (recentUsersRes.data || []).map(u => ({
      ...u,
      plan: u.monetization?.plan || 'FREE',
    }));

    return NextResponse.json({
      success: true,
      totalUsers:     usersRes.count     || 0,
      totalJobs:      jobsRes.count      || 0,
      totalProposals: proposalsRes.count || 0,
      totalCollab:    collabRes.count    || 0,
      newUsersToday:  newUsersTodayRes.count || 0,
      openJobs:       openJobsRes.count  || 0,
      aiProUsers:     aiProRes.count     || 0,
      waitlistCount:  waitlistRes.count  || 0,
      totalRevenue,
      roleSplit,
      userGrowth,
      jobsPerWeek,
      revenueChart,
      recentUsers,
    });
  } catch (error) {
    console.error('[Admin Stats]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch stats.' }, { status: 500 });
  }
}
