import { Tag } from 'antd';
import {
  salePaymentSettlement,
  salePaymentSettlementLabel,
  salePaymentSettlementTagColor,
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
