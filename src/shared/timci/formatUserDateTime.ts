import dayjs from 'dayjs';

export type TimciUserDateTimePrefs = {
  dateFormat: string;
  timeZone: string;
};

/**
 * Convierte valores típicos de API (ISO string o ms) a timestamp en milisegundos.
 */
export function parseTimciApiDateTime(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const t = Date.parse(value);
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

/**
 * Fecha/hora en la zona y formato de preferencias del usuario (incluye segundos).
 * Requiere `dayjs` extendido con `utc` y `timezone` (ver `main.tsx`).
 */
export function formatTimciUserDateTime(
  value: unknown,
  prefs: TimciUserDateTimePrefs,
): string {
  const ms = parseTimciApiDateTime(value);
  if (!ms) return '—';
  try {
    return dayjs(ms).tz(prefs.timeZone).format(`${prefs.dateFormat} HH:mm:ss`);
  } catch {
    return '—';
  }
}

/** Fecha de vigencia (API suele enviar YYYY-MM-DD o ISO); solo día en preferencias del usuario. */
export function formatTimciUserDateOnly(
  value: unknown,
  prefs: TimciUserDateTimePrefs,
): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try {
      return dayjs(value).tz(prefs.timeZone).format(prefs.dateFormat);
    } catch {
      return value;
    }
  }
  const ms = parseTimciApiDateTime(value);
  if (!ms) return '—';
  try {
    return dayjs(ms).tz(prefs.timeZone).format(prefs.dateFormat);
  } catch {
    return '—';
  }
}
