import React from 'react';
import { Database } from 'lucide-react';

export default function EmptyState({ title = 'No Records Found', message = 'No data currently matches your request or search criteria.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 rounded-xl border border-dashed border-[#252832] bg-[#111319]/50">
      <div className="p-3 rounded-full bg-[#0D0F14] border border-[#252832] text-[#71717A]">
        <Database className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[#F5F5F7]">{title}</h4>
        <p className="text-xs text-[#A1A1AA] max-w-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
