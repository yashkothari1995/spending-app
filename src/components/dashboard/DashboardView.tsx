import React from 'react';
import { useApp } from '../../context/AppContext';
import { SummaryCards } from './SummaryCards';
import { SpendingTrendChart } from './SpendingTrendChart';
import { CategoryBreakdownChart } from './CategoryBreakdownChart';
import { PartnerBalanceCard } from './PartnerBalanceCard';
import { UpcomingWidget } from './UpcomingWidget';
import { BudgetWidget } from './BudgetWidget';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ReceiptText, ArrowRight, Plus } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { filteredExpenses, categories, userProfile, openAddExpenseModal, setActiveTab, authUser, loginWithGoogle } = useApp();

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  const categoryMap = new Map<string, { name: string; icon: string }>();
  categories.forEach((c) => categoryMap.set(c.id, { name: c.name, icon: c.icon }));

  const recentExpenses = filteredExpenses.slice(0, 5);

  return (
    <div id="dashboard-view-container" className="space-y-6 pb-20">
      
      {/* Unauthenticated Production Banner */}
      {!authUser && (
        <div id="auth-production-banner" className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider">Production Security & Sync Ready</h3>
            </div>
            <p className="text-white text-base font-extrabold">Sign in with Google for Private Cloud Backup</p>
            <p className="text-xs text-slate-300 max-w-xl">
              Your data is completely isolated using Firebase Security Rules — no one else can read or write your personal expense records.
            </p>
          </div>
          <button
            id="btn-banner-google-signin"
            onClick={loginWithGoogle}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-xl hover:scale-105 active:scale-95 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}

      <SummaryCards />

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrendChart />
        <CategoryBreakdownChart />
      </div>

      {/* Supporting Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {userProfile.hasPartner && <PartnerBalanceCard />}
        <UpcomingWidget />
        <BudgetWidget />
      </div>

      {/* Recent Transactions Table Preview */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddExpenseModal()}
              className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <span>View All ({filteredExpenses.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Expense</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Who Paid</th>
                  <th className="py-3 px-3 text-right">Total Cost</th>
                  <th className="py-3 px-3 text-right">My Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentExpenses.map((exp) => {
                  const catObj = categoryMap.get(exp.categoryId) || { name: 'Other', icon: 'MoreHorizontal' };
                  
                  let paidByLabel = 'I Paid';
                  if (exp.paidBy === 'partner') paidByLabel = `${partnerName} Paid`;
                  if (exp.paidBy === 'other') paidByLabel = 'Someone else';

                  return (
                    <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-400 whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>

                      <td className="py-3 px-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{exp.description}</span>
                          {exp.isRecurring && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded">
                              Recurring
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px]">
                          <CategoryIcon name={catObj.icon} className="w-3.5 h-3.5 text-teal-400" />
                          <span>{catObj.name}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {paidByLabel}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatCurrency(exp.totalAmount, userProfile.currency)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-teal-400">
                        {formatCurrency(exp.myShare, userProfile.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No expenses recorded in this period. Click "+ Add Expense" to log one!
          </div>
        )}
      </div>

    </div>
  );
};
