import React from 'react';
import { Database } from 'lucide-react';

export default function EmptyState({ title = 'No Records Found', message = 'No data currently matches your request or search criteria.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
      <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400">
        <Database className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
