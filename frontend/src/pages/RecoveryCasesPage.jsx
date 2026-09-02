import React, { useEffect, useState } from 'react';
import { fetchRecoveryCases, createRecoveryCase } from '../services/api';
import RecoveryTable from '../components/RecoveryTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { Search, Filter, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

export default function RecoveryCasesPage() {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [newPaymentId, setNewPaymentId] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newAmount, setNewAmount] = useState('4500');
  const [newReason, setNewReason] = useState('INSUFFICIENT_FUNDS');
  const [creating, setCreating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecoveryCases({
        status: statusFilter,
        failureReason: reasonFilter,
        selectedAction: actionFilter,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
        search: searchTerm,
        page,
        limit: 15
      });
      setCases(res.cases || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      setError('Failed to fetch recovery cases from backend REST API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter, reasonFilter, actionFilter, page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadCases();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPaymentId || !newCustomerId) {
      alert('Please fill in Payment ID and Customer ID.');
      return;
    }

    setCreating(true);
    try {
      await createRecoveryCase({
        paymentId: newPaymentId,
        customerId: newCustomerId,
        amount: parseFloat(newAmount) || 1000,
        failureReason: newReason
      });
      setShowModal(false);
      setNewPaymentId('');
      setNewCustomerId('');
      setPage(1);
      loadCases();
    } catch (err) {
      alert('Failed to create recovery case: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-[#F8FAFC]">Recovery Cases</h2>
          <p className="text-xs text-[#94A3B8]">
            Query and manage revenue recovery cases across failure modes and intervention statuses.
          </p>
        </div>

        <button
          onClick={() => {
            const rnd = Math.floor(Math.random() * 9000) + 1000;
            setNewPaymentId(`pay_man_${rnd}`);
            setNewCustomerId(`cust_man_${rnd}`);
            setShowModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-[#F8FAFC] text-xs font-semibold shadow-lg shadow-[#2563EB]/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest New Case</span>
        </button>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilterSubmit} className="p-4 rounded-xl bg-[#171E2E] border border-[#1E293B] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search case, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg pl-9 pr-3 py-1.5 text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-[#0F172A] border border-[#1E293B] rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-[#F8FAFC] focus:outline-none capitalize"
            >
              <option value="all" className="bg-[#111827]">All Statuses</option>
              <option value="AT_RISK" className="bg-[#111827]">AT_RISK</option>
              <option value="open" className="bg-[#111827]">Open</option>
              <option value="in_progress" className="bg-[#111827]">In Progress</option>
              <option value="recovered" className="bg-[#111827]">Recovered</option>
              <option value="failed" className="bg-[#111827]">Failed</option>
              <option value="closed" className="bg-[#111827]">Closed</option>
              <option value="escalated" className="bg-[#111827]">Escalated</option>
            </select>
          </div>

          {/* Failure Reason Filter */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg px-2.5 py-1.5">
            <select
              value={reasonFilter}
              onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-[#F8FAFC] focus:outline-none"
            >
              <option value="all" className="bg-[#111827]">All Failure Reasons</option>
              <option value="INSUFFICIENT_FUNDS" className="bg-[#111827]">INSUFFICIENT_FUNDS</option>
              <option value="NETWORK_ERROR" className="bg-[#111827]">NETWORK_ERROR</option>
              <option value="BANK_DECLINED" className="bg-[#111827]">BANK_DECLINED</option>
              <option value="TIMEOUT" className="bg-[#111827]">TIMEOUT</option>
              <option value="EXPIRED_CARD" className="bg-[#111827]">EXPIRED_CARD</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg px-2.5 py-1.5">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-[#F8FAFC] focus:outline-none"
            >
              <option value="all" className="bg-[#111827]">All Selected Actions</option>
              <option value="intelligent_retry" className="bg-[#111827]">Intelligent Retry</option>
              <option value="payment_link" className="bg-[#111827]">Payment Link</option>
              <option value="email_reminder" className="bg-[#111827]">Email Reminder</option>
            </select>
          </div>

          {/* Amount Range */}
          <div className="flex items-center space-x-1">
            <input
              type="number"
              placeholder="Min ₹"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-1/2 bg-[#0F172A] border border-[#1E293B] rounded-lg px-2 py-1.5 text-[#F8FAFC] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-1/2 bg-[#0F172A] border border-[#1E293B] rounded-lg px-2 py-1.5 text-[#F8FAFC] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] text-xs font-medium transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Cases Content */}
      {loading ? (
        <LoadingState message="Fetching recovery cases via REST API..." />
      ) : error ? (
        <ErrorState title="Error Loading Cases" message={error} onRetry={loadCases} />
      ) : cases.length === 0 ? (
        <EmptyState title="No Recovery Cases Found" message="No cases match your selected query parameters." />
      ) : (
        <div className="space-y-4">
          <RecoveryTable cases={cases} />

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-[#64748B] px-2 py-2">
            <span>Showing page {page} of {pages} ({total} total cases)</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-[#171E2E] border border-[#1E293B] hover:bg-[#1E293B] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#94A3B8]" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                className="p-2 rounded-lg bg-[#171E2E] border border-[#1E293B] hover:bg-[#1E293B] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingest Case Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-[#F8FAFC]">Ingest New Recovery Case</h3>
              <button onClick={() => setShowModal(false)} className="text-[#64748B] hover:text-[#F8FAFC]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-semibold">Payment ID</label>
                <input
                  type="text"
                  value={newPaymentId}
                  onChange={(e) => setNewPaymentId(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-semibold">Customer ID</label>
                <input
                  type="text"
                  value={newCustomerId}
                  onChange={(e) => setNewCustomerId(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-semibold">Transaction Amount (₹)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-semibold">Failure Reason</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-2 text-[#F8FAFC] focus:outline-none"
                >
                  <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
                  <option value="NETWORK_ERROR">NETWORK_ERROR</option>
                  <option value="BANK_DECLINED">BANK_DECLINED</option>
                  <option value="TIMEOUT">TIMEOUT</option>
                  <option value="EXPIRED_CARD">EXPIRED_CARD</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-[#F8FAFC] font-semibold shadow-lg shadow-[#2563EB]/20 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Ingesting...' : 'Create Case (POST /api/recovery/cases)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
