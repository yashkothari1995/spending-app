import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';
import { CURRENCIES } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  Settings, 
  Users, 
  DollarSign, 
  Tag, 
  Trash2, 
  RotateCcw, 
  Check, 
  Plus, 
  AlertTriangle,
  UserCheck,
  UserPlus,
  Copy,
  Link,
  ShieldCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    userAccounts,
    currentUserId,
    setIsUserAccountModalOpen,
    categories, 
    addCustomCategory, 
    deleteCustomCategory, 
    resetToDemoData, 
    clearAllData 
  } = useApp();

  const [hasPartner, setHasPartner] = useState(userProfile.hasPartner);
  const [partnerName, setPartnerName] = useState(userProfile.partnerName || '');
  const [name, setName] = useState(userProfile.name || 'Alex');
  const [currency, setCurrency] = useState<CurrencyCode>(userProfile.currency || 'USD');

  const [newCatName, setNewCatName] = useState('');
  const [isSavedBanner, setIsSavedBanner] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || 'Me',
      hasPartner,
      partnerName: hasPartner ? (partnerName.trim() || 'Partner') : '',
      currency,
    });
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userProfile.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCustomCategory({
        name: newCatName.trim(),
        icon: 'Tag',
        color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      });
      setNewCatName('');
    }
  };

  return (
    <div id="settings-view-container" className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Application Settings</h1>
            <p className="text-xs text-slate-400">
              Manage user IDs, partner account linking, currency, and categories
            </p>
          </div>
        </div>
      </div>

      {isSavedBanner && (
        <div className="p-4 bg-teal-500/20 border border-teal-500/40 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* 0. User IDs & Multi-User Account Manager */}
      <div className="glass-panel p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            <span>User ID & Account Management</span>
          </h3>

          <button
            onClick={() => setIsUserAccountModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Switch or Create User ID</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2 backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Active User ID</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-mono font-extrabold text-teal-400">{userProfile.id}</span>
              <button
                onClick={handleCopyUserId}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 flex items-center gap-1 transition-colors"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Share this User ID code with partners or family members so they can link their account.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2 backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Accounts On Device</span>
            <div className="text-sm font-bold text-white">
              {userAccounts.length} User {userAccounts.length === 1 ? 'ID' : 'IDs'} Registered
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {userAccounts.map((a) => (
                <span
                  key={a.id}
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    a.id === currentUserId
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {a.name} ({a.id})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Household & Partner Setup */}
      <form onSubmit={handleSaveProfile} className="glass-panel p-6 shadow-lg space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-5 h-5 text-teal-400" />
          <span>Household & Partner Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Spouse / Partner Setup Prompt */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-white block">
                Do you have a spouse or partner you want to track expenses with?
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Enables partner share tracking, who owes whom balances, and split metrics
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setHasPartner(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  hasPartner ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHasPartner(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  !hasPartner ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {hasPartner && (
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Spouse / Partner Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah, Alex, Spouse"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                required={hasPartner}
                className="w-full sm:w-72 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-md transition-colors"
          >
            Save Profile Settings
          </button>
        </div>
      </form>

      {/* 2. Custom Categories Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Tag className="w-5 h-5 text-emerald-400" />
          <span>Custom Categories</span>
        </h3>

        <form onSubmit={handleAddCategory} className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            placeholder="New custom category name..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <CategoryIcon name={cat.icon} className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-medium">{cat.name}</span>
              </div>
              {cat.isCustom && (
                <button
                  onClick={() => deleteCustomCategory(cat.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Remove Custom Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Demo Data & Reset Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <RotateCcw className="w-5 h-5 text-amber-400" />
          <span>Data Storage & Demo Controls</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <div>
            <span className="font-bold text-sm text-white block">Reset to Pre-loaded Demo Data</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              Restores initial sample transactions, recurring subscriptions, and settlements for August 2026.
            </span>
          </div>

          <button
            type="button"
            onClick={resetToDemoData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 whitespace-nowrap"
          >
            Reset Demo Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-rose-950/20 rounded-xl border border-rose-500/20">
          <div>
            <span className="font-bold text-sm text-rose-300 block">Clear All Local Data</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              Permanently deletes all expenses, recurring rules, and settlements from local storage.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all recorded data?')) {
                clearAllData();
              }
            }}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 whitespace-nowrap"
          >
            Clear All Data
          </button>
        </div>
      </div>

    </div>
  );
};
