/**
 * Remanente sin imputar de un cobro/crédito: amount − Σ allocations (≥ 0).
 * Prefers `unallocatedAmount` from the API when present.
 */

export type UnallocatedRemainderKind = 'allocated' | 'unallocated';

function parseAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** For registered collection/credit: fully allocated vs remanente pendiente. */
export function unallocatedRemainderKind(params: {
  type?: string | null;
  unallocatedAmount?: string | number | null;
}): UnallocatedRemainderKind | null {
  if (params.type !== 'collection' && params.type !== 'credit') return null;
  const rem = parseAmount(params.unallocatedAmount);
  if (rem == null) return null;
  return rem > 0 ? 'unallocated' : 'allocated';
}

export function unallocatedAmount(record: {
  type?: string | null;
  amount?: string | number | null;
  unallocatedAmount?: string | number | null;
  allocations?: Array<{ amount?: string | number | null }> | null;
}): string | null {
  if (record.type !== 'collection' && record.type !== 'credit') {
    if (record.unallocatedAmount != null && String(record.unallocatedAmount).trim() !== '') {
      return String(record.unallocatedAmount);
    }
    return null;
  }
  if (record.unallocatedAmount != null && String(record.unallocatedAmount).trim() !== '') {
    return String(record.unallocatedAmount);
  }
  const amount = Number(String(record.amount ?? '').replace(',', '.'));
  if (!Number.isFinite(amount)) return null;
  const allocated = (record.allocations ?? []).reduce((sum, a) => {
    const n = Number(String(a.amount ?? '').replace(',', '.'));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const rem = Math.max(0, amount - allocated);
  return String(rem);
}
