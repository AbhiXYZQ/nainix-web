'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Eye, X, FileText } from 'lucide-react';

function Badge({ children, color }) {
  const c = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    violet:'bg-violet-500/15 text-violet-400 border-violet-500/20',
    slate: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    blue:  'bg-blue-500/15 text-blue-400 border-blue-500/20',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${c[color]||c.slate}`}>{children}</span>;
}

const statusColor = { PENDING:'amber', ACCEPTED:'green', REJECTED:'slate', SHORTLISTED:'blue' };

function ProposalModal({ p, onClose }) {
  if (!p) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity:0, scale:0.95, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        className="relative w-full max-w-lg rounded-2xl border border-violet-900/30 bg-[#0d0d1f] p-6 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>
        <div className="mb-4">
          <Badge color={statusColor[p.status]||'slate'}>{p.status}</Badge>
          <h3 className="text-white font-bold text-lg mt-2 leading-snug">{p.job?.title || 'Job'}</h3>
          <p className="text-slate-500 text-sm mt-1">by <span className="text-violet-400">{p.freelancer?.name || '—'}</span></p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/3 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Bid Amount</p><p className="text-white font-semibold">₹{(p.bid_amount||0).toLocaleString('en-IN')}</p></div>
          <div className="bg-white/3 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Delivery</p><p className="text-white font-semibold">{p.delivery_days ? `${p.delivery_days} days` : '—'}</p></div>
          <div className="bg-white/3 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Submitted</p><p className="text-white font-semibold text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'}</p></div>
          <div className="bg-white/3 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Client</p><p className="text-white font-semibold text-xs truncate">{p.job?.client?.name || '—'}</p></div>
        </div>
        {p.cover_letter && (
          <div className="bg-white/3 rounded-xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Cover Letter</p>
            <p className="text-slate-300 text-sm leading-relaxed">{p.cover_letter}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState(null);
  const PAGE_SIZE = 15;

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE, ...(search && { search }) });
      const res = await fetch(`/api/admin/proposals?${params}`);
      const data = await res.json();
      if (data.success) { setProposals(data.proposals); setTotal(data.total); }
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Proposals</h1>
          <p className="text-sm text-slate-500 mt-1">{total.toLocaleString()} total proposals</p>
        </div>
        <button onClick={fetchProposals} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`} /> Refresh
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by freelancer or job…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all"/>
      </div>

      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{background:'rgba(255,255,255,0.02)'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Freelancer','Job Title','Bid (₹)','Delivery','Status','Date',''].map(h=>(
                  <th key={h} className="text-left text-[11px] text-slate-500 font-semibold uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {loading ? [...Array(8)].map((_,i)=>(
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 rounded-lg bg-white/3 animate-pulse"/></td></tr>
              )) : !proposals.length ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No proposals found.</td></tr>
              ) : proposals.map((p,i)=>(
                <motion.tr key={p.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
                  className="hover:bg-white/2 transition-colors group">
                  <td className="px-4 py-3 text-white text-sm font-medium">{p.freelancer?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-[180px] truncate">{p.job?.title || '—'}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold text-sm">₹{(p.bid_amount||0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.delivery_days ? `${p.delivery_days}d` : '—'}</td>
                  <td className="px-4 py-3"><Badge color={statusColor[p.status]||'slate'}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>setSelected(p)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-violet-500/20 transition-all">
                      <Eye className="w-3.5 h-3.5 text-slate-400"/>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-slate-500">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,total)} of {total}</p>
            <div className="flex items-center gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronLeft className="w-4 h-4 text-slate-400"/></button>
              <span className="text-xs text-slate-400 px-2">{page}/{totalPages}</span>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronRight className="w-4 h-4 text-slate-400"/></button>
            </div>
          </div>
        )}
      </div>
      {selected && <ProposalModal p={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}
