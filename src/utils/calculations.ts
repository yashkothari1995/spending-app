import { 
  Expense, 
  RecurringExpense, 
  Settlement, 
  PaidByOption, 
  SplitMethod, 
  RecurrenceFrequency,
  UserProfile 
} from '../types';
import { getTodayDateString } from './formatters';

export interface CalculatedSplit {
  totalAmount: number;
  paidByMe: number;
  paidByPartner: number;
  paidByOthers: number;
  myShare: number;
  partnerShare: number;
  othersShare: number;
  familyShare: number;
}

export function computeShares(
  totalAmount: number,
  paidBy: PaidByOption,
  splitCount: number,
  splitMethod: SplitMethod,
  customMyShare?: number,
  customPartnerShare?: number,
  customOthersShare?: number,
  hasPartner: boolean = true
): CalculatedSplit {
  const safeTotal = Math.max(0, Number(totalAmount) || 0);

  // Payments
  let paidByMe = 0;
  let paidByPartner = 0;
  let paidByOthers = 0;

  if (paidBy === 'me') {
    paidByMe = safeTotal;
  } else if (paidBy === 'partner') {
    paidByPartner = safeTotal;
  } else {
    paidByOthers = safeTotal;
  }

  // Shares
  let myShare = 0;
  let partnerShare = 0;
  let othersShare = 0;

  if (splitMethod === 'custom') {
    myShare = Math.max(0, Number(customMyShare) || 0);
    partnerShare = hasPartner ? Math.max(0, Number(customPartnerShare) || 0) : 0;
    othersShare = Math.max(0, Number(customOthersShare) || 0);
  } else {
    // Equal split
    const safeSplitCount = Math.max(1, splitCount);
    const equalShare = Number((safeTotal / safeSplitCount).toFixed(2));
    
    if (safeSplitCount === 1) {
      myShare = safeTotal;
      partnerShare = 0;
      othersShare = 0;
    } else if (safeSplitCount === 2 && hasPartner) {
      myShare = equalShare;
      partnerShare = Number((safeTotal - myShare).toFixed(2)); // handle odd cents
      othersShare = 0;
    } else {
      myShare = equalShare;
      if (hasPartner) {
        partnerShare = equalShare;
        othersShare = Math.max(0, Number((safeTotal - myShare - partnerShare).toFixed(2)));
      } else {
        partnerShare = 0;
        othersShare = Math.max(0, Number((safeTotal - myShare).toFixed(2)));
      }
    }
  }

  const familyShare = Number((myShare + (hasPartner ? partnerShare : 0)).toFixed(2));

  return {
    totalAmount: safeTotal,
    paidByMe,
    paidByPartner,
    paidByOthers,
    myShare,
    partnerShare,
    othersShare,
    familyShare,
  };
}

export interface DashboardTotals {
  totalSpend: number;
  myShare: number;
  familyShare: number;
  iPaid: number;
  partnerPaid: number;
  recurringSpend: number;
  oneTimeSpend: number;
  grossPartnerDebtFromExpenses: number;
  settlementFromPartnerToMe: number;
  settlementFromMeToPartner: number;
  netPartnerBalance: number; // positive = partner owes me, negative = I owe partner
  formattedBalanceText: string;
}

export function calculateDashboardTotals(
  expenses: Expense[],
  settlements: Settlement[],
  userProfile: UserProfile
): DashboardTotals {
  let totalSpend = 0;
  let myShare = 0;
  let familyShare = 0;
  let iPaid = 0;
  let partnerPaid = 0;
  let recurringSpend = 0;
  let oneTimeSpend = 0;
  let grossPartnerDebtFromExpenses = 0;

  expenses.forEach((exp) => {
    totalSpend += exp.totalAmount;
    myShare += exp.myShare;
    familyShare += exp.familyShare;
    iPaid += exp.paidByMe;
    partnerPaid += exp.paidByPartner;

    if (exp.isRecurring) {
      recurringSpend += exp.totalAmount;
    } else {
      oneTimeSpend += exp.totalAmount;
    }

    // Debt from this expense: partner should contribute partnerShare, but paid paidByPartner
    // So partner owes me (partnerShare - paidByPartner)
    grossPartnerDebtFromExpenses += (exp.partnerShare - exp.paidByPartner);
  });

  let settlementFromPartnerToMe = 0;
  let settlementFromMeToPartner = 0;

  settlements.forEach((s) => {
    if (s.fromPerson === 'partner' && s.toPerson === 'me') {
      settlementFromPartnerToMe += s.amount;
    } else if (s.fromPerson === 'me' && s.toPerson === 'partner') {
      settlementFromMeToPartner += s.amount;
    }
  });

  // Partner debt reduced by settlements partner paid to me, increased by settlements I paid to partner
  const netPartnerBalance = userProfile.hasPartner 
    ? (grossPartnerDebtFromExpenses - settlementFromPartnerToMe + settlementFromMeToPartner)
    : 0;

  const partnerName = userProfile.partnerName || 'Partner';
  let formattedBalanceText = 'Balanced';
  if (Math.abs(netPartnerBalance) > 0.01) {
    if (netPartnerBalance > 0) {
      formattedBalanceText = `${partnerName} owes you $${netPartnerBalance.toFixed(2)}`;
    } else {
      formattedBalanceText = `You owe ${partnerName} $${Math.abs(netPartnerBalance).toFixed(2)}`;
    }
  }

  return {
    totalSpend: Number(totalSpend.toFixed(2)),
    myShare: Number(myShare.toFixed(2)),
    familyShare: Number(familyShare.toFixed(2)),
    iPaid: Number(iPaid.toFixed(2)),
    partnerPaid: Number(partnerPaid.toFixed(2)),
    recurringSpend: Number(recurringSpend.toFixed(2)),
    oneTimeSpend: Number(oneTimeSpend.toFixed(2)),
    grossPartnerDebtFromExpenses: Number(grossPartnerDebtFromExpenses.toFixed(2)),
    settlementFromPartnerToMe: Number(settlementFromPartnerToMe.toFixed(2)),
    settlementFromMeToPartner: Number(settlementFromMeToPartner.toFixed(2)),
    netPartnerBalance: Number(netPartnerBalance.toFixed(2)),
    formattedBalanceText,
  };
}

