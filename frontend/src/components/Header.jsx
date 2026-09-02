import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Cpu, Database, Zap, PanelLeft, Menu } from 'lucide-react';

export default function Header({ backendHealth, mlHealth, sidebarOpen, onToggleSidebar }) {
  return (
    <header className="border-b border-[#1E293B] bg-[#111827]/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand, Sidebar Toggle & Tagline */}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-lg shadow-[#2563EB]/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-[#F8FAFC]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-['Outfit'] font-bold text-xl tracking-tight bg-gradient-to-r from-[#F8FAFC] via-[#94A3B8] to-[#60A5FA] bg-clip-text text-transparent">
                  ORVIX
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3B82F6]/12 text-[#60A5FA] border border-[#3B82F6]/25">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-medium">
                AI Revenue Recovery Intelligence & Orchestrator • <span className="text-[#10B981] italic font-normal">"Decide the next best action. Recover more revenue."</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Test Mode */}
          <div className="flex items-center space-x-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-2.5 py-1 rounded-md text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span className="text-[#F59E0B] font-bold uppercase tracking-wider">Test Mode</span>
          </div>

          {/* Synthetic Data Badge */}
          <div className="flex items-center space-x-1.5 bg-[#171E2E] border border-[#1E293B] px-2.5 py-1 rounded-md text-[11px] font-mono text-[#94A3B8]">
            <Database className="w-3 h-3 text-[#60A5FA]" />
            <span>Synthetic Data</span>
          </div>

          {/* Backend API */}
          <div className="flex items-center space-x-1.5 bg-[#171E2E] border border-[#1E293B] px-2.5 py-1 rounded-md text-[11px] font-mono">
            <Shield className="w-3 h-3 text-[#60A5FA]" />
            <span className="text-[#64748B]">Backend:</span>
            <span className={`font-bold ${backendHealth?.status === 'ok' ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
              {backendHealth?.status === 'ok' ? 'OK (5000)' : 'Offline'}
            </span>
          </div>

          {/* ML Engine */}
          <div className="flex items-center space-x-1.5 bg-[#171E2E] border border-[#1E293B] px-2.5 py-1 rounded-md text-[11px] font-mono">
            <Cpu className="w-3 h-3 text-[#60A5FA]" />
            <span className="text-[#64748B]">ML Engine:</span>
            <span className={`font-bold ${mlHealth?.status === 'ok' ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
              {mlHealth?.status === 'ok' ? 'OK (8000)' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
