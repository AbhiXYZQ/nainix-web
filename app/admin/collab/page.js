'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, Users2, Eye, X, CheckCircle } from 'lucide-react';

function CollabModal({ room, onClose, onDelete }) {
  if (!room) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}}
        className="relative w-full max-w-md rounded-2xl border border-violet-900/30 bg-[#0d0d1f] p-6 shadow-2xl z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>
        <h3 className="text-white font-bold text-lg mb-1">{room.title}</h3>
        <p className="text-slate-400 text-sm mb-4">{room.description || '—'}</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/3 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase mb-1">Creator</p><p className="text-white text-sm font-medium">{room.creator?.name||'—'}</p></div>
          <div className="bg-white/3 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase mb-1">Role Req.</p><p className="text-white text-sm font-medium">{room.required_role||'ANY'}</p></div>
          <div className="bg-white/3 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase mb-1">Members</p><p className="text-white text-sm font-medium">{room.member_count||0}</p></div>
          <div className="bg-white/3 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase mb-1">Created</p><p className="text-white text-sm font-medium">{room.created_at ? new Date(room.created_at).toLocaleDateString('en-IN') : '—'}</p></div>
        </div>
        {room.skills_needed?.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Skills Needed</p>
            <div className="flex flex-wrap gap-2">{room.skills_needed.map(s=><span key={s} className="px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">{s}</span>)}</div>
          </div>
        )}
        <button onClick={()=>onDelete(room)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
          <Trash2 className="w-3.5 h-3.5"/> Delete Room
        </button>
      </motion.div>
    </div>
  );
}

export default function AdminCollabPage() {
  const [rooms, setRooms]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast]     = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 3000); };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/collab');
      const data = await res.json();
      if (data.success) { setRooms(data.rooms); setTotal(data.total); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleDelete = async (room) => {
    if (!confirm(`Delete "${room.title}"?`)) return;
    setSelected(null);
    const res = await fetch(`/api/admin/collab/${room.id}`, { method: 'DELETE' });
    const data = await res.json();
    showToast(data.message || 'Deleted');
    fetchRooms();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Collab Rooms</h1>
          <p className="text-sm text-slate-500 mt-1">{total} active rooms</p>
        </div>
        <button onClick={fetchRooms} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> Refresh
        </button>
      </div>

      {toast && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <CheckCircle className="w-4 h-4"/> {toast}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_,i)=>(
          <div key={i} className="h-40 rounded-2xl bg-white/3 animate-pulse"/>
        )) : !rooms.length ? (
          <p className="text-slate-500 col-span-3 text-center py-12">No collab rooms found.</p>
        ) : rooms.map((room,i)=>(
          <motion.div key={room.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
            className="rounded-2xl border border-white/5 p-4 hover:border-violet-500/20 transition-all cursor-pointer group"
            style={{background:'rgba(255,255,255,0.02)'}} onClick={()=>setSelected(room)}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                <Users2 className="w-4 h-4 text-violet-400"/>
              </div>
              <button onClick={e=>{e.stopPropagation();handleDelete(room);}}
                className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all">
                <Trash2 className="w-3.5 h-3.5 text-red-400"/>
              </button>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1 truncate">{room.title}</h3>
            <p className="text-slate-500 text-xs line-clamp-2 mb-3">{room.description || 'No description'}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">👤 {room.creator?.name||'—'}</span>
              <span className="text-violet-400">{room.member_count||0} members</span>
            </div>
          </motion.div>
        ))}
      </div>

      {selected && <CollabModal room={selected} onClose={()=>setSelected(null)} onDelete={handleDelete}/>}
    </div>
  );
}
