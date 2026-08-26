import React, { useEffect, useState } from 'react';
import { fetchExperimentStats } from '../services/api';
import KPICard from '../components/KPICard';
import RecoveryChart from '../components/RecoveryChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { FlaskConical, TrendingUp, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function ExperimentsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExperiments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExperimentStats();
      setData(res);
    } catch (err) {
      setError('Failed to fetch experiment statistics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  if (loading) return <LoadingState message="Calculating baseline vs ORVIX experiment metrics..." />;
  if (error) return <ErrorState title="Experiment Data Error" message={error} onRetry={loadExperiments} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-white">Baseline vs ORVIX Experimentation</h2>
          <p className="text-xs text-slate-400">
            Measuring true incremental revenue recovery by comparing ORVIX AI decision engine against baseline naive retry strategies.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Active Experiment: Controlled A/B Split</span>
        </div>
      </div>

      {/* Primary Experiment KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Incremental ₹ Recovered"
          value={`₹${data.incrementalRevenue?.toLocaleString('en-IN') || 0}`}
          subtitle="Net value created above baseline"
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="ORVIX Recovery Rate"
          value={`${data.orvix?.recoveryRate || 0}%`}
          subtitle={`vs ${data.baseline?.recoveryRate || 0}% Baseline strategy`}
          icon={Zap}
          color="indigo"
        />
        <KPICard
          title="Friction Reduction"
          value={data.reductionInCustomerFriction || '72%'}
          subtitle="Fewer unnecessary retries/messages"
          icon={ShieldCheck}
          color="cyan"
        />
      </div>

      {/* Side by Side Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Card */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-slate-300 text-base">Control Group: Naive Baseline</h4>
            <span className="text-xs text-slate-500 font-mono">Traditional Strategy</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-500">Recovery Rate:</span>
              <span className="text-amber-400 font-bold">{data.baseline?.recoveryRate}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-500">Total Recovered:</span>
              <span className="text-slate-200">₹{data.baseline?.totalRecovered?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Avg Cost / Recovery:</span>
              <span className="text-rose-400">₹{data.baseline?.avgCostPerRecovery || 450}</span>
            </div>
          </div>
        </div>

        {/* ORVIX Card */}
        <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/30 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <h4 className="font-bold text-white text-base">Treatment Group: ORVIX AI</h4>
            <span className="text-xs text-indigo-400 font-mono font-semibold">AI Orchestrator</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-indigo-500/10">
              <span className="text-slate-400">Recovery Rate:</span>
              <span className="text-emerald-400 font-bold">{data.orvix?.recoveryRate}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-indigo-500/10">
              <span className="text-slate-400">Total Recovered:</span>
              <span className="text-white font-bold">₹{data.orvix?.totalRecovered?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Avg Cost / Recovery:</span>
              <span className="text-emerald-400 font-bold">₹{data.orvix?.avgCostPerRecovery || 120}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Visual Bar Chart */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h4 className="font-bold text-slate-200 text-sm">Incremental Lift & Metric Comparison</h4>
        <RecoveryChart
          type="bar"
          data={data.comparisonChart}
          xKey="category"
          yKeys={['Baseline', 'ORVIX']}
          height={300}
        />
      </div>
    </div>
  );
}
