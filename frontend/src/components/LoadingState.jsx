import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading ORVIX intelligence data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-xl border border-[#252832] bg-[#111319]">
      <Loader2 className="w-7 h-7 text-[#7C3AED] animate-spin" />
      <p className="text-xs font-medium text-[#A1A1AA]">{message}</p>
    </div>
  );
}
