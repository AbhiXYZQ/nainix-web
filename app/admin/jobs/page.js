'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Briefcase, Star, Trash2, Eye, RefreshCw,
  ChevronLeft, ChevronRight, CheckCircle, X, Clock,
  TrendingUp, Zap, Filter
} from 'lucide-react';

const STATUSES   = ['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'];
const CATEGORIES = ['ALL', 'Web Development', 'App Development', 'AI/ML', 'Blockchain', 'DevOps', 'Backend Development', 'Frontend Development'];

function Badge({ children, color }) {
  const c = {
    green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    amber:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
    blue:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    slate:  'bg-slate-500/10 text-slate-500 border-slate-500/20',
    red:    'bg-red-500/15 text-red-400 border-red-500/20',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${c[color] || c.slate}`}>
      {children}
    </span>
  );
}

const statusColor = { OPEN: 'green', IN_PROGRESS: 'amber', COMPLETED: 'blue' };

// ─── Job Detail Modal ─────────────────────────────────────────
function JobModal({ job, onClose, onAction, actionLoading }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl rounded-2xl border border-violet-900/30 bg-[#0d0d1f] p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-start gap-3 flex-wrap mb-3">
            <Badge color={statusColor[job.status] || 'slate'}>{job.status}</Badge>
            {job.is_featured && <Badge color="amber">⭐ Featured</Badge>}
            {job.is_urgent && <Badge color="red">⚡ Urgent</Badge>}
          </div>
          <h3 className="text-white font-bold text-lg leading-snug">{job.title}</h3>
          <p className="text-slate-500 text-sm mt-1">
            by <span className="text-violet-400">{job.client?.name || job.client_id}</span>
          </p>
        </div>

        {/* Budget + Category */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/3 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Budget</p>
            <p className="text-white font-semibold text-sm">₹{job.budget_min?.toLocaleString('en-IN')} – ₹{job.budget_max?.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/3 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Category</p>
            <p className="text-white font-semibold text-sm">{job.category || '—'}</p>
          </div>
          <div className="bg-white/3 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Posted</p>
            <p className="text-white font-semibold text-sm">
              {job.created_at ? new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
            </p>
          </div>
          <div className="bg-white/3 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Proposals</p>
            <p className="text-white font-semibold text-sm">{job.proposal_count ?? '—'}</p>
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div className="bg-white/3 rounded-xl p-4 mb-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Description</p>
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-6">{job.description}</p>
          </div>
        )}

        {/* Skills */}
        {job.required_skills?.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.map(s => (
                <span key={s} className="px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onAction('feature', job)}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-50"
          >
            <Star className="w-3.5 h-3.5" /> {job.is_featured ? 'Unfeature' : 'Force Feature'}
          </button>
          <button
            onClick={() => onAction('close', job)}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-500/20 transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Close Job
          </button>
          <button
            onClick={() => onAction('delete', job)}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminJobsPage() {
  const [jobs, setJobs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('ALL');
  const [category, setCategory]   = useState('ALL');
  const [page, setPage]           = useState(1);
  const [selectedJob, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]         = useState('');
  const PAGE_SIZE = 15;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: PAGE_SIZE,
        ...(search !== ''       && { search }),
        ...(status !== 'ALL'   && { status }),
        ...(category !== 'ALL' && { category }),
      });
      const res  = await fetch(`/api/admin/jobs?${params}`);
      const data = await res.json();
      if (data.success) { setJobs(data.jobs); setTotal(data.total); }
    } finally { setLoading(false); }
  }, [page, search, status, category]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleAction = async (action, job) => {
    if (action === 'delete' && !confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    setActionLoading(true);
    setSelected(null);
    try {
      const res  = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      showToast(data.message || 'Done');
      fetchJobs();
    } finally { setActionLoading(false); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Job Management</h1>
          <p className="text-sm text-slate-500 mt-1">{total.toLocaleString()} total jobs</p>
        </div>
        <button onClick={fetchJobs} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> {toast}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jobs by title…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-slate-300 outline-none cursor-pointer">
          {STATUSES.map(s => <option key={s} value={s} className="bg-[#0d0d1f]">{s === 'ALL' ? 'All Status' : s.replace('_', ' ')}</option>)}
        </select>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-slate-300 outline-none cursor-pointer max-w-[180px] truncate">
          {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d0d1f]">{c === 'ALL' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Job Title', 'Client', 'Category', 'Budget', 'Status', 'Props', 'Posted', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-8 rounded-lg bg-white/3 animate-pulse" /></td></tr>
                ))
              ) : !jobs.length ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No jobs found.</td></tr>
              ) : (
                jobs.map((job, i) => (
                  <motion.tr key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/2 transition-colors group">
                    {/* Title */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        {job.is_featured && <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        {job.is_urgent   && <Zap  className="w-3 h-3 text-red-400 flex-shrink-0" />}
                        <span className="text-white font-medium text-sm truncate">{job.title}</span>
                      </div>
                    </td>
                    {/* Client */}
                    <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[120px]">
                      {job.client?.name || '—'}
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{job.category || '—'}</td>
                    {/* Budget */}
                    <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">
                      ₹{(job.budget_min || 0).toLocaleString('en-IN')}–{(job.budget_max || 0).toLocaleString('en-IN')}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge color={statusColor[job.status] || 'slate'}>{job.status?.replace('_', ' ')}</Badge>
                    </td>
                    {/* Proposals */}
                    <td className="px-4 py-3 text-center text-slate-400 text-xs">{job.proposal_count ?? 0}</td>
                    {/* Posted */}
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelected(job)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-violet-500/20 transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button onClick={() => handleAction('feature', job)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-amber-500/20 transition-colors" title="Feature">
                          <Star className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button onClick={() => handleAction('delete', job)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-colors" title="Delete">
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
            <p className="text-xs text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
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

      {/* Job Modal */}
      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelected(null)} onAction={handleAction} actionLoading={actionLoading} />
      )}
    </div>
  );
}
