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

function applyMustacheParams(text: string, params: Record<string, string>): string {
  let out = text;
  for (const [k, val] of Object.entries(params)) {
    out = out.replaceAll(`{{${k}}}`, val);
  }
  return out;
}

export function createTimciI18nProvider(): I18nProvider {
  return {
    translate: (key: string, options?: unknown, defaultMessage?: string) => {
      let resolvedDefault = defaultMessage;
      let params: Record<string, string> | undefined;

      if (typeof options === 'string') {
        resolvedDefault = options;
      } else if (options != null && typeof options === 'object' && !Array.isArray(options)) {
        const entries = Object.entries(options as Record<string, unknown>).filter(
          (e): e is [string, string] => typeof e[1] === 'string',
        );
        if (entries.length > 0) params = Object.fromEntries(entries);
      }

      let text = translateEs(key, resolvedDefault);
      if (params) text = applyMustacheParams(text, params);
      return text;
    },
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
