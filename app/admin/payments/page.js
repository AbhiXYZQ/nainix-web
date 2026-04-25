'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, RefreshCw, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal]       = useState(0);
  const [revenue, setRevenue]   = useState({ today: 0, month: 0, total: 0 });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const PAGE_SIZE = 20;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE, ...(search && { search }) });
      const res  = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
        setTotal(data.total);
        setRevenue(data.revenue);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [page, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const summaryCards = [
    { label: "Today's Revenue",   value: `₹${revenue.today?.toLocaleString('en-IN') || 0}`,  color: 'text-emerald-400' },
    { label: "This Month",        value: `₹${revenue.month?.toLocaleString('en-IN') || 0}`,  color: 'text-violet-400' },
    { label: "Total Revenue",     value: `₹${revenue.total?.toLocaleString('en-IN') || 0}`,  color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Payments & Revenue</h1>
          <p className="text-sm text-slate-500 mt-1">{total} total transactions</p>
        </div>
        <button onClick={fetchPayments} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
            {loading ? <div className="h-7 w-24 bg-white/5 rounded-lg animate-pulse" /> :
              <p className={`text-2xl font-black ${color}`}>{value}</p>}
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by user or transaction ID…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Amount', 'Feature', 'Transaction ID', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 rounded-lg bg-white/3 animate-pulse" /></td></tr>
              )) : !payments.length ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No transactions found.</td></tr>
              ) : payments.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{p.user?.email || p.user_id || '—'}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">₹{((p.amount || 0) / 100).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/20 uppercase">
                      {p.feature?.replace('_', ' ') || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono truncate max-w-[160px]">{p.razorpay_payment_id || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase">
                      {p.status || 'SUCCESS'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
