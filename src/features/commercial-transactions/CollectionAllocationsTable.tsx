import {
  commercialResourceFromType,
  commercialTransactionShowPath,
} from '../../shared/timci/commercialTransactionsApi.js';
import { formatTimciMoney, formatTimciMoneyOrEmpty } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { AllocationFormRow } from './types.js';
import {
  buildFifoAllocations,
  parseMoneyNumber,
  parsePositiveAmount,
  type AllocationCandidateRow,
} from './collectionAllocations.js';
import { useNavigate } from 'react-router';
import { App, Button, Form, InputNumber, Space, Table, Typography } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslate } from '@refinedev/core';

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
  const allocations = useMemo(() => value ?? [], [value]);

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
                      min="0"
                      max={max != null ? String(max) : undefined}
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
