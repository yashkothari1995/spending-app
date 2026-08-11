import { Expense, Category, UserProfile } from '../types';
import { formatDate } from './formatters';

export function exportExpensesToCSV(
  expenses: Expense[],
  categories: Category[],
  userProfile: UserProfile
): void {
  const categoryMap = new Map<string, string>();
  categories.forEach((c) => categoryMap.set(c.id, c.name));

  const partnerName = userProfile.hasPartner ? userProfile.partnerName : 'Partner';

  const headers = [
    'Date',
    'Expense Name',
    'Category',
    'Total Cost',
    'Who Paid',
    'Amount I Paid',
    `${partnerName} Paid`,
    'My Share',
    `${partnerName} Share`,
    'Family Share',
    'Split Method',
    'People Count',
    'Recurring Status',
    'Notes',
  ];

  const escapeCSV = (value: string | number) => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = expenses.map((exp) => {
    let paidByLabel = 'Me';
    if (exp.paidBy === 'partner') paidByLabel = partnerName;
    if (exp.paidBy === 'other') paidByLabel = 'Someone else';

    return [
      escapeCSV(formatDate(exp.date)),
      escapeCSV(exp.description),
      escapeCSV(categoryMap.get(exp.categoryId) || 'Uncategorized'),
      escapeCSV(exp.totalAmount.toFixed(2)),
      escapeCSV(paidByLabel),
      escapeCSV(exp.paidByMe.toFixed(2)),
      escapeCSV(exp.paidByPartner.toFixed(2)),
      escapeCSV(exp.myShare.toFixed(2)),
      escapeCSV(exp.partnerShare.toFixed(2)),
      escapeCSV(exp.familyShare.toFixed(2)),
      escapeCSV(exp.splitMethod),
      escapeCSV(exp.splitCount),
      escapeCSV(exp.isRecurring ? 'Recurring' : 'One-time'),
      escapeCSV(exp.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Spend_Tracker_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
