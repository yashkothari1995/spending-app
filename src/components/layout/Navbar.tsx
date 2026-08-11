import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Repeat, 
  Target, 
  Handshake, 
  BarChart3, 
  Settings, 
  Plus, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  MoreHorizontal,
  X,
  UserCheck,
  UserPlus,
  Cloud
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    openAddExpenseModal, 
    userProfile, 
    dashboardTotals,
    setIsUserAccountModalOpen,
    isCloudConnected,
    authUser,
    loginWithGoogle,
    logoutGoogle
  } = useApp();

  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const mainNavItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'settlements', label: 'Settlements', icon: <Handshake className="w-4 h-4" /> },
  ];

  const secondaryNavItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'recurring', label: 'Recurring', icon: <Repeat className="w-4 h-4" /> },
    { id: 'budgets', label: 'Budgets', icon: <Target className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const allNavItems = [...mainNavItems, ...secondaryNavItems];

  const isMoreActive = secondaryNavItems.some((item) => item.id === activeTab);
  const netBal = dashboardTotals.netPartnerBalance;
  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

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
    <>
      {/* Desktop Top Header Bar */}
      <header id="main-header" className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl text-white border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20 shrink-0">
                <Wallet className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                    SpendTracker
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    Family
                  </span>
                  {isCloudConnected && (
                    <span className="hidden sm:flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Connected to Firebase Cloud Firestore for real-time live sync across devices">
                      <Cloud className="w-2.5 h-2.5" />
                      <span>Live Cloud</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 hidden md:block">
                  {userProfile.hasPartner ? `Tracking with ${partnerName}` : 'Personal Expense Tracker'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav id="desktop-nav-links" className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
              {allNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Side: Auth Button, User ID Badge, Partner Balance, Add Button */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Google Authentication Control */}
              {authUser ? (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 pl-2.5 rounded-xl backdrop-blur-md">
                  {authUser.photoURL ? (
                    <img src={authUser.photoURL} alt={authUser.displayName || 'Google User'} className="w-6 h-6 rounded-full shrink-0 border border-teal-500/50" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {(authUser.displayName || authUser.email || 'G').substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left hidden lg:block pr-1">
                    <span className="text-white text-xs font-bold block leading-tight truncate max-w-[100px]">{authUser.displayName || 'Signed In'}</span>
                    <span className="text-[9px] text-teal-400 block leading-tight truncate max-w-[100px]">{authUser.email}</span>
                  </div>
                  <button
                    id="btn-google-logout"
                    onClick={logoutGoogle}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-[10px] font-bold transition-all"
                    title="Sign Out of Google"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  id="btn-google-login"
                  onClick={loginWithGoogle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}

              {/* User ID Quick Switcher Badge */}
              <button
                id="btn-user-id-badge"
                onClick={() => setIsUserAccountModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-semibold backdrop-blur-md"
                title="Manage User IDs & Accounts"
              >
                <div className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${colorBadges[userProfile.avatarColor || 'teal']}`}>
                  {userProfile.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-white font-bold block leading-tight">{userProfile.name}</span>
                  <span className="text-[10px] font-mono text-teal-400 block leading-tight truncate max-w-[80px]">{userProfile.id}</span>
                </div>
                <Users className="w-3.5 h-3.5 text-slate-400 sm:ml-1" />
              </button>


              {/* Partner Balance Indicator */}
              {userProfile.hasPartner && (
                <div 
                  id="partner-balance-pill"
                  onClick={() => setActiveTab('settlements')}
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors backdrop-blur-md ${
                    netBal > 0
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20'
                      : netBal < 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                  title="Click to manage settlements"
                >
                  {netBal > 0 ? (
                    <ArrowDownLeft className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  ) : netBal < 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : null}
                  <span>
                    {netBal > 0
                      ? `${partnerName} owes ${formatCurrency(netBal, userProfile.currency)}`
                      : netBal < 0
                      ? `You owe ${partnerName} ${formatCurrency(Math.abs(netBal), userProfile.currency)}`
                      : 'Settled up'}
                  </span>
                </div>
              )}

              {/* Add Expense Button */}
              <button
                id="btn-header-add-expense"
                onClick={() => openAddExpenseModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-lg shadow-teal-500/20 shrink-0 min-h-[40px]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav id="mobile-bottom-nav" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-3 py-2 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-btn-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMoreOpen(false);
                }}
                className={`flex flex-col items-center gap-1 min-h-[44px] justify-center px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'text-teal-400 bg-teal-500/10 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span className="truncate max-w-[65px] text-center">{item.label}</span>
              </button>
            );
          })}

          {/* Mobile "More" Drawer Button */}
          <button
            id="mobile-nav-btn-more"
            onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
            className={`flex flex-col items-center gap-1 min-h-[44px] justify-center px-3 py-1 rounded-xl text-[11px] font-semibold transition-all relative ${
              isMoreActive || isMobileMoreOpen
                ? 'text-teal-400 bg-teal-500/10 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span>More</span>
            {isMoreActive && (
              <span className="w-2 h-2 rounded-full bg-teal-400 absolute top-1 right-2 animate-pulse" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile "More" Bottom Sheet Modal */}
      {isMobileMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/95 border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl text-white space-y-4 backdrop-blur-2xl max-w-md mx-auto w-full">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">More Tools & Navigation</h3>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Secondary Nav Grid */}
            <div className="grid grid-cols-2 gap-2">
              {secondaryNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMoreOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-teal-400">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Switch Account Mobile Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsMobileMoreOpen(false);
                  setIsUserAccountModalOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 min-h-[44px]"
              >
                <Users className="w-4 h-4 stroke-[2.5]" />
                <span>Switch User ID / Manage Accounts ({userProfile.id})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

