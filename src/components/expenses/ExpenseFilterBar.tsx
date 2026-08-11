import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DateFilterPreset, PaidByOption } from '../../types';
import { exportExpensesToCSV } from '../../utils/export';
import { 
  Search, 
  Filter, 
  Download, 
  X, 
  Calendar, 
  ChevronDown, 
  DollarSign 
} from 'lucide-react';

export const ExpenseFilterBar: React.FC = () => {
  const { filters, setFilters, categories, userProfile, filteredExpenses } = useApp();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  const presets: { id: DateFilterPreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'last_3_months', label: 'Last 3 Months' },
    { id: 'last_6_months', label: 'Last 6 Months' },
    { id: 'this_year', label: 'This Year' },
    { id: 'last_year', label: 'Last Year' },
  ];

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      preset: 'this_month',
      categoryId: 'all',
      paidBy: 'all',
      recurringType: 'all',
    });
  };

  const handleExport = () => {
    exportExpensesToCSV(filteredExpenses, categories, userProfile);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
      
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-transactions"
            type="text"
            placeholder="Search description, notes, category..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Preset Selector */}
          <select
            value={filters.preset}
            onChange={(e) => setFilters((prev) => ({ ...prev, preset: e.target.value as DateFilterPreset }))}
            className="bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 backdrop-blur-md"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900">{p.label}</option>
            ))}
          </select>

          {/* Category Filter Dropdown */}
          <select
            value={filters.categoryId || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 max-w-[140px] truncate backdrop-blur-md"
          >
            <option value="all" className="bg-slate-900">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
            ))}
          </select>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors backdrop-blur-md ${
              isAdvancedOpen || filters.paidBy !== 'all' || filters.recurringType !== 'all'
                ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Export CSV Button */}
          <button
            id="btn-export-csv"
            onClick={handleExport}
            disabled={filteredExpenses.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-colors disabled:opacity-50 backdrop-blur-md"
            title="Export transactions to CSV file"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

        </div>
      </div>

      {/* Advanced Filter Collapsible Bar */}
      {isAdvancedOpen && (
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Who Paid Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Who Paid
            </label>
            <select
              value={filters.paidBy || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, paidBy: e.target.value as PaidByOption | 'all' }))}
              className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-400 backdrop-blur-md"
            >
              <option value="all" className="bg-slate-900">All Payers</option>
              <option value="me" className="bg-slate-900">I Paid</option>
              {userProfile.hasPartner && <option value="partner" className="bg-slate-900">{partnerName} Paid</option>}
              <option value="other" className="bg-slate-900">Someone Else Paid</option>
            </select>
          </div>

          {/* Recurring Type Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Recurring / One-Time
            </label>
            <select
              value={filters.recurringType || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, recurringType: e.target.value as 'all' | 'recurring' | 'one_time' }))}
              className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-400 backdrop-blur-md"
            >
              <option value="all" className="bg-slate-900">All Types</option>
              <option value="recurring" className="bg-slate-900">Recurring Expenses Only</option>
              <option value="one_time" className="bg-slate-900">One-Time Expenses Only</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
