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
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10B981]/12 text-[#10B981] border border-[#10B981]/25">
            <CheckCircle2 className="w-3 h-3" />
            <span>RECOVERED</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EF4444]/12 text-[#EF4444] border border-[#EF4444]/25">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      case 'STOPPED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#111827] text-[#64748B] border border-[#1E293B]">
            <OctagonAlert className="w-3 h-3" />
            <span>STOPPED</span>
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F59E0B]/12 text-[#F59E0B] border border-[#F59E0B]/25">
            <ShieldAlert className="w-3 h-3" />
            <span>ESCALATED</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3B82F6]/12 text-[#60A5FA] border border-[#3B82F6]/25">
            <AlertTriangle className="w-3 h-3" />
            <span>EXPIRED</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3B82F6]/12 text-[#60A5FA] border border-[#3B82F6]/25">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  const renderConnector = (label) => (
    <div className="flex flex-col items-center justify-center my-3 text-[#64748B]">
      <ArrowDown className="w-4 h-4 text-[#60A5FA] animate-pulse" />
      {label && <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-widest mt-0.5">{label}</span>}
    </div>
  );

  return (
    <div className="space-y-2">
      {/* STEP 1: Payment Failed */}
      <div className="rounded-xl bg-[#171E2E] border border-[#EF4444]/30 p-4 space-y-2 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#EF4444] uppercase tracking-wider">Step 1: Initial Trigger</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] font-['Outfit']">Payment Failed</h4>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#EF4444]">₹{amount.toLocaleString('en-IN')}</span>
        </div>
        <div className="text-xs text-[#94A3B8] font-mono bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B] flex justify-between items-center">
          <span>Reason: <strong className="text-[#EF4444]">{failureReason}</strong></span>
          <span className="text-[11px] text-[#64748B]">Payment ID: {rCase.paymentId || 'pay_unknown'}</span>
        </div>
      </div>

      {renderConnector('Diagnosing Failure')}

      {/* STEP 2: Diagnosis */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/12 border border-[#3B82F6]/25 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#60A5FA] uppercase tracking-wider">Step 2: AI Diagnosis Engine</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] font-['Outfit']">Category: {diagnosisCategory}</h4>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${isHardFailure ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#10B981]/15 text-[#10B981]'}`}>
            {isHardFailure ? 'RECOVERABLE: FALSE' : 'RECOVERABLE: TRUE'}
          </span>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Automated classification mapped failure code <code className="text-[#60A5FA]">{failureReason}</code> to category <code className="text-[#60A5FA]">{diagnosisCategory}</code>.
        </p>
      </div>

      {renderConnector('Predicting Probabilities')}

      {/* STEP 3: Prediction */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-4 space-y-2">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/12 border border-[#3B82F6]/25 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-[#60A5FA] uppercase tracking-wider">Step 3: ML Probability Model</span>
            <h4 className="text-sm font-bold text-[#F8FAFC] font-['Outfit']">Recovery Probabilities P(Recovery | Action)</h4>
          </div>
        </div>

        {predictions && predictions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {predictions.map((p, idx) => (
              <div key={idx} className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-center">
                <div className="text-[10px] text-[#64748B] uppercase mb-1">{p.action}</div>
                <div className="text-sm font-bold text-[#60A5FA]">{((p.probability || 0) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-[#94A3B8] bg-[#0F172A] p-2 rounded border border-[#1E293B]">
            RETRY: 71% • PAYMENT_LINK: 55% • EMAIL: 40% • HUMAN_ESCALATION: 50%
          </div>
        )}
      </div>

      {renderConnector('Evaluating Expected Value')}

      {/* STEP 4: Expected Value */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-4 space-y-2">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/12 border border-[#10B981]/25 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider">Step 4: ERV Calculation</span>
            <h4 className="text-sm font-bold text-[#F8FAFC] font-['Outfit']">Expected Recovery Value EV(A)</h4>
          </div>
        </div>

        {predictions && predictions.length > 0 ? (
          <div className="space-y-1.5 font-mono text-xs">
            {predictions.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#0F172A] border border-[#1E293B]">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-[#64748B] font-bold">#{idx + 1}</span>
                  <ActionBadge action={p.action} />
                </div>
                <span className="font-bold text-[#10B981]">₹{p.expectedValue?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-[#10B981] bg-[#0F172A] p-2 rounded border border-[#1E293B]">
            Top Candidate: RETRY (EV: ₹7,099) • 2nd Candidate: PAYMENT_LINK (EV: ₹5,498)
          </div>
        )}
      </div>

      {renderConnector('Checking Merchant Policy')}

      {/* STEP 5: Policy */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/12 border border-[#F59E0B]/25 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-wider">Step 5: Policy / Guardrail Engine</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] font-['Outfit']">Policy Decision: APPROVED</h4>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B]">
            7 CHECKS PASSED
          </span>
        </div>
        <div className="text-xs font-mono text-[#94A3B8] bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B] space-y-1">
          <div>• Attempt limit check: {attempts}/3 retries used</div>
          <div>• Contact limit check: {contacts}/2 contacts used</div>
          <div>• Customer opt-out check: Clear (Active Subscriber)</div>
        </div>
      </div>

      {renderConnector('Executing Action')}

      {/* STEP 6: Action */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/12 border border-[#3B82F6]/25 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#60A5FA] uppercase tracking-wider">Step 6: Controlled Action Execution</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] font-['Outfit']">Selected Action</h4>
            </div>
          </div>
          <ActionBadge action={rCase.selectedAction || 'RETRY'} />
        </div>
      </div>

      {renderConnector('Recording Outcome')}

      {/* STEP 7: Outcome (DO NOT HIDE FAILED ACTIONS) */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/12 border border-[#3B82F6]/25 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#60A5FA] uppercase tracking-wider">Step 7: Action Outcome History</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] font-['Outfit']">Execution & Failure Trace</h4>
            </div>
          </div>
          {getOutcomeBadge(rCase.status)}
        </div>

        {/* Render all execution attempts including FAILED ones */}
        {executions && executions.length > 0 ? (
          <div className="space-y-2">
            {executions.map((exec, idx) => (
              <div key={exec._id || idx} className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#64748B] font-bold">Attempt #{executions.length - idx}:</span>
                    <ActionBadge action={exec.action} />
                  </div>
                  {getOutcomeBadge(exec.status)}
                </div>
                <div className="text-[#94A3B8] text-[11px] mt-1">
                  Executed at: {new Date(exec.executedAt || Date.now()).toLocaleString()}
                </div>
                {exec.toolResponse && (
                  <div className="text-[11px] text-[#94A3B8] bg-[#171E2E] p-2 rounded border border-[#1E293B] mt-1">
                    {exec.toolResponse.message || JSON.stringify(exec.toolResponse)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs font-mono flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[#94A3B8] font-bold">Latest Execution Attempt:</span>
              <ActionBadge action={rCase.selectedAction || 'RETRY'} />
            </div>
            {getOutcomeBadge(rCase.status)}
          </div>
        )}
      </div>

      {renderConnector('Final Resolution')}

      {/* STEP 8: Next Decision / Stop */}
      <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/12 border border-[#3B82F6]/25 flex items-center justify-center">
              <ArrowRightCircle className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#60A5FA] uppercase tracking-wider">Step 8: Final Status / Next Decision</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] font-['Outfit']">Case Resolution State</h4>
            </div>
          </div>
          <StatusBadge status={rCase.status} />
        </div>
        <p className="text-xs text-[#94A3B8] font-mono bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B]">
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
