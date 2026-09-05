import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import GlobalSearchModal from '../common/GlobalSearchModal';
import SimulatorDrawer from '../common/SimulatorDrawer';

export default function AppShell({ children, onCaseUpdated }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B10] text-[#F8FAFC] font-['Inter',sans-serif] flex flex-row overflow-x-hidden selection:bg-[#2563EB]/30 selection:text-white">
      {/* 1. SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navigation */}
        <TopNav
          onOpenSearch={() => setSearchOpen(true)}
          onOpenSimulator={() => setSimulatorOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* 3. GLOBAL SEARCH MODAL (Cmd + K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* 4. SIMULATOR DRAWER (+ Simulate Failure) */}
      <SimulatorDrawer
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        onCaseUpdated={onCaseUpdated}
      />
    </div>
  );
}
