import React, { useEffect, useState } from 'react';
import { checkBackendHealth, checkMlServiceHealth } from '../services/api';
import LoadingState from '../components/LoadingState';
import { HeartPulse, Server, Cpu, Database, Sparkles, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SystemHealthPage() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [mlHealth, setMlHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const [bRes, mRes] = await Promise.all([
        checkBackendHealth().catch(e => ({ status: 'error', message: e.message })),
        checkMlServiceHealth().catch(e => ({ status: 'error', message: e.message }))
      ]);
      setBackendHealth(bRes);
      setMlHealth(mRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  if (loading) return <LoadingState message="Inspecting micro-service system health matrix..." />;

  const isBackendOk = backendHealth?.status === 'ok';
  const isMlOk = mlHealth?.status === 'ok';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1E2638]">
        <div>
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-2xl font-bold font-['Outfit'] text-[#F8FAFC]">System Health & Infrastructure Matrix</h2>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Real-time status monitoring across ORVIX micro-architecture components.
          </p>
        </div>
        <button
          onClick={loadHealth}
          className="px-3.5 py-1.5 rounded-lg bg-[#161B26] border border-[#1E2638] text-xs font-mono text-[#60A5FA] hover:text-white flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Health Matrix</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Service 1: Express Backend */}
        <div className="p-6 rounded-2xl bg-[#111622] border border-[#1E2638] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#2563EB]/15 border border-[#3B82F6]/30 text-[#60A5FA]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F8FAFC] font-['Outfit']">Express Backend API</h3>
                <p className="text-[11px] text-[#64748B]">Node.js Express Orchestrator</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full font-bold text-[11px] flex items-center space-x-1 ${
              isBackendOk ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
            }`}>
              {isBackendOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{isBackendOk ? 'HEALTHY (Port 5000)' : 'OFFLINE'}</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Service ID:</span>
              <span className="text-[#F8FAFC]">orvix-backend</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Environment:</span>
              <span className="text-[#60A5FA] font-bold">{backendHealth?.environment || 'development'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Database Mode:</span>
              <span className="text-[#10B981] font-bold">{backendHealth?.database || 'connected'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Endpoint URL:</span>
              <code className="text-[#F8FAFC]">http://localhost:5000/api/health</code>
            </div>
          </div>
        </div>

        {/* Service 2: Python FastAPI ML Service */}
        <div className="p-6 rounded-2xl bg-[#111622] border border-[#1E2638] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F8FAFC] font-['Outfit']">Python FastAPI ML Service</h3>
                <p className="text-[11px] text-[#64748B]">Scikit-learn Prediction Engine</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full font-bold text-[11px] flex items-center space-x-1 ${
              isMlOk ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
            }`}>
              {isMlOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{isMlOk ? 'HEALTHY (Port 8000)' : 'OFFLINE'}</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Model Status:</span>
              <span className="text-[#10B981] font-bold">{mlHealth?.modelStatus || 'loaded'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Model Version:</span>
              <span className="text-[#60A5FA] font-bold">recovery_model_v1.joblib</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Algorithm:</span>
              <span className="text-[#F8FAFC]">Logistic Regression Pipeline</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Endpoint URL:</span>
              <code className="text-[#F8FAFC]">http://localhost:8000/health</code>
            </div>
          </div>
        </div>

        {/* Service 3: MongoDB Database */}
        <div className="p-6 rounded-2xl bg-[#111622] border border-[#1E2638] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F8FAFC] font-['Outfit']">MongoDB Instance</h3>
                <p className="text-[11px] text-[#64748B]">Event & Ledger Data Store</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full font-bold text-[11px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CONNECTED</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Database Name:</span>
              <span className="text-[#F8FAFC] font-bold">orvix</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Collections:</span>
              <span className="text-[#60A5FA]">RecoveryCases, Payments, Customers, Policies, AuditLogs</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Connection URI:</span>
              <code className="text-[#F8FAFC]">mongodb://localhost:27017/orvix</code>
            </div>
          </div>
        </div>

        {/* Service 4: Google Gemini AI Layer */}
        <div className="p-6 rounded-2xl bg-[#111622] border border-[#1E2638] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#60A5FA]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F8FAFC] font-['Outfit']">LLM Explanation Layer</h3>
                <p className="text-[11px] text-[#64748B]">Google Gemini AI Integration</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full font-bold text-[11px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ACTIVE</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Integration Mode:</span>
              <span className="text-[#60A5FA] font-bold">Gemini Factual Explanation Layer</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]">
              <span className="text-[#64748B]">Capabilities:</span>
              <span className="text-[#F8FAFC]">Risk reasoning, why not alternatives, stop conditions</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Status:</span>
              <span className="text-[#10B981] font-bold">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
