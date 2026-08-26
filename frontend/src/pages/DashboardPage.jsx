import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../services/api';
import KPICard from '../components/KPICard';
import RecoveryChart from '../components/RecoveryChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { DollarSign, CheckCircle2, TrendingUp, AlertOctagon, Layers, Clock, OctagonAlert, ShieldAlert } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await fetchDashboardStats();
      setData(stats);
    } catch (err) {
      setError('Could not connect to ORVIX backend API. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <LoadingState message="Fetching real-time revenue recovery metrics..." />;
  if (error) return <ErrorState title="Dashboard Unavailable" message={error} onRetry={loadDashboard} />;
  if (!data || data.totalCases === 0) {
    return (
      <EmptyState
        title="No Recovery Data Available"
        message="Please run the database seed command (npm run simulator:seed) to generate synthetic revenue recovery events."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-white">Revenue Recovery Dashboard</h2>
          <p className="text-xs text-slate-400">
            Real-time AI revenue risk detection, recovery optimization, and baseline experimentation metrics.
          </p>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenue at Risk"
          value={`₹${data.revenueAtRisk?.toLocaleString('en-IN') || 0}`}
          subtitle="Total failed transactions"
          icon={DollarSign}
          color="rose"
        />
        <KPICard
          title="Revenue Recovered"
          value={`₹${data.revenueRecovered?.toLocaleString('en-IN') || 0}`}
          subtitle="Successfully processed"
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="Recovery Rate"
          value={`${data.recoveryRate || 0}%`}
          subtitle="Successful cases ratio"
          icon={TrendingUp}
          color="indigo"
        />
        <KPICard
          title="Incremental ₹ Recovered"
          value={`₹${data.incrementalRevenue?.toLocaleString('en-IN') || 0}`}
          subtitle="Value over baseline retry"
          icon={TrendingUp}
          color="cyan"
        />
        <KPICard
          title="Total Cases"
          value={data.totalCases || 0}
          subtitle="Total ingested events"
          icon={Layers}
          color="indigo"
        />
        <KPICard
          title="Active Cases"
          value={data.activeCases || 0}
          subtitle="Currently evaluating/retrying"
          icon={Clock}
          color="amber"
        />
        <KPICard
          title="Stopped Cases"
          value={data.stoppedCases || 0}
          subtitle="Bounded policy stops"
          icon={OctagonAlert}
          color="cyan"
        />
        <KPICard
          title="Escalated Cases"
          value={data.escalatedCases || 0}
          subtitle="Human intervention queue"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Recovery Trend */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-200 text-sm">1. Revenue Recovery Trend</h4>
            <span className="text-[11px] text-slate-500 font-mono">5-Day Rolling</span>
          </div>
          <RecoveryChart
            type="area"
            data={data.trend}
            xKey="date"
            yKeys={['atRisk', 'recovered']}
            height={260}
          />
        </div>

        {/* Chart 2: Baseline vs ORVIX Performance */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-200 text-sm">2. Baseline vs ORVIX AI Layer</h4>
            <span className="text-[11px] text-emerald-400 font-semibold">+32% Incremental Lift</span>
          </div>
          <RecoveryChart
            type="bar"
            data={data.baselineVsOrvix}
            xKey="metric"
            yKeys={['Baseline', 'ORVIX']}
            height={260}
          />
        </div>

        {/* Chart 3: Recovery by Selected Action */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-200 text-sm">3. Recovery by Action</h4>
            <span className="text-[11px] text-slate-500">₹ Recovered</span>
          </div>
          <RecoveryChart
            type="bar"
            data={data.recoveryByAction}
            xKey="action"
            yKeys={['recovered']}
            height={260}
          />
        </div>

        {/* Chart 4: Case Status Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-200 text-sm">4. Case Status Breakdown</h4>
            <span className="text-[11px] text-slate-500">Distribution</span>
          </div>
          <RecoveryChart
            type="pie"
            data={data.statusDistribution}
            xKey="name"
            yKeys={['value']}
            height={260}
          />
        </div>
      </div>
    </div>
  );
}
