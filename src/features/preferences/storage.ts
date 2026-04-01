export type ThemeMode = 'light' | 'dark';

export type UserPreferencesState = {
  timeZone: string;
  dateFormat: string;
  theme: ThemeMode;
};

export const STORAGE_KEY = 'timci-refine-user-preferences';

export const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';

/** Formats exposed in preferences (and accepted from localStorage). */
export const ALLOWED_DATE_FORMATS = ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'] as const;

export function normalizeStoredDateFormat(
  value: string | undefined,
  fallback: string = DEFAULT_DATE_FORMAT,
): string {
  if (value && (ALLOWED_DATE_FORMATS as readonly string[]).includes(value)) return value;
  return fallback;
}

function detectDefaultTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function defaultUserPreferences(): UserPreferencesState {
  return {
    timeZone: detectDefaultTimeZone(),
    dateFormat: DEFAULT_DATE_FORMAT,
    theme: 'light',
  };
}

export function loadUserPreferences(): UserPreferencesState {
  if (typeof window === 'undefined') return defaultUserPreferences();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultUserPreferences();
    const parsed = JSON.parse(raw) as Partial<UserPreferencesState>;
    const base = defaultUserPreferences();
    return {
      timeZone: typeof parsed.timeZone === 'string' ? parsed.timeZone : base.timeZone,
      dateFormat: normalizeStoredDateFormat(
        typeof parsed.dateFormat === 'string' ? parsed.dateFormat : undefined,
        base.dateFormat,
      ),
      theme: parsed.theme === 'dark' || parsed.theme === 'light' ? parsed.theme : base.theme,
    };
  } catch {
    return defaultUserPreferences();
  }
}

export function saveUserPreferences(next: UserPreferencesState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}
