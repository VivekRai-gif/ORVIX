import React, { useState } from 'react';
import { createRecoveryCase, decideRecoveryCase, executeRecoveryCase, fetchRecoveryCaseById } from '../services/api';
import ActionBadge from './ActionBadge';
import StatusBadge from './StatusBadge';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Zap,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Send
} from 'lucide-react';

export default function LiveSimulationWidget({ onCaseUpdated }) {
  const [amount, setAmount] = useState('12499');
  const [failureReason, setFailureReason] = useState('INSUFFICIENT_FUNDS');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerSegment, setCustomerSegment] = useState('RETURNING');

  const [step, setStep] = useState('IDLE'); // IDLE, PROCESSING, DECIDED, EXECUTED, RECOVERED
  const [activeCase, setActiveCase] = useState(null);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Simulate Payment Failure
  const handleSimulateFailure = async () => {
    setLoading(true);
    setStep('PROCESSING');
    try {
      const rawId = Math.floor(Math.random() * 899999 + 100000);
      const caseData = {
        caseId: `RC_LIVE_${rawId}`,
        paymentId: `pay_live_${rawId}`,
        customerId: `cust_live_${Math.floor(Math.random() * 899 + 100)}`,
        amount: Number(amount) || 12499,
        failureReason,
        paymentMethod,
        customerSegment
      };

      // Create case in backend
      const createRes = await createRecoveryCase(caseData);
      const createdCase = createRes.case || caseData;

      // Run ORVIX Decision Orchestrator
      const decideRes = await decideRecoveryCase(createdCase.caseId, {
        amount: createdCase.amount,
        failureReason: createdCase.failureReason
      });

      setActiveCase(createdCase);
      setDecision(decideRes);
      setStep('DECIDED');

      if (onCaseUpdated) onCaseUpdated();
    } catch (err) {
      alert('Simulation error: ' + err.message);
      setStep('IDLE');
    } finally {
      setLoading(false);
    }
  };

  // 2. Simulate Action Execution
  const handleExecuteAction = async () => {
    if (!activeCase) return;
    setLoading(true);
    try {
      await executeRecoveryCase(activeCase.caseId, {
        action: decision?.selectedAction || 'PAYMENT_LINK'
      });
      setStep('EXECUTED');
      if (onCaseUpdated) onCaseUpdated();
    } catch (err) {
      alert('Execution error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Simulate Customer Completing Payment
  const handleSimulateCustomerPayment = async () => {
    if (!activeCase) return;
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/recovery/cases/${activeCase.caseId}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome: 'RECOVERED',
          metadata: { amount: activeCase.amount, source: 'LIVE_SIMULATOR' }
        })
      });

      setStep('RECOVERED');
      if (onCaseUpdated) onCaseUpdated();
    } catch (err) {
      alert('Outcome error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('IDLE');
    setActiveCase(null);
    setDecision(null);
  };

  return (
    <div className="rounded-2xl bg-[#171E2E] border border-[#1E293B] p-6 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#60A5FA]" />
          <h3 className="text-base font-bold font-['Outfit'] text-[#F8FAFC]">Live Payment Failure & Recovery Simulator</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#3B82F6]/12 border border-[#3B82F6]/25 text-[#60A5FA] font-mono text-[11px] font-bold">
          Interactive Live Mode
        </span>
      </div>

      {step === 'IDLE' && (
        <div className="space-y-4">
          <p className="text-xs text-[#94A3B8] font-mono">
            Test ORVIX in real time: Click below to simulate a failed payment event, watch ORVIX diagnose & rank candidate actions, and simulate customer payment completion.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-[10px] text-[#64748B] uppercase">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#64748B] uppercase">Failure Reason</label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="INSUFFICIENT_FUNDS" className="bg-[#111827]">INSUFFICIENT_FUNDS</option>
                <option value="NETWORK_TIMEOUT" className="bg-[#111827]">NETWORK_TIMEOUT</option>
                <option value="EXPIRED_CARD" className="bg-[#111827]">EXPIRED_CARD</option>
                <option value="STOLEN_CARD" className="bg-[#111827]">STOLEN_CARD (Hard Failure)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#64748B] uppercase">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="upi" className="bg-[#111827]">UPI</option>
                <option value="card" className="bg-[#111827]">Card</option>
                <option value="netbanking" className="bg-[#111827]">Netbanking</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#64748B] uppercase">Segment</label>
              <select
                value={customerSegment}
                onChange={(e) => setCustomerSegment(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="RETURNING" className="bg-[#111827]">RETURNING</option>
                <option value="VIP" className="bg-[#111827]">VIP</option>
                <option value="NEW" className="bg-[#111827]">NEW</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSimulateFailure}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-[#F8FAFC] font-bold text-xs font-mono shadow-lg shadow-[#2563EB]/20 flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>▶ Simulate Payment Failure (₹{Number(amount).toLocaleString('en-IN')})</span>
          </button>
        </div>
      )}

      {step === 'PROCESSING' && (
        <div className="py-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#60A5FA] animate-spin mx-auto" />
          <div className="text-xs font-mono text-[#60A5FA] font-bold">
            ORVIX Engine Running: Diagnosing Failure → Predicting P(R|A) → Calculating ERV → Evaluating Policy...
          </div>
        </div>
      )}

      {(step === 'DECIDED' || step === 'EXECUTED') && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="text-[#EF4444] font-bold flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>Payment Failed: ₹{activeCase.amount?.toLocaleString('en-IN')}</span>
              </span>
              <span className="text-[#64748B]">{activeCase.caseId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase">Diagnosis</span>
                <div className="text-[#60A5FA] font-bold">{decision?.diagnosis?.category || 'SOFT_FAILURE'}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase">Selected Action</span>
                <div><ActionBadge action={decision?.selectedAction || 'PAYMENT_LINK'} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase">Policy Approval</span>
                <div className="text-[#10B981] font-bold">{decision?.policyDecision || 'APPROVED'}</div>
              </div>
            </div>

            {decision?.explanation?.reasoning && (
              <div className="text-[11px] text-[#94A3B8] bg-[#171E2E] p-2.5 rounded border border-[#1E293B]">
                <strong className="text-[#60A5FA]">AI Explanation:</strong> {decision.explanation.reasoning}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {step === 'DECIDED' ? (
              <button
                onClick={handleExecuteAction}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-[#F8FAFC] font-bold text-xs font-mono shadow-lg shadow-[#2563EB]/20 flex items-center justify-center space-x-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Execute '{decision?.selectedAction || 'PAYMENT_LINK'}' via Tool Registry</span>
              </button>
            ) : (
              <button
                onClick={handleSimulateCustomerPayment}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-[#F8FAFC] font-bold text-xs font-mono shadow-lg shadow-[#10B981]/20 flex items-center justify-center space-x-2 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>🎉 Simulate Customer Payment (₹{activeCase.amount?.toLocaleString('en-IN')})</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] text-xs font-mono transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {step === 'RECOVERED' && (
        <div className="p-5 rounded-xl bg-[#10B981]/12 border border-[#10B981]/30 text-center space-y-3 font-mono">
          <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center mx-auto text-[#10B981]">
            <CheckCircle2 className="w-7 h-7 animate-bounce" />
          </div>
          <h4 className="text-base font-bold text-[#10B981]">
            ₹{activeCase.amount?.toLocaleString('en-IN')} RECOVERED SUCCESSFULLY! 🎉
          </h4>
          <p className="text-xs text-[#94A3B8]">
            Action '{decision?.selectedAction || 'PAYMENT_LINK'}' resulted in successful payment recovery. Outcome recorded to Audit Trail & Metrics updated.
          </p>

          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-[#F8FAFC] text-xs font-bold font-sans shadow-md transition-colors"
          >
            Simulate Another Payment
          </button>
        </div>
      )}
    </div>
  );
}
