import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { PieChart as PieIcon, ArrowRight } from 'lucide-react';

type CatMetric = 'totalAmount' | 'myShare' | 'familyShare' | 'paidByMe';

const COLOR_PALETTE = [
  '#10b981', '#14b8a6', '#06b6d4', '#0284c7', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', 
  '#f43f5e', '#f97316', '#eab308', '#84cc16'
];

export const CategoryBreakdownChart: React.FC = () => {
  const { filteredExpenses, categories, userProfile, setFilters, setActiveTab } = useApp();
  const [metric, setMetric] = useState<CatMetric>('totalAmount');

  const categoryMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon: string; amount: number }>();
    categories.forEach((c) => {
      map.set(c.id, { id: c.id, name: c.name, icon: c.icon, amount: 0 });
    });

    let periodTotal = 0;

    filteredExpenses.forEach((exp) => {
      const val = exp[metric] || 0;
      periodTotal += val;
      const current = map.get(exp.categoryId) || { id: exp.categoryId, name: 'Other', icon: 'MoreHorizontal', amount: 0 };
      current.amount += val;
      map.set(exp.categoryId, current);
    });

    const items = Array.from(map.values())
      .filter((i) => i.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return { items, periodTotal };
  }, [filteredExpenses, categories, metric]);

  const handleCategoryClick = (catId: string) => {
    setFilters((prev) => ({ ...prev, categoryId: catId }));
    setActiveTab('transactions');
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Category Breakdown</h3>
          </div>
          <p className="text-xs text-slate-400">
            Where your money is allocated by category
          </p>
        </div>

        {/* Metric Selector */}
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as CatMetric)}
          className="bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-400 backdrop-blur-md"
        >
          <option value="totalAmount" className="bg-slate-900">Total Spend</option>
          <option value="myShare" className="bg-slate-900">My Share</option>
          <option value="familyShare" className="bg-slate-900">Family Share</option>
          <option value="paidByMe" className="bg-slate-900">Amount I Paid</option>
        </select>
      </div>

      {/* Chart & List Container */}
      {categoryMap.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center flex-1">
          
          {/* Donut Chart */}
          <div className="h-[200px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryMap.items}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categoryMap.items.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.id}`} 
                      fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} 
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                      onClick={() => handleCategoryClick(entry.id)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = categoryMap.periodTotal > 0 ? ((data.amount / categoryMap.periodTotal) * 100).toFixed(1) : 0;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs">
                          <span className="font-bold text-white block">{data.name}</span>
                          <span className="text-emerald-400 font-extrabold">{formatCurrency(data.amount, userProfile.currency)}</span>
                          <span className="text-slate-400 text-[10px] block">({pct}% of period total)</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-sm font-extrabold text-white">
                {formatCurrency(categoryMap.periodTotal, userProfile.currency)}
              </span>
            </div>
          </div>

          {/* Top Categories Progress List */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {categoryMap.items.slice(0, 6).map((cat, idx) => {
              const pct = categoryMap.periodTotal > 0 ? ((cat.amount / categoryMap.periodTotal) * 100) : 0;
              const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-slate-300" />
                      <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        {formatCurrency(cat.amount, userProfile.currency)}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
          <PieIcon className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-xs">No category expenses in this period</p>
        </div>
      )}

    </div>
  );
};
