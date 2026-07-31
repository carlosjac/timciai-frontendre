/**
 * Settlement of a registered sale against allocations (collections/credits).
 * Based on `openAmount`: > 0 → unpaid; ≤ 0 → paid. Draft/voided → null.
 */

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
