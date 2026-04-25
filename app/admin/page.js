'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, FileText, CreditCard, Home,
  Sparkles, TrendingUp, TrendingDown, Minus,
  UserCheck, UserX, Clock, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/3 p-5 backdrop-blur-sm"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">{label}</p>
          {loading ? (
            <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
          ) : (
            <p className="text-3xl font-black text-white tabular-nums">{value ?? '—'}</p>
          )}
          {sub && !loading && (
            <p className="text-xs text-slate-500 mt-1.5">{sub}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {/* Bottom glow */}
      <div className={`absolute bottom-0 left-0 right-0 h-px opacity-40 ${color}`}
        style={{ background: 'currentColor' }} />
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────
function SectionHeader({ title, sub }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

const CHART_COLORS = ['#7c3aed', '#6366f1', '#a78bfa', '#818cf8', '#c4b5fd'];
const PIE_COLORS  = ['#7c3aed', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11112a] border border-violet-900/40 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminOverviewPage() {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const kpiCards = [
    { label: 'Total Users',      value: stats?.totalUsers,      icon: Users,     color: 'bg-violet-600',  sub: `${stats?.newUsersToday ?? 0} joined today` },
    { label: 'Total Jobs',       value: stats?.totalJobs,       icon: Briefcase, color: 'bg-indigo-600',  sub: `${stats?.openJobs ?? 0} currently open` },
    { label: 'Total Proposals',  value: stats?.totalProposals,  icon: FileText,  color: 'bg-purple-600',  sub: `Across all jobs` },
    { label: 'Revenue (₹)',      value: stats?.totalRevenue != null ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : null, icon: CreditCard, color: 'bg-emerald-600', sub: `Total earnings` },
    { label: 'Collab Rooms',     value: stats?.totalCollab,     icon: Home,      color: 'bg-sky-600',     sub: `Active rooms` },
    { label: 'AI Pro Users',     value: stats?.aiProUsers,      icon: Sparkles,  color: 'bg-amber-600',   sub: `Paying subscribers` },
  ];

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString('en-IN')}` : 'Loading data...'}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div key={card.label} transition={{ delay: i * 0.05 }}>
            <StatCard {...card} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl border border-white/5 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <SectionHeader title="User Growth" sub="New registrations — last 14 days" />
          {loading ? (
            <div className="h-48 rounded-xl bg-white/3 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2.5} dot={false} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Role Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/5 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <SectionHeader title="User Roles" sub="CLIENT vs FREELANCER" />
          {loading ? (
            <div className="h-48 rounded-xl bg-white/3 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats?.roleSplit || [{ name: 'Clients', value: 0 }, { name: 'Freelancers', value: 0 }]}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={4} dataKey="value"
                >
                  {(stats?.roleSplit || []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Jobs Per Week */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/5 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <SectionHeader title="Jobs Posted" sub="Per week — last 8 weeks" />
          {loading ? (
            <div className="h-48 rounded-xl bg-white/3 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.jobsPerWeek || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jobs" fill="#6366f1" radius={[4, 4, 0, 0]} name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/5 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <SectionHeader title="Revenue" sub="Daily earnings — last 14 days (₹)" />
          {loading ? (
            <div className="h-48 rounded-xl bg-white/3 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats?.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={false} name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/5 p-5"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <SectionHeader title="Recent Signups" sub="Latest users who joined the platform" />
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : !stats?.recentUsers?.length ? (
          <p className="text-slate-500 text-sm">No recent signups found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-slate-500 font-medium pb-3 pr-4">Name</th>
                  <th className="text-left text-xs text-slate-500 font-medium pb-3 pr-4">Email</th>
                  <th className="text-left text-xs text-slate-500 font-medium pb-3 pr-4">Role</th>
                  <th className="text-left text-xs text-slate-500 font-medium pb-3 pr-4">Plan</th>
                  <th className="text-left text-xs text-slate-500 font-medium pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-300 flex-shrink-0">
                          {(u.name || u.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-white font-medium truncate max-w-[120px]">{u.name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-400 truncate max-w-[160px]">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
                        u.role === 'CLIENT' ? 'bg-sky-500/15 text-sky-400' :
                        u.role === 'ADMIN'  ? 'bg-red-500/15 text-red-400' :
                        'bg-violet-500/15 text-violet-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
                        u.plan === 'AI_PRO' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-slate-500'
                      }`}>
                        {u.plan || 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
