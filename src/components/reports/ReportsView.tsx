import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { exportExpensesToCSV } from '../../utils/export';
import { CategoryIcon } from '../common/CategoryIcon';
import { BarChart3, Download, PieChart, Users, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { filteredExpenses, categories, userProfile, activeDateRange } = useApp();

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  const categoryMap = new Map<string, { name: string; icon: string }>();
  categories.forEach((c) => categoryMap.set(c.id, { name: c.name, icon: c.icon }));

  // Financial statistics calculation
  const stats = useMemo(() => {
    let totalSpend = 0;
    let myShareTotal = 0;
    let partnerShareTotal = 0;
    let paidByMeTotal = 0;
    let paidByPartnerTotal = 0;
    let recurringTotal = 0;
    let oneTimeTotal = 0;

    const catTotals = new Map<string, number>();

    filteredExpenses.forEach((exp) => {
      totalSpend += exp.totalAmount;
      myShareTotal += exp.myShare;
      partnerShareTotal += exp.partnerShare;
      paidByMeTotal += exp.paidByMe;
      paidByPartnerTotal += exp.paidByPartner;

      if (exp.isRecurring) {
        recurringTotal += exp.totalAmount;
      } else {
        oneTimeTotal += exp.totalAmount;
      }

      catTotals.set(exp.categoryId, (catTotals.get(exp.categoryId) || 0) + exp.totalAmount);
    });

    const catRanked = Array.from(catTotals.entries())
      .map(([catId, amt]) => ({
        catId,
        name: categoryMap.get(catId)?.name || 'Uncategorized',
        icon: categoryMap.get(catId)?.icon || 'MoreHorizontal',
        amount: amt,
        pct: totalSpend > 0 ? (amt / totalSpend) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalSpend,
      myShareTotal,
      partnerShareTotal,
      paidByMeTotal,
      paidByPartnerTotal,
      recurringTotal,
      oneTimeTotal,
      catRanked,
    };
  }, [filteredExpenses, categoryMap]);

  return (
    <div id="reports-view-container" className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Financial Analytics & Reports</h1>
            <p className="text-xs text-slate-400">
              Period: {activeDateRange.startDate} to {activeDateRange.endDate}
            </p>
          </div>
        </div>

        <button
          onClick={() => exportExpensesToCSV(filteredExpenses, categories, userProfile)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-emerald-400 shadow-md transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Full Report (CSV)</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Total Period Spend</span>
          <span className="text-2xl font-extrabold text-white">{formatCurrency(stats.totalSpend, userProfile.currency)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">{filteredExpenses.length} transactions</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">My Total Share</span>
          <span className="text-2xl font-extrabold text-emerald-400">{formatCurrency(stats.myShareTotal, userProfile.currency)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {stats.totalSpend > 0 ? `${((stats.myShareTotal / stats.totalSpend) * 100).toFixed(1)}% of total` : '0%'}
          </span>
        </div>

        {userProfile.hasPartner && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">{partnerName}'s Total Share</span>
            <span className="text-2xl font-extrabold text-teal-300">{formatCurrency(stats.partnerShareTotal, userProfile.currency)}</span>
            <span className="text-[10px] text-slate-500 block mt-1">
              {stats.totalSpend > 0 ? `${((stats.partnerShareTotal / stats.totalSpend) * 100).toFixed(1)}% of total` : '0%'}
            </span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Recurring vs One-Time</span>
          <div className="text-sm font-bold text-white mt-1">
            <span className="text-purple-400">{formatCurrency(stats.recurringTotal, userProfile.currency)}</span> / <span className="text-slate-300">{formatCurrency(stats.oneTimeTotal, userProfile.currency)}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Recurring / One-Time</span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-emerald-400" />
          <span>Category Spending Report</span>
        </h3>

        {stats.catRanked.length > 0 ? (
          <div className="space-y-3">
            {stats.catRanked.map((cat) => (
              <div key={cat.catId} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CategoryIcon name={cat.icon} className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-white">{formatCurrency(cat.amount, userProfile.currency)}</span>
                    <span className="text-slate-400 text-[10px] block">({cat.pct.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No expenses recorded for this period report.
          </div>
        )}
      </div>

    </div>
  );
};
