import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'open').toLowerCase();

  const styles = {
    open: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    recovered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    closed: 'bg-slate-800 text-slate-400 border-slate-700',
    escalated: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const label = normalized.replace('_', ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[normalized] || styles.open}`}>
      {label}
    </span>
  );
}
