import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import RecoveryCasesPage from './pages/RecoveryCasesPage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import ExperimentsPage from './pages/ExperimentsPage';
import PoliciesPage from './pages/PoliciesPage';
import AuditLogsPage from './pages/AuditLogsPage';
import { checkBackendHealth, checkMlServiceHealth } from './services/api';

function DashboardLayout({ backendHealth, mlHealth }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-['Inter',sans-serif]">
      <Header
        backendHealth={backendHealth}
        mlHealth={mlHealth}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />
      <div className="flex flex-1 relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

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
      <Routes>
        {/* Public Home / Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Application Dashboard Routes */}
        <Route element={<DashboardLayout backendHealth={backendHealth} mlHealth={mlHealth} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<RecoveryCasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailsPage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
