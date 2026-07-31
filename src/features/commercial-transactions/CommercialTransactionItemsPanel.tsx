import { useTranslate } from '@refinedev/core';
import { Table } from 'antd';
import type { CommercialTransactionResource } from '../../shared/timci/commercialTransactionsApi.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { computeSaleItemsTotal } from './saleLineAmounts.js';

export type CommercialTransactionItemRow = {
  id?: string;
  ordinal?: number;
  sellableItemId?: string | null;
  description?: string;
  quantity?: string;
  unitPriceAmount?: string;
  discountPercent?: string;
  discountAmount?: string;
  subtotal?: string;
};

type Props = {
  resource: CommercialTransactionResource;
  items?: CommercialTransactionItemRow[] | null;
};

/** Only sales carry line items today (backend rejects items on other types). */
export function commercialResourceCanHaveItems(
  resource: CommercialTransactionResource,
): boolean {
  return resource === 'sales';
}

function formatQuantity(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  const raw = String(value).trim().replace(',', '.');
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(value);
  if (Number.isInteger(n)) return String(n);
  return raw.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
}

/**
 * Read-only line items for commercial transaction show.
 * Only rendered when there is at least one row (typically sales).
 */
export function CommercialTransactionItemsPanel({ resource: _resource, items }: Props) {
  const translate = useTranslate();
  const rows = Array.isArray(items) ? items : [];

  if (rows.length === 0) return null;

  const total = computeSaleItemsTotal(rows);

  return (
    <Table
      style={{ marginTop: 16 }}
      size="small"
      pagination={false}
      scroll={{ x: true }}
      rowKey={(r) => String(r.id ?? r.ordinal)}
      dataSource={rows}
      title={() => translate('pages.commercialTransactions.fields.items')}
      summary={() =>
        total ? (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={5} align="right">
              <strong>{translate('pages.commercialTransactions.fields.total')}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <strong>{total}</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        ) : null
      }
      columns={[
        {
          title: translate('pages.commercialTransactions.fields.description'),
          dataIndex: 'description',
          ellipsis: true,
          render: (v: unknown) => (v != null && String(v).trim() !== '' ? String(v) : '—'),
        },
        {
          title: translate('pages.commercialTransactions.fields.quantity'),
          dataIndex: 'quantity',
          align: 'right',
          render: (v: unknown) => formatQuantity(v),
        },
        {
          title: translate('pages.commercialTransactions.fields.unitPrice'),
          dataIndex: 'unitPriceAmount',
          align: 'right',
          render: (v: unknown) => formatTimciMoney(v),
        },
        {
          title: translate('pages.commercialTransactions.fields.discountPercent'),
          dataIndex: 'discountPercent',
          align: 'right',
          render: (v: unknown) => formatTimciMoney(v),
        },
        {
          title: translate('pages.commercialTransactions.fields.discountAmount'),
          dataIndex: 'discountAmount',
          align: 'right',
          render: (v: unknown) => formatTimciMoney(v),
        },
        {
          title: translate('pages.commercialTransactions.fields.subtotal'),
          dataIndex: 'subtotal',
          align: 'right',
          render: (v: unknown) => formatTimciMoney(v),
        },
      ]}
    />
  );
}
