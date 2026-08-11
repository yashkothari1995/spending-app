import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Target, AlertTriangle, CheckCircle, Plus, Edit2, Save } from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { budget, updateBudget, filteredExpenses, categories, userProfile } = useApp();

  const [totalBudgetInput, setTotalBudgetInput] = useState<number | ''>(budget.totalBudget);
  const [isEditingTotal, setIsEditingTotal] = useState(false);

  // Category budget map
  const categoryBudgetMap = new Map<string, number>();
  budget.categoryBudgets.forEach((cb) => categoryBudgetMap.set(cb.categoryId, cb.amount));

  // Category spent map
  const categorySpentMap = new Map<string, number>();
  let overallSpent = 0;
  filteredExpenses.forEach((exp) => {
    overallSpent += exp.totalAmount;
    categorySpentMap.set(exp.categoryId, (categorySpentMap.get(exp.categoryId) || 0) + exp.totalAmount);
  });

  const categoryMap = new Map<string, { name: string; icon: string }>();
  categories.forEach((c) => categoryMap.set(c.id, { name: c.name, icon: c.icon }));

  const handleSaveTotalBudget = () => {
    if (Number(totalBudgetInput) > 0) {
      updateBudget({
        ...budget,
        totalBudget: Number(totalBudgetInput),
      });
      setIsEditingTotal(false);
    }
  };

  const handleUpdateCategoryBudget = (catId: string, amount: number) => {
    const nextCatBudgets = budget.categoryBudgets.filter((cb) => cb.categoryId !== catId);
    if (amount > 0) {
      nextCatBudgets.push({ categoryId: catId, amount });
    }
    updateBudget({
      ...budget,
      categoryBudgets: nextCatBudgets,
    });
  };

  const totalBudget = budget.totalBudget || 5000;
  const remainingTotal = totalBudget - overallSpent;
  const overallPct = Math.min(100, Math.round((overallSpent / totalBudget) * 100));

  return (
    <div id="budget-view-container" className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Monthly Spending Budgets</h1>
              <p className="text-xs text-slate-400">
                Set total and category-level limits to avoid overspending
              </p>
            </div>
          </div>

          {/* Edit Overall Budget Trigger */}
          {isEditingTotal ? (
            <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
              <input
                type="number"
                value={totalBudgetInput}
                onChange={(e) => setTotalBudgetInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
              />
              <button
                onClick={handleSaveTotalBudget}
                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTotal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Set Overall Limit</span>
            </button>
          )}
        </div>

        {/* Overall Progress Banner */}
        <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Overall Monthly Target</span>
            <span className="text-amber-400">{formatCurrency(overallSpent, userProfile.currency)} / {formatCurrency(totalBudget, userProfile.currency)} ({overallPct}%)</span>
          </div>

          <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallSpent > totalBudget ? 'bg-rose-500' : overallPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${overallPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {remainingTotal >= 0 ? `${formatCurrency(remainingTotal, userProfile.currency)} remaining in budget` : `${formatCurrency(Math.abs(remainingTotal), userProfile.currency)} over budget!`}
            </span>
            <span className="text-slate-400">{100 - overallPct}% buffer left</span>
          </div>
        </div>
      </div>

      {/* Category Level Budgets Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <span>Category Budgets & Progress</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catBudget = categoryBudgetMap.get(cat.id) || 0;
            const spent = categorySpentMap.get(cat.id) || 0;
            const pct = catBudget > 0 ? Math.min(100, Math.round((spent / catBudget) * 100)) : 0;
            const isOver = catBudget > 0 && spent > catBudget;
            const isWarning = catBudget > 0 && pct >= 80 && !isOver;

            return (
              <div
                key={cat.id}
                className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{cat.name}</h4>
                      <span className="text-[10px] text-slate-400">
                        {catBudget > 0 ? `${formatCurrency(spent, userProfile.currency)} of ${formatCurrency(catBudget, userProfile.currency)}` : 'No budget set'}
                      </span>
                    </div>
                  </div>

                  {/* Inline Budget Set / Edit */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Set $"
                      defaultValue={catBudget > 0 ? catBudget : ''}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        handleUpdateCategoryBudget(cat.id, isNaN(val) ? 0 : val);
                      }}
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Progress Bar if budget > 0 */}
                {catBudget > 0 && (
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className={isOver ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                        {pct}% used
                      </span>
                      <span className="text-slate-400">
                        {spent > catBudget ? `${formatCurrency(spent - catBudget, userProfile.currency)} over` : `${formatCurrency(catBudget - spent, userProfile.currency)} left`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
