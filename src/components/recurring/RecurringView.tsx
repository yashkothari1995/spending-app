import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RecurringExpense } from '../../types';
import { calculateMonthlyRecurringEstimate } from '../../utils/calculations';
import { formatCurrency, formatShortDate, getTodayDateString } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { AddRecurringModal } from './AddRecurringModal';
import { 
  Repeat, 
  Plus, 
  Play, 
  Pause, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Tv, 
  Zap, 
  Home, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const RecurringView: React.FC = () => {
  const { 
    recurringExpenses, 
    categories, 
    userProfile, 
    toggleRecurringStatus, 
    deleteRecurringExpense 
  } = useApp();

  const [filterMode, setFilterMode] = useState<'all' | 'due_7' | 'due_30' | 'paused'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringExpense | null>(null);

  const todayStr = getTodayDateString();
  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  const categoryMap = new Map<string, { name: string; icon: string }>();
  categories.forEach((c) => categoryMap.set(c.id, { name: c.name, icon: c.icon }));

  // Monthly summary calculations
  const estimates = useMemo(() => {
    return calculateMonthlyRecurringEstimate(recurringExpenses, userProfile.hasPartner);
  }, [recurringExpenses, userProfile.hasPartner]);

  // Filter list
  const filteredList = useMemo(() => {
    return recurringExpenses.filter((r) => {
      if (filterMode === 'paused') return r.status === 'paused' || r.status === 'ended';

      if (r.status !== 'active') return false;

      if (filterMode === 'due_7') {
        const diffMs = new Date(r.nextPaymentDate + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }

      if (filterMode === 'due_30') {
        const diffMs = new Date(r.nextPaymentDate + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      }

      return true;
    });
  }, [recurringExpenses, filterMode, todayStr]);

  const openNewModal = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rec: RecurringExpense) => {
    setEditingRule(rec);
    setIsModalOpen(true);
  };

  return (
    <div id="recurring-view-container" className="space-y-6 pb-20">
      
      {/* Top Banner & KPI Summaries */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Recurring Expenses & Subscriptions</h1>
            </div>
            <p className="text-xs text-slate-400">
              Manage fixed bills, loans, memberships, and automated subscriptions
            </p>
          </div>

          <button
            id="btn-add-recurring-rule"
            onClick={openNewModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Recurring Expense</span>
          </button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Monthly Recurring Total</span>
            <span className="text-2xl font-extrabold text-white">{formatCurrency(estimates.monthlyTotal, userProfile.currency)}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Est. commitment per month</span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">My Monthly Share</span>
            <span className="text-2xl font-extrabold text-emerald-400">{formatCurrency(estimates.monthlyMyShare, userProfile.currency)}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">My actual cost per month</span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">
              {userProfile.hasPartner ? 'Family Monthly Share' : 'Personal Monthly Share'}
            </span>
            <span className="text-2xl font-extrabold text-teal-300">{formatCurrency(estimates.monthlyFamilyShare, userProfile.currency)}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Combined household share</span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Active Subscriptions</span>
            <span className="text-2xl font-extrabold text-purple-400">{estimates.activeCount} Active</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Automated recurring items</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit overflow-x-auto">
        {[
          { id: 'all', label: 'All Active' },
          { id: 'due_7', label: 'Due in Next 7 Days' },
          { id: 'due_30', label: 'Due in Next 30 Days' },
          { id: 'paused', label: 'Paused / Ended' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterMode === tab.id
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recurring Items Cards Grid */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((rec) => {
            const catObj = categoryMap.get(rec.categoryId) || { name: 'Other', icon: 'MoreHorizontal' };
            const isActive = rec.status === 'active';

            let paidByLabel = 'I Pay';
            if (rec.paidBy === 'partner') paidByLabel = `${partnerName} Pays`;
            if (rec.paidBy === 'other') paidByLabel = 'Someone Else Pays';

            return (
              <div
                key={rec.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg relative flex flex-col justify-between transition-all ${
                  isActive ? 'border-slate-800 hover:border-purple-500/50' : 'border-slate-800/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <CategoryIcon name={catObj.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{rec.description}</h3>
                        <span className="text-[11px] text-slate-400 capitalize">{rec.frequency} • {catObj.name}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {rec.status}
                    </span>
                  </div>

                  {/* Financial Breakdown Box */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Amount:</span>
                      <span className="font-extrabold text-white">{formatCurrency(rec.amount, userProfile.currency)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Who Normally Pays:</span>
                      <span className="font-semibold text-purple-300">{paidByLabel}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">My Share:</span>
                      <span className="font-semibold text-emerald-400">{formatCurrency(rec.myShare, userProfile.currency)}</span>
                    </div>

                    {userProfile.hasPartner && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{partnerName}'s Share:</span>
                        <span className="font-semibold text-teal-300">{formatCurrency(rec.partnerShare, userProfile.currency)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Next: {formatShortDate(rec.nextPaymentDate)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleRecurringStatus(rec.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isActive ? 'Pause' : 'Resume'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(rec)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Edit Template"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteRecurringExpense(rec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      title="Delete Recurring Series"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <Repeat className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <h3 className="text-base font-bold text-slate-300 mb-1">No Recurring Expenses Found</h3>
          <p className="text-xs mb-4">No subscriptions match this filter criteria.</p>
          <button
            onClick={openNewModal}
            className="px-4 py-2 bg-purple-500 text-white font-bold text-xs rounded-xl hover:bg-purple-600"
          >
            Add Recurring Expense
          </button>
        </div>
      )}

      {/* Add / Edit Recurring Modal */}
      <AddRecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recurringToEdit={editingRule}
      />

    </div>
  );
};
