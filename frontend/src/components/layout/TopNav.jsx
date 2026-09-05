import React from 'react';
import { Search, Calendar, Store, Bell, User, Sparkles } from 'lucide-react';

export default function TopNav({ onOpenSearch, onOpenSimulator }) {
  return (
    <header className="border-b border-[#1E2638] bg-[#0E131F]/90 backdrop-blur sticky top-0 z-40 px-6 py-3 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Global Search Trigger */}
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#161B26] border border-[#1E2638] text-xs font-mono text-[#94A3B8] hover:border-[#3B82F6]/50 hover:text-[#F8FAFC] transition-all shadow-inner"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Search cases, customers, or payment IDs...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#0B0E14] border border-[#1E2638] text-[10px] font-mono text-[#64748B]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Filters, Status Pills, Simulator CTA */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Merchant Selector */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161B26] border border-[#1E2638] text-[#94A3B8]">
            <Store className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span className="text-[#F8FAFC] font-semibold">ORVIX Store</span>
          </div>

          {/* Date Selector */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161B26] border border-[#1E2638] text-[#94A3B8]">
            <Calendar className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span className="text-[#F8FAFC] font-semibold">Rolling 30 Days</span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1.5 rounded-lg text-[#F59E0B] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span>DEMO MODE</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1.5 rounded-lg text-[#10B981] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>AI Active</span>
          </div>

          {/* Simulate Payment Failure CTA */}
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold shadow-lg shadow-[#2563EB]/20 transition-all flex items-center space-x-1.5"
            >
              <span>+ Simulate Failure</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
