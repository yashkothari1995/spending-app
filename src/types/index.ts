export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY' | 'SGD' | '$' | '€' | '£' | '₹';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export type PaidByOption = 'me' | 'partner' | 'other';

export type SplitMethod = 'equal' | 'custom';

export type RecurrenceFrequency = 
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annually'
  | 'yearly'
  | 'custom';

export type ExpenseType = 
  | 'subscription'
  | 'fixed_bill'
  | 'variable_bill'
  | 'loan_emi'
  | 'rent_mortgage'
  | 'insurance'
  | 'membership'
  | 'other';

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class or hex
  isCustom?: boolean;
  createdByUserId?: string;
}

export interface ExpenseShare {
  personId: string; // 'me' | 'partner' | 'other_1' etc.
  personName: string;
  amount: number;
}

export interface PaymentBreakdown {
  paidByMe: number;
  paidByPartner: number;
  paidByOthers: number;
}

export interface Expense {
  id: string;
  description: string;
  totalAmount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  paidBy: PaidByOption;
  
  // Breakdown of who physically paid
  paidByMe: number;
  paidByPartner: number;
  paidByOthers: number;

  // Split configurations
  splitCount: number; // 1 (just me), 2 (me+wife), 3, 4, custom
  splitMethod: SplitMethod;
  
  // Calculated shares
  myShare: number;
  partnerShare: number;
  othersShare: number;
  familyShare: number; // myShare + partnerShare

  // Recurring link
  isRecurring: boolean;
  recurringId?: string;
  expenseType?: ExpenseType;

  notes?: string;
  createdByUserId?: string;
  createdByUserName?: string;
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  frequency: RecurrenceFrequency;
  categoryId: string;
  expenseType: ExpenseType;
  
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  nextPaymentDate: string; // YYYY-MM-DD
  occurrencesLimit?: number;
  occurrencesCount: number;
  
  paidBy: PaidByOption;
  splitCount: number;
  splitMethod: SplitMethod;
  myShare: number;
  partnerShare: number;
  othersShare: number;

  status: 'active' | 'paused' | 'ended';
  notes?: string;
  createdByUserId?: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  fromPerson: 'me' | 'partner' | 'other';
  toPerson: 'me' | 'partner' | 'other';
  fromName: string;
  toName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdByUserId?: string;
  createdAt: string;
}

export interface CategoryBudget {
  categoryId: string;
  amount: number;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: CategoryBudget[];
  createdByUserId?: string;
}


export interface UserAccount {
  id: string; // e.g. 'USR-8492' or 'alex_k'
  name: string;
  email?: string;
  avatarColor: string; // 'teal' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'purple' | 'cyan'
  hasPartner: boolean;
  partnerName: string;
  partnerUserId?: string;
  currency: CurrencyCode;
  createdAt: string;
}

export interface UserProfile {
  id: string; // Unique User ID code
  name: string;
  email?: string;
  avatarColor?: string;
  hasPartner: boolean;
  partnerName: string;
  partnerUserId?: string;
  currency: CurrencyCode;
}

export type DateFilterPreset = 
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'last_year'
  | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface ExpenseFilters {
  searchQuery: string;
  preset: DateFilterPreset;
  customDateRange?: DateRange;
  categoryId?: string;
  paidBy?: PaidByOption | 'all';
  recurringType?: 'all' | 'recurring' | 'one_time';
  minAmount?: number;
  maxAmount?: number;
}

export type NavigationTab = 
  | 'dashboard'
  | 'transactions'
  | 'recurring'
  | 'budgets'
  | 'settlements'
  | 'reports'
  | 'settings';
