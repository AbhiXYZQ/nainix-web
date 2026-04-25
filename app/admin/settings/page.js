'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, CheckCircle, AlertCircle, Eye, EyeOff, Shield, Clock, Globe, Mail } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved]       = useState('');
  const [error, setError]       = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Coming Soon settings
  const [launchDate, setLaunchDate] = useState('2026-06-01');
  const [siteMode, setSiteMode]     = useState('coming_soon');
  const [saving, setSaving]         = useState(false);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true); setSaved(''); setError('');
    try {
      const res  = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchDate, siteMode }),
      });
      const data = await res.json();
      if (data.success) setSaved('Settings saved successfully.');
      else setError(data.message || 'Failed to save.');
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  };

  const cards = [
    {
      icon: Globe,
      title: 'Site Mode',
      desc: 'Control whether the site shows the Coming Soon page or is fully live.',
      content: (
        <div className="flex gap-3 mt-4">
          {[
            { val: 'coming_soon', label: '🚧 Coming Soon', desc: 'Public sees countdown' },
            { val: 'live',        label: '🟢 Live',        desc: 'Site fully accessible' },
          ].map(opt => (
            <button key={opt.val} type="button" onClick={() => setSiteMode(opt.val)}
              className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                siteMode === opt.val
                  ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                  : 'bg-white/3 border-white/8 text-slate-400 hover:border-white/15'
              }`}>
              <p className="font-semibold text-sm">{opt.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      )
    },
    {
      icon: Clock,
      title: 'Launch Date',
      desc: 'The countdown target on the coming soon page.',
      content: (
        <input type="date" value={launchDate} onChange={e=>setLaunchDate(e.target.value)}
          className="mt-4 w-full px-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-white text-sm outline-none focus:border-violet-500/40 transition-all [color-scheme:dark]"/>
      )
    },
    {
      icon: Shield,
      title: 'Preview Bypass Secret',
      desc: 'Use this URL to access the site while in Coming Soon mode.',
      content: (
        <div className="mt-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/3 border border-white/8">
            <code className="flex-1 text-xs text-violet-300 truncate">
              {showSecret
                ? `https://www.nainix.me/api/preview?secret=nainix_owner_2026`
                : '••••••••••••••••••••••••••••••'}
            </code>
            <button type="button" onClick={() => setShowSecret(s=>!s)} className="text-slate-500 hover:text-white transition-colors">
              {showSecret ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2">Visit this URL in browser to unlock full site access for 30 days.</p>
        </div>
      )
    },
    {
      icon: Mail,
      title: 'Platform Email',
      desc: 'Emails are sent from this address via Resend.',
      content: (
        <div className="mt-4 px-4 py-3 rounded-xl bg-white/3 border border-white/8">
          <p className="text-sm text-white font-medium">hello@nainix.me</p>
          <p className="text-xs text-slate-500 mt-0.5">Configured via RESEND_FROM_EMAIL env variable</p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Platform-wide configuration</p>
      </div>

      {saved && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <CheckCircle className="w-4 h-4"/> {saved}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          <AlertCircle className="w-4 h-4"/> {error}
        </motion.div>
      )}

      <form onSubmit={saveSettings} className="space-y-4">
        {cards.map(({icon:Icon, title, desc, content}, i) => (
          <motion.div key={title} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
            className="rounded-2xl border border-white/5 p-5" style={{background:'rgba(255,255,255,0.02)'}}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-violet-400"/>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                {content}
              </div>
            </div>
          </motion.div>
        ))}

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm transition-all">
          {saving ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</> : <><Settings className="w-4 h-4"/> Save Settings</>}
        </button>
      </form>
    </div>
  );
}
