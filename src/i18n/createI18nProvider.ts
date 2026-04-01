import type { I18nProvider } from '@refinedev/core';
import { esMessages } from './locale.es.js';

const LOCALE_STORAGE_KEY = 'timci-refine-locale';
const DEFAULT_LOCALE = 'es';

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/** Use outside React (e.g. authProvider) for the default Spanish dictionary. */
export function translateEs(key: string, defaultMessage?: string): string {
  const v = getByPath(esMessages, key);
  if (typeof v === 'string') return v;
  return defaultMessage ?? key;
}

export function createTimciI18nProvider(): I18nProvider {
  return {
    translate: (key: string, _options?: unknown, defaultMessage?: string) =>
      translateEs(key, defaultMessage),
    changeLocale: async (locale: string) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      }
    },
    getLocale: () => {
      if (typeof localStorage === 'undefined') return DEFAULT_LOCALE;
      return localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE;
    },
  };
}
