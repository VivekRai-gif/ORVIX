import React from 'react';

export default function ActionBadge({ action }) {
  if (!action) {
    return <span className="text-xs text-slate-500 font-mono">--</span>;
  }

  const normalized = action.toLowerCase();

  const styles = {
    intelligent_retry: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    payment_link: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    email_reminder: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    human_escalation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    stop: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const labels = {
    intelligent_retry: 'Intelligent Retry',
    payment_link: 'Payment Link',
    email_reminder: 'Email Reminder',
    human_escalation: 'Human Escalation',
    stop: 'Stop Action'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[normalized] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      {labels[normalized] || action}
    </span>
  );
}
