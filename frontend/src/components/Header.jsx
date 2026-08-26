import React from 'react';
import { Activity, Shield, Cpu, Database, Zap } from 'lucide-react';

export default function Header({ backendHealth, mlHealth }) {
  return (
    <header className="border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-['Outfit'] font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                ORVIX
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI Revenue Recovery Intelligence & Orchestrator • <span className="text-emerald-400 italic font-normal">"Decide the next best action. Recover more revenue."</span>
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Test Mode */}
          <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 font-bold uppercase tracking-wider">Test Mode</span>
          </div>

          {/* Synthetic Data Badge */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>Synthetic Data</span>
          </div>

          {/* Backend API */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-400">Backend:</span>
            <span className={`font-bold ${backendHealth?.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {backendHealth?.status === 'ok' ? 'OK (5000)' : 'Offline'}
            </span>
          </div>

          {/* ML Engine */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-mono">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">ML Engine:</span>
            <span className={`font-bold ${mlHealth?.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mlHealth?.status === 'ok' ? 'OK (8000)' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
