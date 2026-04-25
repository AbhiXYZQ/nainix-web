'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, UserCheck, UserX, Trash2, Mail,
  ChevronLeft, ChevronRight, RefreshCw, Shield, X,
  Eye, MoreHorizontal, CheckCircle, XCircle
} from 'lucide-react';

const ROLES  = ['ALL', 'CLIENT', 'FREELANCER', 'ADMIN'];
const PLANS  = ['ALL', 'FREE', 'AI_PRO'];
const VERIFIED = ['ALL', 'YES', 'NO'];

function Badge({ children, color }) {
  const colors = {
    green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    red:    'bg-red-500/15 text-red-400 border-red-500/20',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    sky:    'bg-sky-500/15 text-sky-400 border-sky-500/20',
    amber:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
    slate:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
}

function Avatar({ name, email }) {
  const letter = (name || email || '?')[0].toUpperCase();
  const colors = ['from-violet-600 to-indigo-600', 'from-sky-600 to-blue-600', 'from-emerald-600 to-teal-600', 'from-amber-600 to-orange-600'];
  const idx    = (name || email || '').charCodeAt(0) % colors.length;
  return (
    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
      {letter}
    </div>
  );
}

// ─── User Detail Modal ─────────────────────────────────────────
function UserModal({ user, onClose, onAction }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-2xl border border-violet-900/30 bg-[#0d0d1f] p-6 shadow-2xl z-10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar name={user.name} email={user.email} />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg truncate">{user.name || '—'}</h3>
            <p className="text-slate-400 text-sm truncate">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge color={user.role === 'CLIENT' ? 'sky' : user.role === 'ADMIN' ? 'red' : 'violet'}>{user.role}</Badge>
              <Badge color={user.monetization?.plan === 'AI_PRO' ? 'amber' : 'slate'}>{user.monetization?.plan || 'FREE'}</Badge>
              {user.email_verified && <Badge color="green">Verified</Badge>}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Username',  value: user.username ? `@${user.username}` : '—' },
            { label: 'Joined',    value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : '—' },
            { label: 'Country',   value: user.country || '—' },
            { label: 'City',      value: user.city || '—' },
            { label: 'Phone',     value: user.phone || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/3 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-sm text-white font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onAction('ban', user)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
            <UserX className="w-3.5 h-3.5" /> Ban User
          </button>
          <button onClick={() => onAction('verify', user)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
            <UserCheck className="w-3.5 h-3.5" /> Force Verify
          </button>
          <button onClick={() => onAction('email', user)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all">
            <Mail className="w-3.5 h-3.5" /> Send Email
          </button>
          <button onClick={() => onAction('delete', user)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('ALL');
  const [planFilter, setPlan]     = useState('ALL');
  const [verFilter, setVer]       = useState('ALL');
  const [page, setPage]           = useState(1);
  const [selectedUser, setSelected] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const PAGE_SIZE = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: PAGE_SIZE,
        ...(search     && { search }),
        ...(roleFilter !== 'ALL' && { role: roleFilter }),
        ...(planFilter !== 'ALL' && { plan: planFilter }),
        ...(verFilter  !== 'ALL' && { verified: verFilter }),
      });
      const res  = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) { setUsers(data.users); setTotal(data.total); }
    } finally { setLoading(false); }
  }, [page, search, roleFilter, planFilter, verFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (action, user) => {
    setSelected(null);
    if (action === 'delete' && !confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    if (action === 'email') { window.open(`mailto:${user.email}`); return; }
    const res  = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setActionMsg(data.message || 'Done');
    setTimeout(() => setActionMsg(''), 3000);
    fetchUsers();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">{total.toLocaleString()} total users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Action Toast */}
      {actionMsg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> {actionMsg}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, username…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all"
          />
        </div>

        {/* Role Filter */}
        <select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-slate-300 outline-none focus:border-violet-500/40 cursor-pointer">
          <option value="ALL" className="bg-[#0d0d1f]">All Roles</option>
          <option value="CLIENT" className="bg-[#0d0d1f]">Clients</option>
          <option value="FREELANCER" className="bg-[#0d0d1f]">Freelancers</option>
          <option value="ADMIN" className="bg-[#0d0d1f]">Admins</option>
        </select>

        {/* Plan Filter */}
        <select value={planFilter} onChange={e => { setPlan(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-slate-300 outline-none focus:border-violet-500/40 cursor-pointer">
          {PLANS.map(p => <option key={p} value={p} className="bg-[#0d0d1f]">{p === 'ALL' ? 'All Plans' : p}</option>)}
        </select>

        {/* Verified Filter */}
        <select value={verFilter} onChange={e => { setVer(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-slate-300 outline-none focus:border-violet-500/40 cursor-pointer">
          {VERIFIED.map(v => <option key={v} value={v} className="bg-[#0d0d1f]">{v === 'ALL' ? 'All Verified' : v === 'YES' ? 'Verified' : 'Unverified'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3">User</th>
                <th className="text-left text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3">Role</th>
                <th className="text-left text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3">Plan</th>
                <th className="text-left text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3">Verified</th>
                <th className="text-left text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3">Joined</th>
                <th className="text-right text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-8 rounded-lg bg-white/3 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : !users.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No users found.</td></tr>
              ) : (
                users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} email={u.email} />
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate max-w-[140px]">{u.name || '—'}</p>
                          <p className="text-slate-500 text-xs truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3">
                      <Badge color={u.role === 'CLIENT' ? 'sky' : u.role === 'ADMIN' ? 'red' : 'violet'}>{u.role}</Badge>
                    </td>
                    {/* Plan */}
                    <td className="px-4 py-3">
                      <Badge color={u.monetization?.plan === 'AI_PRO' ? 'amber' : 'slate'}>{u.monetization?.plan || 'FREE'}</Badge>
                    </td>
                    {/* Verified */}
                    <td className="px-4 py-3">
                      {u.email_verified
                        ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Yes</span>
                        : <span className="flex items-center gap-1 text-slate-500 text-xs"><XCircle className="w-3.5 h-3.5" /> No</span>}
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelected(u)} title="View" className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-violet-500/20 transition-colors">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button onClick={() => handleAction('verify', u)} title="Force Verify" className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button onClick={() => handleAction('email', u)} title="Email" className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-violet-500/20 transition-colors">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button onClick={() => handleAction('delete', u)} title="Delete" className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <span className="text-xs text-slate-400 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-all">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelected(null)} onAction={handleAction} />
      )}
    </div>
  );
}
