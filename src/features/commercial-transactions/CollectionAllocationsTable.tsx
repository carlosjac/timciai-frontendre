import {
  commercialResourceFromType,
  commercialTransactionShowPath,
} from '../../shared/timci/commercialTransactionsApi.js';
import { formatTimciMoney, formatTimciMoneyOrEmpty } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { AllocationFormRow } from './types.js';
import { useNavigate } from 'react-router';
import { App, Button, Form, InputNumber, Space, Table, Typography } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslate } from '@refinedev/core';

export type AllocationCandidateRow = {
  id: string;
  entityTxnNumber?: number | null;
  type: string;
  transactionDate?: string;
  amount?: string;
  openAmount?: string;
  concept?: string | null;
  /** Full-open policy adjustment (signed) as of collection date. */
  adjustmentAmount?: string;
  /** Cash to settle full open as of collection date. */
  settlementAmount?: string;
};

type Props = {
  candidates: AllocationCandidateRow[];
  /** No customer / currency yet, or still loading candidates. */
  disabled?: boolean;
  loading?: boolean;
  emptyHint: string;
  /** Overrides Form field `amount` when the table is used outside create/edit forms. */
  sourceAmount?: string | number | null;
  /** Injected by Form.Item when used as a custom control. */
  value?: AllocationFormRow[];
  onChange?: (next: AllocationFormRow[]) => void;
};

function parsePositiveAmount(raw: unknown): string | null {
  const formatted = formatTimciMoneyOrEmpty(raw);
  if (!formatted) return null;
  const n = Number(formatted);
  return n > 0 ? formatted : null;
}

function parseMoneyNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function roundMoney2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatMoney2(n: number): string {
  return formatTimciMoneyOrEmpty(n) || '0.00';
}

/** FIFO on cash (settlement); stores nominal open tranche in allocation.amount. */
export function buildFifoAllocations(
  collectionAmount: number,
  candidates: AllocationCandidateRow[],
): AllocationFormRow[] {
  let remaining = roundMoney2(collectionAmount);
  if (remaining <= 0) return [];

  const out: AllocationFormRow[] = [];
  for (const row of candidates) {
    if (remaining <= 0) break;
    const open = roundMoney2(parseMoneyNumber(row.openAmount ?? row.amount) ?? 0);
    if (open <= 0) continue;
    const settlement = roundMoney2(parseMoneyNumber(row.settlementAmount) ?? open);
    if (settlement <= 0) continue;
    const takeCash = Math.min(remaining, settlement);
    if (takeCash <= 0) continue;
    const takeNominal = roundMoney2((takeCash / settlement) * open);
    out.push({ targetTransactionId: row.id, amount: formatMoney2(takeNominal) });
    remaining = roundMoney2(remaining - takeCash);
  }
  return out;
}

/**
 * Tabla de ventas/débitos imputables: cada fila con importe a imputar.
 * Pensado para usarse dentro de `<Form.Item name="allocations">` (value/onChange).
 */
