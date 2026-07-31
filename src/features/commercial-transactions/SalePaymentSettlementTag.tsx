import { Tag } from 'antd';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import {
  salePaymentSettlement,
  salePaymentSettlementTagColor,
  salePaymentSettlementTitleKey,
  type SalePaymentSettlement,
} from './salePaymentSettlement.js';

type Translate = (key: string, options?: object, defaultMessage?: string) => string;

/** Tag Pagada / Impaga (+ saldo pendiente when unpaid). */
export function SalePaymentSettlementTag({
  status,
  openAmount,
  type = 'sale',
  translate,
}: {
  status?: string | null;
  openAmount?: string | number | null;
  type?: string | null;
  translate: Translate;
}) {
  const settlement = salePaymentSettlement({ type, status, openAmount });
  if (!settlement) return '—';

  const label = salePaymentSettlementLabel(settlement, openAmount, translate);
  return <Tag color={salePaymentSettlementTagColor(settlement)}>{label}</Tag>;
}

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
