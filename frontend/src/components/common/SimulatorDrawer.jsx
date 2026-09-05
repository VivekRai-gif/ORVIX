import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Send, CreditCard, ArrowRight } from 'lucide-react';
import { createRecoveryCase, decideRecoveryCase, executeRecoveryCase } from '../../services/api';
import ActionBadge from '../ActionBadge';
import { formatFullINR } from '../../utils/formatters';

export default function SimulatorDrawer({ isOpen, onClose, onCaseUpdated }) {
  const [amount, setAmount] = useState('12499');
  const [failureReason, setFailureReason] = useState('INSUFFICIENT_FUNDS');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerSegment, setCustomerSegment] = useState('RETURNING');

  const [step, setStep] = useState('IDLE'); // IDLE, PROCESSING, DECIDED, EXECUTED, RECOVERED
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeCase, setActiveCase] = useState(null);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pipelineSteps = [
    { label: '1. PAYMENT FAILED', desc: 'Captured payment failure & metadata' },
    { label: '2. RISK DETECTED', desc: 'Identified revenue at risk' },
    { label: '3. AI DIAGNOSIS', desc: 'Classified failure category & confidence' },
    { label: '4. RECOVERY PREDICTION', desc: 'Estimated recovery probabilities P(R|A)' },
    { label: '5. EXPECTED VALUE', desc: 'Calculated ERV = P(R|A) × Amount − Cost' },
    { label: '6. POLICY CHECK', desc: 'Verified 7 merchant policy guardrails' },
    { label: '7. NEXT BEST ACTION', desc: 'Selected optimal recovery action' },
    { label: '8. RECOVERY OUTCOME', desc: 'Executed action & updated ledger' }
  ];

  const handleSimulateFailure = async () => {
    setLoading(true);
    setStep('PROCESSING');
    setActiveStepIndex(0);

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

      for (let i = 0; i <= 6; i++) {
        setActiveStepIndex(i);
        await new Promise(r => setTimeout(r, 200));
        if (i === 0) {
          var createRes = await createRecoveryCase(caseData);
        }
        if (i === 4) {
          var decideRes = await decideRecoveryCase(createRes.case?.caseId || caseData.caseId, {
            amount: caseData.amount,
            failureReason: caseData.failureReason
          });
        }
      }

      setActiveCase(createRes.case || caseData);
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
          metadata: { amount: activeCase.amount, source: 'SIMULATOR_DRAWER' }
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
    setActiveStepIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#05070A]/80 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-lg bg-[#111622] border-l border-[#1E2638] h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#1E2638] flex items-center justify-between bg-[#0D111A]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#60A5FA]" />
            <h3 className="font-bold text-base font-['Outfit'] text-[#F8FAFC]">Live Recovery Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#171E2E] border border-[#1E2638] text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1 text-xs font-mono">
          {step === 'IDLE' && (
            <div className="space-y-4">
              <p className="text-[#94A3B8] leading-relaxed">
                Simulate a payment failure and watch ORVIX diagnose, decide, act, and measure recovery in real time.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#64748B] uppercase font-bold">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#090C14] border border-[#1E2638] text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#64748B] uppercase font-bold">Failure Code</label>
                  <select
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#090C14] border border-[#1E2638] text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (Soft Failure)</option>
                    <option value="NETWORK_TIMEOUT">NETWORK_TIMEOUT (Temporary)</option>
                    <option value="EXPIRED_CARD">EXPIRED_CARD (Customer Action)</option>
                    <option value="STOLEN_CARD">STOLEN_CARD (Hard Failure)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#64748B] uppercase font-bold">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#090C14] border border-[#1E2638] text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="netbanking">Netbanking</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#64748B] uppercase font-bold">Customer Segment</label>
                  <select
                    value={customerSegment}
                    onChange={(e) => setCustomerSegment(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#090C14] border border-[#1E2638] text-[#F8FAFC] font-semibold focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="RETURNING">RETURNING</option>
                    <option value="VIP">VIP</option>
                    <option value="NEW">NEW</option>
                    <option value="PRICE_SENSITIVE">PRICE_SENSITIVE</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSimulateFailure}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold shadow-lg shadow-[#2563EB]/25 flex items-center justify-center space-x-2 transition-all mt-4"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Simulate Payment Failure ({formatFullINR(Number(amount))})</span>
              </button>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2 text-[#60A5FA] font-bold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing ORVIX Decision Pipeline...</span>
              </div>

              <div className="space-y-2">
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
                          ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-[#F8FAFC] animate-pulse'
                          : 'bg-[#090C14] border-[#1E2638] text-[#64748B]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{s.label}</span>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> : null}
                      </div>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(step === 'DECIDED' || step === 'EXECUTED') && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#090C14] border border-[#1E2638] space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E2638] pb-2 text-[#EF4444] font-bold">
                  <span>Payment Failed: {formatFullINR(activeCase?.amount)}</span>
                  <span className="text-[#64748B] text-[10px]">{activeCase?.caseId}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#1E2638]">
                    <span className="text-[#64748B]">Category:</span>
                    <span className="text-[#60A5FA] font-bold">{decision?.diagnosis?.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1E2638]">
                    <span className="text-[#64748B]">Selected Action:</span>
                    <ActionBadge action={decision?.selectedAction || 'RETRY'} />
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Policy Check:</span>
                    <span className="text-[#10B981] font-bold">APPROVED</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 pt-2">
                {step === 'DECIDED' ? (
                  <button
                    onClick={handleExecuteAction}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Execute Action</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSimulateCustomerPayment}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Simulate Customer Payment</span>
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl bg-[#161B26] border border-[#1E2638] text-[#94A3B8]"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {step === 'RECOVERED' && (
            <div className="p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto animate-bounce" />
              <div>
                <div className="text-[#10B981] font-bold uppercase">Payment Recovered</div>
                <div className="text-2xl font-bold text-[#F8FAFC] mt-1">{formatFullINR(activeCase?.amount)}</div>
              </div>
              <div className="pt-2 flex flex-col space-y-2">
                <button
                  onClick={() => {
                    navigate(`/cases/${activeCase?.caseId}`);
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-bold flex items-center justify-center space-x-2"
                >
                  <span>Inspect Recovery Case Trace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl bg-[#161B26] border border-[#1E2638] text-[#94A3B8]"
                >
                  Simulate Another Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
