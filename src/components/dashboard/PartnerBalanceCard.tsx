import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Handshake, ShieldCheck, CreditCard } from 'lucide-react';

export const PartnerBalanceCard: React.FC = () => {
  const { dashboardTotals, userProfile, setActiveTab } = useApp();

  if (!userProfile.hasPartner) return null;

  const partnerName = userProfile.partnerName || 'Partner';
  const netBal = dashboardTotals.netPartnerBalance;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">{partnerName} & You</h3>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
            Split Balance
          </span>
        </div>

        {/* Big Balance Callout */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md mb-4 text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Net Debt / Balance
          </span>
          
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {netBal > 0 ? (
              <span className="text-teal-400 flex items-center justify-center gap-1">
                <ArrowDownLeft className="w-6 h-6 stroke-[3]" />
                {partnerName} owes you {formatCurrency(netBal, userProfile.currency)}
              </span>
            ) : netBal < 0 ? (
              <span className="text-rose-400 flex items-center justify-center gap-1">
                <ArrowUpRight className="w-6 h-6 stroke-[3]" />
                You owe {partnerName} {formatCurrency(Math.abs(netBal), userProfile.currency)}
              </span>
            ) : (
              <span className="text-slate-300 flex items-center justify-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
                All Settled Up!
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-slate-400 block text-[11px] mb-0.5">I Paid Out of Pocket</span>
            <span className="font-bold text-teal-400 text-sm">{formatCurrency(dashboardTotals.iPaid, userProfile.currency)}</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <span className="text-slate-400 block text-[11px] mb-0.5">{partnerName} Paid Out of Pocket</span>
            <span className="font-bold text-cyan-300 text-sm">{formatCurrency(dashboardTotals.partnerPaid, userProfile.currency)}</span>
          </div>
        </div>
      </div>

      {/* Settle Action Button */}
      <button
        onClick={() => setActiveTab('settlements')}
        className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
      >
        <CreditCard className="w-4 h-4" />
        <span>Record Settlement or Settle Up</span>
      </button>

    </div>
  );
};
