import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { Search, Filter, History, ChevronLeft, ChevronRight, Cpu, User, ShieldCheck } from 'lucide-react';

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
    switch (actor) {
      case 'ai_engine':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[11px]">
            <Cpu className="w-3 h-3" />
            <span>ai_engine</span>
          </span>
        );
      case 'merchant':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[11px]">
            <User className="w-3 h-3" />
            <span>merchant</span>
          </span>
        );
      case 'system':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
            <ShieldCheck className="w-3 h-3" />
            <span>system</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-white">Immutable Decision Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Complete audit log of all automated AI decisions, merchant policy checks, and system interventions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search message, case..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48 md:w-64"
            />
          </form>

          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actorFilter}
              onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-slate-200 focus:outline-none capitalize text-xs"
            >
              <option value="all" className="bg-slate-900">All Actors</option>
              <option value="system" className="bg-slate-900">System</option>
              <option value="ai_engine" className="bg-slate-900">AI Engine</option>
              <option value="merchant" className="bg-slate-900">Merchant</option>
              <option value="customer" className="bg-slate-900">Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingState message="Fetching audit trail events..." />
      ) : error ? (
        <ErrorState title="Error Loading Audit Logs" message={error} onRetry={loadAuditLogs} />
      ) : logs.length === 0 ? (
        <EmptyState title="No Audit Records Found" message="No audit entries match the current filter or search criteria." />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-850/50 transition-colors font-sans">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {getActorBadge(log.actor)}
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-400 font-medium">
                      {log.caseId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] uppercase">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-2">
            <span>Showing page {page} of {pages} ({total} total entries)</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-300" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
