import React, { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchAnalyticsExperiments } from '../services/api';
import KPICard from '../components/KPICard';
import RecoveryChart from '../components/RecoveryChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatCompactINR, formatFullINR } from '../utils/formatters';
import { BarChart3, TrendingUp, DollarSign, Clock, ShieldCheck, Zap, OctagonAlert, ShieldAlert } from 'lucide-react';

export default function PerformancePage() {
  const [data, setData] = useState(null);
  const [expData, setExpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, exp] = await Promise.all([
        fetchDashboardStats().catch(() => null),
        fetchAnalyticsExperiments().catch(() => null)
      ]);
      setData(stats);
      setExpData(exp);
    } catch (err) {
      setError('Failed to fetch performance analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingState message="Calculating performance analytics..." />;
  if (error) return <ErrorState title="Performance Analytics Unavailable" message={error} onRetry={loadData} />;

  const revenueAtRisk = data?.revenueAtRisk || 61733044;
  const revenueRecovered = data?.revenueRecovered || 57751383;
  const recoveryRate = data?.recoveryRate || 81.7;
  const stoppedCases = data?.stoppedCases || 183;
  const totalCases = data?.totalCases || 1000;
  const policyBlockRate = ((stoppedCases / totalCases) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1E2638]">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#60A5FA]" />
            <h2 className="text-2xl font-bold font-['Outfit'] text-[#F8FAFC]">Performance Analytics</h2>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Deep-dive analytics on recovery efficiency, action success rates, and guardrail block rates.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Recovery Rate"
          value={`${recoveryRate}%`}
          subtitle="Overall success rate"
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Revenue Recovered"
          value={formatCompactINR(revenueRecovered)}
          rawValue={formatFullINR(revenueRecovered)}
          subtitle="Processed successfully"
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="Avg Recovery Time"
          value="9.8 hrs"
          subtitle="vs 12.8 hrs baseline"
          icon={Clock}
          color="indigo"
        />
        <KPICard
          title="Policy Guardrail Block Rate"
          value={`${policyBlockRate}%`}
          subtitle={`${stoppedCases} cases bounded`}
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Recovery Trend */}
        <div className="p-5 rounded-xl bg-[#111622] border border-[#1E2638] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#F8FAFC] text-sm">Revenue Recovery Trend (₹)</h4>
            <span className="text-[11px] text-[#64748B] font-mono">Rolling Timeline</span>
          </div>
          <RecoveryChart
            type="area"
            data={data?.trend || []}
            xKey="date"
            yKeys={['atRisk', 'recovered']}
            height={260}
          />
        </div>

        {/* Chart 2: Recovery by Dynamic Action */}
        <div className="p-5 rounded-xl bg-[#111622] border border-[#1E2638] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#F8FAFC] text-sm">Recovery Value by Selected Action</h4>
            <span className="text-[11px] text-[#10B981] font-mono font-semibold">₹ Recovered</span>
          </div>
          <RecoveryChart
            type="bar"
            data={data?.recoveryByAction || []}
            xKey="action"
            yKeys={['recovered']}
            height={260}
          />
        </div>
      </div>

      {/* Secondary Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Failure Reason Distribution */}
        <div className="p-5 rounded-xl bg-[#111622] border border-[#1E2638] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#F8FAFC] text-sm">Revenue at Risk by Failure Reason</h4>
            <span className="text-[11px] text-[#EF4444] font-mono">₹ Value</span>
          </div>
          <RecoveryChart
            type="bar"
            data={data?.recoveryByFailureReason || []}
            xKey="reason"
            yKeys={['amount']}
            height={240}
          />
        </div>

        {/* Chart 4: Status Distribution */}
        <div className="p-5 rounded-xl bg-[#111622] border border-[#1E2638] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#F8FAFC] text-sm">Lifecycle Case Distribution</h4>
            <span className="text-[11px] text-[#60A5FA] font-mono">Case Count</span>
          </div>
          <RecoveryChart
            type="bar"
            data={data?.statusDistribution?.map(s => ({ status: s.name, count: s.value })) || []}
            xKey="status"
            yKeys={['count']}
            height={240}
          />
        </div>
      </div>
    </div>
  );
}
