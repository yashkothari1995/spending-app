import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatShortDate, getTodayDateString } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const UpcomingWidget: React.FC = () => {
  const { recurringExpenses, categories, userProfile, setActiveTab } = useApp();
  const todayStr = getTodayDateString();

  const categoryMap = useMemo(() => {
    const map = new Map<string, { icon: string; name: string }>();
    categories.forEach((c) => map.set(c.id, { icon: c.icon, name: c.name }));
    return map;
  }, [categories]);

  // Upcoming items sorted by nextPaymentDate
  const upcomingList = useMemo(() => {
    return recurringExpenses
      .filter((r) => r.status === 'active' && r.nextPaymentDate >= todayStr)
      .sort((a, b) => (a.nextPaymentDate < b.nextPaymentDate ? -1 : 1))
      .slice(0, 5);
  }, [recurringExpenses, todayStr]);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Upcoming Bills & Subscriptions</h3>
          </div>
          <button
            onClick={() => setActiveTab('recurring')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Scheduled recurring charges due soon
        </p>

        {upcomingList.length > 0 ? (
          <div className="space-y-2.5">
            {upcomingList.map((rec) => {
              const catObj = categoryMap.get(rec.categoryId) || { icon: 'MoreHorizontal', name: 'Other' };
              
              // Days remaining calculation
              const diffMs = new Date(rec.nextPaymentDate + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={rec.id}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <CategoryIcon name={catObj.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-white block truncate max-w-[150px] sm:max-w-[200px]">
                        {rec.description}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {rec.frequency} • {catObj.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-xs text-white block">
                      {formatCurrency(rec.amount, userProfile.currency)}
                    </span>
                    <span className="text-[10px] text-purple-300 font-medium bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      {diffDays === 0 ? 'Due Today' : diffDays === 1 ? 'Due Tomorrow' : `Due in ${diffDays} days (${formatShortDate(rec.nextPaymentDate)})`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No upcoming recurring bills in immediate queue</p>
          </div>
        )}
      </div>

    </div>
  );
};
