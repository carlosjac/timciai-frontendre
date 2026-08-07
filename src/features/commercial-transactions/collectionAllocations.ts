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

/**
 * True when cash covers full-open settlement (closes the document → policy applies).
 * Partials are 1:1 (cash = nominal).
 */
function closesDocument(cash: number, open: number, settlement: number): boolean {
  if (open <= 0 || settlement <= 0) return false;
  return roundMoney2(cash) >= roundMoney2(settlement);
}

/** FIFO on cash; stores nominal. Partial takes are 1:1; closing take uses settlement ratio. */
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
    const takeNominal = closesDocument(takeCash, open, settlement)
      ? roundMoney2((takeCash / settlement) * open)
      : Math.min(takeCash, open);
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

/**
 * Maps a nominal open tranche to cash.
 * Partial (nominal < open): 1:1. Close (nominal >= open): settlement ratio.
 */
export function nominalAllocatedToCash(opts: {
  nominalAllocated: number;
  openAmount: number;
  settlementAmount: number;
}): number {
  const open = roundMoney2(opts.openAmount);
  const settlement = roundMoney2(opts.settlementAmount);
  const nominal = roundMoney2(opts.nominalAllocated);
  if (open <= 0 || settlement <= 0 || nominal <= 0) return 0;
  if (nominal >= open) {
    // Closing: full settlement cash (or proportional if somehow over)
    if (settlement === open) return Math.min(nominal, open);
    return roundMoney2((nominal / open) * settlement);
  }
  // Partial: 1:1
  return Math.min(nominal, open);
}

/**
 * Outgoing allocations on collection/credit show: draft (and credits always) store nominal;
 * registered collections already store settlement cash after materialize.
 */
export function cashDisplayForStoredAllocation(opts: {
  storedAmount: number;
  openAmount: number;
  settlementAmount: number;
  /** When true, stored amount is nominal and must be converted. */
  convertNominalToCash: boolean;
}): number {
  if (!opts.convertNominalToCash) return roundMoney2(opts.storedAmount);
  if (opts.openAmount <= 0 || opts.settlementAmount <= 0) {
    return roundMoney2(opts.storedAmount);
  }
  return nominalAllocatedToCash({
    nominalAllocated: opts.storedAmount,
    openAmount: opts.openAmount,
    settlementAmount: opts.settlementAmount,
  });
}

/** @deprecated Use cashDisplayForStoredAllocation */
export function cashDisplayForCollectionAllocation(opts: {
  storedAmount: number;
  openAmount: number;
  settlementAmount: number;
  isDraft: boolean;
}): number {
  return cashDisplayForStoredAllocation({
    storedAmount: opts.storedAmount,
    openAmount: opts.openAmount,
    settlementAmount: opts.settlementAmount,
    convertNominalToCash: opts.isDraft,
  });
}

/**
 * Maps cash entered by the user back to nominal open tranche for the API.
 * Partial (cash < settlement): 1:1. Close (cash >= settlement): invert ratio.
 */
export function cashAllocatedToNominal(opts: {
  cashAllocated: number;
  openAmount: number;
  settlementAmount: number;
}): number {
  const open = roundMoney2(opts.openAmount);
  const settlement = roundMoney2(opts.settlementAmount);
  const cash = roundMoney2(opts.cashAllocated);
  if (open <= 0 || settlement <= 0 || cash <= 0) return 0;
  if (closesDocument(cash, open, settlement)) {
    if (settlement === open) return Math.min(cash, open);
    return roundMoney2((cash / settlement) * open);
  }
  return Math.min(cash, open);
}

export { parseMoneyNumber, roundMoney2, formatMoney2 };
