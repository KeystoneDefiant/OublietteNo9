/**
 * Format a credit amount with thousands separators (e.g. 5000 → "5,000").
 */
export function formatCredits(amount: number): string {
  return amount.toLocaleString();
}
