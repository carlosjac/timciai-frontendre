import { useTranslate } from '@refinedev/core';
import { Table } from 'antd';
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
  commercialResourceCanHaveAllocations,
  type AllocationRow,
} from './commercialTransactionPanels.js';

type Props = {
  /** Only debits, credits and collections carry outgoing allocations. */
  resource: CommercialTransactionResource;
  allocations?: AllocationRow[] | null;
  status?: string | null;
  customerId?: string | null;
  currencyId?: string | null;
  transactionDate?: string | null;
};

function allocationRowKey(row: AllocationRow): string {
  return String(row.id ?? `${row.ordinal}-${row.targetTransactionId}-${row.amount}`);
}

/**
 * Read-only imputaciones for debit / credit / collection show.
 * Collections and credits show cash (efectivo) in the amount column when possible.
 */
export function CommercialTransactionAllocationsPanel({
  resource,
  allocations,
  status,
  customerId,
  currencyId,
  transactionDate,
}: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { dateFormat, timeZone } = useUserPreferences();
  const rows = Array.isArray(allocations) ? allocations : [];
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  /** Collections: only drafts store nominal. Credits: always nominal (no materialize rewrite). */
  const convertNominalToCash =
    (resource === 'collections' && status === 'draft') || resource === 'credits';

  const needsSettlementDisplay = convertNominalToCash && rows.length > 0;

  const [settlementByTargetId, setSettlementByTargetId] = useState<
    Map<string, CurrentAccountSettlementLine>
  >(new Map());
  const canLoadSettlement =
    needsSettlementDisplay && Boolean(tenantId && customerId && currencyId);
  if (!canLoadSettlement && settlementByTargetId.size > 0) {
    setSettlementByTargetId(new Map());
  }

  useEffect(() => {
    if (!canLoadSettlement || !tenantId || !customerId || !currencyId) return;
    const asOf =
      transactionDate != null && String(transactionDate).trim() !== ''
        ? String(transactionDate).slice(0, 10)
        : new Date().toISOString().slice(0, 10);
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
    void (async () => {
      try {
        const { json } = await timciFetch(
          getCustomerCurrentAccountSettlementUrl(tenantId, customerId, currencyId, asOf),
        );
        if (cancelled) return;
        const lines = (json as { lines?: CurrentAccountSettlementLine[] })?.lines ?? [];
        const map = new Map<string, CurrentAccountSettlementLine>();
        for (const line of lines) {
          if (line?.id) map.set(String(line.id), line);
        }
        setSettlementByTargetId(map);
      } catch {
        if (!cancelled) setSettlementByTargetId(new Map());
      }
    })();
    });
    return () => {
      cancelled = true;
    };
  }, [canLoadSettlement, tenantId, customerId, currencyId, transactionDate]);

  const displayAmountByRowKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      const key = allocationRowKey(row);
      const stored = parseMoneyNumber(row.amount) ?? 0;
      if (!convertNominalToCash) {
        const formatted = formatTimciMoneyOrEmpty(row.amount);
        if (formatted) map.set(key, formatted);
        continue;
      }
      const targetId = row.targetTransactionId != null ? String(row.targetTransactionId) : '';
      const line = targetId ? settlementByTargetId.get(targetId) : undefined;
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
  }, [rows, convertNominalToCash, settlementByTargetId]);

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

  const amountColumnTitle =
    resource === 'collections' || resource === 'credits'
      ? translate('pages.commercialTransactions.fields.allocationAmountCash')
      : translate('pages.commercialTransactions.fields.allocationAmountNominal');

  return (
    <Table
      style={{ marginTop: 16 }}
      size="small"
      pagination={false}
      scroll={{ x: true }}
      rowKey={(r) => allocationRowKey(r)}
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
          render: (_: unknown, row: AllocationRow) => {
            const label =
              row.targetEntityTxnNumber != null ? String(row.targetEntityTxnNumber) : '—';
            const id = row.targetTransactionId != null ? String(row.targetTransactionId) : '';
            const res = commercialResourceFromType(row.targetType ?? '');
            if (!id || !res || label === '—') return label;
            return (
              <Link
                to={commercialTransactionShowPath(res, id)}
                onClick={(event) => event.stopPropagation()}
              >
                {label}
              </Link>
            );
          },
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
          title: amountColumnTitle,
          key: 'amount',
          align: 'right',
          render: (_: unknown, row: AllocationRow) => {
            const display = displayAmountByRowKey.get(allocationRowKey(row));
            return formatTimciMoney(display ?? row.amount);
          },
        },
      ]}
    />
  );
}
