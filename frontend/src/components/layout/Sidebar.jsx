import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  FlaskConical,
  Shield,
  History,
  Activity,
  HeartPulse,
  ChevronLeft
} from 'lucide-react';

export default function Sidebar({ isOpen = true, onClose }) {
  const groups = [
    {
      group: 'WORKSPACE',
      items: [
        { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Recovery Cases', path: '/cases', icon: FileText },
        { label: 'Customers', path: '/customers', icon: Users }
      ]
    },
    {
      group: 'ANALYTICS',
      items: [
        { label: 'Performance', path: '/performance', icon: BarChart3 },
        { label: 'Experiments', path: '/experiments', icon: FlaskConical }
      ]
    },
    {
      group: 'CONTROL',
      items: [
        { label: 'Merchant Policies', path: '/policies', icon: Shield },
        { label: 'Audit Logs', path: '/audit-logs', icon: History }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { label: 'System Health', path: '/system-health', icon: HeartPulse }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-[#1E2638] bg-[#0E131F] flex flex-col justify-between p-4 min-h-screen shrink-0 transition-all duration-300">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[#1E2638]">
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="h-9 px-2 py-1 rounded-xl bg-[#090C14] border border-[#1E2638] flex items-center justify-center shadow">
              <img src="/logo.png" alt="ORVIX" className="h-6 w-auto object-contain" />
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30">
              v1.0
            </span>
          </NavLink>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161B26]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grouped Nav Items */}
        <nav className="space-y-5">
          {groups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                {grp.group}
              </div>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                          isActive
                            ? 'bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30 font-bold shadow-sm shadow-[#3B82F6]/10'
                            : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161B26]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info Card */}
      <div className="p-3 rounded-xl bg-[#161B26] border border-[#1E2638] space-y-1.5 text-xs font-mono">
        <div className="flex items-center space-x-2 text-[#60A5FA] font-bold text-[11px]">
          <Activity className="w-3.5 h-3.5" />
          <span>Decision Engine v1.0</span>
        </div>
        <p className="text-[10px] text-[#64748B] leading-tight">
          Bounded autonomous recovery orchestration with explainable guardrails.
        </p>
      </div>
    </aside>
  );
}
