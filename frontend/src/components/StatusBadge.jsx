import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'open').toLowerCase();

  const styles = {
    open: 'bg-[#3B82F6]/12 text-[#60A5FA] border-[#3B82F6]/25',
    in_progress: 'bg-[#F59E0B]/12 text-[#F59E0B] border-[#F59E0B]/25',
    recovered: 'bg-[#10B981]/12 text-[#10B981] border-[#10B981]/25',
    failed: 'bg-[#EF4444]/12 text-[#EF4444] border-[#EF4444]/25',
    closed: 'bg-[#111827] text-[#64748B] border-[#1E293B]',
    escalated: 'bg-[#2563EB]/12 text-[#60A5FA] border-[#2563EB]/25'
  };

  const label = normalized.replace('_', ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[normalized] || styles.open}`}>
      {label}
    </span>
  );
}
