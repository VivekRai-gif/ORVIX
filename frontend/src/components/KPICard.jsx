import React from 'react';

export default function KPICard({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }) {
  const colorStyles = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
  };

  return (
    <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-5 space-y-3 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorStyles[color] || colorStyles.indigo}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold font-['Outfit'] text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {trend && (
        <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 pt-1">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
