import { ALLOWED_DATE_FORMATS } from '../preferences/storage.js';

type TranslateFn = (key: string, defaultMessage?: string, keyFallback?: string) => string;

const DATE_FORMAT_LABEL_KEYS: Record<(typeof ALLOWED_DATE_FORMATS)[number], string> = {
  'DD/MM/YYYY': 'pages.preferences.dateFormats.ddmmyyyy',
  'YYYY-MM-DD': 'pages.preferences.dateFormats.yyyymmdd',
  'MM/DD/YYYY': 'pages.preferences.dateFormats.mmddyyyy',
};

export function translateUserDateFormat(translate: TranslateFn, value: unknown): string {
  const key = typeof value === 'string' ? value : '';
  if (key in DATE_FORMAT_LABEL_KEYS) {
    return translate(DATE_FORMAT_LABEL_KEYS[key as keyof typeof DATE_FORMAT_LABEL_KEYS], undefined, key);
  }
  return key || '—';
}

export function translateUserTheme(translate: TranslateFn, value: unknown): string {
  if (value === 'dark') return translate('pages.preferences.theme.dark');
  if (value === 'light') return translate('pages.preferences.theme.light');
  return typeof value === 'string' && value ? value : '—';
}
