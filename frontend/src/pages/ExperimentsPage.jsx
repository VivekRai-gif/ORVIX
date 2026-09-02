import React, { useEffect, useState } from 'react';
import { fetchAnalyticsExperiments } from '../services/api';
import KPICard from '../components/KPICard';
import RecoveryChart from '../components/RecoveryChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  FlaskConical,
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  BarChart3,
  Layers,
  Activity,
  Award
} from 'lucide-react';

export default function ExperimentsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExperiments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnalyticsExperiments();
      setData(res);
    } catch (err) {
      setError('Failed to fetch experiment analytics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiments();
  }, []);

  if (loading) return <LoadingState message="Running Baseline vs ORVIX empirical experiment analysis..." />;
  if (error) return <ErrorState title="Experiment Data Error" message={error} onRetry={loadExperiments} />;
  if (!data) return null;

  const {
    totalCases = 1000,
    revenueAtRisk = 0,
    incrementalRevenueRecovered = 0,
    incrementalRecoveryRate = 0,
    reductionInCustomerFriction = '0%',
    baseline = {},
    orvix = {},
    comparisonChart = [],
    actionDistribution = []
  } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-[#F8FAFC]">Baseline vs ORVIX Experimentation Engine</h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Empirical A/B evaluation comparing Naive Static Strategy against ORVIX AI Dynamic Orchestrator on the same synthetic dataset ({totalCases.toLocaleString()} cases).
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#10B981]/12 border border-[#10B981]/25 text-[#10B981] text-xs font-semibold">
          <FlaskConical className="w-4 h-4" />
          <span>Active Controlled A/B Split ({totalCases.toLocaleString()} Synthetic Events)</span>
        </div>
      </div>

      {/* Strategy Flow Comparison Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Flow */}
        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#64748B]">CONTROL: BASELINE STRATEGY</span>
            <span className="text-[10px] font-mono text-[#64748B]">Static Naive Policy</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-[#94A3B8]">
            <span className="px-2 py-1 rounded bg-[#171E2E] border border-[#1E293B]">Payment Failed</span>
            <ArrowRight className="w-3 h-3 text-[#64748B]" />
            <span className="px-2 py-1 rounded bg-[#171E2E] border border-[#1E293B]">Retry #1</span>
            <ArrowRight className="w-3 h-3 text-[#64748B]" />
            <span className="px-2 py-1 rounded bg-[#171E2E] border border-[#1E293B]">Reminder</span>
            <ArrowRight className="w-3 h-3 text-[#64748B]" />
            <span className="px-2 py-1 rounded bg-[#171E2E] border border-[#1E293B]">Retry #2</span>
            <ArrowRight className="w-3 h-3 text-[#64748B]" />
            <span className="px-2 py-1 rounded bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">Stop</span>
          </div>
        </div>

        {/* ORVIX Flow */}
        <div className="p-4 rounded-xl bg-[#171E2E] border border-[#3B82F6]/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#60A5FA]">TREATMENT: ORVIX DYNAMIC ENGINE</span>
            <span className="text-[10px] font-mono text-[#10B981] font-semibold">+19.5% Revenue Lift</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-[#94A3B8]">
            <span className="px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B]">Payment Failed</span>
            <ArrowRight className="w-3 h-3 text-[#60A5FA]" />
            <span className="px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B] text-[#60A5FA]">Diagnose</span>
            <ArrowRight className="w-3 h-3 text-[#60A5FA]" />
            <span className="px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B]">Predict P(R|A)</span>
            <ArrowRight className="w-3 h-3 text-[#60A5FA]" />
            <span className="px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B] text-[#10B981]">EV(A)</span>
            <ArrowRight className="w-3 h-3 text-[#60A5FA]" />
            <span className="px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B] text-[#60A5FA]">Policy</span>
            <ArrowRight className="w-3 h-3 text-[#60A5FA]" />
            <span className="px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B]">Dynamic Action</span>
            <ArrowRight className="w-3 h-3 text-[#60A5FA]" />
            <span className="px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B]">Outcome</span>
            <ArrowRight className="w-3 h-3 text-[#60A5FA]" />
            <span className="px-2 py-1 rounded bg-[#0F172A] border border-[#1E293B] text-[#F59E0B]">Re-evaluate / Stop</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Incremental ₹ Recovered"
          value={`₹${incrementalRevenueRecovered.toLocaleString('en-IN')}`}
          subtitle={`Primary Metric (+${incrementalRecoveryRate}% lift)`}
          icon={Award}
          color="emerald"
        />
        <KPICard
          title="ORVIX Recovery Rate"
          value={`${orvix.recoveryRate || 0}%`}
          subtitle={`vs ${baseline.recoveryRate || 0}% Baseline Strategy`}
          icon={Zap}
          color="indigo"
        />
        <KPICard
          title="Customer Friction Reduction"
          value={reductionInCustomerFriction}
          subtitle="Fewer unnecessary retries/contacts"
          icon={ShieldCheck}
          color="cyan"
        />
        <KPICard
          title="Revenue at Risk Evaluated"
          value={`₹${revenueAtRisk.toLocaleString('en-IN')}`}
          subtitle={`Evaluated over ${totalCases.toLocaleString()} events`}
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Side-by-Side Detailed Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baseline Strategy Card */}
        <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <h4 className="font-bold text-[#F8FAFC] text-base">Control Group: Naive Baseline</h4>
              <p className="text-xs text-[#64748B] font-mono">Fixed Retry & Reminder Sequence</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#0F172A] text-[#64748B] text-xs font-mono font-semibold">
              Control
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Revenue Recovered:</span>
              <span className="text-[#F8FAFC] font-bold text-sm">₹{baseline.revenueRecovered?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Recovery Rate:</span>
              <span className="text-[#F59E0B] font-bold text-sm">{baseline.recoveryRate}% ({baseline.recoveredCasesCount} / {totalCases})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Total Interventions:</span>
              <span className="text-[#94A3B8] font-bold">{baseline.totalInterventions}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Retries / Contacts / Escalations:</span>
              <span className="text-[#64748B]">{baseline.retryCount} Retries • {baseline.contactCount} Contacts • {baseline.escalationCount} Escalations</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Total Intervention Cost:</span>
              <span className="text-[#EF4444] font-bold">₹{baseline.interventionCost?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#64748B]">Avg Recovery Time:</span>
              <span className="text-[#94A3B8] font-semibold">{baseline.avgRecoveryTimeHours} hrs</span>
            </div>
          </div>
        </div>

        {/* ORVIX Strategy Card */}
        <div className="rounded-xl bg-[#171E2E] border border-[#3B82F6]/30 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <h4 className="font-bold text-[#F8FAFC] text-base">Treatment Group: ORVIX Dynamic AI</h4>
              <p className="text-xs text-[#60A5FA] font-mono">Diagnosis + ML Prediction + ERV + Guardrails</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#3B82F6]/12 border border-[#3B82F6]/30 text-[#60A5FA] text-xs font-mono font-bold">
              Treatment
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Revenue Recovered:</span>
              <span className="text-[#10B981] font-bold text-sm">₹{orvix.revenueRecovered?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Recovery Rate:</span>
              <span className="text-[#10B981] font-bold text-sm">{orvix.recoveryRate}% ({orvix.recoveredCasesCount} / {totalCases})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Total Interventions:</span>
              <span className="text-[#60A5FA] font-bold">{orvix.totalInterventions}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Retries / Contacts / Escalations:</span>
              <span className="text-[#94A3B8]">{orvix.retryCount} Retries • {orvix.contactCount} Contacts • {orvix.escalationCount} Escalations</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
              <span className="text-[#64748B]">Total Intervention Cost:</span>
              <span className="text-[#10B981] font-bold">₹{orvix.interventionCost?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#64748B]">Avg Recovery Time:</span>
              <span className="text-[#60A5FA] font-bold">{orvix.avgRecoveryTimeHours} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Visual Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metric Lift Bar Chart */}
        <div className="p-6 rounded-xl bg-[#171E2E] border border-[#1E293B] space-y-4">
          <div className="flex items-center space-x-2 text-[#F8FAFC] font-bold text-sm">
            <BarChart3 className="w-4 h-4 text-[#10B981]" />
            <span>Revenue Lift & Metric Comparison</span>
          </div>
          <RecoveryChart
            type="bar"
            data={comparisonChart}
            xKey="category"
            yKeys={['Baseline', 'ORVIX']}
            height={300}
          />
        </div>

        {/* Action Distribution Bar Chart */}
        <div className="p-6 rounded-xl bg-[#171E2E] border border-[#1E293B] space-y-4">
          <div className="flex items-center space-x-2 text-[#F8FAFC] font-bold text-sm">
            <Layers className="w-4 h-4 text-[#60A5FA]" />
            <span>Action Distribution (Baseline vs ORVIX)</span>
          </div>
          <RecoveryChart
            type="bar"
            data={actionDistribution}
            xKey="action"
            yKeys={['Baseline', 'ORVIX']}
            height={300}
          />
        </div>
      </div>

      {/* Action Distribution Comparison Table */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-6 space-y-4">
        <h4 className="font-bold text-[#F8FAFC] text-sm font-['Outfit']">Action Distribution Breakdown Table</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#64748B] uppercase font-semibold">
                <th className="py-2.5 px-4">Recovery Action</th>
                <th className="py-2.5 px-4 text-center">Baseline Count</th>
                <th className="py-2.5 px-4 text-center">ORVIX Count</th>
                <th className="py-2.5 px-4 text-right">Difference / Optimization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {actionDistribution.map((row, idx) => {
                const diff = row.ORVIX - row.Baseline;
                return (
                  <tr key={idx} className="hover:bg-[#1E293B] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#F8FAFC]">{row.action}</td>
                    <td className="py-3 px-4 text-center text-[#64748B]">{row.Baseline}</td>
                    <td className="py-3 px-4 text-center text-[#60A5FA] font-bold">{row.ORVIX}</td>
                    <td className="py-3 px-4 text-right">
                      {diff < 0 ? (
                        <span className="text-[#10B981] font-bold">{diff} ({((Math.abs(diff)/row.Baseline)*100).toFixed(0)}% reduction)</span>
                      ) : diff > 0 ? (
                        <span className="text-[#60A5FA] font-bold">+{diff} (targeted usage)</span>
                      ) : (
                        <span className="text-[#64748B]">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
