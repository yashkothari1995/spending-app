import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RecurringExpense, RecurrenceFrequency, ExpenseType, PaidByOption, SplitMethod } from '../../types';
import { computeShares } from '../../utils/calculations';
import { getTodayDateString } from '../../utils/formatters';
import { X, Repeat, DollarSign } from 'lucide-react';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurringToEdit?: RecurringExpense | null;
}

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({ isOpen, onClose, recurringToEdit }) => {
  const { categories, userProfile, addRecurringExpense, updateRecurringExpense } = useApp();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_subscriptions');
  const [expenseType, setExpenseType] = useState<ExpenseType>('subscription');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [nextPaymentDate, setNextPaymentDate] = useState(getTodayDateString());
  const [paidBy, setPaidBy] = useState<PaidByOption>('me');
  const [splitCount, setSplitCount] = useState<number>(userProfile.hasPartner ? 2 : 1);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [notes, setNotes] = useState('');

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  useEffect(() => {
    if (recurringToEdit) {
      setDescription(recurringToEdit.description);
      setAmount(recurringToEdit.amount);
      setFrequency(recurringToEdit.frequency);
      setCategoryId(recurringToEdit.categoryId);
      setExpenseType(recurringToEdit.expenseType);
      setStartDate(recurringToEdit.startDate);
      setNextPaymentDate(recurringToEdit.nextPaymentDate);
      setPaidBy(recurringToEdit.paidBy);
      setSplitCount(recurringToEdit.splitCount);
      setSplitMethod(recurringToEdit.splitMethod);
      setNotes(recurringToEdit.notes || '');
    } else {
      setDescription('');
      setAmount('');
      setFrequency('monthly');
      setCategoryId(categories[0]?.id || 'cat_subscriptions');
      setExpenseType('subscription');
      setStartDate(getTodayDateString());
      setNextPaymentDate(getTodayDateString());
      setPaidBy('me');
      setSplitCount(userProfile.hasPartner ? 2 : 1);
      setSplitMethod('equal');
      setNotes('');
    }
  }, [recurringToEdit, isOpen, categories, userProfile.hasPartner]);

  if (!isOpen) return null;

  const numAmount = Math.max(0, Number(amount) || 0);
  const shares = computeShares(numAmount, paidBy, splitCount, splitMethod, 0, 0, 0, userProfile.hasPartner);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    if (recurringToEdit) {
      updateRecurringExpense(recurringToEdit.id, {
        description: description || 'Untitled Subscription',
        amount: numAmount,
        frequency,
        categoryId,
        expenseType,
        startDate,
        nextPaymentDate,
        paidBy,
        splitCount,
        splitMethod,
        myShare: shares.myShare,
        partnerShare: shares.partnerShare,
        othersShare: shares.othersShare,
        notes,
      });
    } else {
      addRecurringExpense({
        description: description || 'Untitled Subscription',
        amount: numAmount,
        frequency,
        categoryId,
        expenseType,
        startDate,
        nextPaymentDate,
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

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base text-white">
              {recurringToEdit ? 'Edit Recurring Rule' : 'New Recurring Expense'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Subscription / Bill Name
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix, Gym Membership, Wifi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Amount ({userProfile.currency})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every 2 Weeks</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi_annually">Every 6 Months</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Classification
              </label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="subscription">Subscription</option>
                <option value="fixed_bill">Fixed Bill</option>
                <option value="variable_bill">Variable Bill</option>
                <option value="rent_mortgage">Rent / Mortgage</option>
                <option value="loan_emi">Loan / EMI</option>
                <option value="insurance">Insurance</option>
                <option value="membership">Membership</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Next Payment Date
              </label>
              <input
                type="date"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Who Normally Pays?
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value as PaidByOption)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="me">I Pay</option>
                {userProfile.hasPartner && <option value="partner">{partnerName} Pays</option>}
                <option value="other">Someone Else Pays</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Split Count
              </label>
              <select
                value={splitCount}
                onChange={(e) => setSplitCount(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value={1}>Just Me (1)</option>
                {userProfile.hasPartner && <option value={2}>Me + {partnerName} (2)</option>}
                <option value={3}>3 People</option>
                <option value={4}>4 People</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold hover:bg-purple-600 shadow-md shadow-purple-500/20"
            >
              Save Recurring Rule
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
