
export enum CategoryId {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  SHOPPING = 'SHOPPING',
  HOUSING = 'HOUSING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  HEALTH = 'HEALTH',
  INVESTMENT = 'INVESTMENT',
  OTHER = 'OTHER'
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  note?: string;
}

export interface CategoryConfig {
  id: string;
  label: string;
  color: string; // Hex color
  twColor: string; // Tailwind class fallback
  iconName: string; // Lucide icon name
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  categoryId: string;
  [key: string]: any;
}

export type ViewMode = 'OVERVIEW' | 'TRANSACTIONS' | 'CATEGORIES' | 'ICONS' | 'SETTINGS';

export type DateScope = 'MONTH' | 'YEAR' | 'ALL';

export type SortField = 'date' | 'amount' | 'title' | 'category';
export type SortDirection = 'asc' | 'desc';
