/**
 * Display convention for monetary amounts in Timci Admin:
 * - Always show money with exactly 2 decimal places (half-up).
 * - API/DB may store more precision (e.g. NUMERIC(28,10)); do not show the raw value.
 * - Do not use for FX rates, quantities, or non-money percentages input fields
 *   (discount % may be shown with 2 decimals via this helper when displaying).
 */

const EMPTY_DISPLAY = '—';

function parseMoneyNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const n = Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Half-up to 2 decimal places as a fixed string (e.g. `10.50`). Empty/invalid → `—`. */
export function formatTimciMoney(value: unknown): string {
  const n = parseMoneyNumber(value);
  if (n == null) return EMPTY_DISPLAY;
  return (Math.round(n * 100) / 100).toFixed(2);
}

/**
 * Same rounding as {@link formatTimciMoney}, but returns `''` for empty/invalid
 * (useful for computed form fields with placeholder "—").
 */
export function formatTimciMoneyOrEmpty(value: unknown): string {
  const n = parseMoneyNumber(value);
  if (n == null) return '';
  return (Math.round(n * 100) / 100).toFixed(2);
}
