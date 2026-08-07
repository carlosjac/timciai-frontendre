import { useTranslate } from '@refinedev/core';
import { Table } from 'antd';
import type { CommercialTransactionResource } from '../../shared/timci/commercialTransactionsApi.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import {
  TAX_LINE_FIELD_IVA_RATE,
  type CountryTaxProfileSchema,
} from '../../shared/timci/taxesApi.js';
import { computeSaleItemsTotal } from './saleLineAmounts.js';
import type { CommercialTransactionItemRow } from './commercialTransactionPanels.js';
import {
  itemTaxAmountColumnDefs,
  itemTaxAmountForKind,
  taxAttributeDisplayRows,
} from './commercialTransactionTaxDisplay.js';

type Props = {
  resource: CommercialTransactionResource;
  items?: CommercialTransactionItemRow[] | null;
  taxesOn?: boolean;
  schema?: CountryTaxProfileSchema | null;
};

function formatQuantity(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  const raw = String(value).trim().replace(',', '.');
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(value);
  if (Number.isInteger(n)) return String(n);
  return raw.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
}

function sumMoney(values: Array<string | null | undefined>): string {
  let sum = 0;
  let found = false;
  for (const v of values) {
    if (v == null || String(v).trim() === '') continue;
    const n = Number(String(v).replace(',', '.'));
    if (!Number.isNaN(n)) {
      sum += n;
      found = true;
    }
  }
  return found ? sum.toFixed(2) : '';
}

function lineHasTaxData(row: CommercialTransactionItemRow): boolean {
  if ((row.lineTaxes?.length ?? 0) > 0) return true;
  if (row.taxAmount != null && String(row.taxAmount).trim() !== '') {
    const n = Number(String(row.taxAmount).replace(',', '.'));
    if (!Number.isNaN(n) && n !== 0) return true;
  }
  if (
    row.netSubtotal != null &&
    row.subtotal != null &&
    String(row.netSubtotal) !== String(row.subtotal)
  ) {
    return true;
  }
  return false;
}

function lineTaxCategoryLabel(
  row: CommercialTransactionItemRow,
  schema: CountryTaxProfileSchema | null | undefined,
  fallbackCategoryLabel: string,
): string {
  const attrs = row.taxAttributes ?? {};
  const display = taxAttributeDisplayRows({
    schema,
    taxAttributes: attrs,
    fallbackCategoryLabel,
  });
  if (display.length > 0) return display.map((d) => d.value).join(', ');
  const raw = attrs[TAX_LINE_FIELD_IVA_RATE];
  return raw != null && String(raw).trim() !== '' ? String(raw) : '—';
}

/**
 * Read-only line items for commercial transaction show.
 * Only rendered when there is at least one row (typically sales).
 */
export function CommercialTransactionItemsPanel({
  resource: _resource,
  items,
  taxesOn = false,
  schema = null,
}: Props) {
  const translate = useTranslate();
  const rows = Array.isArray(items) ? items : [];

  if (rows.length === 0) return null;

  const showTaxes = taxesOn || rows.some(lineHasTaxData);
  const fallbackTaxLabel = translate('pages.commercialTransactions.fields.taxAmount');
  const taxCols = itemTaxAmountColumnDefs({ schema, fallbackTaxLabel });
  const categoryLabel = translate('pages.commercialTransactions.fields.taxCategory');
  const total = showTaxes
    ? formatTimciMoney(sumMoney(rows.map((r) => r.subtotal)))
    : computeSaleItemsTotal(rows);
  const netTotal = showTaxes
    ? formatTimciMoney(sumMoney(rows.map((r) => r.netSubtotal)))
    : '';
  const taxTotals = showTaxes
    ? taxCols.map((col) =>
        formatTimciMoney(sumMoney(rows.map((r) => itemTaxAmountForKind(r, col.taxKind)))),
      )
    : [];

  /** desc + qty + unit + disc% + discAmt (+ category when taxes) */
  const leadingColSpan = showTaxes ? 6 : 5;

  return (
    <Table
      style={{ marginTop: 16 }}
      size="small"
      pagination={false}
      scroll={{ x: 'max-content' }}
      rowKey={(r) => String(r.id ?? r.ordinal)}
      dataSource={rows}
      title={() => translate('pages.commercialTransactions.fields.items')}
      summary={() =>
        total ? (
          <Table.Summary.Row>
            {showTaxes ? (
              <>
                <Table.Summary.Cell index={0} colSpan={leadingColSpan} align="right">
                  <strong>{translate('pages.commercialTransactions.fields.total')}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>{netTotal || '—'}</strong>
                </Table.Summary.Cell>
                {taxTotals.map((t, i) => (
                  <Table.Summary.Cell key={taxCols[i]!.key} index={2 + i} align="right">
                    <strong>{t || '—'}</strong>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell index={2 + taxCols.length} align="right">
                  <strong>{total}</strong>
                </Table.Summary.Cell>
              </>
            ) : (
              <>
                <Table.Summary.Cell index={0} colSpan={leadingColSpan} align="right">
                  <strong>{translate('pages.commercialTransactions.fields.total')}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>{total}</strong>
                </Table.Summary.Cell>
              </>
            )}
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
          align: 'right' as const,
          render: (v: unknown) => formatQuantity(v),
        },
        {
          title: translate('pages.commercialTransactions.fields.unitPrice'),
          dataIndex: 'unitPriceAmount',
          align: 'right' as const,
          render: (v: unknown) => formatTimciMoney(v),
        },
        {
          title: translate('pages.commercialTransactions.fields.discountPercent'),
          dataIndex: 'discountPercent',
          align: 'right' as const,
          render: (v: unknown) => formatTimciMoney(v),
        },
        {
          title: translate('pages.commercialTransactions.fields.discountAmount'),
          dataIndex: 'discountAmount',
          align: 'right' as const,
          render: (v: unknown) => formatTimciMoney(v),
        },
        ...(showTaxes
          ? [
              {
                title: categoryLabel,
                key: 'taxCategory',
                ellipsis: true,
                render: (_: unknown, row: CommercialTransactionItemRow) =>
                  lineTaxCategoryLabel(row, schema, categoryLabel),
              },
              {
                title: translate('pages.commercialTransactions.fields.net'),
                dataIndex: 'netSubtotal',
                align: 'right' as const,
                fixed: 'right' as const,
                render: (v: unknown, row: CommercialTransactionItemRow) =>
                  formatTimciMoney(v ?? row.subtotal),
              },
              ...taxCols.map((col) => ({
                title: col.label,
                key: `tax-${col.key}`,
                align: 'right' as const,
                fixed: 'right' as const,
                render: (_: unknown, row: CommercialTransactionItemRow) =>
                  formatTimciMoney(itemTaxAmountForKind(row, col.taxKind)),
              })),
              {
                title: translate('pages.commercialTransactions.fields.gross'),
                dataIndex: 'subtotal',
                align: 'right' as const,
                fixed: 'right' as const,
                render: (v: unknown) => formatTimciMoney(v),
              },
            ]
          : [
              {
                title: translate('pages.commercialTransactions.fields.subtotal'),
                dataIndex: 'subtotal',
                align: 'right' as const,
                render: (v: unknown) => formatTimciMoney(v),
              },
            ]),
      ]}
    />
  );
}
