import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode, UserAccount } from '../../types';
import { CURRENCIES } from '../../utils/formatters';
import { 
  Users, 
  UserPlus, 
  Check, 
  Copy, 
  Link, 
  X, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const UserAccountModal: React.FC = () => {
  const { 
    userProfile, 
    userAccounts, 
    currentUserId, 
    switchAccount, 
    createAccount, 
    linkPartner,
    isUserAccountModalOpen, 
    setIsUserAccountModalOpen 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'switch' | 'create' | 'link'>('switch');
  const [copiedId, setCopiedId] = useState(false);

  // Form states for creating new account
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [customId, setCustomId] = useState('');
  const [newAvatarColor, setNewAvatarColor] = useState('teal');
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>('USD');
  const [newHasPartner, setNewHasPartner] = useState(true);
  const [newPartnerName, setNewPartnerName] = useState('');

  // Form state for linking partner ID
  const [partnerInputId, setPartnerInputId] = useState('');
  const [linkSuccessBanner, setLinkSuccessBanner] = useState('');

  if (!isUserAccountModalOpen) return null;

  const handleCopyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createAccount(
      {
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        avatarColor: newAvatarColor,
        currency: newCurrency,
        hasPartner: newHasPartner,
        partnerName: newHasPartner ? (newPartnerName.trim() || 'Partner') : '',
      },
      customId.trim() || undefined
    );

    // Reset fields
    setNewName('');
    setNewEmail('');
    setCustomId('');
    setActiveTab('switch');
  };

  const handleLinkPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerInputId.trim()) {
      linkPartner(partnerInputId.trim());
      setLinkSuccessBanner(`Successfully linked with User ID ${partnerInputId.trim()}`);
      setPartnerInputId('');
      setTimeout(() => setLinkSuccessBanner(''), 3000);
    }
  };

  const colorBadges: Record<string, string> = {
    teal: 'bg-teal-500 text-slate-950',
    indigo: 'bg-indigo-500 text-white',
    emerald: 'bg-emerald-500 text-slate-950',
    rose: 'bg-rose-500 text-white',
    amber: 'bg-amber-500 text-slate-950',
    purple: 'bg-purple-500 text-white',
    cyan: 'bg-cyan-500 text-slate-950',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900/95 border border-white/10 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl text-white space-y-5 backdrop-blur-xl my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">User Accounts & User IDs</h3>
              <p className="text-xs text-slate-400">
                Switch profiles, create user IDs for family members, or link partner IDs
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUserAccountModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User ID Pill */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full font-bold text-sm flex items-center justify-center shadow-lg ${colorBadges[userProfile.avatarColor || 'teal']}`}>
              {userProfile.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{userProfile.name}</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Active Profile
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span>User ID: <strong className="text-teal-400 font-mono">{userProfile.id}</strong></span>
                {userProfile.hasPartner && <span>• Partner: {userProfile.partnerName}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopyUserId(userProfile.id)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors self-end sm:self-center"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-teal-300">Copied ID!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy My User ID</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'switch'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch User ID</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New User ID</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'link'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Link Partner ID</span>
          </button>
        </div>

        {/* Tab 1: Switch Account */}
        {activeTab === 'switch' && (
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider block">
              Available User IDs on this device ({userAccounts.length})
            </span>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {userAccounts.map((acc) => {
                const isSelected = acc.id === currentUserId;
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      switchAccount(acc.id);
                      setIsUserAccountModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500/40 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${colorBadges[acc.avatarColor || 'teal']}`}>
                        {acc.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{acc.name}</span>
                          <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                            {acc.id}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {acc.hasPartner ? `Partner: ${acc.partnerName}` : 'Individual Tracker'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="text-xs text-teal-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button className="px-3 py-1 bg-white/10 hover:bg-teal-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                          <span>Switch</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Create New User ID */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah K, Sam Roommate"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Custom User ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. USR-3910 or sarah_k"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Default Currency
                </label>
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
                Avatar Theme Color
              </label>
              <div className="flex items-center gap-3">
                {['teal', 'indigo', 'emerald', 'rose', 'amber', 'purple', 'cyan'].map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setNewAvatarColor(color)}
                    className={`w-7 h-7 rounded-full transition-transform ${colorBadges[color]} ${
                      newAvatarColor === color ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Create & Switch to New User ID</span>
            </button>
          </form>
        )}

        {/* Tab 3: Link Partner ID */}
        {activeTab === 'link' && (
          <form onSubmit={handleLinkPartner} className="space-y-4">
            <p className="text-xs text-slate-300">
              Link your current account (<strong className="text-teal-400 font-mono">{userProfile.id}</strong>) directly with your partner's or roommate's User ID code to share household split tracking!
            </p>

            {linkSuccessBanner && (
              <div className="p-3 bg-teal-500/20 border border-teal-500/40 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{linkSuccessBanner}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Enter Partner / Spouse / Roommate User ID *
              </label>
              <input
                type="text"
                placeholder="e.g. USR-3910 or sarah_k"
                value={partnerInputId}
                onChange={(e) => setPartnerInputId(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Link className="w-4 h-4 stroke-[2.5]" />
              <span>Link User ID Accounts</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
