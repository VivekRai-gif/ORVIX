import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerRecoveryPage from './pages/CustomerRecoveryPage';

// Redesigned Pages
import DashboardPage from './pages/DashboardPage';
import RecoveryCasesPage from './pages/RecoveryCasesPage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import CustomersPage from './pages/CustomersPage';
import PerformancePage from './pages/PerformancePage';
import ExperimentsPage from './pages/ExperimentsPage';
import PoliciesPage from './pages/PoliciesPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SystemHealthPage from './pages/SystemHealthPage';

function ApplicationLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing & Auth & Hosted Customer Recovery Portal Pages */}
        <Route path="/landing" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pay/:id" element={<CustomerRecoveryPage />} />

        {/* Unified Application Workspace Shell */}
        <Route element={<ApplicationLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<RecoveryCasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/system-health" element={<SystemHealthPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
