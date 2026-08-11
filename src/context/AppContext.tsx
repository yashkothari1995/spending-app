import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from '../lib/firebase';

import {
  Expense,
  RecurringExpense,
  Settlement,
  Category,
  UserProfile,
  UserAccount,
  Budget,
  ExpenseFilters,
  NavigationTab,
  DateRange,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_USER_PROFILE,
  DEFAULT_ACCOUNTS,
  INITIAL_EXPENSES,
  INITIAL_RECURRING_EXPENSES,
  INITIAL_SETTLEMENTS,
  INITIAL_BUDGET,
} from '../data/defaultData';
import {
  getDateRangeFromPreset,
} from '../utils/formatters';
import {
  calculateDashboardTotals,
  processDueRecurringExpenses,
} from '../utils/calculations';

interface AppContextType {
  authUser: User | null;
  authLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutGoogle: () => Promise<void>;

  userProfile: UserProfile;
  userAccounts: UserAccount[];
  currentUserId: string;
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
  categories: Category[];
  budget: Budget;
  filters: ExpenseFilters;
  activeTab: NavigationTab;
  isCloudConnected: boolean;

  // Modals & UI States
  isAddExpenseOpen: boolean;
  editingExpense: Expense | null;
  isUserAccountModalOpen: boolean;

  // Derived state
  activeDateRange: DateRange;
  filteredExpenses: Expense[];
  dashboardTotals: ReturnType<typeof calculateDashboardTotals>;

  // UI Handlers
  setActiveTab: (tab: NavigationTab) => void;
  setFilters: React.Dispatch<React.SetStateAction<ExpenseFilters>>;
  setIsAddExpenseOpen: (open: boolean) => void;
  setEditingExpense: (expense: Expense | null) => void;
  openAddExpenseModal: (expenseToEdit?: Expense | null) => void;
  setIsUserAccountModalOpen: (open: boolean) => void;

  // User Account Actions
  switchAccount: (userId: string) => void;
  createAccount: (data: Omit<UserAccount, 'id' | 'createdAt'>, customId?: string) => void;
  linkPartner: (partnerUserId: string) => void;

  // CRUD Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (
    id: string,
    updatedFields: Partial<Expense>,
    recurringMode?: 'single' | 'future' | 'all'
  ) => void;
  deleteExpense: (
    id: string,
    recurringMode?: 'single' | 'future' | 'all'
  ) => void;
  duplicateExpense: (expense: Expense) => void;

  addRecurringExpense: (
    expense: Omit<RecurringExpense, 'id' | 'createdAt' | 'occurrencesCount'>
  ) => void;
  updateRecurringExpense: (
    id: string,
    updatedFields: Partial<RecurringExpense>
  ) => void;
  deleteRecurringExpense: (id: string) => void;
  toggleRecurringStatus: (id: string) => void;

  addSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
  deleteSettlement: (id: string) => void;

  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateBudget: (budget: Budget) => void;

  addCustomCategory: (category: Omit<Category, 'id' | 'isCustom'>) => void;
  deleteCustomCategory: (id: string) => void;

  resetToDemoData: () => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PROFILE = 'spend_tracker_profile_v1';
