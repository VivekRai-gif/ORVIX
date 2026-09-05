import React, { useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import ActionBadge from './ActionBadge';

export default function CelebrationPopup({ isOpen, onClose, amount, action, caseId, onSimulateAnother }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Party Popper Confetti Particle System
    const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#F43F5E'];
    const particles = [];

    // Create 150 confetti particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 18 - 6,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        opacity: 1
      });
    }

    let animationFrameId;
    let startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.vx *= 0.98; // Friction
        p.rotation += p.rSpeed;
        if (elapsed > 2000) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (elapsed < 4500) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const balloons = [
    { color: 'bg-red-500', left: '10%', delay: '0s' },
    { color: 'bg-blue-500', left: '25%', delay: '0.5s' },
    { color: 'bg-green-500', left: '40%', delay: '0.2s' },
    { color: 'bg-purple-500', left: '60%', delay: '0.7s' },
    { color: 'bg-yellow-500', left: '75%', delay: '0.3s' },
    { color: 'bg-pink-500', left: '90%', delay: '0.6s' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Canvas for Party Popper Confetti */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Floating Animated Balloons Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {balloons.map((b, idx) => (
          <div
            key={idx}
            style={{ left: b.left, animationDelay: b.delay }}
            className={`absolute bottom-[-100px] w-12 h-16 rounded-full ${b.color} opacity-80 shadow-lg animate-balloon-up flex flex-col items-center justify-end`}
          >
            <div className="w-1 h-8 bg-white/40 translate-y-6" />
          </div>
        ))}
      </div>

      {/* Celebration Card Modal */}
      <div className="relative z-20 max-w-lg w-full bg-[#111827] border-2 border-[#10B981] p-8 rounded-3xl shadow-2xl text-center space-y-6 transform animate-bounce-short">
        {/* Top Celebration Icon */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-[#10B981]/20 animate-ping opacity-75" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-xl shadow-[#10B981]/30 text-white text-3xl">
            🎉
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-mono text-xs font-bold uppercase tracking-wider">
            🎉 Payment Recovered! Party Popper Party! 🎉
          </span>
          <h2 className="text-3xl font-bold font-['Outfit'] text-[#F8FAFC] pt-2">
            ₹{Number(amount || 0).toLocaleString('en-IN')} Added Back To Revenue!
          </h2>
          <p className="text-xs text-[#94A3B8]">
            ORVIX Autonomous Decision Engine successfully recovered payment for case <span className="font-mono text-[#60A5FA]">{caseId}</span>.
          </p>
        </div>

        {/* Stats & Action Used Pill Box */}
        <div className="p-4 rounded-2xl bg-[#171E2E] border border-[#1E293B] grid grid-cols-2 gap-4 text-xs font-mono text-left">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase">Optimal Action Executed</span>
            <div className="mt-1"><ActionBadge action={action || 'PAYMENT_LINK'} /></div>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] uppercase">Revenue Outcome</span>
            <div className="text-[#10B981] font-bold mt-1 text-sm">100% RECOVERED</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              if (onSimulateAnother) onSimulateAnother();
            }}
            className="w-full sm:flex-1 py-3 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold text-xs font-mono shadow-lg shadow-[#10B981]/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Simulate Another Payment</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] font-semibold text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
