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
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-6 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold font-['Outfit'] text-white">Live Payment Failure & Recovery Simulator</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold">
          Interactive Live Mode
        </span>
      </div>

      {step === 'IDLE' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 font-mono">
            Test ORVIX in real time: Click below to simulate a failed payment event, watch ORVIX diagnose & rank candidate actions, and simulate customer payment completion.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-[10px] text-slate-400 uppercase">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase">Failure Reason</label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
                <option value="NETWORK_TIMEOUT">NETWORK_TIMEOUT</option>
                <option value="EXPIRED_CARD">EXPIRED_CARD</option>
                <option value="STOLEN_CARD">STOLEN_CARD (Hard Failure)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Netbanking</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase">Segment</label>
              <select
                value={customerSegment}
                onChange={(e) => setCustomerSegment(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="RETURNING">RETURNING</option>
                <option value="VIP">VIP</option>
                <option value="NEW">NEW</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSimulateFailure}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-rose-950/40 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>▶ Simulate Payment Failure (₹{Number(amount).toLocaleString('en-IN')})</span>
          </button>
        </div>
      )}

      {step === 'PROCESSING' && (
        <div className="py-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <div className="text-xs font-mono text-indigo-300 font-bold">
            ORVIX Engine Running: Diagnosing Failure → Predicting P(R|A) → Calculating ERV → Evaluating Policy...
          </div>
        </div>
      )}

      {(step === 'DECIDED' || step === 'EXECUTED') && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-rose-400 font-bold flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>Payment Failed: ₹{activeCase.amount?.toLocaleString('en-IN')}</span>
              </span>
              <span className="text-slate-400">{activeCase.caseId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Diagnosis</span>
                <div className="text-cyan-300 font-bold">{decision?.diagnosis?.category || 'SOFT_FAILURE'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Selected Action</span>
                <div><ActionBadge action={decision?.selectedAction || 'PAYMENT_LINK'} /></div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Policy Approval</span>
                <div className="text-emerald-400 font-bold">{decision?.policyDecision || 'APPROVED'}</div>
              </div>
            </div>

            {decision?.explanation?.reasoning && (
              <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-indigo-400">AI Explanation:</strong> {decision.explanation.reasoning}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {step === 'DECIDED' ? (
              <button
                onClick={handleExecuteAction}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Execute '{decision?.selectedAction || 'PAYMENT_LINK'}' via Tool Registry</span>
              </button>
            ) : (
              <button
                onClick={handleSimulateCustomerPayment}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>🎉 Simulate Customer Payment (₹{activeCase.amount?.toLocaleString('en-IN')})</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {step === 'RECOVERED' && (
        <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3 font-mono">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-7 h-7 animate-bounce" />
          </div>
          <h4 className="text-base font-bold text-emerald-300">
            ₹{activeCase.amount?.toLocaleString('en-IN')} RECOVERED SUCCESSFULLY! 🎉
          </h4>
          <p className="text-xs text-slate-300">
            Action '{decision?.selectedAction || 'PAYMENT_LINK'}' resulted in successful payment recovery. Outcome recorded to Audit Trail & Metrics updated.
          </p>

          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-sans shadow-md"
          >
            Simulate Another Payment
          </button>
        </div>
      )}
    </div>
  );
}
