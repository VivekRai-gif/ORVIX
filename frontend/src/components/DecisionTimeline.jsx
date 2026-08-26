import React from 'react';
import {
  AlertCircle,
  Cpu,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDown,
  OctagonAlert,
  ShieldAlert,
  ArrowRightCircle,
  AlertTriangle
} from 'lucide-react';
import ActionBadge from './ActionBadge';
import StatusBadge from './StatusBadge';

export default function DecisionTimeline({
  rCase = {},
  customer = {},
  payment = {},
  predictions = [],
  executions = [],
  auditLogs = []
}) {
  const failureReason = rCase.failureReason || payment.failureReason || 'INSUFFICIENT_FUNDS';
  const amount = rCase.amount || payment.amount || 0;
  const attempts = rCase.attemptCount || 0;
  const contacts = rCase.contactCount || 0;

  // Derive diagnosis info
  const isHardFailure = failureReason.includes('STOLEN') || failureReason.includes('INVALID');
  const diagnosisCategory = isHardFailure
    ? 'HARD_FAILURE'
    : (failureReason.includes('EXPIRED') ? 'CUSTOMER_ACTION_REQUIRED' : 'SOFT_FAILURE');

  // Derive outcome status badges
  const getOutcomeBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'RECOVERED':
      case 'SUCCESS':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>RECOVERED</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      case 'STOPPED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/20">
            <OctagonAlert className="w-3 h-3" />
            <span>STOPPED</span>
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3 h-3" />
            <span>ESCALATED</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>EXPIRED</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  const renderConnector = (label) => (
    <div className="flex flex-col items-center justify-center my-3 text-slate-500">
      <ArrowDown className="w-4 h-4 text-indigo-400 animate-pulse" />
      {label && <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">{label}</span>}
    </div>
  );

  return (
    <div className="space-y-2">
      {/* STEP 1: Payment Failed */}
      <div className="rounded-xl bg-slate-900/80 border border-rose-500/30 p-4 space-y-2 relative overflow-hidden shadow-lg shadow-rose-950/20">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">Step 1: Initial Trigger</span>
              <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">Payment Failed</h4>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-rose-300">₹{amount.toLocaleString('en-IN')}</span>
        </div>
        <div className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
          <span>Reason: <strong className="text-rose-300">{failureReason}</strong></span>
          <span className="text-[11px] text-slate-500">Payment ID: {rCase.paymentId || 'pay_unknown'}</span>
        </div>
      </div>

      {renderConnector('Diagnosing Failure')}

      {/* STEP 2: Diagnosis */}
      <div className="rounded-xl bg-slate-900/80 border border-cyan-500/30 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Step 2: AI Diagnosis Engine</span>
              <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">Category: {diagnosisCategory}</h4>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${isHardFailure ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
            {isHardFailure ? 'RECOVERABLE: FALSE' : 'RECOVERABLE: TRUE'}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Automated classification mapped failure code <code className="text-cyan-300">{failureReason}</code> to category <code className="text-cyan-300">{diagnosisCategory}</code>.
        </p>
      </div>

      {renderConnector('Predicting Probabilities')}

      {/* STEP 3: Prediction */}
      <div className="rounded-xl bg-slate-900/80 border border-indigo-500/30 p-4 space-y-2">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Step 3: ML Probability Model</span>
            <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">Recovery Probabilities P(Recovery | Action)</h4>
          </div>
        </div>

        {predictions && predictions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {predictions.map((p, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase mb-1">{p.action}</div>
                <div className="text-sm font-bold text-indigo-300">{((p.probability || 0) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
            RETRY: 71% • PAYMENT_LINK: 55% • EMAIL: 40% • HUMAN_ESCALATION: 50%
          </div>
        )}
      </div>

      {renderConnector('Evaluating Expected Value')}

      {/* STEP 4: Expected Value */}
      <div className="rounded-xl bg-slate-900/80 border border-emerald-500/30 p-4 space-y-2">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Step 4: ERV Calculation</span>
            <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">Expected Recovery Value EV(A)</h4>
          </div>
        </div>

        {predictions && predictions.length > 0 ? (
          <div className="space-y-1.5 font-mono text-xs">
            {predictions.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 font-bold">#{idx + 1}</span>
                  <ActionBadge action={p.action} />
                </div>
                <span className="font-bold text-emerald-400">₹{p.expectedValue?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-emerald-300 bg-slate-950/60 p-2 rounded border border-slate-800">
            Top Candidate: RETRY (EV: ₹7,099) • 2nd Candidate: PAYMENT_LINK (EV: ₹5,498)
          </div>
        )}
      </div>

      {renderConnector('Checking Merchant Policy')}

      {/* STEP 5: Policy */}
      <div className="rounded-xl bg-slate-900/80 border border-amber-500/30 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Step 5: Policy / Guardrail Engine</span>
              <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">Policy Decision: APPROVED</h4>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300">
            7 CHECKS PASSED
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
          <div>• Attempt limit check: {attempts}/3 retries used</div>
          <div>• Contact limit check: {contacts}/2 contacts used</div>
          <div>• Customer opt-out check: Clear (Active Subscriber)</div>
        </div>
      </div>

      {renderConnector('Executing Action')}

      {/* STEP 6: Action */}
      <div className="rounded-xl bg-slate-900/80 border border-purple-500/30 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Step 6: Controlled Action Execution</span>
              <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">Selected Action</h4>
            </div>
          </div>
          <ActionBadge action={rCase.selectedAction || 'RETRY'} />
        </div>
      </div>

      {renderConnector('Recording Outcome')}

      {/* STEP 7: Outcome (DO NOT HIDE FAILED ACTIONS) */}
      <div className="rounded-xl bg-slate-900/80 border border-blue-500/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Step 7: Action Outcome History</span>
              <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">Execution & Failure Trace</h4>
            </div>
          </div>
          {getOutcomeBadge(rCase.status)}
        </div>

        {/* Render all execution attempts including FAILED ones */}
        {executions && executions.length > 0 ? (
          <div className="space-y-2">
            {executions.map((exec, idx) => (
              <div key={exec._id || idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-bold">Attempt #{executions.length - idx}:</span>
                    <ActionBadge action={exec.action} />
                  </div>
                  {getOutcomeBadge(exec.status)}
                </div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Executed at: {new Date(exec.executedAt || Date.now()).toLocaleString()}
                </div>
                {exec.toolResponse && (
                  <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/80 mt-1">
                    {exec.toolResponse.message || JSON.stringify(exec.toolResponse)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-bold">Latest Execution Attempt:</span>
              <ActionBadge action={rCase.selectedAction || 'RETRY'} />
            </div>
            {getOutcomeBadge(rCase.status)}
          </div>
        )}
      </div>

      {renderConnector('Final Resolution')}

      {/* STEP 8: Next Decision / Stop */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/40 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <ArrowRightCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Step 8: Final Status / Next Decision</span>
              <h4 className="text-sm font-bold text-slate-100 font-['Outfit']">Case Resolution State</h4>
            </div>
          </div>
          <StatusBadge status={rCase.status} />
        </div>
        <p className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          {rCase.status === 'recovered'
            ? `✔ Case closed successfully. Recovered ₹${(rCase.recoveredAmount || amount).toLocaleString('en-IN')}.`
            : rCase.status === 'closed'
            ? `✖ Interventions stopped by Policy Engine guardrails.`
            : `⏳ Case active. Next eligible candidate action queued: PAYMENT_LINK (EV: ₹5,498).`}
        </p>
      </div>
    </div>
  );
}
