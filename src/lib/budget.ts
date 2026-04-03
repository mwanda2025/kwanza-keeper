/**
 * @fileOverview Utility functions for managing the monthly budget and report preferences.
 * DEPRECATED: All logic migrated to Cloud Firestore via useUserSettings.ts hook.
 * This file is kept as an empty shell to avoid breaking legacy imports, but no longer uses localStorage.
 */

export function getBudget(): number { return 150000; }
export function setBudget(amount: number): void { }
export function getReportDay(): number { return 1; }
export function setReportDay(day: number): void { }
export function isMultiCurrencyEnabled(): boolean { return false; }
export function setMultiCurrencyEnabled(enabled: boolean): void { }
export function calculateRemainingBudget(budget: number, spent: number): number {
  return Math.max(0, budget - spent);
}
export function getBudgetColor(percentage: number): string {
  if (percentage < 60) return 'bg-emerald-500';
  if (percentage < 90) return 'bg-amber-500';
  return 'bg-destructive';
}
