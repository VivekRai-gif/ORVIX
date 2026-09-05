import React from 'react';
import { Link } from 'react-router-dom';
import { PanelLeft, Sparkles } from 'lucide-react';

export default function Header({ sidebarOpen, onToggleSidebar }) {
  return (
    <header className="border-b border-[#1E293B] bg-[#111827]/95 backdrop-blur sticky top-0 z-50 px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand, Logo Image, Sidebar Toggle & Tagline */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              className="p-2 rounded-lg bg-[#171E2E] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          <Link to="/" className="flex items-center space-x-3 group">
            {/* Zoomed & Cropped Official ORVIX Logo */}
            <div className="h-11 px-2.5 py-1 rounded-xl bg-[#090C14] border border-[#1E293B] flex items-center justify-center shadow-lg group-hover:border-[#3B82F6]/50 transition-all">
              <img src="/logo.png" alt="ORVIX" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30">
                  v1.0
                </span>
                <span className="text-xs font-semibold text-[#10B981] font-mono">
                  Recover More. Lose Less.
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                AI Revenue Recovery Intelligence & Orchestrator
              </p>
            </div>
          </Link>
        </div>

        {/* Compact Right Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Demo Mode / Synthetic Events */}
          <div className="flex items-center space-x-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1 rounded-full text-[#F59E0B] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span>DEMO MODE • Synthetic Events</span>
          </div>

          {/* AI Decision Engine Active */}
          <div className="flex items-center space-x-1.5 bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1 rounded-full text-[#10B981] font-bold">
            <Sparkles className="w-3 h-3 text-[#10B981]" />
            <span>AI Decision Engine ● Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
