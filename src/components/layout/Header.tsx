import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DateFilterPreset } from '../../types';
import { formatPresetLabel, CURRENCIES } from '../../utils/formatters';
import { Calendar, ChevronDown, Filter, DollarSign, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { filters, setFilters, activeDateRange, userProfile } = useApp();
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);

  const [tempStart, setTempStart] = useState(activeDateRange.startDate || '');
  const [tempEnd, setTempEnd] = useState(activeDateRange.endDate || '');

  const presets: { id: DateFilterPreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'last_3_months', label: 'Last 3 Months' },
    { id: 'last_6_months', label: 'Last 6 Months' },
    { id: 'this_year', label: 'This Year' },
    { id: 'last_year', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range...' },
  ];

  const handleSelectPreset = (preset: DateFilterPreset) => {
    setIsPresetDropdownOpen(false);
    if (preset === 'custom') {
      setIsCustomPickerOpen(true);
    } else {
      setFilters((prev) => ({
        ...prev,
        preset,
        customDateRange: undefined,
      }));
    }
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempStart && tempEnd) {
      setFilters((prev) => ({
        ...prev,
        preset: 'custom',
        customDateRange: { startDate: tempStart, endDate: tempEnd },
      }));
      setIsCustomPickerOpen(false);
    }
  };

  const activeLabel = formatPresetLabel(filters.preset, filters.customDateRange);
  const currencyObj = CURRENCIES[userProfile.currency] || CURRENCIES['USD'];

  return (
    <div id="period-header-bar" className="bg-white/5 backdrop-blur-md border-b border-white/10 text-slate-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Title & Active Period */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Active Financial Horizon</span>
          </div>
          <h1 id="active-period-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>{activeLabel}</span>
            <span className="text-slate-400 font-normal text-sm sm:text-base">
              ({activeDateRange.startDate} to {activeDateRange.endDate})
            </span>
          </h1>
        </div>

        {/* Right Side: Period Selector & Currency Badge */}
        <div className="flex items-center gap-3">
          
          {/* Currency Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-medium">
            <DollarSign className="w-3.5 h-3.5 text-teal-400" />
            <span>{currencyObj.code} ({currencyObj.symbol})</span>
          </div>

          {/* Period Selector Dropdown */}
          <div className="relative">
            <button
              id="period-selector-btn"
              onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-medium text-xs sm:text-sm border border-white/10 transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>{activeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {isPresetDropdownOpen && (
              <div 
                id="period-preset-menu"
                className="absolute right-0 mt-2 w-52 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1 divide-y divide-white/10"
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Period
                </div>
                <div className="py-1">
                  {presets.map((p) => {
                    const isSelected = filters.preset === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p.id)}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-teal-500/10 text-teal-400 font-semibold'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{p.label}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Custom Date Picker Modal */}
      {isCustomPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base">Select Custom Date Range</h3>
              </div>
              <button
                onClick={() => setIsCustomPickerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyCustomRange} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCustomPickerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 shadow-lg shadow-teal-500/20"
                >
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
