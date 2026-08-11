import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { Target, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';

export const BudgetWidget: React.FC = () => {
  const { budget, dashboardTotals, userProfile, setActiveTab } = useApp();

  const totalSpent = dashboardTotals.totalSpend;
  const totalBudget = budget.totalBudget || 5000;
  const remaining = totalBudget - totalSpent;
  const pct = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  const isOver = totalSpent > totalBudget;
  const isWarning = pct >= 80 && !isOver;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Monthly Budget Progress</h3>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Tracking against your total limit of {formatCurrency(totalBudget, userProfile.currency)}
        </p>

        {/* Big Meter Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Spent: {formatCurrency(totalSpent, userProfile.currency)}</span>
            <span className={`font-bold ${isOver ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-teal-400'}`}>
              {pct}% Used
            </span>
          </div>

          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 backdrop-blur-sm">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-teal-400'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Limit: {formatCurrency(totalBudget, userProfile.currency)}</span>
            <span className={remaining < 0 ? 'text-rose-400 font-bold' : 'text-teal-400 font-bold'}>
              {remaining >= 0 ? `${formatCurrency(remaining, userProfile.currency)} remaining` : `${formatCurrency(Math.abs(remaining), userProfile.currency)} over budget`}
            </span>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 backdrop-blur-sm ${
          isOver
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : isWarning
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-teal-500/10 border-teal-500/30 text-teal-300'
        }`}>
          {isOver ? (
            <>
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Exceeded monthly budget by {formatCurrency(Math.abs(remaining), userProfile.currency)}. Review spending breakdown!</span>
            </>
          ) : isWarning ? (
            <>
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Approaching budget limit (80%+ reached). Only {formatCurrency(remaining, userProfile.currency)} remaining.</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 shrink-0 text-teal-400" />
              <span>Healthy spending pace! You are comfortably under your monthly limit.</span>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
