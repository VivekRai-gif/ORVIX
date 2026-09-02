import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { Search, Filter, History, ChevronLeft, ChevronRight, Cpu, User, ShieldCheck, Shield } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actorFilter, setActorFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs({ actor: actorFilter, search: searchTerm, page, limit: 20 });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      setError('Failed to fetch audit logs from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actorFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadAuditLogs();
  };

  const getActorBadge = (actor) => {
    const actorUpper = (actor || '').toUpperCase();
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
        actorUpper.includes('AI') ? 'bg-[#3B82F6]/12 border border-[#3B82F6]/25 text-[#60A5FA]' :
        actorUpper.includes('POLICY') ? 'bg-[#10B981]/12 border border-[#10B981]/25 text-[#10B981]' :
        actorUpper.includes('HUMAN') ? 'bg-[#F59E0B]/12 border border-[#F59E0B]/25 text-[#F59E0B]' :
        'bg-[#111827] border border-[#1E293B] text-[#64748B]'
      }`}>
        {actor || 'SYSTEM'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-[#F8FAFC]">Decision Audit Logs</h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Immutable, append-only decision audit trail recording every state transition, ML prediction, policy check, and action execution.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#3B82F6]/12 border border-[#3B82F6]/25 text-[#60A5FA] text-xs font-mono font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>Immutable Ledger Active</span>
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-xl bg-[#171E2E] border border-[#1E293B] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail, actor, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#1E293B] rounded-lg pl-9 pr-3 py-1.5 text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Actor Filter */}
          <div className="flex items-center space-x-1.5 bg-[#0F172A] border border-[#1E293B] rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={actorFilter}
              onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-[#F8FAFC] focus:outline-none capitalize"
            >
              <option value="all" className="bg-[#111827]">All Actors</option>
              <option value="AI_ENGINE" className="bg-[#111827]">AI_ENGINE</option>
              <option value="POLICY_ENGINE" className="bg-[#111827]">POLICY_ENGINE</option>
              <option value="HUMAN_OPERATOR" className="bg-[#111827]">HUMAN_OPERATOR</option>
              <option value="SIMULATOR" className="bg-[#111827]">SIMULATOR</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] font-medium transition-colors"
            >
              Search Trail
            </button>
          </div>
        </div>
      </form>

      {/* Logs Table */}
      {loading ? (
        <LoadingState message="Fetching decision audit trail ledger..." />
      ) : error ? (
        <ErrorState title="Audit Trail Error" message={error} onRetry={loadAuditLogs} />
      ) : logs.length === 0 ? (
        <EmptyState title="No Audit Logs Found" message="No ledger entries match the selected filter criteria." />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#171E2E] border border-[#1E293B] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#111827] border-b border-[#1E293B] text-[#64748B] uppercase font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Details / Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {logs.map((log) => {
                    const actorUpper = (log.actor || '').toUpperCase();
                    return (
                      <tr key={log._id || log.id} className="hover:bg-[#1E293B] transition-colors">
                        <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                          {new Date(log.timestamp || Date.now()).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#60A5FA] whitespace-nowrap">
                          {log.caseId || 'N/A'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            actorUpper.includes('AI') ? 'bg-[#3B82F6]/12 border border-[#3B82F6]/25 text-[#60A5FA]' :
                            actorUpper.includes('POLICY') ? 'bg-[#10B981]/12 border border-[#10B981]/25 text-[#10B981]' :
                            actorUpper.includes('HUMAN') ? 'bg-[#F59E0B]/12 border border-[#F59E0B]/25 text-[#F59E0B]' :
                            'bg-[#111827] border border-[#1E293B] text-[#64748B]'
                          }`}>
                            {log.actor || 'SYSTEM'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#F8FAFC] whitespace-nowrap">
                          {log.action || 'EVENT_LOGGED'}
                        </td>
                        <td className="py-3 px-4 text-[#94A3B8] max-w-xs truncate font-sans">
                          {log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : log.details) : 'State recorded successfully.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-[#64748B] px-2 py-2">
            <span>Showing page {page} of {pages} ({total} audit log records)</span>
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
    </div>
  );
}
