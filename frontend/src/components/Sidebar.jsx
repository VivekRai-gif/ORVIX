import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, FlaskConical, Shield, History, Activity } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Recovery Cases', path: '/cases', icon: FileText },
    { label: 'Experiments', path: '/experiments', icon: FlaskConical },
    { label: 'Merchant Policies', path: '/policies', icon: Shield },
    { label: 'Audit Logs', path: '/audit-logs', icon: History }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0F172A]/90 flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
          <Activity className="w-4 h-4" />
          <span>Decision Engine v1.0</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Bounded autonomous recovery orchestration with explainable guardrails.
        </p>
      </div>
    </aside>
  );
}
