import type { CommercialTransactionStatus } from './types.js';

export function commercialStatusTitleKey(
  status: string | undefined,
): `pages.commercialTransactions.status.${CommercialTransactionStatus}` {
  if (status === 'registered') return 'pages.commercialTransactions.status.registered';
  if (status === 'voided') return 'pages.commercialTransactions.status.voided';
  return 'pages.commercialTransactions.status.draft';
}

export function commercialStatusTagColor(status: string | undefined): string {
  if (status === 'registered') return 'green';
  if (status === 'voided') return 'red';
  return 'default';
}
