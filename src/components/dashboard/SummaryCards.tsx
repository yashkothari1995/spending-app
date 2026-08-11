import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { 
  DollarSign, 
  UserCheck, 
  Users, 
  Wallet, 
  Repeat, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Handshake,
  HeartHandshake
} from 'lucide-react';

export const SummaryCards: React.FC = () => {
  const { dashboardTotals, userProfile, setActiveTab } = useApp();
  const netBal = dashboardTotals.netPartnerBalance;
  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  return (
    <div id="summary-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Spend Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:bg-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Spend
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div id="total-spend-value" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          {formatCurrency(dashboardTotals.totalSpend, userProfile.currency)}
        </div>
        <p className="text-[11px] text-slate-400">
          Complete expense value in period
        </p>
      </div>

      {/* 2. My Share Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:bg-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            My Share
          </span>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div id="my-share-value" className="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight mb-1">
          {formatCurrency(dashboardTotals.myShare, userProfile.currency)}
        </div>
        <p className="text-[11px] text-slate-400">
          Actual portion that belongs to me
        </p>
      </div>

      {/* 3. Family / Partner Share Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:bg-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {userProfile.hasPartner ? 'Family Share' : 'Personal Share'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div id="family-share-value" className="text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-tight mb-1">
          {formatCurrency(dashboardTotals.familyShare, userProfile.currency)}
        </div>
        <p className="text-[11px] text-slate-400">
          {userProfile.hasPartner ? `My share + ${partnerName}'s share` : 'Total personal expense'}
        </p>
      </div>

      {/* 4. Net Balance Card (OWED / OWING) */}
      {userProfile.hasPartner ? (
        <div 
          onClick={() => setActiveTab('settlements')}
          className={`border rounded-2xl p-5 shadow-xl backdrop-blur-md relative cursor-pointer group transition-all ${
            netBal > 0
              ? 'bg-teal-500/10 border-teal-500/40 hover:bg-teal-500/15 hover:border-teal-500/60'
              : netBal < 0
              ? 'bg-rose-500/10 border-rose-500/40 hover:bg-rose-500/15 hover:border-rose-500/60'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Handshake className="w-4 h-4 text-teal-400" />
              <span>Net Balance</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
              Settle
            </span>
          </div>

          <div id="balance-card-value" className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
            {netBal > 0 ? (
              <span className="text-teal-400 flex items-center gap-1">
                <ArrowDownLeft className="w-6 h-6 stroke-[3]" />
                +{formatCurrency(netBal, userProfile.currency)}
              </span>
            ) : netBal < 0 ? (
              <span className="text-rose-400 flex items-center gap-1">
                <ArrowUpRight className="w-6 h-6 stroke-[3]" />
                -{formatCurrency(Math.abs(netBal), userProfile.currency)}
              </span>
            ) : (
              <span className="text-slate-300">$0.00</span>
            )}
          </div>

          <p className="text-xs font-semibold mt-1">
            {netBal > 0 ? (
              <span className="text-teal-300">{partnerName} owes you money</span>
            ) : netBal < 0 ? (
              <span className="text-rose-300">You owe {partnerName} money</span>
            ) : (
              <span className="text-slate-400">All settled up!</span>
            )}
          </p>
        </div>
      ) : (
        /* 4b. Alternate I Paid Card when no partner */
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:bg-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              I Paid
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
            {formatCurrency(dashboardTotals.iPaid, userProfile.currency)}
          </div>
          <p className="text-[11px] text-slate-400">
            Amount paid from my account
          </p>
        </div>
      )}

      {/* 5. Payments Summary Bar */}
      <div className="sm:col-span-2 lg:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Amount I Paid</span>
            <span className="text-lg font-bold text-teal-400">{formatCurrency(dashboardTotals.iPaid, userProfile.currency)}</span>
          </div>

          {userProfile.hasPartner && (
            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-medium">{partnerName} Paid</span>
              <span className="text-lg font-bold text-cyan-300">{formatCurrency(dashboardTotals.partnerPaid, userProfile.currency)}</span>
            </div>
          )}

          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Recurring Spend</span>
            <span className="text-lg font-bold text-purple-400">{formatCurrency(dashboardTotals.recurringSpend, userProfile.currency)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
          <HeartHandshake className="w-4 h-4 text-teal-400" />
          <span>I Paid ≠ My Share (Splits managed automatically)</span>
        </div>
      </div>

    </div>
  );
};
