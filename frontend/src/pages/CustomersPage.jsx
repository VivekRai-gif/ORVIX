import React, { useEffect, useState } from 'react';
import { fetchCustomers, fetchCustomerById } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import ActionBadge from '../components/ActionBadge';
import { formatCompactINR, formatFullINR } from '../utils/formatters';
import { Users, Search, ArrowRight, User, X, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('all');
  const [selectedCust, setSelectedCust] = useState(null);
  const [custDetails, setCustDetails] = useState(null);
  const [custLoading, setCustLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCustomers({ search, segment, limit: 30 });
      setCustomers(res.customers || []);
    } catch (err) {
      setError('Failed to fetch customer recovery profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, segment]);

  const handleInspectCustomer = async (cust) => {
    setSelectedCust(cust);
    setCustLoading(true);
    try {
      const res = await fetchCustomerById(cust.customerId);
      setCustDetails(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCustLoading(false);
    }
  };

  if (loading) return <LoadingState message="Fetching customer recovery intelligence..." />;
  if (error) return <ErrorState title="Customers Unavailable" message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1E2638]">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#60A5FA]" />
            <h2 className="text-2xl font-bold font-['Outfit'] text-[#F8FAFC]">Customer Recovery Intelligence</h2>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Customer context profiles, segment distributions, and historical recovery rates.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111622] p-4 rounded-xl border border-[#1E2638] text-xs font-mono">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter customers by ID or segment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#090C14] border border-[#1E2638] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="p-2 bg-[#090C14] border border-[#1E2638] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
        >
          <option value="all">All Segments</option>
          <option value="returning">RETURNING</option>
          <option value="b2b">B2B</option>
          <option value="price_sensitive">PRICE_SENSITIVE</option>
          <option value="new">NEW</option>
          <option value="high_value">HIGH_VALUE</option>
        </select>
      </div>

      {/* Customer Table */}
      <div className="rounded-xl bg-[#111622] border border-[#1E2638] p-5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E2638] text-[#64748B] uppercase font-semibold">
                <th className="py-3 px-3">Customer ID</th>
                <th className="py-3 px-3">Segment</th>
                <th className="py-3 px-3 text-center">Successful</th>
                <th className="py-3 px-3 text-center">Failed</th>
                <th className="py-3 px-3 text-right">Revenue at Risk</th>
                <th className="py-3 px-3 text-right">Recovered</th>
                <th className="py-3 px-3 text-center">Historical Rate</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]">
              {customers.map((c) => (
                <tr key={c.customerId} className="hover:bg-[#161B26] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-[#60A5FA]">{c.customerId}</td>
                  <td className="py-3.5 px-3 uppercase text-[#F8FAFC]">{c.segment}</td>
                  <td className="py-3.5 px-3 text-center text-[#10B981] font-bold">{c.previousSuccessfulPayments || 0}</td>
                  <td className="py-3.5 px-3 text-center text-[#EF4444] font-bold">{c.previousFailedPayments || 0}</td>
                  <td className="py-3.5 px-3 text-right text-[#F8FAFC]">{formatFullINR(c.atRiskAmount || 0)}</td>
                  <td className="py-3.5 px-3 text-right text-[#10B981] font-bold">{formatFullINR(c.recoveredAmount || 0)}</td>
                  <td className="py-3.5 px-3 text-center text-[#60A5FA] font-bold">
                    {((c.historicalRecoveryRate || 0.65) * 100).toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleInspectCustomer(c)}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB]/20 text-[#60A5FA] hover:bg-[#2563EB] hover:text-white transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Quick View Drawer */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-[#05070A]/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-[#111622] border-l border-[#1E2638] h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="p-5 border-b border-[#1E2638] flex items-center justify-between bg-[#0D111A]">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-[#60A5FA]" />
                <h3 className="font-bold text-base font-['Outfit'] text-[#F8FAFC]">Customer Context: {selectedCust.customerId}</h3>
              </div>
              <button
                onClick={() => setSelectedCust(null)}
                className="p-1.5 rounded-lg bg-[#171E2E] border border-[#1E2638] text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#090C14] border border-[#1E2638] space-y-2">
                <div className="flex justify-between py-1 border-b border-[#1E2638]">
                  <span className="text-[#64748B]">Segment:</span>
                  <span className="text-[#F8FAFC] uppercase font-bold">{selectedCust.segment}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E2638]">
                  <span className="text-[#64748B]">Successful Payments:</span>
                  <span className="text-[#10B981] font-bold">{selectedCust.previousSuccessfulPayments}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E2638]">
                  <span className="text-[#64748B]">Failed Payments:</span>
                  <span className="text-[#EF4444] font-bold">{selectedCust.previousFailedPayments}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Historical Recovery Rate:</span>
                  <span className="text-[#60A5FA] font-bold">{((selectedCust.historicalRecoveryRate || 0.65) * 100).toFixed(0)}%</span>
                </div>
              </div>

              {custLoading ? (
                <div className="py-6 text-center text-[#64748B] animate-pulse">Loading payment history...</div>
              ) : custDetails?.cases && custDetails.cases.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase">Associated Recovery Cases</div>
                  <div className="space-y-2">
                    {custDetails.cases.map(c => (
                      <Link
                        key={c.caseId}
                        to={`/cases/${c.caseId}`}
                        onClick={() => setSelectedCust(null)}
                        className="block p-3 rounded-xl bg-[#090C14] border border-[#1E2638] hover:border-[#3B82F6] transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-[#60A5FA]">
                          <span>{c.caseId}</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="flex items-center justify-between text-[#94A3B8]">
                          <span>{c.failureReason}</span>
                          <span className="text-[#F8FAFC]">{formatFullINR(c.amount)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-[#94A3B8]">No active cases for this customer.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
