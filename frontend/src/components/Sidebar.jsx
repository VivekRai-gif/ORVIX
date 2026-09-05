import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, FileText, FlaskConical, Shield, History, Activity, PanelLeftClose, ChevronLeft } from 'lucide-react';

export default function Sidebar({ isOpen = true, onClose }) {
  const navItems = [
    { label: 'Home Page', path: '/', icon: Home, exact: true },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Recovery Cases', path: '/cases', icon: FileText },
    { label: 'Experiments', path: '/experiments', icon: FlaskConical },
    { label: 'Merchant Policies', path: '/policies', icon: Shield },
    { label: 'Audit Logs', path: '/audit-logs', icon: History }
  ];

  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-[#1E293B] bg-[#111827] flex flex-col justify-between p-4 min-h-[calc(100vh-65px)] transition-all duration-300 shrink-0">
      <div className="space-y-6">
        {/* Header & Close Button */}
        <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          <span>Main Navigation</span>
          {onClose && (
            <button
              onClick={onClose}
              title="Close Sidebar"
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#3B82F6]/12 text-[#60A5FA] border border-[#3B82F6]/30 font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-xl bg-[#171E2E] border border-[#1E293B] space-y-2 text-xs">
        <div className="p-2 rounded-xl bg-[#090C14] border border-[#1E293B] mb-2 flex justify-center shadow-inner">
          <img src="/logo.png" alt="ORVIX" className="h-9 w-auto object-contain" />
        </div>
        <div className="flex items-center space-x-2 text-[#60A5FA] font-semibold">
          <Activity className="w-4 h-4" />
          <span>Decision Engine v1.0</span>
        </div>
        <p className="text-[11px] text-[#64748B] leading-relaxed">
          Bounded autonomous recovery orchestration with explainable guardrails.
        </p>
      </div>
    </aside>
  );
}
