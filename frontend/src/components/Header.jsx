import React from 'react';
import { Activity, Shield, Cpu } from 'lucide-react';

export default function Header({ backendHealth, mlHealth }) {
  return (
    <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-['Outfit'] font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              ORVIX
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              AI Revenue Recovery Intelligence & Orchestrator
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Backend API:</span>
            <span className={`font-semibold ${backendHealth?.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {backendHealth?.status === 'ok' ? 'Connected (5000)' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">ML Engine:</span>
            <span className={`font-semibold ${mlHealth?.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mlHealth?.status === 'ok' ? 'Connected (8000)' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
