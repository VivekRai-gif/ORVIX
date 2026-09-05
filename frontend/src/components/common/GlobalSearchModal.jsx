import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, User, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { fetchRecoveryCases, fetchCustomers } from '../../services/api';
import { formatFullINR } from '../../utils/formatters';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [cases, setCases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else openSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const openSearch = () => {
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('open_global_search'));
    }
  };

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setCases([]);
      setCustomers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [caseRes, custRes] = await Promise.all([
          fetchRecoveryCases({ search: query, limit: 5 }).catch(() => ({ cases: [] })),
          fetchCustomers({ search: query, limit: 5 }).catch(() => ({ customers: [] }))
        ]);
        setCases(caseRes.cases || []);
        setCustomers(custRes.customers || []);
      } catch (err) {
        console.error('[Search Error]', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#05070A]/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#111622] border border-[#1E2638] rounded-2xl shadow-2xl overflow-hidden flex flex-col space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-[#1E2638] flex items-center space-x-3 bg-[#0D111A]">
          <Search className="w-5 h-5 text-[#60A5FA]" />
          <input
            type="text"
            autoFocus
            placeholder="Search recovery cases, payment IDs, or customer IDs... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-mono text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#171E2E] border border-[#1E2638] text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 font-mono text-xs">
          {loading && (
            <div className="py-8 text-center text-[#64748B] animate-pulse">
              Searching ORVIX intelligence ledger...
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="py-8 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-[#60A5FA] mx-auto opacity-70" />
              <p className="text-[#94A3B8]">Type to search cases (e.g. <code>case_syn_001000</code> or <code>cust_syn_00999</code>)</p>
            </div>
          )}

          {!loading && query.trim() && cases.length === 0 && customers.length === 0 && (
            <div className="py-8 text-center text-[#94A3B8]">
              No recovery records found matching "{query}".
            </div>
          )}

          {/* Cases Results */}
          {cases.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-1">
                Recovery Cases ({cases.length})
              </div>
              <div className="space-y-1">
                {cases.map((c) => (
                  <div
                    key={c.caseId}
                    onClick={() => {
                      navigate(`/cases/${c.caseId}`);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#161B26] border border-[#1E2638] hover:border-[#3B82F6] hover:bg-[#1C2333] cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-[#60A5FA]" />
                      <div>
                        <div className="font-bold text-[#F8FAFC]">{c.caseId}</div>
                        <div className="text-[10px] text-[#94A3B8]">
                          {c.failureReason} • {formatFullINR(c.amount)}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Results */}
          {customers.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-1">
                Customer Context Profiles ({customers.length})
              </div>
              <div className="space-y-1">
                {customers.map((cust) => (
                  <div
                    key={cust.customerId}
                    onClick={() => {
                      navigate(`/customers?id=${cust.customerId}`);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#161B26] border border-[#1E2638] hover:border-[#3B82F6] hover:bg-[#1C2333] cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-[#10B981]" />
                      <div>
                        <div className="font-bold text-[#F8FAFC]">{cust.customerId}</div>
                        <div className="text-[10px] text-[#94A3B8]">
                          Segment: {cust.segment} • Successes: {cust.previousSuccessfulPayments}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#64748B]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
