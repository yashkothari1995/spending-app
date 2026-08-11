import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ExpenseFilterBar } from './ExpenseFilterBar';
import { 
  ReceiptText, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  Plus, 
  AlertTriangle, 
  X, 
  Repeat, 
  UserCheck, 
  Users, 
  DollarSign,
  ArrowUpDown
} from 'lucide-react';

export const TransactionList: React.FC = () => {
  const { 
    filteredExpenses, 
    categories, 
    userProfile, 
    openAddExpenseModal, 
    deleteExpense, 
    duplicateExpense 
  } = useApp();

  const [sortKey, setSortKey] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected expense for detailed inspect modal
  const [selectedInspect, setSelectedInspect] = useState<Expense | null>(null);

  // Selected expense for delete confirmation modal
  const [deletingTarget, setDeletingTarget] = useState<Expense | null>(null);
  const [deleteMode, setDeleteMode] = useState<'single' | 'future' | 'all'>('single');

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  const categoryMap = new Map<string, { name: string; icon: string }>();
  categories.forEach((c) => categoryMap.set(c.id, { name: c.name, icon: c.icon }));

  // Sorting
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'date') {
      cmp = a.date.localeCompare(b.date);
    } else if (sortKey === 'amount') {
      cmp = a.totalAmount - b.totalAmount;
    } else if (sortKey === 'description') {
      cmp = a.description.localeCompare(b.description);
    }
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  const toggleSort = (key: 'date' | 'amount' | 'description') => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const confirmDelete = () => {
    if (deletingTarget) {
      deleteExpense(deletingTarget.id, deleteMode);
      setDeletingTarget(null);
    }
  };

  return (
    <div id="transaction-list-container" className="space-y-4 pb-20">
      
      {/* Top Filter Bar */}
      <ExpenseFilterBar />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-bold text-white">
            Transactions ({sortedExpenses.length})
          </h2>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold">Sort by:</span>
          <button
            onClick={() => toggleSort('date')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 backdrop-blur-md ${
              sortKey === 'date' ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 font-bold' : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            <span>Date</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => toggleSort('amount')}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 backdrop-blur-md ${
              sortKey === 'amount' ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 font-bold' : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            <span>Amount</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>

          <button
            id="btn-add-expense-from-list"
            onClick={() => openAddExpenseModal()}
            className="ml-auto sm:ml-2 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Transaction List Cards / Table */}
      {sortedExpenses.length > 0 ? (
        <div id="transactions-cards-list" className="space-y-3">
          {sortedExpenses.map((exp) => {
            const catObj = categoryMap.get(exp.categoryId) || { name: 'Uncategorized', icon: 'MoreHorizontal' };
            
            let paidByLabel = 'I Paid';
            if (exp.paidBy === 'partner') paidByLabel = `${partnerName} Paid`;
            if (exp.paidBy === 'other') paidByLabel = 'Someone Else Paid';

            return (
              <div
                key={exp.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl p-4 shadow-xl transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Category Icon + Description + Date */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                      <CategoryIcon name={catObj.icon} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">
                          {exp.description}
                        </span>

                        {exp.isRecurring && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                            <Repeat className="w-3 h-3" />
                            <span>Recurring</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                        <span>{formatDate(exp.date)}</span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{catObj.name}</span>
                        <span>•</span>
                        <span className="text-teal-400/90 font-medium">{paidByLabel}</span>
                        <span>•</span>
                        <span>Split: {exp.splitCount} {exp.splitCount === 1 ? 'person' : 'people'}</span>
                        {exp.createdByUserName && (
                          <>
                            <span>•</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 border border-white/10">
                              By {exp.createdByUserName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts & Quick Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                    
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-extrabold text-white">
                        {formatCurrency(exp.totalAmount, userProfile.currency)}
                      </div>
                      <div className="text-xs text-teal-400 font-semibold">
                        My share: {formatCurrency(exp.myShare, userProfile.currency)}
                      </div>
                    </div>

                    {/* Action Icon Menu */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                      <button
                        onClick={() => setSelectedInspect(exp)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        title="View Full Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openAddExpenseModal(exp)}
                        className="p-1.5 text-slate-400 hover:text-teal-400 rounded-lg hover:bg-white/10 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => duplicateExpense(exp)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/10 transition-colors"
                        title="Duplicate Expense"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingTarget(exp)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center text-slate-500 shadow-xl">
          <ReceiptText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-slate-300 mb-1">No Transactions Found</h3>
          <p className="text-xs mb-4">Try adjusting your date range or active filters.</p>
          <button
            onClick={() => openAddExpenseModal()}
            className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 shadow-lg shadow-teal-500/20"
          >
            Add New Expense
          </button>
        </div>
      )}

      {/* Inspect Detail Modal */}
      {selectedInspect && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base">Expense Breakdown Details</h3>
              </div>
              <button
                onClick={() => setSelectedInspect(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expense Name</span>
                <span className="text-sm font-bold text-white">{selectedInspect.description}</span>
                <span className="text-slate-400 block mt-1">{formatDate(selectedInspect.date)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Total Cost</span>
                  <span className="text-base font-extrabold text-white">{formatCurrency(selectedInspect.totalAmount, userProfile.currency)}</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Split Method</span>
                  <span className="text-sm font-bold text-teal-300 capitalize">{selectedInspect.splitMethod} ({selectedInspect.splitCount} people)</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Who Paid vs Shares</span>
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>I Paid:</span>
                  <span className="font-bold text-teal-400">{formatCurrency(selectedInspect.paidByMe, userProfile.currency)}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span>My Share:</span>
                  <span className="font-bold text-white">{formatCurrency(selectedInspect.myShare, userProfile.currency)}</span>
                </div>

                {userProfile.hasPartner && (
                  <>
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>{partnerName} Paid:</span>
                      <span className="font-bold text-cyan-300">{formatCurrency(selectedInspect.paidByPartner, userProfile.currency)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>{partnerName}'s Share:</span>
                      <span className="font-bold text-cyan-200">{formatCurrency(selectedInspect.partnerShare, userProfile.currency)}</span>
                    </div>
                  </>
                )}

                {selectedInspect.notes && (
                  <div className="pt-1 text-slate-400 italic">
                    Notes: {selectedInspect.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedInspect(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-rose-400 border-b border-white/10 pb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base">Delete Expense Confirmation</h3>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete <strong className="text-white">"{deletingTarget.description}"</strong>?
            </p>

            {deletingTarget.isRecurring && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-2 text-xs">
                <span className="font-semibold text-purple-300 block">This is part of a recurring series:</span>
                <div className="space-y-1">
                  {[
                    { id: 'single', label: 'Delete this occurrence only' },
                    { id: 'future', label: 'Delete this and future occurrences' },
                    { id: 'all', label: 'Delete entire recurring series' },
                  ].map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteMode"
                        value={m.id}
                        checked={deleteMode === m.id}
                        onChange={() => setDeleteMode(m.id as 'single' | 'future' | 'all')}
                        className="text-rose-500 focus:ring-rose-500"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingTarget(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 shadow-md shadow-rose-500/20"
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
