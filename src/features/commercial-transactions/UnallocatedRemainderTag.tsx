import { Tag } from 'antd';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { unallocatedRemainderKind } from './unallocatedAmount.js';

type Translate = (key: string, options?: object, defaultMessage?: string) => string;

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
