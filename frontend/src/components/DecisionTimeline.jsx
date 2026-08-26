import React from 'react';
import { CheckCircle, AlertCircle, Clock, Cpu, User, ShieldCheck } from 'lucide-react';

export default function DecisionTimeline({ auditLogs = [] }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="text-xs text-slate-400 p-4 rounded-lg bg-slate-900/40 border border-slate-800">
        No decision timeline recorded yet for this case.
      </div>
    );
  }

  const getActorIcon = (actor) => {
    switch (actor) {
      case 'ai_engine':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'merchant':
        return <User className="w-3.5 h-3.5 text-indigo-400" />;
      case 'system':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {auditLogs.map((log, index) => (
        <div key={log._id || index} className="relative flex items-start space-x-3">
          <div className="absolute -left-6 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 border border-slate-700">
            {getActorIcon(log.actor)}
          </div>

          <div className="flex-1 rounded-lg bg-slate-900/60 border border-slate-800 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 capitalize">
                {log.eventType?.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-300">{log.message}</p>
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <pre className="mt-2 p-2 rounded bg-slate-950/80 border border-slate-800/80 font-mono text-[10px] text-slate-400 overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
