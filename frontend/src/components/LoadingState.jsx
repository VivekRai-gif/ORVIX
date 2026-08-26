import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading ORVIX intelligence data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-xl border border-slate-800 bg-slate-900/40">
      <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
      <p className="text-xs font-medium text-slate-400">{message}</p>
    </div>
  );
}
