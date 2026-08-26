import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import RecoveryCasesPage from './pages/RecoveryCasesPage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import ExperimentsPage from './pages/ExperimentsPage';
import PoliciesPage from './pages/PoliciesPage';
import AuditLogsPage from './pages/AuditLogsPage';
import { checkBackendHealth, checkMlServiceHealth } from './services/api';

export default function App() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [mlHealth, setMlHealth] = useState(null);

  useEffect(() => {
    const checkAllHealth = async () => {
      const be = await checkBackendHealth();
      const ml = await checkMlServiceHealth();
      setBackendHealth(be);
      setMlHealth(ml);
    };
    checkAllHealth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-['Inter',sans-serif]">
        <Header backendHealth={backendHealth} mlHealth={mlHealth} />
        
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/cases" element={<RecoveryCasesPage />} />
              <Route path="/cases/:id" element={<CaseDetailsPage />} />
              <Route path="/experiments" element={<ExperimentsPage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
