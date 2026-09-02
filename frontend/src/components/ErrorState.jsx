import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'Failed to load data', message = 'An error occurred while communicating with the ORVIX backend service.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5">
      <div className="p-3 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-semibold text-[#F5F5F7]">{title}</h4>
        <p className="text-xs text-[#A1A1AA]">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#F5F5F7] border border-[#EF4444]/30 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
