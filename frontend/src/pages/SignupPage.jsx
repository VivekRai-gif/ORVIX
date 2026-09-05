import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Lock, Mail, User, ShieldAlert, Sparkles } from 'lucide-react';
import { registerUser } from '../services/api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerUser({ name, email, password });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Failed to create account.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F5F5F7] flex flex-col justify-between font-['Inter',sans-serif] relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#7C3AED]/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="px-6 py-6 max-w-7xl w-full mx-auto flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#7C3AED]/25">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-['Outfit'] font-bold text-2xl tracking-tight text-[#F5F5F7]">ORVIX</span>
        </Link>
        <Link to="/login" className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA]">
          Already have an account? Sign In →
        </Link>
      </header>

      {/* Main Card Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md bg-[#111319] border border-[#252832] p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center mx-auto text-[#8B5CF6] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-['Outfit'] text-[#F5F5F7]">Create Your ORVIX Account</h1>
            <p className="text-xs text-[#A1A1AA]">Start autonomous revenue recovery for your store today.</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Full Name / Merchant Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Acme Subscriptions Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#08090D] border border-[#252832] rounded-xl text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="merchant@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#08090D] border border-[#252832] rounded-xl text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#08090D] border border-[#252832] rounded-xl text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#8B5CF6] text-white font-bold text-xs font-mono shadow-lg shadow-[#7C3AED]/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Creating Account...' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#252832]">
            <p className="text-[11px] text-[#71717A]">
              By signing up, you get instant access to the ORVIX AI Decision Engine.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#71717A] relative z-10">
        © {new Date().getFullYear()} ORVIX Intelligence Inc. All rights reserved.
      </footer>
    </div>
  );
}
