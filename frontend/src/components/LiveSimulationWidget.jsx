import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createRecoveryCase, decideRecoveryCase, executeRecoveryCase } from '../services/api';
import ActionBadge from './ActionBadge';
import StatusBadge from './StatusBadge';
import CelebrationPopup from './CelebrationPopup';
import { formatCompactINR, formatFullINR } from '../utils/formatters';
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
  Send,
  Check,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  Layers,
  OctagonAlert,
  ShieldAlert
} from 'lucide-react';

export default function LiveSimulationWidget({ onCaseUpdated }) {
  const [amount, setAmount] = useState('12499');
  const [failureReason, setFailureReason] = useState('INSUFFICIENT_FUNDS');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerSegment, setCustomerSegment] = useState('RETURNING');

  const [step, setStep] = useState('IDLE'); // IDLE, PROCESSING, DECIDED, EXECUTED, RECOVERED
  const [activeStepIndex, setActiveStepIndex] = useState(0); // 0 to 7 pipeline steps
  const [activeCase, setActiveCase] = useState(null);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timestamps, setTimestamps] = useState({});

  const containerRef = useRef(null);

  // 8-step decision pipeline as specified in requirements
  const pipelineSteps = [
    { key: 'FAILED', label: '1. PAYMENT FAILED', desc: 'Captured payment failure & metadata' },
    { key: 'RISK', label: '2. RISK DETECTED', desc: 'Identified revenue at risk' },
    { key: 'DIAGNOSIS', label: '3. AI DIAGNOSIS', desc: 'Classified failure category & confidence' },
    { key: 'PREDICTION', label: '4. RECOVERY PREDICTION', desc: 'Estimated recovery probabilities P(R|A)' },
    { key: 'ERV', label: '5. EXPECTED VALUE', desc: 'Calculated ERV = P(R|A) × Amount − Cost' },
    { key: 'POLICY', label: '6. POLICY CHECK', desc: 'Verified 7 merchant policy guardrails' },
    { key: 'ACTION', label: '7. NEXT BEST ACTION', desc: 'Selected optimal recovery action' },
    { key: 'OUTCOME', label: '8. RECOVERY OUTCOME', desc: 'Executed action & updated ledger' }
  ];

  const handleSimulateFailure = async () => {
    setLoading(true);
    setStep('PROCESSING');
    setActiveStepIndex(0);

    const now = new Date();
    const timeFormat = (offsetSec = 0) => {
      const t = new Date(now.getTime() + offsetSec * 1000);
      return t.toTimeString().split(' ')[0];
    };

    setTimestamps({
      failed: timeFormat(0),
      risk: timeFormat(1),
      diagnosis: timeFormat(1),
      prediction: timeFormat(2),
      erv: timeFormat(2),
      policy: timeFormat(3),
      action: timeFormat(3)
    });

    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

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

      // Animate step 0 -> 1 -> 2
      setActiveStepIndex(0);
      const createRes = await createRecoveryCase(caseData);
      const createdCase = createRes.case || caseData;
      await new Promise(r => setTimeout(r, 300));

      setActiveStepIndex(1);
      await new Promise(r => setTimeout(r, 300));

      setActiveStepIndex(2);
      await new Promise(r => setTimeout(r, 300));

      // Animate step 3 -> 4 -> 5
      setActiveStepIndex(3);
      await new Promise(r => setTimeout(r, 300));

      setActiveStepIndex(4);
      const decideRes = await decideRecoveryCase(createdCase.caseId, {
        amount: createdCase.amount,
        failureReason: createdCase.failureReason
      });
      await new Promise(r => setTimeout(r, 300));

      setActiveStepIndex(5);
      await new Promise(r => setTimeout(r, 300));

      setActiveStepIndex(6);
      await new Promise(r => setTimeout(r, 200));

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

  const handleExecuteAction = async () => {
    if (!activeCase) return;
    setLoading(true);
    try {
      await executeRecoveryCase(activeCase.caseId, {
        action: decision?.selectedAction || 'RETRY'
      });
      setStep('EXECUTED');
      setActiveStepIndex(7);
      window.dispatchEvent(new CustomEvent('orvix_case_updated'));
      if (onCaseUpdated) onCaseUpdated();
    } catch (err) {
      alert('Execution error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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

      const now = new Date();
      setTimestamps(prev => ({ ...prev, outcome: now.toTimeString().split(' ')[0] }));
      setStep('RECOVERED');
      setShowCelebration(true);
      window.dispatchEvent(new CustomEvent('orvix_case_updated'));
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
    setActiveStepIndex(0);
    setShowCelebration(false);
  };

  const selectedAction = decision?.selectedAction || 'RETRY';
  const recPrediction = decision?.actions?.find(a => a.action === selectedAction) || decision?.actions?.[0];

  return (
    <div ref={containerRef} className="rounded-2xl bg-[#171E2E] border border-[#1E293B] p-6 space-y-6 shadow-xl relative">
      {/* Celebration Popup */}
      <CelebrationPopup
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        amount={activeCase?.amount || amount}
        action={selectedAction}
        caseId={activeCase?.caseId || 'case_live'}
        onSimulateAnother={handleReset}
      />

      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#60A5FA]" />
            <h3 className="text-lg font-bold font-['Outfit'] text-[#F8FAFC]">Live Recovery Simulator</h3>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Simulate a payment failure and watch ORVIX diagnose, decide, act, and measure recovery in real time.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-[#3B82F6]/12 border border-[#3B82F6]/25 text-[#60A5FA] font-mono text-xs font-bold">
            Interactive AI Sandbox
          </span>
        </div>
      </div>

      {/* IDLE STATE: SIMULATOR INPUT CONTROLS */}
      {step === 'IDLE' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-[10px] text-[#64748B] uppercase font-bold">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#64748B] uppercase font-bold">Failure Reason</label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="INSUFFICIENT_FUNDS" className="bg-[#111827]">INSUFFICIENT_FUNDS (Soft Failure)</option>
                <option value="NETWORK_TIMEOUT" className="bg-[#111827]">NETWORK_TIMEOUT (Temporary)</option>
                <option value="EXPIRED_CARD" className="bg-[#111827]">EXPIRED_CARD (Customer Action)</option>
                <option value="STOLEN_CARD" className="bg-[#111827]">STOLEN_CARD (Hard Failure)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#64748B] uppercase font-bold">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="upi" className="bg-[#111827]">UPI</option>
                <option value="card" className="bg-[#111827]">Card</option>
                <option value="netbanking" className="bg-[#111827]">Netbanking</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#64748B] uppercase font-bold">Customer Segment</label>
              <select
                value={customerSegment}
                onChange={(e) => setCustomerSegment(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="RETURNING" className="bg-[#111827]">RETURNING</option>
                <option value="VIP" className="bg-[#111827]">VIP</option>
                <option value="NEW" className="bg-[#111827]">NEW</option>
                <option value="PRICE_SENSITIVE" className="bg-[#111827]">PRICE_SENSITIVE</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSimulateFailure}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#2563EB] hover:brightness-110 text-white font-bold text-xs font-mono shadow-xl shadow-[#2563EB]/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Simulate Payment Failure ({formatFullINR(Number(amount))})</span>
          </button>
        </div>
      )}

      {/* STEP 7: AI DECISION FLOW PIPELINE STEPPER */}
      {step === 'PROCESSING' && (
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#60A5FA] font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-[#60A5FA]" />
            <span>ORVIX Live AI Recovery Decision Pipeline Running...</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            {pipelineSteps.map((s, idx) => {
              const isDone = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#F8FAFC]'
                      : isCurrent
                      ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-[#F8FAFC] shadow-lg shadow-[#3B82F6]/10 animate-pulse'
                      : 'bg-[#0F172A] border-[#1E293B] text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-bold text-[11px]">
                    <span className={isDone ? 'text-[#10B981]' : isCurrent ? 'text-[#60A5FA]' : 'text-[#64748B]'}>
                      {s.label}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#60A5FA] animate-spin" />
                    ) : null}
                  </div>
                  <p className="text-[10px] text-[#94A3B8] leading-tight">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DECIDED OR EXECUTED STATE */}
      {(step === 'DECIDED' || step === 'EXECUTED') && (
        <div className="space-y-6">
          {/* Top Decision Summary */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="text-[#EF4444] font-bold flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>Payment Failed: {formatFullINR(activeCase?.amount)}</span>
              </span>
              <span className="text-[#64748B]">{activeCase?.caseId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Category</span>
                <div className="text-[#60A5FA] font-bold mt-0.5">{decision?.diagnosis?.category || 'SOFT_FAILURE'}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Selected Action</span>
                <div className="mt-0.5"><ActionBadge action={selectedAction} /></div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Policy Check</span>
                <div className="text-[#10B981] font-bold mt-0.5">{decision?.policyDecision || 'APPROVED'}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Recommended ERV</span>
                <div className="text-[#10B981] font-bold mt-0.5">
                  {formatFullINR(recPrediction?.expectedValue || Math.round(activeCase?.amount * 0.7))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 8. AI DIAGNOSIS CARD */}
            <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <div className="flex items-center space-x-2 text-[#60A5FA] font-bold text-xs font-mono">
                  <Zap className="w-4 h-4 text-[#60A5FA]" />
                  <span>AI DIAGNOSIS CARD</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#10B981]/12 text-[#10B981] font-mono text-[10px] font-bold">
                  {decision?.diagnosis?.recoverable ? 'Recoverable' : 'Hard Failure'}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#1E293B]">
                  <span className="text-[#64748B]">Failure Code:</span>
                  <span className="text-[#EF4444] font-bold">{failureReason}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E293B]">
                  <span className="text-[#64748B]">Classification:</span>
                  <span className="text-[#F8FAFC] font-semibold">{decision?.diagnosis?.category || 'SOFT_FAILURE'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E293B]">
                  <span className="text-[#64748B]">Confidence Score:</span>
                  <span className="text-[#60A5FA] font-bold">{Math.round((decision?.diagnosis?.confidence || 0.94) * 100)}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Recovery Potential:</span>
                  <span className="text-[#10B981] font-bold">High</span>
                </div>
              </div>
            </div>

            {/* 10. WHY ORVIX CHOSE THIS */}
            <div className="p-5 rounded-xl bg-[#0F172A] border border-[#3B82F6]/30 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <div className="flex items-center space-x-2 text-[#F8FAFC] font-bold text-xs font-mono">
                  <FileText className="w-4 h-4 text-[#60A5FA]" />
                  <span>WHY ORVIX CHOSE {selectedAction}</span>
                </div>
                <span className="text-[10px] font-mono text-[#60A5FA]">Confidence: 91%</span>
              </div>

              <ul className="space-y-1.5 text-xs text-[#94A3B8] font-sans">
                <li className="flex items-start space-x-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>Failure type <strong>{failureReason}</strong> is classified as recoverable soft failure.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>Customer segment <strong>{customerSegment}</strong> has high historical recovery probability.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>Action <strong>{selectedAction}</strong> is fully allowed by merchant policy guardrails.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>Yields highest Expected Recovery Value ({formatFullINR(recPrediction?.expectedValue || Math.round(activeCase?.amount * 0.7))}).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 9. RECOVERY ACTION RANKING */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="text-[#F8FAFC] font-bold uppercase tracking-wider">RECOVERY OPTIONS & ERV RANKING</span>
              <span className="text-[11px] text-[#10B981]">Formula: ERV = P(R|A) × Amount − Cost</span>
            </div>

            <div className="space-y-2">
              {decision?.actions?.map((item, idx) => {
                const isSelected = item.action === selectedAction;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-[#F8FAFC]'
                        : 'bg-[#171E2E] border-[#1E293B] text-[#94A3B8]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ActionBadge action={item.action} />
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold">
                          ✓ RECOMMENDED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <span className="text-[10px] text-[#64748B] block">PROBABILITY</span>
                        <span className="text-sm font-bold text-[#60A5FA]">{Math.round(item.probability * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block">EXPECTED VALUE (ERV)</span>
                        <span className="text-sm font-bold text-[#10B981]">{formatFullINR(item.expectedValue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Execution Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {step === 'DECIDED' ? (
              <button
                onClick={handleExecuteAction}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-[#F8FAFC] font-bold text-xs font-mono shadow-lg shadow-[#2563EB]/20 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                <span>Execute '{selectedAction}' Action</span>
              </button>
            ) : (
              <button
                onClick={handleSimulateCustomerPayment}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981] hover:brightness-110 text-white font-bold text-xs font-mono shadow-xl shadow-[#10B981]/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>🎉 Simulate Customer Payment ({formatFullINR(activeCase?.amount)})</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-5 py-3.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] text-xs font-mono transition-colors"
            >
              Reset Simulator
            </button>
          </div>
        </div>
      )}

      {/* 12. SUCCESS STATE CARD */}
      {step === 'RECOVERED' && (
        <div className="p-6 rounded-2xl bg-[#10B981]/12 border-2 border-[#10B981]/40 text-center space-y-5 font-mono shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center mx-auto text-[#10B981]">
            <CheckCircle2 className="w-9 h-9 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">✓ PAYMENT RECOVERED</span>
            <h4 className="text-3xl font-extrabold text-[#F8FAFC] font-['Outfit']">
              {formatFullINR(activeCase?.amount)}
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Recovered through: <strong className="text-[#60A5FA]">{selectedAction}</strong>
            </p>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-y border-[#10B981]/20 py-3 text-left">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase">Revenue Recovered</span>
              <div className="text-[#10B981] font-bold">{formatFullINR(activeCase?.amount)}</div>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] uppercase">Recovery Probability</span>
              <div className="text-[#60A5FA] font-bold">{Math.round((recPrediction?.probability || 0.92) * 100)}%</div>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] uppercase">Action Taken</span>
              <div className="text-[#F8FAFC] font-bold">{selectedAction}</div>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] uppercase">Time to Recovery</span>
              <div className="text-[#F8FAFC] font-bold">2.4 seconds</div>
            </div>
          </div>

          {/* 13. STOP CONDITION */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#10B981]/30 text-xs text-[#10B981] flex items-center justify-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span><strong>STOP CONDITION:</strong> Recovery completed — no further action required.</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/cases/${activeCase?.caseId}`}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-bold font-sans shadow-lg shadow-[#2563EB]/25 transition-all"
            >
              View Recovery Case
            </Link>
            <Link
              to="/audit-logs"
              className="px-5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] text-xs font-sans transition-colors"
            >
              View Audit Trail
            </Link>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/30 text-xs font-sans font-semibold transition-colors"
            >
              Simulate Another Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
