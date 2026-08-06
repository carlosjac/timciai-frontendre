import { formatTimciMoneyOrEmpty } from '../../shared/timci/formatMoney.js';
import type { AllocationFormRow } from './types.js';

export type AllocationCandidateRow = {
  id: string;
  entityTxnNumber?: number | null;
  type: string;
  transactionDate?: string;
  amount?: string;
  openAmount?: string;
  concept?: string | null;
  /** Full-open policy adjustment (signed) as of collection date. */
  adjustmentAmount?: string;
  /** Cash to settle full open as of collection date. */
  settlementAmount?: string;
};

function parseMoneyNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function roundMoney2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatMoney2(n: number): string {
  return formatTimciMoneyOrEmpty(n) || '0.00';
}

/** FIFO on cash (settlement); stores nominal open tranche in allocation.amount. */
export function buildFifoAllocations(
  collectionAmount: number,
  candidates: AllocationCandidateRow[],
): AllocationFormRow[] {
  let remaining = roundMoney2(collectionAmount);
  if (remaining <= 0) return [];

  const out: AllocationFormRow[] = [];
  for (const row of candidates) {
    if (remaining <= 0) break;
    const open = roundMoney2(parseMoneyNumber(row.openAmount ?? row.amount) ?? 0);
    if (open <= 0) continue;
    const settlement = roundMoney2(parseMoneyNumber(row.settlementAmount) ?? open);
    if (settlement <= 0) continue;
    const takeCash = Math.min(remaining, settlement);
    if (takeCash <= 0) continue;
    const takeNominal = roundMoney2((takeCash / settlement) * open);
    out.push({ targetTransactionId: row.id, amount: formatMoney2(takeNominal) });
    remaining = roundMoney2(remaining - takeCash);
  }
  return out;
}

export function parsePositiveAmount(raw: unknown): string | null {
  const formatted = formatTimciMoneyOrEmpty(raw);
  if (!formatted) return null;
  const n = Number(formatted);
  return n > 0 ? formatted : null;
}

export { parseMoneyNumber, roundMoney2, formatMoney2 };
