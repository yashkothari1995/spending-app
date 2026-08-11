import { CurrencyCode, CurrencyOption, DateFilterPreset, DateRange } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyOption> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  '$': { code: '$', symbol: '$', name: 'US Dollar ($)' },
  '€': { code: '€', symbol: '€', name: 'Euro (€)' },
  '£': { code: '£', symbol: '£', name: 'British Pound (£)' },
  '₹': { code: '₹', symbol: '₹', name: 'Indian Rupee (₹)' },
};


export function formatCurrency(amount: number, code: CurrencyCode = 'USD'): string {
  const symbol = CURRENCIES[code]?.symbol || '$';
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthYearString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getDateRangeFromPreset(preset: DateFilterPreset, referenceDate: Date = new Date()): DateRange {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  
  const toISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  switch (preset) {
    case 'today': {
      const dateStr = toISO(referenceDate);
      return { startDate: dateStr, endDate: dateStr };
    }
    case 'this_week': {
      const current = new Date(referenceDate);
      const dayOfWeek = current.getDay();
      const start = new Date(current);
      start.setDate(current.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'this_month': {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'last_month': {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'last_3_months': {
      const start = new Date(year, month - 2, 1);
      const end = new Date(year, month + 1, 0);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'last_6_months': {
      const start = new Date(year, month - 5, 1);
      const end = new Date(year, month + 1, 0);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'this_year': {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'last_year': {
      const start = new Date(year - 1, 0, 1);
      const end = new Date(year - 1, 11, 31);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
    case 'custom':
    default: {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { startDate: toISO(start), endDate: toISO(end) };
    }
  }
}

export function formatPresetLabel(preset: DateFilterPreset, customRange?: DateRange): string {
  switch (preset) {
    case 'today': return 'Today';
    case 'this_week': return 'This Week';
    case 'this_month': return 'This Month';
    case 'last_month': return 'Last Month';
    case 'last_3_months': return 'Last 3 Months';
    case 'last_6_months': return 'Last 6 Months';
    case 'this_year': return 'This Year';
    case 'last_year': return 'Last Year';
    case 'custom':
      if (customRange?.startDate && customRange?.endDate) {
        return `${formatShortDate(customRange.startDate)} - ${formatShortDate(customRange.endDate)}`;
      }
      return 'Custom Range';
    default:
      return 'Selected Period';
  }
}
