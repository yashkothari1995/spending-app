import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Expense, 
  PaidByOption, 
  SplitMethod, 
  ExpenseType, 
  RecurrenceFrequency 
} from '../../types';
import { computeShares } from '../../utils/calculations';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  X, 
  Plus, 
  AlertCircle, 
  Repeat, 
  UserCheck, 
  Users, 
  DollarSign, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Tag
} from 'lucide-react';

export const AddExpenseModal: React.FC = () => {
  const { 
    isAddExpenseOpen, 
    setIsAddExpenseOpen, 
    editingExpense, 
    setEditingExpense, 
    categories, 
    userProfile, 
    addExpense, 
    updateExpense,
    addRecurringExpense,
    addCustomCategory
  } = useApp();

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  // Form states
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [date, setDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_groceries');
  
  const [paidBy, setPaidBy] = useState<PaidByOption>('me');
  const [splitCount, setSplitCount] = useState<number>(userProfile.hasPartner ? 2 : 1);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');

  const [customMyShare, setCustomMyShare] = useState<number | ''>('');
  const [customPartnerShare, setCustomPartnerShare] = useState<number | ''>('');
  const [customOthersShare, setCustomOthersShare] = useState<number | ''>('');

  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [expenseType, setExpenseType] = useState<ExpenseType>('variable_bill');
  const [notes, setNotes] = useState('');

  // Editing mode for recurring series
  const [recurringEditMode, setRecurringEditMode] = useState<'single' | 'future' | 'all'>('single');

  // Custom Category Creation Sub-Form
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Populate form if editing or opening fresh
  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setTotalAmount(editingExpense.totalAmount);
      setDate(editingExpense.date);
      setCategoryId(editingExpense.categoryId);
      setPaidBy(editingExpense.paidBy);
      setSplitCount(editingExpense.splitCount);
      setSplitMethod(editingExpense.splitMethod);
      setCustomMyShare(editingExpense.myShare);
      setCustomPartnerShare(editingExpense.partnerShare);
      setCustomOthersShare(editingExpense.othersShare);
      setIsRecurring(editingExpense.isRecurring);
      setExpenseType(editingExpense.expenseType || 'variable_bill');
      setNotes(editingExpense.notes || '');
    } else {
      // Reset defaults
      setDescription('');
      setTotalAmount('');
      setDate(getTodayDateString());
      setCategoryId(categories[0]?.id || 'cat_groceries');
      setPaidBy('me');
      setSplitCount(userProfile.hasPartner ? 2 : 1);
      setSplitMethod('equal');
      setCustomMyShare('');
      setCustomPartnerShare('');
      setCustomOthersShare('');
      setIsRecurring(false);
      setFrequency('monthly');
      setExpenseType('variable_bill');
      setNotes('');
    }
  }, [editingExpense, isAddExpenseOpen, userProfile.hasPartner, categories]);

  if (!isAddExpenseOpen) return null;

  const numAmount = Math.max(0, Number(totalAmount) || 0);

  // Calculate live shares
  const shares = computeShares(
    numAmount,
    paidBy,
    splitCount,
    splitMethod,
    Number(customMyShare) || 0,
    Number(customPartnerShare) || 0,
    Number(customOthersShare) || 0,
    userProfile.hasPartner
  );

  // Custom split validation
  const customSum = (Number(customMyShare) || 0) + (userProfile.hasPartner ? (Number(customPartnerShare) || 0) : 0) + (Number(customOthersShare) || 0);
  const isCustomSplitValid = splitMethod === 'custom' ? Math.abs(customSum - numAmount) < 0.01 : true;

  const handleClose = () => {
    setIsAddExpenseOpen(false);
    setEditingExpense(null);
  };

  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCustomCategory({
        name: newCatName.trim(),
        icon: 'Tag',
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      });
      setNewCatName('');
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;
    if (splitMethod === 'custom' && !isCustomSplitValid) return;

    if (editingExpense) {
      updateExpense(
        editingExpense.id,
        {
          description: description || 'Untitled Expense',
          totalAmount: numAmount,
          date,
          categoryId,
          paidBy,
          paidByMe: shares.paidByMe,
          paidByPartner: shares.paidByPartner,
          paidByOthers: shares.paidByOthers,
          splitCount,
          splitMethod,
          myShare: shares.myShare,
          partnerShare: shares.partnerShare,
          othersShare: shares.othersShare,
          familyShare: shares.familyShare,
          isRecurring,
          expenseType,
          notes,
        },
        recurringEditMode
      );
    } else {
      addExpense({
        description: description || 'Untitled Expense',
        totalAmount: numAmount,
        date,
        categoryId,
        paidBy,
        paidByMe: shares.paidByMe,
        paidByPartner: shares.paidByPartner,
        paidByOthers: shares.paidByOthers,
        splitCount,
        splitMethod,
        myShare: shares.myShare,
        partnerShare: shares.partnerShare,
        othersShare: shares.othersShare,
        familyShare: shares.familyShare,
        isRecurring,
        expenseType,
        notes,
      });

      // If marked as recurring on creation, also register a recurring template
      if (isRecurring) {
        addRecurringExpense({
          description: description || 'Untitled Expense',
          amount: numAmount,
          frequency,
          categoryId,
          expenseType,
          startDate: date,
          nextPaymentDate: date,
          paidBy,
          splitCount,
          splitMethod,
          myShare: shares.myShare,
          partnerShare: shares.partnerShare,
          othersShare: shares.othersShare,
          status: 'active',
          notes,
        });
      }
    }

    handleClose();
  };

  // Live Net Impact Statement
  const netImpactText = () => {
    if (!userProfile.hasPartner || splitCount === 1) {
      return '100% Personal Spend';
    }
    const partnerOwesMe = shares.partnerShare - shares.paidByPartner;
    if (partnerOwesMe > 0) {
      return `${partnerName} owes you ${formatCurrency(partnerOwesMe, userProfile.currency)}`;
    } else if (partnerOwesMe < 0) {
      return `You owe ${partnerName} ${formatCurrency(Math.abs(partnerOwesMe), userProfile.currency)}`;
    }
    return 'Balanced split (no debt)';
  };

  return (
    <div id="add-expense-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900/90 border border-white/10 backdrop-blur-xl rounded-2xl w-full max-w-2xl my-auto shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-expense-title" className="text-lg sm:text-xl font-bold text-white">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <p className="text-xs text-slate-400">
                Record cost, track who paid, and split fairly
              </p>
            </div>
          </div>
          <button
            id="btn-close-expense-modal"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Main Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Expense Name / Description <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-expense-description"
                type="text"
                placeholder="e.g. Dinner at Bistro, Whole Foods Groceries, Rent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
              />
            </div>

            {/* Total Cost */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Total Cost ({userProfile.currency}) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {userProfile.currency === 'USD' ? '$' : userProfile.currency}
                </span>
                <input
                  id="input-expense-total-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-expense-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors backdrop-blur-md"
                />
              </div>
            </div>

          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Category</span>
              </button>
            </div>

            {isCreatingCategory && (
              <div className="mb-3 p-3 bg-white/5 border border-teal-500/30 rounded-xl flex items-center gap-2 backdrop-blur-md">
                <input
                  type="text"
                  placeholder="New Category Name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomCategory}
                  className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 shadow-md shadow-teal-500/20"
                >
                  Save
                </button>
              </div>
            )}

            <div id="category-picker-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition-all border ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-500 text-white shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Who Paid */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 backdrop-blur-md">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Who Paid?</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy('me')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                  paidBy === 'me'
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                I Paid
              </button>

              {userProfile.hasPartner && (
                <button
                  type="button"
                  onClick={() => setPaidBy('partner')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    paidBy === 'partner'
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {partnerName} Paid
                </button>
              )}

              <button
                type="button"
                onClick={() => setPaidBy('other')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                  paidBy === 'other'
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Someone Else
              </button>
            </div>
          </div>

          {/* Section: Expense Splitting */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <span>Split Between How Many People?</span>
              </label>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setSplitMethod('equal')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    splitMethod === 'equal' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMethod('custom')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    splitMethod === 'custom' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Split People Options */}
            <div className="flex flex-wrap gap-2">
              {[
                { count: 1, label: 'Just Me' },
                ...(userProfile.hasPartner ? [{ count: 2, label: `Me + ${partnerName}` }] : []),
                { count: 3, label: '3 People' },
                { count: 4, label: '4 People' },
              ].map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setSplitCount(opt.count)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    splitCount === opt.count
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Split Breakdown Fields */}
            {splitMethod === 'custom' && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl space-y-3 backdrop-blur-sm">
                <p className="text-xs text-slate-400 font-medium">
                  Enter exact share amount for each person:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      My Share ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={customMyShare}
                      onChange={(e) => setCustomMyShare(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {userProfile.hasPartner && (
                    <div>
                      <label className="block text-[11px] text-slate-300 font-medium mb-1">
                        {partnerName}'s Share ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={customPartnerShare}
                        onChange={(e) => setCustomPartnerShare(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Others' Share ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={customOthersShare}
                      onChange={(e) => setCustomOthersShare(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {!isCustomSplitValid && (
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Shares total (${customSum.toFixed(2)}) must equal total cost (${numAmount.toFixed(2)})!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Live Calculation Box */}
          <div className="p-4 bg-white/5 border border-teal-500/30 rounded-xl space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-400 border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Live Financial Summary
              </span>
              <span className="bg-teal-500/10 px-2 py-0.5 rounded text-[11px] text-teal-300 border border-teal-500/20">
                {netImpactText()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Cost</span>
                <span className="font-bold text-white">{formatCurrency(shares.totalAmount, userProfile.currency)}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">I Paid</span>
                <span className="font-bold text-teal-400">{formatCurrency(shares.paidByMe, userProfile.currency)}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">My Share</span>
                <span className="font-bold text-slate-200">{formatCurrency(shares.myShare, userProfile.currency)}</span>
              </div>

              {userProfile.hasPartner && (
                <div>
                  <span className="text-slate-400 block text-[10px]">{partnerName}'s Share</span>
                  <span className="font-bold text-cyan-300">{formatCurrency(shares.partnerShare, userProfile.currency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Recurring Expense Options */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-purple-400" />
                <span>Is This a Recurring Expense?</span>
              </label>

              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isRecurring ? 'bg-purple-500' : 'bg-white/10 border border-white/10'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRecurring ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-300 font-medium mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  >
                    <option value="daily" className="bg-slate-900">Daily</option>
                    <option value="weekly" className="bg-slate-900">Weekly</option>
                    <option value="biweekly" className="bg-slate-900">Every 2 Weeks</option>
                    <option value="monthly" className="bg-slate-900">Monthly</option>
                    <option value="quarterly" className="bg-slate-900">Quarterly</option>
                    <option value="semi_annually" className="bg-slate-900">Every 6 Months</option>
                    <option value="yearly" className="bg-slate-900">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-medium mb-1">
                    Expense Classification
                  </label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 backdrop-blur-md"
                  >
                    <option value="subscription" className="bg-slate-900">Subscription (e.g. Netflix)</option>
                    <option value="fixed_bill" className="bg-slate-900">Fixed Bill (e.g. Internet)</option>
                    <option value="variable_bill" className="bg-slate-900">Variable Bill (e.g. Utilities)</option>
                    <option value="rent_mortgage" className="bg-slate-900">Rent / Mortgage</option>
                    <option value="loan_emi" className="bg-slate-900">Loan / EMI</option>
                    <option value="insurance" className="bg-slate-900">Insurance</option>
                    <option value="membership" className="bg-slate-900">Membership</option>
                    <option value="other" className="bg-slate-900">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Editing Mode Selector for Recurring Expenses */}
          {editingExpense?.isRecurring && (
            <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-purple-300 block">
                What do you want to edit?
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'single', label: 'This occurrence only' },
                  { id: 'future', label: 'This & future' },
                  { id: 'all', label: 'Entire series' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setRecurringEditMode(mode.id as 'single' | 'future' | 'all')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                      recurringEditMode === mode.id
                        ? 'bg-purple-500 text-white border-purple-400'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Optional Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Paid via Venmo, receipt attached..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 sticky bottom-0 bg-slate-900/90 backdrop-blur-md pb-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-expense"
              type="submit"
              disabled={numAmount <= 0 || !isCustomSplitValid}
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all"
            >
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