export function CollectionAllocationsTable({
  candidates,
  disabled = false,
  loading = false,
  emptyHint,
  sourceAmount,
  value,
  onChange,
}: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const form = Form.useFormInstance();
  const { dateFormat, timeZone } = useUserPreferences();
  const watchedAmount = Form.useWatch('amount', form);
  const collectionAmount = sourceAmount ?? watchedAmount;
  const allocations = value ?? [];

  const amountByTargetId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of allocations) {
      const id = row?.targetTransactionId != null ? String(row.targetTransactionId) : '';
      if (!id) continue;
      const formatted = formatTimciMoneyOrEmpty(row.amount);
      if (formatted) map.set(id, formatted);
    }
    return map;
  }, [allocations]);

  const candidateIds = useMemo(() => new Set(candidates.map((c) => c.id)), [candidates]);

  /** Drop allocations that no longer appear in the candidate table (customer/currency change). */
  useEffect(() => {
    if (!onChange || !allocations.length || loading || candidates.length === 0) return;
    const next = allocations.filter(
      (a) => a?.targetTransactionId != null && candidateIds.has(String(a.targetTransactionId)),
    );
    if (next.length !== allocations.length) {
      onChange(next);
    }
  }, [allocations, candidateIds, candidates.length, loading, onChange]);

  const setAmountForTarget = useCallback(
    (targetTransactionId: string, raw: string | number | null) => {
      const without = allocations.filter(
        (a) => String(a?.targetTransactionId ?? '') !== targetTransactionId,
      );
      const positive = parsePositiveAmount(raw);
      onChange?.(
        positive ? [...without, { targetTransactionId, amount: positive }] : without,
      );
    },
    [allocations, onChange],
  );

  const typeLabel = useCallback(
    (type: string) => {
      if (type === 'debit') return translate('pages.commercialTransactions.type.debit');
      return translate('pages.commercialTransactions.type.sale');
    },
    [translate],
  );

  const openTargetShow = useCallback(
    (row: AllocationCandidateRow) => {
      const resource = commercialResourceFromType(row.type);
      if (!resource) return;
      navigate(commercialTransactionShowPath(resource, row.id));
    },
    [navigate],
  );

  const collectionAmountNum = parseMoneyNumber(collectionAmount);
  const canAutoAllocate =
    !disabled && candidates.length > 0 && collectionAmountNum != null && collectionAmountNum > 0;

  const onAutoAllocate = useCallback(() => {
    const rawAmount =
      sourceAmount ?? form.getFieldValue('amount') ?? collectionAmount;
    const total = parseMoneyNumber(rawAmount);
    if (total == null || total <= 0) {
      message.warning(translate('pages.commercialTransactions.fields.autoAllocateNeedAmount'));
      return;
    }
    if (!candidates.length) {
      message.warning(translate('pages.commercialTransactions.fields.allocationsEmpty'));
      return;
    }
    const next = buildFifoAllocations(total, candidates);
    onChange?.(next);
    if (!next.length) {
      message.warning(translate('pages.commercialTransactions.fields.allocationsEmpty'));
      return;
    }
    message.success(translate('pages.commercialTransactions.fields.autoAllocateDone'));
  }, [candidates, collectionAmount, form, message, onChange, sourceAmount, translate]);

  return (
    <>
      <Space style={{ marginBottom: 12, width: '100%' }} wrap>
        <Button
          type="default"
          htmlType="button"
          onClick={onAutoAllocate}
          disabled={!canAutoAllocate}
          aria-label={translate('pages.commercialTransactions.fields.autoAllocate')}
        >
          {translate('pages.commercialTransactions.fields.autoAllocate')}
        </Button>
      </Space>

      {!candidates.length && !loading ? (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {emptyHint}
        </Typography.Paragraph>
      ) : (
        <Table<AllocationCandidateRow>
          size="small"
          rowKey="id"
          loading={loading}
          pagination={false}
          dataSource={candidates}
          scroll={{ x: true }}
          onRow={(row) => ({
            onClick: () => openTargetShow(row),
            style: { cursor: 'pointer' },
          })}
          columns={[
            {
              title: translate('pages.commercialTransactions.fields.entityTxnNumber'),
              dataIndex: 'entityTxnNumber',
              width: 64,
              render: (v: unknown) => (v != null && v !== '' ? String(v) : '—'),
            },
            {
              title: translate('pages.commercialTransactions.fields.allocationType'),
              dataIndex: 'type',
              render: (v: string) => typeLabel(v),
            },
            {
              title: translate('pages.commercialTransactions.fields.concept'),
              dataIndex: 'concept',
              ellipsis: true,
              render: (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '—'),
            },
            {
              title: translate('pages.commercialTransactions.fields.transactionDate'),
              dataIndex: 'transactionDate',
              render: (v: unknown) => formatTimciUserDateOnly(v, { dateFormat, timeZone }),
            },
            {
              title: translate('pages.commercialTransactions.fields.amount'),
              dataIndex: 'amount',
              align: 'right',
              render: (v: unknown) => formatTimciMoney(v),
            },
            {
              title: translate('pages.commercialTransactions.fields.openAmount'),
              dataIndex: 'openAmount',
              align: 'right',
              render: (_: unknown, row) => formatTimciMoney(row.openAmount ?? row.amount),
            },
            {
              title: translate('pages.customers.currentAccountSettlementAdjustment'),
              dataIndex: 'adjustmentAmount',
              align: 'right',
              render: (v: unknown) => (v != null && String(v) !== '' ? formatTimciMoney(v) : '—'),
            },
            {
              title: translate('pages.customers.currentAccountSettlementDue'),
              dataIndex: 'settlementAmount',
              align: 'right',
              render: (_: unknown, row) =>
                formatTimciMoney(row.settlementAmount ?? row.openAmount ?? row.amount),
            },
            {
              title: translate('pages.commercialTransactions.fields.allocationAmount'),
              key: 'allocate',
              width: 160,
              render: (_: unknown, row) => {
                const open = Number(String(row.openAmount ?? row.amount ?? '').replace(',', '.'));
                const max = Number.isFinite(open) && open > 0 ? open : undefined;
                return (
                  <span
                    data-timci-row-action
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <InputNumber
                      min={0}
                      max={max}
                      precision={2}
                      stringMode
                      style={{ width: '100%' }}
                      disabled={disabled}
                      value={amountByTargetId.get(row.id)}
                      onChange={(v) => setAmountForTarget(row.id, v)}
                      aria-label={translate(
                        'pages.commercialTransactions.fields.allocationAmount',
                      )}
                    />
                  </span>
                );
              },
            },
          ]}
        />
      )}
    </>
  );
}
