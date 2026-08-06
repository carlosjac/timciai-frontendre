/**
 * Settlement of a registered sale against allocations (collections/credits).
 * Based on `openAmount`: > 0 → unpaid; ≤ 0 → paid. Draft/voided → null.
 */

import { formatTimciMoney } from '../../shared/timci/formatMoney.js';

export type SalePaymentSettlement = 'paid' | 'unpaid';

function parseOpenAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Returns paid/unpaid only for registered sales; otherwise null. */
export function salePaymentSettlement(params: {
  type?: string | null;
  status?: string | null;
  openAmount?: string | number | null;
}): SalePaymentSettlement | null {
  if (params.type != null && params.type !== 'sale') return null;
  if (params.status !== 'registered') return null;
  const open = parseOpenAmount(params.openAmount);
  if (open == null) return null;
  return open > 0 ? 'unpaid' : 'paid';
}

export function salePaymentSettlementTitleKey(
  settlement: SalePaymentSettlement,
): 'pages.commercialTransactions.paymentSettlement.paid' | 'pages.commercialTransactions.paymentSettlement.unpaid' {
  return settlement === 'paid'
    ? 'pages.commercialTransactions.paymentSettlement.paid'
    : 'pages.commercialTransactions.paymentSettlement.unpaid';
}

export function salePaymentSettlementTagColor(settlement: SalePaymentSettlement): string {
  return settlement === 'paid' ? 'success' : 'warning';
}

type Translate = (key: string, options?: object, defaultMessage?: string) => string;

export function salePaymentSettlementLabel(
  settlement: SalePaymentSettlement,
  openAmount: unknown,
  translate: Translate,
): string {
  const base = translate(salePaymentSettlementTitleKey(settlement));
  if (settlement !== 'unpaid') return base;
  const pending = formatTimciMoney(openAmount);
  if (!pending || pending === '—') return base;
  return `${base} · ${pending}`;
}
