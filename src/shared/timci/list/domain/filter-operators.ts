/**
 * Timci list filter kinds and operators (aligned with backend shared filter types).
 */

export type TimciFilterKind = 'text' | 'number' | 'boolean' | 'date';

export const TIMCI_TEXT_OPERATORS = ['eq', 'contains', 'startsWith', 'endsWith'] as const;
export const TIMCI_NUMBER_OPERATORS = ['eq', 'gt', 'gte', 'lt', 'lte', 'between'] as const;
export const TIMCI_DATE_OPERATORS = [
  'eq',
  'before',
  'after',
  'onOrBefore',
  'onOrAfter',
  'between',
] as const;
export const TIMCI_BOOLEAN_OPERATORS = ['eq'] as const;

export type TimciTextOperator = (typeof TIMCI_TEXT_OPERATORS)[number];
export type TimciNumberOperator = (typeof TIMCI_NUMBER_OPERATORS)[number];
export type TimciDateOperator = (typeof TIMCI_DATE_OPERATORS)[number];

export function operatorsForKind(kind: TimciFilterKind): readonly string[] {
  switch (kind) {
    case 'text':
      return TIMCI_TEXT_OPERATORS;
    case 'number':
      return TIMCI_NUMBER_OPERATORS;
    case 'boolean':
      return TIMCI_BOOLEAN_OPERATORS;
    case 'date':
      return TIMCI_DATE_OPERATORS;
    default:
      return [];
  }
}

export function defaultOperatorForKind(kind: TimciFilterKind): string {
  switch (kind) {
    case 'text':
      return 'contains';
    case 'number':
    case 'boolean':
      return 'eq';
    case 'date':
      return 'onOrAfter';
    default:
      return 'eq';
  }
}

export function normalizeStoredOperator(
  kind: TimciFilterKind,
  op: string | undefined,
): string {
  const allowed = operatorsForKind(kind);
  if (op && allowed.includes(op)) return op;
  return defaultOperatorForKind(kind);
}
