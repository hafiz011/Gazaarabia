/**
 * Bounds for affiliate/ambassador commission percentages.
 * MAX_COMMISSION is a safety cap — agree the exact figure with finance.
 */
export const MAX_COMMISSION = 50;

/**
 * Validate a base/share commission pair.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateCommission(
  baseCommission: unknown,
  shareCommission: unknown
): string | null {
  const base = Number(baseCommission);
  const share = Number(shareCommission);

  const inRange = (v: number) => Number.isFinite(v) && v >= 0 && v <= MAX_COMMISSION;

  if (!inRange(base) || !inRange(share)) {
    return `Commission values must be numbers between 0 and ${MAX_COMMISSION}%.`;
  }
  if (share > base) {
    return "shareCommission cannot exceed baseCommission.";
  }
  return null;
}
