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
  const { filteredExpenses, categories, userProfile, openAddExpenseModal, setActiveTab } = useApp();

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  const categoryMap = new Map<string, { name: string; icon: string }>();
  categories.forEach((c) => categoryMap.set(c.id, { name: c.name, icon: c.icon }));

  const recentExpenses = filteredExpenses.slice(0, 5);

  return (
    <div id="dashboard-view-container" className="space-y-6 pb-20">
      
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
