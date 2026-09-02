import React from 'react';

export default function KPICard({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }) {
  const colorStyles = {
    indigo: 'bg-[#2563EB]/12 border-[#2563EB]/25 text-[#60A5FA]',
    emerald: 'bg-[#10B981]/12 border-[#10B981]/25 text-[#10B981]',
    amber: 'bg-[#F59E0B]/12 border-[#F59E0B]/25 text-[#F59E0B]',
    cyan: 'bg-[#60A5FA]/12 border-[#60A5FA]/25 text-[#60A5FA]',
    rose: 'bg-[#EF4444]/12 border-[#EF4444]/25 text-[#EF4444]'
  };

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
        {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
      </div>

      {trend && (
        <div className="flex items-center space-x-1 text-xs font-semibold text-[#10B981] pt-1">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
