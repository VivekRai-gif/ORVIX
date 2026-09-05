import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchRecoveryCaseById,
  decideRecoveryCase,
  executeRecoveryCase,
  stopRecoveryCase,
  escalateRecoveryCase
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ActionBadge from '../components/ActionBadge';
import DecisionTimeline from '../components/DecisionTimeline';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import CelebrationPopup from '../components/CelebrationPopup';
import {
  ArrowLeft,
  User,
  Cpu,
  Layers,
  Play,
  OctagonAlert,
  ShieldAlert,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HelpCircle,
  FileText,
  DollarSign,
  AlertOctagon
} from 'lucide-react';

export default function CaseDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecoveryCaseById(id);
      setData(res);
    } catch (err) {
      setError(`Failed to load details for recovery case '${id}'`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleDecide = async (action) => {
    setActionLoading(true);
    try {
      await decideRecoveryCase(id, { action, reason: 'Manual operator selection' });
      setMsg(`Action '${action}' selected successfully.`);
      await loadDetails();
    } catch (err) {
      alert('Failed to select action: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecute = async () => {
    setActionLoading(true);
    try {
      const res = await executeRecoveryCase(id, { action: data?.case?.selectedAction || 'RETRY' });
      setMsg(`Action executed successfully! Outcome status updated to '${res.case?.status}'.`);
      setShowCelebration(true); // 🎉 Trigger Party Popper Confetti + Balloons Celebration Popup!
      await loadDetails();
    } catch (err) {
      alert('Failed to execute action: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    try {
      await stopRecoveryCase(id, { reason: 'Stopped manually from dashboard UI' });
      setMsg('Case recovery interventions stopped.');
      await loadDetails();
    } catch (err) {
      alert('Failed to stop case: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    setActionLoading(true);
    try {
      await escalateRecoveryCase(id, { reason: 'Escalated manually from dashboard UI' });
      setMsg('Case escalated to human review queue.');
      await loadDetails();
    } catch (err) {
      alert('Failed to escalate case: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message={`Loading recovery intelligence trace for case '${id}'...`} />;
  if (error) return <ErrorState title="Case Not Found" message={error} onRetry={loadDetails} />;
  if (!data || !data.case) return <ErrorState title="Case Data Error" message="Case record not returned." />;

  const { case: rCase, customer = {}, payment = {}, predictions = [], executions = [], auditLogs = [], explanation } = data;

  const failureReason = rCase.failureReason || payment.failureReason || 'INSUFFICIENT_FUNDS';
  const amount = rCase.amount || payment.amount || 0;

  return (
    <div className="space-y-6">
      {/* Celebration Popup (Confetti Party Popper + Floating Balloons) */}
      <CelebrationPopup
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        amount={amount}
        action={rCase.selectedAction || 'RETRY'}
        caseId={rCase.caseId}
      />

      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/cases" className="inline-flex items-center space-x-2 text-xs font-semibold text-[#94A3B8] hover:text-[#60A5FA] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recovery Cases</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badges */}
          <span className="px-2.5 py-1 rounded bg-[#3B82F6]/12 border border-[#3B82F6]/25 text-[#60A5FA] text-xs font-mono font-bold">
            AI Decision
          </span>
          <span className="px-2.5 py-1 rounded bg-[#10B981]/12 border border-[#10B981]/25 text-[#10B981] text-xs font-mono font-bold">
            Policy Approved
          </span>

          <button
            onClick={handleExecute}
            disabled={actionLoading || rCase.status === 'recovered' || rCase.status === 'closed'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-[#F8FAFC] text-xs font-semibold shadow-lg shadow-[#10B981]/20 disabled:opacity-40 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Execute Action</span>
          </button>

          <button
            onClick={handleStop}
            disabled={actionLoading || rCase.status === 'closed'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] text-xs font-semibold border border-[#334155] disabled:opacity-40 transition-colors"
          >
            <OctagonAlert className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Stop Interventions</span>
          </button>

          <button
            onClick={handleEscalate}
            disabled={actionLoading || rCase.status === 'escalated'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 text-xs font-semibold disabled:opacity-40 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Escalate Case</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-[#3B82F6]/12 border border-[#3B82F6]/25 text-[#60A5FA] text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#60A5FA]" />
          <span>{msg}</span>
        </div>
      )}

      {/* 1. REVENUE AT RISK HERO BANNER */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-xs font-mono text-[#60A5FA] font-bold">{rCase.caseId}</span>
              <StatusBadge status={rCase.status} />
              <ActionBadge action={rCase.selectedAction} />
            </div>
            <h2 className="text-3xl font-bold font-['Outfit'] text-[#F8FAFC]">
              Revenue at Risk: ₹{amount.toLocaleString('en-IN')}
            </h2>
            <p className="text-xs text-[#94A3B8] font-mono mt-1">
              Payment ID: <code className="text-[#F8FAFC]">{rCase.paymentId}</code> • Failure Reason: <code className="text-[#EF4444]">{failureReason}</code>
            </p>
          </div>

          <div className="flex items-center space-x-6 text-right font-mono text-xs">
            <div>
              <div className="text-[#64748B] uppercase">Max Expected Value</div>
              <div className="text-xl font-bold text-[#10B981]">₹{rCase.expectedRecoveryValue?.toLocaleString('en-IN') || 0}</div>
            </div>
            <div>
              <div className="text-[#64748B] uppercase">Retries Used</div>
              <div className="text-xl font-bold text-[#F8FAFC]">{rCase.attemptCount || 0} / 3</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Context & AI Explanation */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer Profile */}
          <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-5 space-y-3">
            <div className="flex items-center space-x-2 text-[#F8FAFC] font-bold text-sm">
              <User className="w-4 h-4 text-[#60A5FA]" />
              <span>Customer Context Profile</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#64748B]">Customer ID:</span>
                <span className="text-[#F8FAFC] font-semibold">{customer?.customerId || rCase.customerId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#64748B]">Segment:</span>
                <span className="text-[#F8FAFC] uppercase">{customer?.segment || 'consumer'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#64748B]">Successful Payments:</span>
                <span className="text-[#10B981] font-bold">{customer?.previousSuccessfulPayments || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E293B]">
                <span className="text-[#64748B]">Failed Payments:</span>
                <span className="text-[#EF4444] font-bold">{customer?.previousFailedPayments || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Historical Recovery Rate:</span>
                <span className="text-[#60A5FA] font-bold">{((customer?.historicalRecoveryRate || 0.65) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* AI Factual Explanation Layer */}
          <div className="rounded-xl bg-[#171E2E] border border-[#3B82F6]/30 p-5 space-y-3">
            <div className="flex items-center space-x-2 text-[#60A5FA] font-bold text-sm">
              <FileText className="w-4 h-4 text-[#60A5FA]" />
              <span>AI Decision Explanation</span>
            </div>

            {explanation ? (
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-[#64748B] font-bold uppercase">Summary</div>
                  <p className="text-[#94A3B8] font-sans mt-0.5">{explanation.summary}</p>
                </div>
                <div>
                  <div className="text-[10px] text-[#60A5FA] font-bold uppercase">Selection Reasoning</div>
                  <p className="text-[#94A3B8] font-sans mt-0.5">{explanation.reasoning}</p>
                </div>
                <div>
                  <div className="text-[10px] text-[#EF4444] font-bold uppercase">Risk Assessment</div>
                  <p className="text-[#94A3B8] font-sans mt-0.5">{explanation.risk}</p>
                </div>
                <div>
                  <div className="text-[10px] text-[#F59E0B] font-bold uppercase">Why Not Alternatives</div>
                  <p className="text-[#94A3B8] font-sans mt-0.5">{explanation.whyNotAlternatives}</p>
                </div>
                <div>
                  <div className="text-[10px] text-[#60A5FA] font-bold uppercase">Stop Condition</div>
                  <p className="text-[#94A3B8] font-sans mt-0.5">{explanation.stopCondition}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] font-mono">Explanation generated automatically upon decision evaluation.</p>
            )}
          </div>
        </div>

        {/* Right Column: AI Candidate Predictions & Visual Decision Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Candidate Predictions & Expected Values */}
          <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#F8FAFC] font-bold text-sm">
                <Cpu className="w-4 h-4 text-[#8B5CF6]" />
                <span>Google Gemini AI Action Evaluation & Handler Assignments</span>
              </div>
              <span className="text-[11px] font-mono text-[#10B981]">Formula: ERV = P(R|A) × Amount − Cost</span>
            </div>

            {predictions && predictions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-[#64748B] uppercase font-semibold">
                      <th className="py-2.5 px-3">Candidate Action</th>
                      <th className="py-2.5 px-3">Assigned Handler</th>
                      <th className="py-2.5 px-3 text-center">Probability P(R|A)</th>
                      <th className="py-2.5 px-3 text-right">Expected Value (ERV)</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {predictions.map((p, idx) => (
                      <tr key={idx} className={rCase.selectedAction === p.action ? 'bg-[#3B82F6]/10 border-l-2 border-[#3B82F6]' : ''}>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[#64748B] font-bold text-[10px]">#{idx + 1}</span>
                              <ActionBadge action={p.action} />
                            </div>
                            {p.reason && (
                              <p className="text-[11px] text-[#94A3B8] font-sans leading-tight mt-1">
                                {p.reason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="text-[#8B5CF6] font-bold block">{p.assignedTo || 'Automated Tool Dispatcher'}</span>
                            <span className="text-[10px] text-[#71717A] font-sans block">{p.assigneeWhy || 'Assigned by Gemini AI based on context'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-[#60A5FA] font-bold text-sm">
                          {((p.probability || 0) * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#10B981] text-sm">
                          ₹{p.expectedValue?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDecide(p.action)}
                            disabled={actionLoading || rCase.selectedAction === p.action}
                            className="px-3 py-1.5 rounded bg-[#2563EB] hover:bg-[#3B82F6] text-white text-[11px] font-sans font-semibold disabled:opacity-40 transition-colors"
                          >
                            {rCase.selectedAction === p.action ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">No candidate predictions available.</p>
            )}
          </div>

          {/* Full 8-Step Visual Decision Timeline */}
          <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center space-x-2 text-[#F8FAFC] font-bold text-sm">
                <Layers className="w-4 h-4 text-[#10B981]" />
                <span>Complete Decision Timeline & Execution Trace</span>
              </div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Do Not Hide Failed Actions</span>
            </div>

            <DecisionTimeline
              rCase={rCase}
              customer={customer}
              payment={payment}
              predictions={predictions}
              executions={executions}
              auditLogs={auditLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
