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
import { ArrowLeft, User, Cpu, Layers, Play, OctagonAlert, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function CaseDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

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
      const res = await executeRecoveryCase(id, { action: data?.case?.selectedAction || 'intelligent_retry' });
      setMsg(`Action executed successfully! Status updated to '${res.case?.status}'.`);
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

  const { case: rCase, customer, payment, predictions, executions, auditLogs } = data;

  return (
    <div className="space-y-6">
      {/* Back Link & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/cases" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recovery Cases</span>
        </Link>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExecute}
            disabled={actionLoading || rCase.status === 'recovered' || rCase.status === 'closed'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Execute Action</span>
          </button>

          <button
            onClick={handleStop}
            disabled={actionLoading || rCase.status === 'closed'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-40 transition-colors"
          >
            <OctagonAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stop Interventions</span>
          </button>

          <button
            onClick={handleEscalate}
            disabled={actionLoading || rCase.status === 'escalated'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-semibold disabled:opacity-40 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Escalate Case</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* Case Overview Banner */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-xs font-mono text-indigo-400 font-semibold">{rCase.caseId}</span>
              <StatusBadge status={rCase.status} />
              <ActionBadge action={rCase.selectedAction} />
            </div>
            <h2 className="text-2xl font-bold font-['Outfit'] text-white">
              Revenue at Risk: ₹{rCase.amount?.toLocaleString('en-IN')}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Payment ID: {rCase.paymentId} • Customer ID: {rCase.customerId}
            </p>
          </div>

          <div className="flex items-center space-x-6 text-right font-mono text-xs">
            <div>
              <div className="text-slate-500 uppercase">Expected Value</div>
              <div className="text-lg font-bold text-emerald-400">₹{rCase.expectedRecoveryValue?.toLocaleString('en-IN') || 0}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase">Attempts</div>
              <div className="text-lg font-bold text-slate-200">{rCase.attemptCount || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer Profile Card */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Customer Profile</span>
            </div>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Segment:</span>
                <span className="text-slate-200 font-semibold uppercase">{customer?.segment || 'consumer'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Successful Payments:</span>
                <span className="text-emerald-400">{customer?.previousSuccessfulPayments || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Failed Payments:</span>
                <span className="text-rose-400">{customer?.previousFailedPayments || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Historical Recovery Rate:</span>
                <span className="text-cyan-400 font-bold">{((customer?.historicalRecoveryRate || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI Predictions */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>AI Candidate Predictions & Expected Values</span>
              </div>
            </div>

            {predictions && predictions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-2 px-3">Candidate Action</th>
                      <th className="py-2 px-3">Probability P(R|A)</th>
                      <th className="py-2 px-3 text-right">Expected Value EV(A)</th>
                      <th className="py-2 px-3 text-right">Select</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {predictions.map((p, idx) => (
                      <tr key={idx} className={rCase.selectedAction === p.action ? 'bg-indigo-950/30' : ''}>
                        <td className="py-2.5 px-3">
                          <ActionBadge action={p.action} />
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">
                          {((p.probability || 0) * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          ₹{p.expectedValue?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDecide(p.action)}
                            disabled={actionLoading || rCase.selectedAction === p.action}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-sans text-indigo-300 disabled:opacity-40"
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
              <p className="text-xs text-slate-400">No predictions recorded yet for this case.</p>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Audit Log & Orchestration Timeline</span>
            </div>
            <DecisionTimeline auditLogs={auditLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}