const LOCAL_STORAGE_KEY_USERS = 'spend_tracker_users_v1';
const LOCAL_STORAGE_KEY_ACTIVE_USER_ID = 'spend_tracker_active_user_id_v1';
const LOCAL_STORAGE_KEY_EXPENSES = 'spend_tracker_expenses_v1';
const LOCAL_STORAGE_KEY_RECURRING = 'spend_tracker_recurring_v1';
const LOCAL_STORAGE_KEY_SETTLEMENTS = 'spend_tracker_settlements_v1';
const LOCAL_STORAGE_KEY_CATEGORIES = 'spend_tracker_categories_v1';
const LOCAL_STORAGE_KEY_BUDGET = 'spend_tracker_budget_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Accounts state
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_USER_ID);
    return saved || DEFAULT_USER_PROFILE.id;
  });

  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  const [expenses, setExpensesState] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [recurringExpenses, setRecurringExpensesState] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RECURRING);
    return saved ? JSON.parse(saved) : INITIAL_RECURRING_EXPENSES;
  });

  const [settlements, setSettlementsState] = useState<Settlement[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTLEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
  });

  const [categories, setCategoriesState] = useState<Category[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [budget, setBudgetState] = useState<Budget>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET);
    return saved ? JSON.parse(saved) : INITIAL_BUDGET;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isUserAccountModalOpen, setIsUserAccountModalOpen] = useState(false);

  const [filters, setFilters] = useState<ExpenseFilters>({
    searchQuery: '',
    preset: 'this_month',
    categoryId: 'all',
    paidBy: 'all',
    recurringType: 'all',
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthLoading(false);

      if (user) {
        setIsCloudConnected(true);
        const userDocRef = doc(db, 'userAccounts', user.uid);
        const snap = await getDoc(userDocRef);

        let prof: UserProfile;
        if (snap.exists()) {
          const acc = snap.data() as UserAccount;
          prof = {
            id: acc.id,
            name: acc.name,
            email: acc.email,
            avatarColor: acc.avatarColor || 'indigo',
            hasPartner: acc.hasPartner || false,
            partnerName: acc.partnerName || '',
            partnerUserId: acc.partnerUserId || '',
            currency: acc.currency || '$',
          };
        } else {
          // Initialize user account document in Firestore
          const newAcc: UserAccount = {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatarColor: 'indigo',
            hasPartner: false,
            partnerName: '',
            partnerUserId: '',
            currency: '$',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newAcc).catch(console.error);
          prof = {
            id: newAcc.id,
            name: newAcc.name,
            email: newAcc.email,
            avatarColor: newAcc.avatarColor,
            hasPartner: newAcc.hasPartner,
            partnerName: newAcc.partnerName,
            partnerUserId: newAcc.partnerUserId,
            currency: newAcc.currency,
          };
        }

        setCurrentUserId(user.uid);
        setUserProfileState(prof);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Auth login error:', err);
      alert('Could not sign in with Google. Please check popup permissions.');
    }
  };

  const logoutGoogle = async () => {
    try {
      await signOut(auth);
      setAuthUser(null);
      setUserProfileState(DEFAULT_USER_PROFILE);
      setExpensesState([]);
      setRecurringExpensesState([]);
      setSettlementsState([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // LocalStorage Fallback Persistence
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RECURRING, JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_BUDGET, JSON.stringify(budget));
  }, [budget]);

  // Firestore Real-Time Synchronization (User-Isolated Queries)
  useEffect(() => {
    if (!authUser) {
      // Unauthenticated demo fallback logic
      return;
    }

    const uid = authUser.uid;

    // 1. Sync User Accounts
    const unsubAccounts = onSnapshot(
      doc(db, 'userAccounts', uid),
      (snapshot) => {
        setIsCloudConnected(true);
        if (snapshot.exists()) {
          const acc = snapshot.data() as UserAccount;
          setUserAccounts([acc]);
        }
      },
      (err) => console.warn('Firestore userAccount sync:', err)
    );

    // 2. Sync User Expenses (only user's expenses)
    const expensesQuery = query(collection(db, 'expenses'), where('createdByUserId', '==', uid));
    const unsubExpenses = onSnapshot(
      expensesQuery,
      (snapshot) => {
        setIsCloudConnected(true);
        const exps: Expense[] = snapshot.docs.map((d) => d.data() as Expense);
        setExpensesState(exps);
      },
      (err) => console.warn('Firestore expenses sync:', err)
    );

    // 3. Sync User Recurring Expenses
    const recQuery = query(collection(db, 'recurringExpenses'), where('createdByUserId', '==', uid));
    const unsubRecurring = onSnapshot(
      recQuery,
      (snapshot) => {
        const recs: RecurringExpense[] = snapshot.docs.map((d) => d.data() as RecurringExpense);
        setRecurringExpensesState(recs);
      },
      (err) => console.warn('Firestore recurring sync:', err)
    );

    // 4. Sync User Settlements
    const setQuery = query(collection(db, 'settlements'), where('createdByUserId', '==', uid));
    const unsubSettlements = onSnapshot(
      setQuery,
      (snapshot) => {
        const sets: Settlement[] = snapshot.docs.map((d) => d.data() as Settlement);
        setSettlementsState(sets);
      },
      (err) => console.warn('Firestore settlements sync:', err)
    );

    // 5. Sync Categories
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cats: Category[] = snapshot.docs.map((d) => d.data() as Category);
          setCategoriesState(cats);
        }
      },
      (err) => console.warn('Firestore categories sync:', err)
    );

    // 6. Sync Budget
    const unsubBudget = onSnapshot(
      doc(db, 'budgets', uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const b = snapshot.data() as Budget;
          setBudgetState(b);
        } else {
          const newBud: Budget = { ...INITIAL_BUDGET, id: uid };
          setDoc(doc(db, 'budgets', uid), newBud).catch(console.error);
          setBudgetState(newBud);
        }
      },
      (err) => console.warn('Firestore budget sync:', err)
    );

    return () => {
      unsubAccounts();
      unsubExpenses();
      unsubRecurring();
      unsubSettlements();
      unsubCategories();
      unsubBudget();
    };
  }, [authUser]);

  // Auto-process due recurring expenses on mount
  useEffect(() => {
    const { updatedRecurring, newExpenses } = processDueRecurringExpenses(
      recurringExpenses,
      expenses,
      undefined,
      userProfile.hasPartner
    );

    if (newExpenses.length > 0) {
      newExpenses.forEach((exp) => setDoc(doc(db, 'expenses', exp.id), exp).catch(console.error));
      updatedRecurring.forEach((rec) => setDoc(doc(db, 'recurringExpenses', rec.id), rec).catch(console.error));
      setExpensesState((prev) => [...newExpenses, ...prev]);
      setRecurringExpensesState(updatedRecurring);
    }
  }, []);

  // Compute Active Date Range from Preset or Custom
  const activeDateRange = useMemo<DateRange>(() => {
    if (filters.preset === 'custom' && filters.customDateRange) {
      return filters.customDateRange;
    }
    return getDateRangeFromPreset(filters.preset);
  }, [filters.preset, filters.customDateRange]);

  // Filter expenses based on current filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Date filter
      if (activeDateRange.startDate && exp.date < activeDateRange.startDate) return false;
      if (activeDateRange.endDate && exp.date > activeDateRange.endDate) return false;

      // Category
      if (filters.categoryId && filters.categoryId !== 'all' && exp.categoryId !== filters.categoryId) {
        return false;
      }

      // Paid By
      if (filters.paidBy && filters.paidBy !== 'all' && exp.paidBy !== filters.paidBy) {
        return false;
      }

      // Recurring Type
      if (filters.recurringType === 'recurring' && !exp.isRecurring) return false;
      if (filters.recurringType === 'one_time' && exp.isRecurring) return false;

      // Min/Max Amount
      if (filters.minAmount !== undefined && exp.totalAmount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && exp.totalAmount > filters.maxAmount) return false;

      // Search Query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const descMatch = exp.description.toLowerCase().includes(q);
        const notesMatch = exp.notes?.toLowerCase().includes(q) || false;
        const catObj = categories.find((c) => c.id === exp.categoryId);
        const catMatch = catObj ? catObj.name.toLowerCase().includes(q) : false;
        if (!descMatch && !notesMatch && !catMatch) return false;
      }

      return true;
    }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [expenses, activeDateRange, filters, categories]);

  // Dashboard Totals calculated on filtered expenses and filtered settlements
  const filteredSettlements = useMemo(() => {
    return settlements.filter((s) => {
      if (activeDateRange.startDate && s.date < activeDateRange.startDate) return false;
      if (activeDateRange.endDate && s.date > activeDateRange.endDate) return false;
      return true;
    });
  }, [settlements, activeDateRange]);

  const dashboardTotals = useMemo(() => {
    return calculateDashboardTotals(filteredExpenses, filteredSettlements, userProfile);
  }, [filteredExpenses, filteredSettlements, userProfile]);

  // Modal Actions
  const openAddExpenseModal = (expenseToEdit?: Expense | null) => {
    setEditingExpense(expenseToEdit || null);
    setIsAddExpenseOpen(true);
  };

  // User Account Actions
  const switchAccount = (userId: string) => {
    const foundAcc = userAccounts.find((a) => a.id === userId);
    if (foundAcc) {
      setCurrentUserId(userId);
      setUserProfileState({
        id: foundAcc.id,
        name: foundAcc.name,
        email: foundAcc.email,
        avatarColor: foundAcc.avatarColor,
        hasPartner: foundAcc.hasPartner,
        partnerName: foundAcc.partnerName,
        partnerUserId: foundAcc.partnerUserId,
        currency: foundAcc.currency,
      });
    }
  };

  const createAccount = (
    data: Omit<UserAccount, 'id' | 'createdAt'>,
    customId?: string
  ) => {
    const newId = customId || `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAcc: UserAccount = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setUserAccounts((prev) => [...prev, newAcc]);
    setCurrentUserId(newId);
    setUserProfileState({
      id: newAcc.id,
      name: newAcc.name,
      email: newAcc.email,
      avatarColor: newAcc.avatarColor,
      hasPartner: newAcc.hasPartner,
      partnerName: newAcc.partnerName,
      partnerUserId: newAcc.partnerUserId,
      currency: newAcc.currency,
    });

    // Sync to Firestore
    setDoc(doc(db, 'userAccounts', newAcc.id), newAcc).catch(console.error);
  };

  const linkPartner = (partnerUserId: string) => {
    const partnerAcc = userAccounts.find((a) => a.id === partnerUserId);
    const partnerName = partnerAcc ? partnerAcc.name : 'Partner';

    const updatedAcc = userAccounts.map((acc) => {
      if (acc.id === currentUserId) {
        const u = {
          ...acc,
          hasPartner: true,
          partnerName,
          partnerUserId,
        };
        setDoc(doc(db, 'userAccounts', u.id), u).catch(console.error);
        return u;
      }
      return acc;
    });

    setUserAccounts(updatedAcc);

    setUserProfileState((prev) => ({
      ...prev,
      hasPartner: true,
      partnerName,
      partnerUserId,
    }));
  };

  // CRUD Actions bound to authUser.uid
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const activeUid = authUser?.uid || userProfile.id;
    const newExp: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdByUserId: activeUid,
      createdByUserName: authUser?.displayName || userProfile.name,
      createdAt: new Date().toISOString(),
    };
    setExpensesState((prev) => [newExp, ...prev]);

    // Save to Firestore
    setDoc(doc(db, 'expenses', newExp.id), newExp).catch(console.error);
  };

  const updateExpense = (
    id: string,
    updatedFields: Partial<Expense>,
    recurringMode: 'single' | 'future' | 'all' = 'single'
  ) => {
    setExpensesState((prev) => {
      const targetIndex = prev.findIndex((e) => e.id === id);
      if (targetIndex === -1) return prev;
      const targetExp = prev[targetIndex];

      if (!targetExp.isRecurring || !targetExp.recurringId || recurringMode === 'single') {
        const next = [...prev];
        const updated = { ...targetExp, ...updatedFields };
        next[targetIndex] = updated;
        setDoc(doc(db, 'expenses', updated.id), updated).catch(console.error);
        return next;
      }

      if (recurringMode === 'all') {
        return prev.map((exp) => {
          if (exp.recurringId === targetExp.recurringId) {
            const u = { ...exp, ...updatedFields };
            setDoc(doc(db, 'expenses', u.id), u).catch(console.error);
            return u;
          }
          return exp;
        });
      }

      if (recurringMode === 'future') {
        return prev.map((exp) => {
          if (exp.recurringId === targetExp.recurringId && exp.date >= targetExp.date) {
            const u = { ...exp, ...updatedFields };
            setDoc(doc(db, 'expenses', u.id), u).catch(console.error);
            return u;
          }
          return exp;
        });
      }

      return prev;
    });
  };

  const deleteExpense = (
    id: string,
    recurringMode: 'single' | 'future' | 'all' = 'single'
  ) => {
    setExpensesState((prev) => {
      const targetExp = prev.find((e) => e.id === id);
      if (!targetExp) return prev;

      if (!targetExp.isRecurring || !targetExp.recurringId || recurringMode === 'single') {
        deleteDoc(doc(db, 'expenses', id)).catch(console.error);
        return prev.filter((e) => e.id !== id);
      }

      if (recurringMode === 'all') {
        prev.forEach((exp) => {
          if (exp.recurringId === targetExp.recurringId) {
            deleteDoc(doc(db, 'expenses', exp.id)).catch(console.error);
          }
        });
        return prev.filter((e) => e.recurringId !== targetExp.recurringId);
      }

      if (recurringMode === 'future') {
        prev.forEach((exp) => {
          if (exp.recurringId === targetExp.recurringId && exp.date >= targetExp.date) {
            deleteDoc(doc(db, 'expenses', exp.id)).catch(console.error);
          }
        });
        return prev.filter(
          (e) => !(e.recurringId === targetExp.recurringId && e.date >= targetExp.date)
        );
      }

      return prev;
    });
  };

  const duplicateExpense = (expense: Expense) => {
    const dup: Expense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      description: `${expense.description} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setExpensesState((prev) => [dup, ...prev]);
    setDoc(doc(db, 'expenses', dup.id), dup).catch(console.error);
  };

  const addRecurringExpense = (
    recData: Omit<RecurringExpense, 'id' | 'createdAt' | 'occurrencesCount'>
  ) => {
    const activeUid = authUser?.uid || userProfile.id;
    const newRec: RecurringExpense = {
      ...recData,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdByUserId: activeUid,
      occurrencesCount: 0,
      createdAt: new Date().toISOString(),
    };
    setRecurringExpensesState((prev) => [newRec, ...prev]);
    setDoc(doc(db, 'recurringExpenses', newRec.id), newRec).catch(console.error);
  };

  const updateRecurringExpense = (id: string, updatedFields: Partial<RecurringExpense>) => {
    setRecurringExpensesState((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const u = { ...r, ...updatedFields };
          setDoc(doc(db, 'recurringExpenses', u.id), u).catch(console.error);
          return u;
        }
        return r;
      })
    );
  };

  const deleteRecurringExpense = (id: string) => {
    setRecurringExpensesState((prev) => prev.filter((r) => r.id !== id));
    deleteDoc(doc(db, 'recurringExpenses', id)).catch(console.error);
  };

  const toggleRecurringStatus = (id: string) => {
    setRecurringExpensesState((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'active' ? 'paused' : 'active';
          const u = { ...r, status: nextStatus };
          setDoc(doc(db, 'recurringExpenses', u.id), u).catch(console.error);
          return u;
        }
        return r;
      })
    );
  };

  const addSettlement = (settlementData: Omit<Settlement, 'id' | 'createdAt'>) => {
    const activeUid = authUser?.uid || userProfile.id;
    const newSet: Settlement = {
      ...settlementData,
      id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdByUserId: activeUid,
      createdAt: new Date().toISOString(),
    };
    setSettlementsState((prev) => [newSet, ...prev]);
    setDoc(doc(db, 'settlements', newSet.id), newSet).catch(console.error);
  };

  const deleteSettlement = (id: string) => {
    setSettlementsState((prev) => prev.filter((s) => s.id !== id));
    deleteDoc(doc(db, 'settlements', id)).catch(console.error);
  };

  const updateUserProfile = (profileFields: Partial<UserProfile>) => {
    setUserProfileState((prev) => {
      const u = { ...prev, ...profileFields };
      const activeUid = authUser?.uid || u.id;
      setDoc(doc(db, 'userAccounts', activeUid), u, { merge: true }).catch(console.error);
      return u;
    });
  };

  const updateBudget = (updatedBudget: Budget) => {
    const activeUid = authUser?.uid || 'main_budget';
    const b = { ...updatedBudget, id: activeUid, createdByUserId: activeUid };
    setBudgetState(b);
    setDoc(doc(db, 'budgets', activeUid), b).catch(console.error);
  };

  const addCustomCategory = (catData: Omit<Category, 'id' | 'isCustom'>) => {
    const activeUid = authUser?.uid || userProfile.id;
    const newCat: Category = {
      ...catData,
      id: `cat_custom_${Date.now()}`,
      createdByUserId: activeUid,
      isCustom: true,
    };
    setCategoriesState((prev) => [...prev, newCat]);
    setDoc(doc(db, 'categories', newCat.id), newCat).catch(console.error);
  };

  const deleteCustomCategory = (id: string) => {
    setCategoriesState((prev) => prev.filter((c) => c.id !== id));
    deleteDoc(doc(db, 'categories', id)).catch(console.error);
  };

  const resetToDemoData = () => {
    setUserProfileState(DEFAULT_USER_PROFILE);
    setExpensesState(INITIAL_EXPENSES);
    setRecurringExpensesState(INITIAL_RECURRING_EXPENSES);
    setSettlementsState(INITIAL_SETTLEMENTS);
    setCategoriesState(DEFAULT_CATEGORIES);
    setBudgetState(INITIAL_BUDGET);

    setFilters({
      searchQuery: '',
      preset: 'this_month',
      categoryId: 'all',
      paidBy: 'all',
      recurringType: 'all',
    });
  };

  const clearAllData = () => {
    expenses.forEach((e) => deleteDoc(doc(db, 'expenses', e.id)).catch(console.error));
    recurringExpenses.forEach((r) => deleteDoc(doc(db, 'recurringExpenses', r.id)).catch(console.error));
    settlements.forEach((s) => deleteDoc(doc(db, 'settlements', s.id)).catch(console.error));
    setExpensesState([]);
    setRecurringExpensesState([]);
    setSettlementsState([]);
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        authLoading,
        loginWithGoogle,
        logoutGoogle,

        userProfile,
        userAccounts,
        currentUserId,
        expenses,
        recurringExpenses,
        settlements,
        categories,
        budget,
        filters,
        activeTab,
        isCloudConnected,
        isAddExpenseOpen,
        editingExpense,
        isUserAccountModalOpen,
        activeDateRange,
        filteredExpenses,
        dashboardTotals,

        setActiveTab,
        setFilters,
        setIsAddExpenseOpen,
        setEditingExpense,
        openAddExpenseModal,
        setIsUserAccountModalOpen,

        switchAccount,
        createAccount,
        linkPartner,

        addExpense,
        updateExpense,
        deleteExpense,
        duplicateExpense,

        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        toggleRecurringStatus,

        addSettlement,
        deleteSettlement,

        updateUserProfile,
        updateBudget,

        addCustomCategory,
        deleteCustomCategory,

        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
