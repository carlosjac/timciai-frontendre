import { useTranslate } from '@refinedev/core';
import { Table, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  commercialResourceFromType,
  commercialTransactionShowPath,
  getCustomerCurrentAccountSettlementUrl,
  type CommercialTransactionResource,
  type CurrentAccountSettlementLine,
} from '../../shared/timci/commercialTransactionsApi.js';
import { formatTimciMoney, formatTimciMoneyOrEmpty } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import {
  cashDisplayForStoredAllocation,
  parseMoneyNumber,
} from './collectionAllocations.js';
import {
  commercialResourceCanReceiveAllocations,
  type IncomingAllocationRow,
} from './commercialTransactionPanels.js';

type Props = {
  resource: CommercialTransactionResource;
  incomingAllocations?: IncomingAllocationRow[] | null;
  /** Target sale/debit id — used to resolve settlement ratio for credit sources. */
  targetTransactionId?: string | null;
  customerId?: string | null;
  currencyId?: string | null;
  /** When true, render nothing if there are no incoming allocations. */
  hideWhenEmpty?: boolean;
};

/**
 * Imputaciones recibidas (cobros/créditos/débitos registrados que aplicaron a esta venta/débito).
 * Cobros ya traen efectivo (post-materialize). Créditos guardan nominal → se muestra efectivo.
 */
export function CommercialTransactionIncomingAllocationsPanel({
  resource,
  incomingAllocations,
  targetTransactionId,
  customerId,
  currencyId,
  hideWhenEmpty = false,
}: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { dateFormat, timeZone } = useUserPreferences();
  const rows = Array.isArray(incomingAllocations) ? incomingAllocations : [];
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const creditAsOfDates = useMemo(
    () =>
      [
        ...new Set(
          rows
            .filter((r) => r.sourceType === 'credit')
            .map((r) => String(r.sourceTransactionDate ?? '').slice(0, 10))
            .filter(Boolean),
        ),
      ].sort(),
    [rows],
  );

  const needsSettlement =
    creditAsOfDates.length > 0 &&
    Boolean(tenantId && customerId && currencyId && targetTransactionId);

  const [settlementByAsOf, setSettlementByAsOf] = useState<
    Map<string, CurrentAccountSettlementLine | null>
  >(new Map());
  if (!needsSettlement && settlementByAsOf.size > 0) {
    setSettlementByAsOf(new Map());
  }

  useEffect(() => {
    if (!needsSettlement || !tenantId || !customerId || !currencyId || !targetTransactionId) {
      return;
    }

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
    void (async () => {
      const next = new Map<string, CurrentAccountSettlementLine | null>();
      await Promise.all(
        creditAsOfDates.map(async (asOf) => {
          try {
            const { json } = await timciFetch(
              getCustomerCurrentAccountSettlementUrl(tenantId, customerId, currencyId, asOf),
            );
            const lines = (json as { lines?: CurrentAccountSettlementLine[] })?.lines ?? [];
            const line = lines.find((l) => String(l.id) === String(targetTransactionId)) ?? null;
            next.set(asOf, line);
          } catch {
            next.set(asOf, null);
          }
        }),
      );
      if (!cancelled) setSettlementByAsOf(next);
    })();
    });
    return () => {
      cancelled = true;
    };
  }, [needsSettlement, tenantId, customerId, currencyId, targetTransactionId, creditAsOfDates]);

  const displayAmountByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      const key = `${row.sourceTransactionId}-${row.amount}`;
      const stored = parseMoneyNumber(row.amount) ?? 0;
      // Registered collections already store settlement cash on the allocation.
      if (row.sourceType === 'collection' || row.sourceType === 'debit') {
        const formatted = formatTimciMoneyOrEmpty(row.amount);
        if (formatted) map.set(key, formatted);
        continue;
      }
      const asOf = String(row.sourceTransactionDate ?? '').slice(0, 10);
      const line = settlementByAsOf.get(asOf);
      const open = parseMoneyNumber(line?.openAmount) ?? 0;
      const settlement = parseMoneyNumber(line?.settlementAmount) ?? open;
      const cash = cashDisplayForStoredAllocation({
        storedAmount: stored,
        openAmount: open,
        settlementAmount: settlement,
        convertNominalToCash: true,
      });
      const formatted = formatTimciMoneyOrEmpty(cash);
      if (formatted) map.set(key, formatted);
    }
    return map;
  }, [rows, settlementByAsOf]);

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
  if (hideWhenEmpty && rows.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <Typography.Title level={5}>
        {translate('pages.commercialTransactions.fields.allocationsIncoming')}
      </Typography.Title>
      <Table
        size="small"
        pagination={false}
        scroll={{ x: true }}
        rowKey={(r) => `${r.sourceTransactionId}-${r.amount}`}
        dataSource={rows}
        locale={{
          emptyText: translate('pages.commercialTransactions.fields.allocationsNone'),
        }}
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
            render: (v: unknown, row: IncomingAllocationRow) => {
              const label = v != null && v !== '' ? String(v) : '—';
              const res = commercialResourceFromType(row.sourceType);
              if (!res || label === '—') return label;
              return (
                <Link
                  to={commercialTransactionShowPath(res, row.sourceTransactionId)}
                  onClick={(event) => event.stopPropagation()}
                >
                  {label}
                </Link>
              );
            },
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
            title: translate('pages.commercialTransactions.fields.allocationAmountCash'),
            key: 'amount',
            align: 'right',
            render: (_: unknown, row: IncomingAllocationRow) => {
              const key = `${row.sourceTransactionId}-${row.amount}`;
              return formatTimciMoney(displayAmountByKey.get(key) ?? row.amount);
            },
          },
        ]}
      />
    </div>
  );
}
