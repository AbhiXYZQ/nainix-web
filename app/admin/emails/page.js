'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Users, CheckCircle, AlertCircle } from 'lucide-react';

const AUDIENCES = [
  { value: 'all',        label: '👥 All Users' },
  { value: 'clients',    label: '💼 All Clients' },
  { value: 'freelancers',label: '🧑‍💻 All Freelancers' },
  { value: 'ai_pro',     label: '⭐ AI Pro Users' },
];

const TEMPLATES = [
  {
    label: '🚀 Launch Announcement',
    subject: 'Nainix is Live! 🎉',
    body: `Hi there!\n\nWe're thrilled to announce that Nainix is officially live!\n\nVisit us at https://www.nainix.me to explore jobs, find talent, and grow together.\n\nWith commissions as low as 1%, there's no better time to join the developer-first revolution.\n\nSee you inside!\n\n— The Nainix Team`
  },
  {
    label: '🔧 Maintenance Notice',
    subject: 'Scheduled Maintenance — Nainix',
    body: `Hi there,\n\nWe wanted to give you a heads up that Nainix will be undergoing scheduled maintenance on [DATE] from [TIME] IST.\n\nDuring this time, the platform may be temporarily unavailable. We apologize for the inconvenience.\n\nThank you for your patience!\n\n— The Nainix Team`
  },
  {
    label: '✨ New Feature',
    subject: 'New on Nainix — [Feature Name]',
    body: `Hi there,\n\nWe've just shipped something exciting!\n\n[Describe the new feature here]\n\nLog in now to check it out: https://www.nainix.me\n\n— The Nainix Team`
  },
];

export default function AdminEmailsPage() {
  const [audience, setAudience] = useState('all');
  const [subject, setSubject]   = useState('');
  const [body, setBody]         = useState('');
  const [sending, setSending]   = useState(false);
  const [result, setResult]     = useState(null);

  const applyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    if (!confirm(`Send this email to all ${AUDIENCES.find(a => a.value === audience)?.label}? This cannot be undone.`)) return;

    setSending(true);
    setResult(null);
    try {
      const res  = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, subject, body }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      if (data.success) { setSubject(''); setBody(''); }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally { setSending(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Email Center</h1>
        <p className="text-sm text-slate-500 mt-1">Send bulk emails to your users via Resend</p>
      </div>

      {/* Result Toast */}
      {result && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
            result.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
          {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {result.message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Templates */}
        <div className="rounded-2xl border border-white/5 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Quick Templates</p>
          <div className="space-y-2">
            {TEMPLATES.map(tpl => (
              <button key={tpl.label} onClick={() => applyTemplate(tpl)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-violet-500/10 hover:text-violet-300 border border-transparent hover:border-violet-500/20 transition-all">
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compose Form */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <form onSubmit={handleSend} className="space-y-4">

            {/* Audience */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Send To</label>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCES.map(a => (
                  <button key={a.value} type="button" onClick={() => setAudience(a.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                      audience === a.value
                        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                        : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required
                placeholder="Email subject line…"
                className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all" />
            </div>

            {/* Body */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={10}
                placeholder="Write your email message here…"
                className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all resize-none font-mono" />
            </div>

            <button type="submit" disabled={sending || !subject || !body}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all">
              {sending ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending…</>
              ) : (
                <><Send className="w-4 h-4" /> Send Email</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
