import { EditButton } from '@refinedev/antd';
import { useList, usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { useMemo } from 'react';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import type { CommercialTransactionResource } from '../../shared/timci/commercialTransactionsApi.js';
import { commercialTransactionShowPath } from '../../shared/timci/commercialTransactionsApi.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { COMMERCIAL_TX_CONFIG } from './types.js';
import { commercialStatusTagColor, commercialStatusTitleKey } from './statusLabel.js';
import { salePaymentSettlement, salePaymentSettlementLabel } from './salePaymentSettlement.js';
import { SalePaymentSettlementTag } from './SalePaymentSettlementTag.js';
import { unallocatedAmount } from './unallocatedAmount.js';

type TxRow = BaseRecord & {
  entityTxnNumber?: number | null;
  transactionDate?: string;
  customerId?: string;
  currencyId?: string;
  amount?: string;
  openAmount?: string | null;
  unallocatedAmount?: string | null;
  allocations?: Array<{ amount?: string | null }>;
  concept?: string | null;
  status?: string;
  type?: string;
};

type Props = {
  resource: CommercialTransactionResource;
};

export function CommercialTransactionList({ resource }: Props) {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const config = COMMERCIAL_TX_CONFIG[resource];
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canView = codes.includes(`${resource}.view`);
  const canUpdate = codes.includes(`${resource}.update`);

  const { result: customersResult } = useList({
    resource: 'customers',
    pagination: { currentPage: 1, pageSize: 500 },
  });
  const { result: currenciesResult } = useList({
    resource: 'currencies',
    pagination: { currentPage: 1, pageSize: 500 },
  });

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of customersResult.data ?? []) {
      map.set(String(c.id), typeof c.name === 'string' ? c.name : String(c.id));
    }
    return map;
  }, [customersResult.data]);

  const currencyLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of currenciesResult.data ?? []) {
      const name = typeof c.name === 'string' ? c.name.trim() : '';
      const code = typeof c.code === 'string' ? c.code.trim() : '';
      map.set(String(c.id), name && code ? `${name} (${code})` : name || code || String(c.id));
    }
    return map;
  }, [currenciesResult.data]);

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: TxRow) => commercialTransactionShowPath(resource, String(record.id))
        : undefined,
    [canView, resource],
  );

  const columnDefs = useMemo((): TimciColumnDef<TxRow>[] => {
    const editColumn: TimciColumnDef<TxRow> = {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.commercialTransactions.actions',
      width: 72,
      render: (_: unknown, record: TxRow) => {
        if (record.status !== 'draft') return null;
        return (
          <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
            <EditButton
              resource={resource}
              recordItemId={record.id}
              hideText
              title={translate('table.commercialTransactions.edit')}
              aria-label={translate('table.commercialTransactions.edit')}
            />
          </span>
        );
      },
      exportValue: () => '',
    };

    const cols: TimciColumnDef<TxRow>[] = [
      {
        key: 'entityTxnNumber',
        dataIndex: 'entityTxnNumber',
        titleKey: 'table.commercialTransactions.entityTxnNumber',
        sorter: true,
        filter: { kind: 'number' },
        width: 80,
        render: (v: unknown) => (v != null && v !== '' ? String(v) : '—'),
        exportValue: (r) =>
          r.entityTxnNumber != null ? String(r.entityTxnNumber) : '',
      },
      {
        key: 'transactionDate',
        dataIndex: 'transactionDate',
        titleKey: 'table.commercialTransactions.transactionDate',
        sorter: true,
        filter: { kind: 'date' },
        render: (v: unknown) => formatTimciUserDateOnly(v, { dateFormat, timeZone }),
        exportValue: (r) =>
          formatTimciUserDateOnly(r.transactionDate, { dateFormat, timeZone }),
      },
      {
        key: 'customerId',
        dataIndex: 'customerId',
        titleKey: 'table.commercialTransactions.customer',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => {
          const id = v != null ? String(v) : '';
          return id ? (customerNameById.get(id) ?? id) : '—';
        },
        exportValue: (r) => {
          const id = r.customerId ? String(r.customerId) : '';
          return id ? (customerNameById.get(id) ?? id) : '';
        },
      },
      {
        key: 'currencyId',
        dataIndex: 'currencyId',
        titleKey: 'table.commercialTransactions.currency',
        sorter: true,
        render: (v: unknown) => {
          const id = v != null ? String(v) : '';
          return id ? (currencyLabelById.get(id) ?? id) : '—';
        },
        exportValue: (r) => {
          const id = r.currencyId ? String(r.currencyId) : '';
          return id ? (currencyLabelById.get(id) ?? id) : '';
        },
      },
      {
        key: 'amount',
        dataIndex: 'amount',
        titleKey: 'table.commercialTransactions.amount',
        sorter: true,
        filter: { kind: 'number' },
        render: (v: unknown) => formatTimciMoney(v),
        exportValue: (r) => formatTimciMoney(r.amount),
      },
      {
        key: 'concept',
        dataIndex: 'concept',
        titleKey: 'table.commercialTransactions.concept',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => {
          const text = typeof v === 'string' ? v.trim() : '';
          return text || '—';
        },
        exportValue: (r) => (typeof r.concept === 'string' ? r.concept.trim() : ''),
      },
      {
        key: 'status',
        dataIndex: 'status',
        titleKey: 'table.commercialTransactions.status',
        sorter: true,
        render: (v: unknown) => {
          const status = typeof v === 'string' ? v : undefined;
          return (
            <Tag color={commercialStatusTagColor(status)}>
              {translate(commercialStatusTitleKey(status))}
            </Tag>
          );
        },
        exportValue: (r) => translate(commercialStatusTitleKey(r.status)),
      },
    ];

    if (resource === 'sales') {
      cols.push({
        key: 'paymentSettlement',
        dataIndex: 'openAmount',
        titleKey: 'table.commercialTransactions.paymentSettlement',
        render: (_: unknown, record: TxRow) => (
          <SalePaymentSettlementTag
            type="sale"
            status={record.status}
            openAmount={record.openAmount}
            translate={translate}
          />
        ),
        exportValue: (r) => {
          const settlement = salePaymentSettlement({
            type: 'sale',
            status: r.status,
            openAmount: r.openAmount,
          });
          return settlement ? salePaymentSettlementLabel(settlement, r.openAmount, translate) : '';
        },
      });
    }

    if (resource === 'collections' || resource === 'credits') {
      cols.push({
        key: 'unallocatedAmount',
        dataIndex: 'unallocatedAmount',
        titleKey: 'table.commercialTransactions.unallocatedAmount',
        render: (_: unknown, record: TxRow) => {
          const rem = unallocatedAmount({
            type: resource === 'collections' ? 'collection' : 'credit',
            amount: record.amount,
            unallocatedAmount: record.unallocatedAmount,
            allocations: record.allocations,
          });
          return rem != null ? formatTimciMoney(rem) : '—';
        },
        exportValue: (r) => {
          const rem = unallocatedAmount({
            type: resource === 'collections' ? 'collection' : 'credit',
            amount: r.amount,
            unallocatedAmount: r.unallocatedAmount,
            allocations: r.allocations,
          });
          return rem != null ? formatTimciMoney(rem) : '';
        },
      });
    }

    return canUpdate ? [editColumn, ...cols] : cols;
  }, [
    canUpdate,
    customerNameById,
    currencyLabelById,
    dateFormat,
    resource,
    timeZone,
    translate,
  ]);

  return (
    <TimciDataList<TxRow>
      resource={resource}
      rowKey="id"
      titleKey={`${config.i18nPagesPrefix}.title`}
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
      getRowShowPath={getRowShowPath}
      initialSorters={[{ field: 'entityTxnNumber', order: 'desc' }]}
    />
  );
}
