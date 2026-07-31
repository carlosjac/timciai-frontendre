import { Tag } from 'antd';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';

type Translate = (key: string, options?: object, defaultMessage?: string) => string;

function parseAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export type UnallocatedRemainderKind = 'allocated' | 'unallocated';

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

/**
 * Tag Imputado / Sin imputar (+ monto) beside Cobro/Crédito in CC type column.
 * Mirrors {@link SalePaymentSettlementTag} for sales.
 */
export function UnallocatedRemainderTag({
  type,
  unallocatedAmount,
  translate,
}: {
  type?: string | null;
  unallocatedAmount?: string | number | null;
  translate: Translate;
}) {
  const kind = unallocatedRemainderKind({ type, unallocatedAmount });
  if (!kind) return null;

  if (kind === 'allocated') {
    return (
      <Tag color="success">
        {translate('pages.commercialTransactions.allocationRemainder.allocated')}
      </Tag>
    );
  }

  const money = formatTimciMoney(unallocatedAmount);
  const base = translate('pages.commercialTransactions.allocationRemainder.unallocated');
  const label = money && money !== '—' ? `${base} · ${money}` : base;
  return <Tag color="warning">{label}</Tag>;
}
