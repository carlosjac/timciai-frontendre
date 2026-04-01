import type { ReactNode } from 'react';
import type { TimciFilterKind } from './filter-operators.js';

export type { TimciFilterKind } from './filter-operators.js';

/**
 * Declarative column config for Timci list tables (English identifiers only).
 * User-facing titles come from i18n via `titleKey`.
 */
export type TimciColumnDef<T extends Record<string, unknown> = Record<string, unknown>> = {
  /** Stable id for visibility + export (English, kebab or camel). */
  key: string;
  dataIndex: keyof T & string;
  /** i18n key for header label (Spanish in locale file). */
  titleKey: string;
  sorter?: boolean;
  /** Server-side filter with operators suited to the column type (Timci JSON filter). */
  filter?: { kind: TimciFilterKind };
  /** If false, column starts hidden (user can show via picker). */
  defaultVisible?: boolean;
  width?: number | string;
  render?: (value: unknown, record: T) => ReactNode;
  /** CSV cell when not plain `dataIndex`; defaults to stringifying `record[dataIndex]`. */
  exportValue?: (record: T) => string;
};
