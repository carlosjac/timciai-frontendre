import { useTranslate } from '@refinedev/core';
import { Table } from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  commercialResourceFromType,
  commercialTransactionShowPath,
  type CommercialTransactionResource,
} from '../../shared/timci/commercialTransactionsApi.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import {
  commercialResourceCanHaveAllocations,
  type AllocationRow,
} from './commercialTransactionPanels.js';

type Props = {
  /** Only debits, credits and collections carry outgoing allocations. */
  resource: CommercialTransactionResource;
  allocations?: AllocationRow[] | null;
};

/**
 * Read-only imputaciones for debit / credit / collection show.
 * Row click navigates to the target transaction show (browser back restores origin).
 */
export function CommercialTransactionAllocationsPanel({ resource, allocations }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { dateFormat, timeZone } = useUserPreferences();
  const rows = Array.isArray(allocations) ? allocations : [];

  const typeLabel = useCallback(
    (type: string | null | undefined) => {
      if (type === 'debit') return translate('pages.commercialTransactions.type.debit');
      if (type === 'credit') return translate('pages.commercialTransactions.type.credit');
      if (type === 'collection') return translate('pages.commercialTransactions.type.collection');
      return translate('pages.commercialTransactions.type.sale');
    },
    [translate],
  );

  const openTarget = useCallback(
    (row: AllocationRow) => {
      const id = row.targetTransactionId != null ? String(row.targetTransactionId) : '';
      if (!id) return;
      const res = commercialResourceFromType(row.targetType ?? 'sale') ?? 'sales';
      navigate(commercialTransactionShowPath(res, id));
    },
    [navigate],
  );

  if (!commercialResourceCanHaveAllocations(resource)) return null;

  return (
    <Table
      style={{ marginTop: 16 }}
      size="small"
      pagination={false}
      scroll={{ x: true }}
      rowKey={(r) => String(r.id ?? `${r.ordinal}-${r.targetTransactionId}-${r.amount}`)}
      dataSource={rows}
      locale={{
        emptyText: translate('pages.commercialTransactions.fields.allocationsNone'),
      }}
      title={() => translate('pages.commercialTransactions.fields.allocations')}
      onRow={(row) => {
        const id = row.targetTransactionId != null ? String(row.targetTransactionId) : '';
        if (!id) return {};
        return {
          onClick: () => openTarget(row),
          style: { cursor: 'pointer' },
        };
      }}
      columns={[
        {
          title: translate('pages.commercialTransactions.fields.entityTxnNumber'),
          key: 'entityTxnNumber',
          width: 64,
          render: (_: unknown, row: AllocationRow) =>
            row.targetEntityTxnNumber != null ? String(row.targetEntityTxnNumber) : '—',
        },
        {
          title: translate('pages.commercialTransactions.fields.allocationType'),
          key: 'type',
          render: (_: unknown, row: AllocationRow) => typeLabel(row.targetType),
        },
        {
          title: translate('pages.commercialTransactions.fields.concept'),
          key: 'concept',
          ellipsis: true,
          render: (_: unknown, row: AllocationRow) => {
            const c = row.targetConcept?.trim();
            return c ? c : '—';
          },
        },
        {
          title: translate('pages.commercialTransactions.fields.transactionDate'),
          key: 'transactionDate',
          render: (_: unknown, row: AllocationRow) =>
            formatTimciUserDateOnly(row.targetTransactionDate, { dateFormat, timeZone }),
        },
        {
          title: translate('pages.commercialTransactions.fields.allocationAmount'),
          dataIndex: 'amount',
          align: 'right',
          render: (v: unknown) => formatTimciMoney(v),
        },
      ]}
    />
  );
}
