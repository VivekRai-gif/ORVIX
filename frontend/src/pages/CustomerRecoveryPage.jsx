import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CelebrationPopup from '../components/CelebrationPopup';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function CustomerRecoveryPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paid, setPaid] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchPublicDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/public/recovery/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data.case);
          if (data.case?.status === 'recovered') {
            setPaid(true);
          }
        }
      } catch (err) {
        console.warn('Public API error, using default:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicDetails();
  }, [id]);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);

    try {
      const res = await fetch(`${API_BASE_URL}/public/recovery/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      });

      if (res.ok) {
        setPaid(true);
        setShowCelebration(true); // 🎉 Trigger Party Popper Confetti + Balloons Celebration Modal!
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (err) {
      alert('Payment authorization error: ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  const amount = caseData?.amount || 12499;
  const merchantName = caseData?.merchantName || 'ORVIX Premium SaaS Store';

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F5F5F7] flex flex-col items-center justify-center p-4 sm:p-6 font-['Inter'] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7C3AED]/20 via-[#2563EB]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Celebration Popup (Confetti + Balloons) */}
      <CelebrationPopup
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        amount={amount}
        action="PAYMENT_LINK"
        caseId={id || 'case_live'}
      />

      <div className="max-w-lg w-full space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#111319] border border-[#252832] text-xs font-mono text-[#8B5CF6]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>ORVIX Verified Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-white">
            {merchantName}
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            Subscription & Invoice Recovery Authorization
          </p>
        </div>

        {!paid ? (
          <div className="rounded-2xl bg-[#0D0F14] border border-[#252832] p-6 shadow-2xl space-y-6">
            {/* Invoice Summary Banner */}
            <div className="p-4 rounded-xl bg-[#111319] border border-[#252832] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>Reference ID: <strong className="font-mono text-[#F5F5F7]">{id}</strong></span>
                <span className="px-2 py-0.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] font-mono text-[10px] font-bold">
                  PAYMENT FAILED
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-[#252832] pt-3">
                <span className="text-sm font-semibold text-[#A1A1AA]">Total Amount Due</span>
                <span className="text-2xl font-bold font-mono text-[#10B981]">
                  ₹{Number(amount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] text-[#FCA5A5] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <span>
                  Your previous recurring payment failed due to bank processing limits or insufficient funds. Select a fresh payment method to complete payment instantly.
                </span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <form onSubmit={handlePay} className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                      : 'bg-[#111319] border-[#252832] text-[#A1A1AA] hover:bg-[#151821]'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#8B5CF6]" />
                  <span>UPI Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                      : 'bg-[#111319] border-[#252832] text-[#A1A1AA] hover:bg-[#151821]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20'
                      : 'bg-[#111319] border-[#252832] text-[#A1A1AA] hover:bg-[#151821]'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-[#10B981]" />
                  <span>Netbanking</span>
                </button>
              </div>

              {/* Payment Details Input Mock */}
              {paymentMethod === 'upi' && (
                <div className="p-3 rounded-xl bg-[#111319] border border-[#252832] space-y-2">
                  <label className="text-[11px] text-[#A1A1AA]">UPI ID / VPA</label>
                  <input
                    type="text"
                    defaultValue="customer@okaxis"
                    className="w-full p-2.5 rounded-lg bg-[#08090D] border border-[#252832] text-xs font-mono text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                  <p className="text-[10px] text-[#A1A1AA]">Supports PhonePe, Google Pay, Paytm, BHIM</p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-3 rounded-xl bg-[#111319] border border-[#252832] space-y-2">
                  <label className="text-[11px] text-[#A1A1AA]">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4111 •••• •••• 9012"
                    className="w-full p-2.5 rounded-lg bg-[#08090D] border border-[#252832] text-xs font-mono text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="p-2.5 rounded-lg bg-[#08090D] border border-[#252832] text-xs font-mono text-white focus:outline-none focus:border-[#7C3AED]"
                    />
                    <input
                      type="password"
                      defaultValue="888"
                      className="p-2.5 rounded-lg bg-[#08090D] border border-[#252832] text-xs font-mono text-white focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="p-3 rounded-xl bg-[#111319] border border-[#252832] space-y-2">
                  <label className="text-[11px] text-[#A1A1AA]">Select Bank</label>
                  <select className="w-full p-2.5 rounded-lg bg-[#08090D] border border-[#252832] text-xs font-mono text-white focus:outline-none focus:border-[#7C3AED]">
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={paying}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#7C3AED] hover:brightness-110 text-white font-bold text-xs font-mono shadow-xl shadow-[#7C3AED]/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>⚡ Authorize Payment (₹{Number(amount).toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Payment Success Confirmation Card */
          <div className="rounded-2xl bg-[#0D0F14] border-2 border-[#10B981] p-8 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center mx-auto text-[#10B981]">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-mono text-xs font-bold uppercase">
                🎉 Payment Recovered & Verified
              </span>
              <h2 className="text-3xl font-bold font-['Outfit'] text-white pt-2">
                ₹{Number(amount).toLocaleString('en-IN')}
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Thank you! Your payment has been authorized and credited to <strong className="text-white">{merchantName}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#111319] border border-[#252832] text-xs font-mono text-left space-y-2">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Transaction Ref:</span>
                <span className="text-white font-bold">{id}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Payment Method:</span>
                <span className="text-[#10B981] uppercase font-bold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Status:</span>
                <span className="text-[#10B981] font-bold">100% RECOVERED</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#252832] hover:bg-[#323644] text-white text-xs font-mono font-bold transition-all"
              >
                <span>Return to ORVIX Merchant Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#8B5CF6]" />
              </Link>
            </div>
          </div>
        )}

        {/* Footer Security Badges */}
        <div className="flex items-center justify-center space-x-4 text-[11px] text-[#A1A1AA] font-mono">
          <span className="flex items-center space-x-1">
            <Lock className="w-3 h-3 text-[#10B981]" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <span>•</span>
          <span>PCI-DSS Compliant</span>
        </div>
      </div>
    </div>
  );
}
