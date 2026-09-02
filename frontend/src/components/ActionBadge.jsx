import React from 'react';

export default function ActionBadge({ action }) {
  if (!action) {
    return <span className="text-xs text-[#71717A] font-mono">--</span>;
  }

  const normalized = action.toLowerCase();

  const styles = {
    intelligent_retry: 'bg-[#2563EB]/12 text-[#60A5FA] border-[#2563EB]/30',
    payment_link: 'bg-[#3B82F6]/12 text-[#60A5FA] border-[#3B82F6]/30',
    email_reminder: 'bg-[#1E293B] text-[#94A3B8] border-[#334155]',
    human_escalation: 'bg-[#F59E0B]/12 text-[#F59E0B] border-[#F59E0B]/25',
    stop: 'bg-[#111827] text-[#64748B] border-[#1E293B]'
  };

  const labels = {
    intelligent_retry: 'Intelligent Retry',
    payment_link: 'Payment Link',
    email_reminder: 'Email Reminder',
    human_escalation: 'Human Escalation',
    stop: 'Stop Action'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[normalized] || 'bg-[#171E2E] text-[#94A3B8] border-[#1E293B]'}`}>
      {labels[normalized] || action}
    </span>
  );
}
