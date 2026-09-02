import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import ActionBadge from './ActionBadge';
import { ExternalLink } from 'lucide-react';

export default function RecoveryTable({ cases = [] }) {
  if (!cases || cases.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1E293B] bg-[#171E2E]">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#1E293B] bg-[#111827] text-[#64748B] font-semibold uppercase tracking-wider">
            <th className="py-3.5 px-4">Case ID</th>
            <th className="py-3.5 px-4">Customer</th>
            <th className="py-3.5 px-4">Amount (₹)</th>
            <th className="py-3.5 px-4">Failure Category</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Selected Action</th>
            <th className="py-3.5 px-4">Expected Value</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E293B] font-mono">
          {cases.map((c) => (
            <tr key={c.caseId} className="hover:bg-[#1E293B] transition-colors font-sans">
              <td className="py-3 px-4 font-mono font-medium text-[#60A5FA]">
                <Link to={`/cases/${c.caseId}`} className="hover:underline flex items-center space-x-1">
                  <span>{c.caseId}</span>
                </Link>
              </td>
              <td className="py-3 px-4 text-[#94A3B8] font-mono">{c.customerId}</td>
              <td className="py-3 px-4 text-[#F8FAFC] font-bold font-mono">
                ₹{c.amount?.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4">
                <span className="inline-block px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] border border-[#1E293B] font-mono text-[11px] uppercase">
                  {c.failureCategory || 'soft_failure'}
                </span>
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={c.status} />
              </td>
              <td className="py-3 px-4">
                <ActionBadge action={c.selectedAction} />
              </td>
              <td className="py-3 px-4 font-mono text-[#10B981] font-semibold">
                ₹{c.expectedRecoveryValue?.toLocaleString('en-IN') || 0}
              </td>
              <td className="py-3 px-4 text-right">
                <Link
                  to={`/cases/${c.caseId}`}
                  className="inline-flex items-center space-x-1 text-xs text-[#60A5FA] hover:text-[#2563EB] font-medium"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
