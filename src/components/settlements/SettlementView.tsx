import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { 
  Handshake, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  DollarSign, 
  CreditCard 
} from 'lucide-react';

export const SettlementView: React.FC = () => {
  const { 
    dashboardTotals, 
    userProfile, 
    settlements, 
    addSettlement, 
    deleteSettlement 
  } = useApp();

  const [fromPerson, setFromPerson] = useState<'me' | 'partner'>('partner');
  const [toPerson, setToPerson] = useState<'me' | 'partner'>('me');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';
  const netBal = dashboardTotals.netPartnerBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Math.max(0, Number(amount) || 0);
    if (numAmount <= 0) return;

    addSettlement({
      fromPerson,
      toPerson,
      fromName: fromPerson === 'partner' ? partnerName : userProfile.name,
      toName: toPerson === 'me' ? userProfile.name : partnerName,
      amount: numAmount,
      date,
      notes,
    });

    setAmount('');
    setNotes('');
  };

  return (
    <div id="settlements-view-container" className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Settlements & Debt Balancing</h1>
            <p className="text-xs text-slate-400">
              Record cash/Venmo transfers between partners without affecting expense spend totals
            </p>
          </div>
        </div>
      </div>

      {/* Net Balance Status Card & Settle Up Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Net Debt Status Card */}
        <div className="glass-panel p-6 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase text-slate-400">Current Split Balance</span>
              <span className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                {userProfile.hasPartner ? `Between ${userProfile.name} & ${partnerName}` : 'Individual Mode'}
              </span>
            </div>

            {userProfile.hasPartner ? (
              <div className={`p-6 rounded-2xl border text-center space-y-2 backdrop-blur-md ${
                netBal > 0
                  ? 'bg-teal-950/20 border-teal-500/30'
                  : netBal < 0
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-white/5 border-white/10'
              }`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Net Amount Owed
                </span>

                <div className="text-3xl sm:text-4xl font-extrabold">
                  {netBal > 0 ? (
                    <span className="text-teal-400 flex items-center justify-center gap-1">
                      <ArrowDownLeft className="w-8 h-8 stroke-[3]" />
                      {partnerName} owes you {formatCurrency(netBal, userProfile.currency)}
                    </span>
                  ) : netBal < 0 ? (
                    <span className="text-rose-400 flex items-center justify-center gap-1">
                      <ArrowUpRight className="w-8 h-8 stroke-[3]" />
                      You owe {partnerName} {formatCurrency(Math.abs(netBal), userProfile.currency)}
                    </span>
                  ) : (
                    <span className="text-slate-300 flex items-center justify-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-teal-400" />
                      All Settled Up!
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 pt-2">
                  Expenses create debt. Settlements reduce debt without double-counting expense spend.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Enable partner in Settings to track debts & settlements with a spouse or partner.
              </p>
            )}
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-400 space-y-1 backdrop-blur-sm">
            <span className="font-semibold text-slate-300 block">How Settlements Work:</span>
            <p>• Example: If {partnerName} owes you $500, and sends you $300 via Venmo.</p>
            <p>• Log a settlement of $300 from {partnerName} to You.</p>
            <p>• Remaining balance updates to $200 owed, leaving total expense charts untouched!</p>
          </div>
        </div>

        {/* Right: Record Settlement Form */}
        <div className="glass-panel p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <CreditCard className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base text-white">Record New Settlement</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Payer (Who Sent Money)
                </label>
                <select
                  value={fromPerson}
                  onChange={(e) => {
                    const val = e.target.value as 'me' | 'partner';
                    setFromPerson(val);
                    setToPerson(val === 'me' ? 'partner' : 'me');
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 backdrop-blur-md"
                >
                  <option value="partner" className="bg-slate-900">{partnerName} (Payer)</option>
                  <option value="me" className="bg-slate-900">{userProfile.name} (Me)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Recipient (Who Received)
                </label>
                <select
                  value={toPerson}
                  onChange={(e) => {
                    const val = e.target.value as 'me' | 'partner';
                    setToPerson(val);
                    setFromPerson(val === 'me' ? 'partner' : 'me');
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 backdrop-blur-md"
                >
                  <option value="me" className="bg-slate-900">{userProfile.name} (Recipient)</option>
                  <option value="partner" className="bg-slate-900">{partnerName} (Recipient)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Settlement Amount ({userProfile.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-400 backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Transfer Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 backdrop-blur-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Venmo transfer for mortgage share"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 backdrop-blur-md"
              />
            </div>

            <button
              id="btn-save-settlement"
              type="submit"
              disabled={!amount || Number(amount) <= 0}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Record Settlement Transfer</span>
            </button>
          </form>
        </div>

      </div>

      {/* Settlement History Table */}
      <div className="glass-panel p-6 shadow-lg">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Handshake className="w-5 h-5 text-teal-400" />
          <span>Settlement Transfer History ({settlements.length})</span>
        </h3>

        {settlements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">From (Payer)</th>
                  <th className="py-3 px-3">To (Recipient)</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-400">{formatDate(s.date)}</td>
                    <td className="py-3 px-3 font-semibold text-white">{s.fromName}</td>
                    <td className="py-3 px-3 font-semibold text-teal-400">{s.toName}</td>
                    <td className="py-3 px-3 font-bold text-white">{formatCurrency(s.amount, userProfile.currency)}</td>
                    <td className="py-3 px-3 text-slate-400">{s.notes || '-'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteSettlement(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10"
                        title="Delete Settlement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No settlements recorded yet. Use the form above when money is transferred to settle up!
          </div>
        )}
      </div>

    </div>
  );
};
