'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Briefcase, TrendingUp, Star, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#11112a] border border-violet-900/40 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p,i)=><p key={i} style={{color:p.color}} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function AdminReportsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const d   = await res.json();
      if (d.success) setData(d);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const metrics = [
    { label: 'Total Users',    value: data?.totalUsers,     icon: Users,      color: 'text-violet-400' },
    { label: 'Total Jobs',     value: data?.totalJobs,      icon: Briefcase,  color: 'text-indigo-400' },
    { label: 'Open Jobs',      value: data?.openJobs,       icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'AI Pro Subs',    value: data?.aiProUsers,     icon: Star,       color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Platform growth and performance insights</p>
        </div>
        <button onClick={fetchReports} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({label,value,icon:Icon,color},i)=>(
          <motion.div key={label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="rounded-2xl border border-white/5 p-4" style={{background:'rgba(255,255,255,0.02)'}}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
              <Icon className={`w-4 h-4 ${color}`}/>
            </div>
            {loading ? <div className="h-7 w-16 bg-white/5 rounded-lg animate-pulse"/> :
              <p className={`text-2xl font-black ${color}`}>{value ?? '—'}</p>}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          className="rounded-2xl border border-white/5 p-5" style={{background:'rgba(255,255,255,0.02)'}}>
          <h3 className="text-sm font-semibold text-white mb-1">User Growth</h3>
          <p className="text-xs text-slate-500 mb-4">New signups — last 14 days</p>
          {loading ? <div className="h-48 bg-white/3 rounded-xl animate-pulse"/> :
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.userGrowth||[]}>
                <defs><linearGradient id="ug" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="date" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2.5} fill="url(#ug)" name="New Users"/>
              </AreaChart>
            </ResponsiveContainer>
          }
        </motion.div>

        {/* Jobs Per Week */}
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
          className="rounded-2xl border border-white/5 p-5" style={{background:'rgba(255,255,255,0.02)'}}>
          <h3 className="text-sm font-semibold text-white mb-1">Jobs Posted</h3>
          <p className="text-xs text-slate-500 mb-4">Weekly breakdown — last 8 weeks</p>
          {loading ? <div className="h-48 bg-white/3 rounded-xl animate-pulse"/> :
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.jobsPerWeek||[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="week" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="jobs" fill="#6366f1" radius={[4,4,0,0]} name="Jobs"/>
              </BarChart>
            </ResponsiveContainer>
          }
        </motion.div>
      </div>

      {/* Role Split Table */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
        className="rounded-2xl border border-white/5 p-5" style={{background:'rgba(255,255,255,0.02)'}}>
        <h3 className="text-sm font-semibold text-white mb-4">User Distribution</h3>
        <div className="space-y-3">
          {(data?.roleSplit||[{name:'Clients',value:0},{name:'Freelancers',value:0}]).map(({name,value})=>{
            const total = (data?.totalUsers||1);
            const pct = Math.round((value/total)*100);
            return (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">{name}</span>
                  <span className="text-slate-500">{value} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,delay:0.4}}
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500"/>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