export function calculateNextDate(startDate: string, frequency: RecurrenceFrequency): string {
  const d = new Date(startDate + 'T00:00:00');
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'quarterly':
      d.setMonth(d.getMonth() + 3);
      break;
    case 'semi_annually':
      d.setMonth(d.getMonth() + 6);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    case 'custom':
    default:
      d.setMonth(d.getMonth() + 1);
      break;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function processDueRecurringExpenses(
  recurringExpenses: RecurringExpense[],
  existingExpenses: Expense[],
  todayStr: string = getTodayDateString(),
  hasPartner: boolean = true
): { updatedRecurring: RecurringExpense[]; newExpenses: Expense[] } {
  const updatedRecurring = [...recurringExpenses];
  const newExpenses: Expense[] = [];

  updatedRecurring.forEach((rec, idx) => {
    if (rec.status !== 'active') return;

    let currentNext = rec.nextPaymentDate;
    let occurrences = rec.occurrencesCount;

    while (currentNext <= todayStr) {
      if (rec.endDate && currentNext > rec.endDate) {
        updatedRecurring[idx] = { ...updatedRecurring[idx], status: 'ended' };
        break;
      }

      if (rec.occurrencesLimit && occurrences >= rec.occurrencesLimit) {
        updatedRecurring[idx] = { ...updatedRecurring[idx], status: 'ended' };
        break;
      }

      // Check if expense already generated for this recurring item on currentNext date
      const alreadyExists = existingExpenses.some(
        (e) => e.recurringId === rec.id && e.date === currentNext
      ) || newExpenses.some((e) => e.recurringId === rec.id && e.date === currentNext);

      if (!alreadyExists) {
        const shares = computeShares(
          rec.amount,
          rec.paidBy,
          rec.splitCount,
          rec.splitMethod,
          rec.myShare,
          rec.partnerShare,
          rec.othersShare,
          hasPartner
        );

        const newExp: Expense = {
          id: `exp_rec_${rec.id}_${currentNext.replace(/-/g, '')}`,
          description: rec.description,
          totalAmount: rec.amount,
          date: currentNext,
          categoryId: rec.categoryId,
          paidBy: rec.paidBy,
          paidByMe: shares.paidByMe,
          paidByPartner: shares.paidByPartner,
          paidByOthers: shares.paidByOthers,
          splitCount: rec.splitCount,
          splitMethod: rec.splitMethod,
          myShare: shares.myShare,
          partnerShare: shares.partnerShare,
          othersShare: shares.othersShare,
          familyShare: shares.familyShare,
          isRecurring: true,
          recurringId: rec.id,
          expenseType: rec.expenseType,
          notes: rec.notes || 'Auto-generated recurring expense',
          createdAt: new Date().toISOString(),
        };

        newExpenses.push(newExp);
      }

      occurrences += 1;
      const nextDate = calculateNextDate(currentNext, rec.frequency);
      currentNext = nextDate;

      updatedRecurring[idx] = {
        ...updatedRecurring[idx],
        nextPaymentDate: currentNext,
        occurrencesCount: occurrences,
      };
    }
  });

  return { updatedRecurring, newExpenses };
}

export function calculateMonthlyRecurringEstimate(
  recurringExpenses: RecurringExpense[],
  hasPartner: boolean = true
): { monthlyTotal: number; monthlyMyShare: number; monthlyFamilyShare: number; activeCount: number } {
  let monthlyTotal = 0;
  let monthlyMyShare = 0;
  let monthlyFamilyShare = 0;
  let activeCount = 0;

  recurringExpenses.forEach((rec) => {
    if (rec.status !== 'active') return;
    activeCount += 1;

    let multiplier = 1; // for monthly
    switch (rec.frequency) {
      case 'daily': multiplier = 30; break;
      case 'weekly': multiplier = 4.33; break;
      case 'biweekly': multiplier = 2.16; break;
      case 'monthly': multiplier = 1; break;
      case 'quarterly': multiplier = 1 / 3; break;
      case 'semi_annually': multiplier = 1 / 6; break;
      case 'yearly': multiplier = 1 / 12; break;
      default: multiplier = 1; break;
    }

    const shares = computeShares(
      rec.amount,
      rec.paidBy,
      rec.splitCount,
      rec.splitMethod,
      rec.myShare,
      rec.partnerShare,
      rec.othersShare,
      hasPartner
    );

    monthlyTotal += rec.amount * multiplier;
    monthlyMyShare += shares.myShare * multiplier;
    monthlyFamilyShare += shares.familyShare * multiplier;
  });

  return {
    monthlyTotal: Number(monthlyTotal.toFixed(2)),
    monthlyMyShare: Number(monthlyMyShare.toFixed(2)),
    monthlyFamilyShare: Number(monthlyFamilyShare.toFixed(2)),
    activeCount,
  };
}
