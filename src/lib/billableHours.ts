/**
 * Round worked hours for billing (3 dp ≈ 0.1-minute precision; avoids
 * 2-decimal display chopping e.g. 29 minutes → 0.483 h not 0.48 h).
 */
export function roundBillableHours(hours: number): number {
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.round(hours * 1000) / 1000;
}

/** Display hours with at most one decimal (e.g. 0.5, not 0.500). */
export function formatBillableHoursDisplay(hours: number | null | undefined): string {
  const h = roundBillableHours(hours ?? 0);
  const roundedTenth = Math.round(h * 10) / 10;
  if (!Number.isFinite(roundedTenth) || roundedTenth <= 0) return '0';
  return Number.isInteger(roundedTenth)
    ? String(roundedTenth)
    : roundedTenth.toFixed(1);
}
