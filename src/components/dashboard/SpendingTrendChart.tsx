import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

type TrendMetric = 'totalAmount' | 'myShare' | 'familyShare' | 'paidByMe' | 'paidByPartner';
type GroupBy = 'day' | 'week' | 'month';

export const SpendingTrendChart: React.FC = () => {
  const { filteredExpenses, userProfile } = useApp();
  const [metric, setMetric] = useState<TrendMetric>('totalAmount');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  const chartData = useMemo(() => {
    if (filteredExpenses.length === 0) return [];

    const map = new Map<string, number>();

    filteredExpenses.forEach((exp) => {
      let key = exp.date; // YYYY-MM-DD
      if (groupBy === 'month') {
        key = exp.date.substring(0, 7); // YYYY-MM
      } else if (groupBy === 'week') {
        const d = new Date(exp.date + 'T00:00:00');
        const day = d.getDay();
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - day);
        key = startOfWeek.toISOString().substring(0, 10);
      }

      const val = exp[metric] || 0;
      map.set(key, (map.get(key) || 0) + val);
    });

    const sortedKeys = Array.from(map.keys()).sort();

    return sortedKeys.map((k) => ({
      dateKey: k,
      label: groupBy === 'month' ? k : formatShortDate(k),
      value: Number((map.get(k) || 0).toFixed(2)),
    }));
  }, [filteredExpenses, metric, groupBy]);

  const metricLabels: Record<TrendMetric, string> = {
    totalAmount: 'Total Spend',
    myShare: 'My Share',
    familyShare: 'Family Share',
    paidByMe: 'Amount I Paid',
    paidByPartner: `${partnerName} Paid`,
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Spending Trend</h3>
          </div>
          <p className="text-xs text-slate-400">
            Analyze velocity and payment trends over time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as TrendMetric)}
            className="bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-400 backdrop-blur-md"
          >
            <option value="totalAmount" className="bg-slate-900">Total Spend</option>
            <option value="myShare" className="bg-slate-900">My Share</option>
            <option value="familyShare" className="bg-slate-900">Family Share</option>
            <option value="paidByMe" className="bg-slate-900">I Paid</option>
            {userProfile.hasPartner && <option value="paidByPartner" className="bg-slate-900">{partnerName} Paid</option>}
          </select>

          {/* Grouping Toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            {(['day', 'week', 'month'] as GroupBy[]).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors ${
                  groupBy === g
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[260px] w-full pt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs">
                        <span className="text-slate-400 font-medium block mb-1">{data.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="text-white font-bold">{metricLabels[metric]}:</span>
                          <span className="text-emerald-400 font-extrabold">{formatCurrency(data.value, userProfile.currency)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#spendingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
            <Calendar className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-xs">No transactions available in this period</p>
          </div>
        )}
      </div>

    </div>
  );
};
