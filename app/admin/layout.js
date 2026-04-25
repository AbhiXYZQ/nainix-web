'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Briefcase, FileText, CreditCard,
  Users2, Mail, BarChart3, Settings, LogOut, ExternalLink,
  ChevronLeft, ChevronRight, Bell, Shield
} from 'lucide-react';

const navItems = [
  { label: 'Overview',     href: '/admin',            icon: LayoutDashboard },
  { label: 'Users',        href: '/admin/users',       icon: Users },
  { label: 'Jobs',         href: '/admin/jobs',        icon: Briefcase },
  { label: 'Proposals',    href: '/admin/proposals',   icon: FileText },
  { label: 'Payments',     href: '/admin/payments',    icon: CreditCard },
  { label: 'Collab Rooms', href: '/admin/collab',      icon: Users2 },
  { label: 'Email Center', href: '/admin/emails',      icon: Mail },
  { label: 'Reports',      href: '/admin/reports',     icon: BarChart3 },
  { label: 'Settings',     href: '/admin/settings',    icon: Settings },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#080812] text-white">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`relative flex flex-col border-r border-violet-900/30 bg-[#0a0a1a] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-violet-900/20 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Nainix</p>
              <p className="text-[10px] text-violet-400 font-medium uppercase tracking-widest">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`flex-shrink-0 w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!collapsed && <span>{label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-2 py-4 border-t border-violet-900/20 space-y-0.5">
          <Link
            href="/"
            target="_blank"
            title={collapsed ? 'View Website' : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink className="flex-shrink-0 w-4 h-4" />
            {!collapsed && <span>View Website</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="flex-shrink-0 w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-violet-600 border border-violet-500/50 flex items-center justify-center shadow-lg hover:bg-violet-500 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-white" /> : <ChevronLeft className="w-3 h-3 text-white" />}
        </button>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-violet-900/20 bg-[#080812] sticky top-0 z-10 backdrop-blur-sm">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {navItems.find(n => n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href))?.label || 'Admin'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Nainix Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-500" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">Admin</p>
                <p className="text-[10px] text-slate-500">hello@nainix.me</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
