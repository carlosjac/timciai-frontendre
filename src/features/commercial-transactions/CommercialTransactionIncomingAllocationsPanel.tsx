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

export type IncomingAllocationRow = {
  sourceTransactionId: string;
  sourceType: string;
  sourceTransactionDate: string;
  sourceAmount: string;
  sourceConcept?: string | null;
  sourceEntityTxnNumber?: number | null;
  amount: string;
};

type Props = {
  resource: CommercialTransactionResource;
  incomingAllocations?: IncomingAllocationRow[] | null;
};

/** Sale and debit can receive imputaciones from credits/collections. */
export function commercialResourceCanReceiveAllocations(
  resource: CommercialTransactionResource,
): boolean {
  return resource === 'sales' || resource === 'debits';
}

/**
 * Imputaciones recibidas (cobros/créditos registrados que aplicaron a esta venta/débito).
 * Row click navigates to the source transaction show (browser back restores origin).
 */
export function CommercialTransactionIncomingAllocationsPanel({
  resource,
  incomingAllocations,
}: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { dateFormat, timeZone } = useUserPreferences();
  const rows = Array.isArray(incomingAllocations) ? incomingAllocations : [];

  const typeLabel = useCallback(
    (type: string) => {
      if (type === 'debit') return translate('pages.commercialTransactions.type.debit');
      if (type === 'credit') return translate('pages.commercialTransactions.type.credit');
      if (type === 'collection') return translate('pages.commercialTransactions.type.collection');
      return translate('pages.commercialTransactions.type.sale');
    },
    [translate],
  );

  if (!commercialResourceCanReceiveAllocations(resource)) return null;

  return (
    <Table
      style={{ marginTop: 16 }}
      size="small"
      pagination={false}
      scroll={{ x: true }}
      rowKey={(r) => `${r.sourceTransactionId}-${r.amount}`}
      dataSource={rows}
      locale={{
        emptyText: translate('pages.commercialTransactions.fields.allocationsNone'),
      }}
      title={() =>
        resource === 'sales'
          ? translate('pages.commercialTransactions.fields.allocations')
          : translate('pages.commercialTransactions.fields.allocationsIncoming')
      }
      onRow={(row) => {
        const res = commercialResourceFromType(row.sourceType);
        if (!res) return {};
        return {
          onClick: () =>
            navigate(commercialTransactionShowPath(res, row.sourceTransactionId)),
          style: { cursor: 'pointer' },
        };
      }}
      columns={[
        {
          title: translate('pages.commercialTransactions.fields.entityTxnNumber'),
          dataIndex: 'sourceEntityTxnNumber',
          width: 64,
          render: (v: unknown) => (v != null && v !== '' ? String(v) : '—'),
        },
        {
          title: translate('pages.commercialTransactions.fields.allocationType'),
          dataIndex: 'sourceType',
          render: (v: string) => typeLabel(v),
        },
        {
          title: translate('pages.commercialTransactions.fields.concept'),
          dataIndex: 'sourceConcept',
          ellipsis: true,
          render: (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '—'),
        },
        {
          title: translate('pages.commercialTransactions.fields.transactionDate'),
          dataIndex: 'sourceTransactionDate',
          render: (v: unknown) => formatTimciUserDateOnly(v, { dateFormat, timeZone }),
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
