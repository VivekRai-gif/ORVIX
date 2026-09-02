import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  TrendingUp,
  DollarSign,
  Award,
  Zap,
  Layers,
  FlaskConical,
  Shield,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  Clock,
  BarChart3,
  RefreshCw,
  FileText,
  Lock,
  Play,
  ArrowUpRight
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: Cpu,
      title: 'AI Payment Failure Diagnosis',
      description: 'Automatically classifies error codes (INSUFFICIENT_FUNDS, TIMEOUT, EXPIRED_CARD) into soft recoverable vs hard unrecoverable failure categories.'
    },
    {
      icon: TrendingUp,
      title: 'ML Probability Engine P(R|A)',
      description: 'Predicts the exact recovery probability per candidate action (Retry, Link, Email, Escalation) tailored to customer history and transaction context.'
    },
    {
      icon: DollarSign,
      title: 'Expected Recovery Value (ERV) Engine',
      description: 'Calculates ERV = P(R|A) × Amount − Cost to dynamically select the single highest net financial value recovery action.'
    },
    {
      icon: Shield,
      title: 'Merchant Policy Guardrails',
      description: 'Enforces strict operational boundaries (max retries, max customer contact limits, recovery windows) protecting brand trust and compliance.'
    },
    {
      icon: RefreshCw,
      title: 'Live Interactive Simulator',
      description: 'Simulate failed payment events in real time, watch ORVIX rank candidate actions, and test customer recovery flows live.'
    },
    {
      icon: FileText,
      title: 'Immutable Decision Audit Trail',
      description: 'Append-only ledger logging state transitions, ML probability scores, policy approvals, and tool execution traces for complete auditability.'
    }
  ];

  const workflowSteps = [
    {
      number: '01',
      title: 'Ingest Payment Failure',
      description: 'Captures failed transaction event with payment ID, amount, error reason, and customer segment.'
    },
    {
      number: '02',
      title: 'AI Failure Diagnosis',
      description: 'Classifies failure reason into recoverable soft failures vs unrecoverable hard failures.'
    },
    {
      number: '03',
      title: 'ML Prediction & ERV Optimization',
      description: 'Computes P(Recovery|Action) and calculates Expected Recovery Value to select optimal intervention.'
    },
    {
      number: '04',
      title: 'Policy Guardrail Check',
      description: 'Evaluates retry attempt limits, contact rules, and opt-out statuses before approving execution.'
    },
    {
      number: '05',
      title: 'Automated Action & Audit Log',
      description: 'Triggers selected tool via Tool Registry, records outcome, and updates decision audit ledger.'
    }
  ];

  const benefits = [
    {
      title: 'Maximize Recovered Revenue',
      description: 'Achieve +19.5% net revenue recovery lift above traditional static retries with empirical ML optimization.',
      stat: '+19.5%',
      statLabel: 'Net Lift'
    },
    {
      title: 'Minimize Customer Friction',
      description: 'Reduce unnecessary retry attempts and spam notifications by 20.8%, protecting subscriber goodwill.',
      stat: '20.8%',
      statLabel: 'Fewer Retries'
    },
    {
      title: 'Guaranteed Policy Compliance',
      description: '100% bounded execution with configurable merchant guardrails that prevent over-retry and over-contact.',
      stat: '100%',
      statLabel: 'Guardrail Bounded'
    },
    {
      title: 'Transparent & Explainable AI',
      description: 'Every automated decision includes human-readable factual reasoning explaining why candidate actions were chosen.',
      stat: '100%',
      statLabel: 'Explainable Decisions'
    }
  ];

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F5F5F7] font-['Inter',sans-serif] selection:bg-[#7C3AED]/30 selection:text-[#F5F5F7]">
      {/* 1. NAVBAR */}
      <nav className="border-b border-[#252832] bg-[#08090D]/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#7C3AED]/25 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-['Outfit'] font-bold text-2xl tracking-tight text-[#F5F5F7]">
                ORVIX
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#7C3AED]/15 text-[#8B5CF6] border border-[#7C3AED]/30">
                v1.0
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#A1A1AA]">
            <a href="#features" className="hover:text-[#F5F5F7] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#F5F5F7] transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-[#F5F5F7] transition-colors">Dashboard Preview</a>
            <a href="#benefits" className="hover:text-[#F5F5F7] transition-colors">Why ORVIX</a>
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#8B5CF6] px-5 py-2.5 rounded-xl shadow-lg shadow-[#7C3AED]/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#A1A1AA] hover:text-[#F5F5F7] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#252832] bg-[#0D0F14] px-6 py-6 space-y-4">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F7]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F7]"
            >
              How It Works
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F7]"
            >
              Dashboard Preview
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F7]"
            >
              Why ORVIX
            </a>
            <div className="pt-4 border-t border-[#252832] space-y-3">
              <Link
                to="/dashboard"
                className="block text-center text-sm font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] py-2"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard"
                className="w-full inline-flex items-center justify-center space-x-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#8B5CF6] py-3 rounded-xl shadow-lg shadow-[#7C3AED]/25"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#7C3AED]/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#8B5CF6]/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#111319] border border-[#252832] text-xs font-mono text-[#8B5CF6] shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Autonomous AI Revenue Recovery & Orchestration Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-['Outfit'] tracking-tight max-w-5xl mx-auto text-[#F5F5F7] leading-[1.1]">
            Turn Failed Payments Into <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#60A5FA] bg-clip-text text-transparent">Recovered Revenue</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-xl text-[#A1A1AA] max-w-3xl mx-auto leading-relaxed">
            ORVIX automatically diagnoses payment failure codes, calculates Expected Recovery Value (ERV) using ML probability models, and executes bounded recovery actions under strict merchant policy guardrails.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-base font-bold text-white bg-[#7C3AED] hover:bg-[#8B5CF6] px-8 py-4 rounded-xl shadow-xl shadow-[#7C3AED]/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-base font-semibold text-[#F5F5F7] bg-[#111319] hover:bg-[#151821] border border-[#252832] hover:border-[#363A46] px-8 py-4 rounded-xl transition-all"
            >
              <span>See How It Works</span>
              <ChevronRight className="w-5 h-5 text-[#A1A1AA]" />
            </a>
          </div>

          {/* Key Metric Highlights Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
            <div className="p-4 rounded-xl bg-[#111319]/80 border border-[#252832]">
              <div className="text-2xl font-bold font-mono text-[#22C55E]">+19.5%</div>
              <div className="text-xs text-[#71717A] mt-0.5">Net Recovery Rate Lift</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111319]/80 border border-[#252832]">
              <div className="text-2xl font-bold font-mono text-[#8B5CF6]">20.8%</div>
              <div className="text-xs text-[#71717A] mt-0.5">Fewer Unnecessary Retries</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111319]/80 border border-[#252832]">
              <div className="text-2xl font-bold font-mono text-[#F5F5F7]">₹5.77 Cr</div>
              <div className="text-xs text-[#71717A] mt-0.5">Recovered Revenue (1k Dataset)</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111319]/80 border border-[#252832]">
              <div className="text-2xl font-bold font-mono text-[#F59E0B]">100%</div>
              <div className="text-xs text-[#71717A] mt-0.5">Policy Bounded & Audit Logged</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM / VALUE PROPOSITION */}
      <section className="py-20 bg-[#0D0F14] border-y border-[#252832] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-mono font-bold text-[#8B5CF6] uppercase tracking-widest">
              Problem → Solution → Result
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-['Outfit'] text-[#F5F5F7]">
              Why Traditional Recovery Methods Fail
            </h3>
            <p className="text-sm md:text-base text-[#A1A1AA] max-w-2xl mx-auto">
              Static retries and spammy notifications create customer friction without recovering lost revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Problem */}
            <div className="p-8 rounded-2xl bg-[#111319] border border-[#EF4444]/30 relative overflow-hidden group hover:border-[#EF4444]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#EF4444]/12 border border-[#EF4444]/25 flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6 text-[#EF4444]" />
              </div>
              <span className="text-xs font-mono font-bold text-[#EF4444] uppercase tracking-wider">The Problem</span>
              <h4 className="text-xl font-bold text-[#F5F5F7] mt-1 mb-3 font-['Outfit']">Naive Static Retries</h4>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Legacy systems retry payments on fixed schedules regardless of why the payment failed. Hard card declines get retried, wasting fees and angering customers.
              </p>
            </div>

            {/* Card 2: Solution */}
            <div className="p-8 rounded-2xl bg-[#111319] border border-[#7C3AED]/40 relative overflow-hidden group hover:border-[#8B5CF6] transition-colors shadow-lg shadow-[#7C3AED]/10">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <span className="text-xs font-mono font-bold text-[#8B5CF6] uppercase tracking-wider">The Solution</span>
              <h4 className="text-xl font-bold text-[#F5F5F7] mt-1 mb-3 font-['Outfit']">AI Diagnosis & ERV Engine</h4>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                ORVIX diagnoses failure root cause, models <code className="text-[#8B5CF6]">P(Recovery|Action)</code>, and evaluates Expected Recovery Value to pick the highest net-value candidate action.
              </p>
            </div>

            {/* Card 3: Result */}
            <div className="p-8 rounded-2xl bg-[#111319] border border-[#22C55E]/30 relative overflow-hidden group hover:border-[#22C55E]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/12 border border-[#22C55E]/25 flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-[#22C55E]" />
              </div>
              <span className="text-xs font-mono font-bold text-[#22C55E] uppercase tracking-wider">The Result</span>
              <h4 className="text-xl font-bold text-[#F5F5F7] mt-1 mb-3 font-['Outfit']">Maximum Recovered Lift</h4>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Merchants achieve up to 81.7% recovery rate (+19.5% lift above baseline) while cutting customer friction and retry costs by over 20%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-mono font-bold text-[#8B5CF6] uppercase tracking-widest">
            Core Capabilities
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold font-['Outfit'] text-[#F5F5F7]">
            Built for Autonomous Revenue Recovery
          </h3>
          <p className="text-sm md:text-base text-[#A1A1AA] max-w-2xl mx-auto">
            Explore the production-grade intelligence layer powering ORVIX payment recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#111319] border border-[#252832] hover:border-[#363A46] hover:bg-[#151821] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/12 border border-[#7C3AED]/25 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <h4 className="text-lg font-bold text-[#F5F5F7] font-['Outfit'] mb-2">
                  {feat.title}
                </h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-[#0D0F14] border-y border-[#252832]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-mono font-bold text-[#8B5CF6] uppercase tracking-widest">
              End-To-End Decision Workflow
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold font-['Outfit'] text-[#F5F5F7]">
              How ORVIX Recovers Payments
            </h3>
            <p className="text-sm md:text-base text-[#A1A1AA] max-w-2xl mx-auto">
              5 automated steps from payment failure ingestion to tool execution and audit logging.
            </p>
          </div>

          <div className="relative">
            {/* Desktop connector line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C3AED]/20 via-[#8B5CF6]/50 to-[#22C55E]/20 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
              {workflowSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#111319] border border-[#252832] hover:border-[#7C3AED]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xl font-mono font-bold text-[#8B5CF6]">
                      {step.number}
                    </span>
                    <h4 className="text-base font-bold text-[#F5F5F7] font-['Outfit'] mt-3 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#252832] text-[10px] font-mono text-[#71717A] flex items-center justify-between">
                    <span>Step {idx + 1} of 5</span>
                    <ChevronRight className="w-3 h-3 text-[#8B5CF6]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRODUCT PREVIEW */}
      <section id="preview" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-mono font-bold text-[#8B5CF6] uppercase tracking-widest">
            Live Application Preview
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold font-['Outfit'] text-[#F5F5F7]">
            Experience the ORVIX Control Center
          </h3>
          <p className="text-sm md:text-base text-[#A1A1AA] max-w-2xl mx-auto">
            Get a full visual preview of the real dashboard, live simulator, and audit trail available inside.
          </p>
        </div>

        {/* Dashboard Preview Card */}
        <div className="relative rounded-3xl bg-[#111319] border border-[#252832] p-4 md:p-8 shadow-2xl shadow-[#7C3AED]/10 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-[#7C3AED]/15 blur-[120px] pointer-events-none" />

          {/* Window Bar Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#252832] mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
              <span className="text-xs font-mono text-[#71717A] ml-2">orvix.app/dashboard</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#22C55E]/12 border border-[#22C55E]/25 text-[#22C55E] text-xs font-mono font-bold">
              • AI Decision Engine Active
            </div>
          </div>

          {/* Mock KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[#08090D] border border-[#252832]">
              <div className="text-[11px] text-[#71717A] uppercase font-mono">Revenue at Risk</div>
              <div className="text-2xl font-bold text-[#F5F5F7] font-mono mt-1">₹7,06,87,125</div>
              <div className="text-[10px] text-[#EF4444] font-mono mt-1">Failed Transaction Volume</div>
            </div>
            <div className="p-4 rounded-xl bg-[#08090D] border border-[#252832]">
              <div className="text-[11px] text-[#71717A] uppercase font-mono">Revenue Recovered</div>
              <div className="text-2xl font-bold text-[#22C55E] font-mono mt-1">₹5,77,51,383</div>
              <div className="text-[10px] text-[#22C55E] font-mono mt-1">Successfully Recovered</div>
            </div>
            <div className="p-4 rounded-xl bg-[#08090D] border border-[#252832]">
              <div className="text-[11px] text-[#71717A] uppercase font-mono">ORVIX Recovery Rate</div>
              <div className="text-2xl font-bold text-[#8B5CF6] font-mono mt-1">81.7%</div>
              <div className="text-[10px] text-[#22C55E] font-mono mt-1">vs 62.2% Baseline (+19.5%)</div>
            </div>
            <div className="p-4 rounded-xl bg-[#08090D] border border-[#252832]">
              <div className="text-[11px] text-[#71717A] uppercase font-mono">Incremental Revenue</div>
              <div className="text-2xl font-bold text-[#60A5FA] font-mono mt-1">₹1,33,33,550</div>
              <div className="text-[10px] text-[#60A5FA] font-mono mt-1">Net Empirical Lift</div>
            </div>
          </div>

          {/* Mock Interactive Teaser Banner */}
          <div className="p-6 rounded-2xl bg-[#0D0F14] border border-[#7C3AED]/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#8B5CF6] text-xs font-mono font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Payment Failure Simulator Ready</span>
              </div>
              <h4 className="text-lg font-bold text-[#F5F5F7] font-['Outfit']">
                Simulate Payment Failures & Watch ORVIX Diagnose Live
              </h4>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#8B5CF6] text-white font-bold text-xs font-mono shadow-lg shadow-[#7C3AED]/25 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live App</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. BENEFITS / WHY USE IT */}
      <section id="benefits" className="py-24 bg-[#0D0F14] border-y border-[#252832]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-mono font-bold text-[#8B5CF6] uppercase tracking-widest">
              Measurable Business Outcomes
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold font-['Outfit'] text-[#F5F5F7]">
              Why Modern Merchants Choose ORVIX
            </h3>
            <p className="text-sm md:text-base text-[#A1A1AA] max-w-2xl mx-auto">
              Clear financial and operational outcomes engineered specifically for subscription and SaaS merchants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((b, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#111319] border border-[#252832] hover:border-[#363A46] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-[#F5F5F7] font-['Outfit'] mb-2">
                      {b.title}
                    </h4>
                    <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                  <div className="text-right pl-4">
                    <div className="text-3xl font-bold font-mono text-[#8B5CF6]">{b.stat}</div>
                    <div className="text-[10px] font-mono text-[#71717A] uppercase mt-0.5">{b.statLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-28 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#7C3AED]/20 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center mx-auto text-[#8B5CF6] shadow-xl shadow-[#7C3AED]/20">
            <Activity className="w-8 h-8" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold font-['Outfit'] text-[#F5F5F7] tracking-tight">
            Ready to Recover Lost Revenue?
          </h2>

          <p className="text-base md:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Stop letting payment failures reduce your merchant bottom line. Start evaluating ORVIX's autonomous decision engine today.
          </p>

          <div className="pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-3 text-lg font-bold text-white bg-[#7C3AED] hover:bg-[#8B5CF6] px-10 py-5 rounded-2xl shadow-2xl shadow-[#7C3AED]/30 transition-all transform hover:-translate-y-1"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-[#252832] bg-[#08090D] py-12 text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-['Outfit'] font-bold text-base text-[#F5F5F7]">ORVIX</span>
              <span className="text-[11px] text-[#A1A1AA] block">AI Revenue Recovery Intelligence & Orchestration</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-[#A1A1AA]">
            <a href="#features" className="hover:text-[#F5F5F7]">Features</a>
            <a href="#how-it-works" className="hover:text-[#F5F5F7]">How It Works</a>
            <Link to="/dashboard" className="hover:text-[#F5F5F7]">Dashboard</Link>
            <Link to="/cases" className="hover:text-[#F5F5F7]">Recovery Cases</Link>
            <Link to="/experiments" className="hover:text-[#F5F5F7]">Experiments</Link>
            <Link to="/policies" className="hover:text-[#F5F5F7]">Policies</Link>
            <Link to="/audit-logs" className="hover:text-[#F5F5F7]">Audit Trail</Link>
          </div>

          <div className="text-right font-mono text-[11px] text-[#71717A]">
            © {new Date().getFullYear()} ORVIX Intelligence Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
