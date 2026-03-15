
/**
 * @fileOverview Utility functions for managing the monthly budget and report preferences.
 * Uses localStorage for simple persistence.
 */

const BUDGET_KEY = 'kwanza_keeper_monthly_budget';
const REPORT_DAY_KEY = 'kwanza_keeper_report_day';
const MULTI_CURRENCY_KEY = 'kwanza_keeper_multi_currency_enabled';
const DEFAULT_BUDGET = 150000; // Default 150.000 Kz
const DEFAULT_REPORT_DAY = 1; // Default day 1

/**
 * Retrieves the saved monthly budget from localStorage.
 */
export function getBudget(): number {
  if (typeof window === 'undefined') return DEFAULT_BUDGET;
  const saved = localStorage.getItem(BUDGET_KEY);
  return saved ? parseFloat(saved) : DEFAULT_BUDGET;
}

/**
 * Saves a new monthly budget value to localStorage.
 */
export function setBudget(amount: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BUDGET_KEY, amount.toString());
}

/**
 * Retrieves the preferred day for monthly reports.
 */
export function getReportDay(): number {
  if (typeof window === 'undefined') return DEFAULT_REPORT_DAY;
  const saved = localStorage.getItem(REPORT_DAY_KEY);
  return saved ? parseInt(saved) : DEFAULT_REPORT_DAY;
}

/**
 * Saves the preferred day for monthly reports.
 */
export function setReportDay(day: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REPORT_DAY_KEY, day.toString());
}

/**
 * Checks if multi-currency support is enabled.
 */
export function isMultiCurrencyEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MULTI_CURRENCY_KEY) === 'true';
}

/**
 * Toggles multi-currency support.
 */
export function setMultiCurrencyEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MULTI_CURRENCY_KEY, enabled.toString());
}

/**
 * Calculates the remaining budget.
 */
export function calculateRemainingBudget(budget: number, spent: number): number {
  return Math.max(0, budget - spent);
}

/**
 * Returns a color class based on the budget consumption percentage.
 * Green: < 60%
 * Orange: 60% - 90%
 * Red: > 90%
 */
export function getBudgetColor(percentage: number): string {
  if (percentage < 60) return 'bg-emerald-500';
  if (percentage < 90) return 'bg-amber-500';
  return 'bg-destructive';
}
