import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { TaskForm } from './components/TaskForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastContainer } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/Tasks';
import { FocusPage } from './pages/Focus';
import { PlannerPage } from './pages/Planner';
import { InsightsPage } from './pages/Insights';

const AppShell: React.FC = () => {
  const { currentPage } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActivePage = () => {
    switch (currentPage) {
      case 'overview':
        return <Dashboard />;
      case 'tasks':
        return <TasksPage />;
      case 'focus':
        return <FocusPage />;
      case 'planner':
        return <PlannerPage />;
      case 'insights':
        return <InsightsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#101112] text-[#F7F7F5] flex font-sans selection:bg-[#FFD166]/20 selection:text-[#FFD166]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Dialogs & Toast Notifications */}
      <TaskForm />
      <ConfirmDialog />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
