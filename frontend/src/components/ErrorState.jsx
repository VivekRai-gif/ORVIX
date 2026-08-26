import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'Failed to load data', message = 'An error occurred while communicating with the ORVIX backend service.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-xl border border-rose-500/20 bg-rose-950/10">
      <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-semibold text-rose-200">{title}</h4>
        <p className="text-xs text-rose-300/70">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
