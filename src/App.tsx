import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionList } from './components/expenses/TransactionList';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { UserAccountModal } from './components/common/UserAccountModal';
import { RecurringView } from './components/recurring/RecurringView';
import { BudgetView } from './components/budgets/BudgetView';
import { SettlementView } from './components/settlements/SettlementView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950 pb-20 lg:pb-8">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Period Selector Header */}
      <Header />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'transactions' && <TransactionList />}
        {activeTab === 'recurring' && <RecurringView />}
        {activeTab === 'budgets' && <BudgetView />}
        {activeTab === 'settlements' && <SettlementView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal />

      {/* User Accounts & User IDs Modal */}
      <UserAccountModal />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
