import React from 'react';

export default function KPICard({ title, value, rawValue, subtitle, icon: Icon, trend, color = 'indigo', highlight = false }) {
  const colorStyles = {
    indigo: 'bg-[#2563EB]/12 border-[#2563EB]/25 text-[#60A5FA]',
    emerald: 'bg-[#10B981]/12 border-[#10B981]/25 text-[#10B981]',
    amber: 'bg-[#F59E0B]/12 border-[#F59E0B]/25 text-[#F59E0B]',
    cyan: 'bg-[#60A5FA]/12 border-[#60A5FA]/25 text-[#38BDF8]',
    rose: 'bg-[#EF4444]/12 border-[#EF4444]/25 text-[#EF4444]'
  };

  if (highlight) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-[#171E2E] via-[#1E293B] to-[#1E1B4B] border-2 border-[#60A5FA]/50 p-5 space-y-3 shadow-xl shadow-[#3B82F6]/10 relative overflow-hidden group hover:border-[#60A5FA] transition-all">
        <div className="absolute top-0 right-0 px-3 py-0.5 bg-[#2563EB] text-[#F8FAFC] text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl-lg shadow">
          ★ Primary Value Lift
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#93C5FD]">{title}</span>
          {Icon && (
            <div className="p-2 rounded-lg bg-[#2563EB]/25 border border-[#3B82F6]/40 text-[#60A5FA]">
              <Icon className="w-4 h-4 text-[#60A5FA]" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-extrabold font-['Outfit'] text-[#F8FAFC] tracking-tight bg-gradient-to-r from-[#F8FAFC] to-[#60A5FA] bg-clip-text text-transparent">
            {value}
          </div>
          {rawValue && <div className="text-[11px] font-mono text-[#94A3B8]">{rawValue}</div>}
          {subtitle && <p className="text-xs font-medium text-[#60A5FA]">{subtitle}</p>}
        </div>

        {trend && (
          <div className="flex items-center space-x-1 text-xs font-bold text-[#10B981] pt-0.5">
            <span>{trend}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-5 space-y-3 hover:border-[#334155] hover:bg-[#1E293B] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorStyles[color] || colorStyles.indigo}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold font-['Outfit'] text-[#F8FAFC] tracking-tight">{value}</div>
        {rawValue && <div className="text-[11px] font-mono text-[#64748B]">{rawValue}</div>}
        {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
      </div>

      {trend && (
        <div className="flex items-center space-x-1 text-xs font-semibold text-[#10B981] pt-0.5">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
