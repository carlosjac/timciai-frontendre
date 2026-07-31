import { useList, useTranslate, type BaseRecord } from '@refinedev/core';
import { App, Button, Drawer, Form, Grid, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { CommercialTransactionResource } from '../../shared/timci/commercialTransactionsApi.js';
import { getCommercialTransactionReplaceAllocationsUrl } from '../../shared/timci/commercialTransactionsApi.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';
import { formatTimciMoneyOrEmpty } from '../../shared/timci/formatMoney.js';
import {
  CollectionAllocationsTable,
  type AllocationCandidateRow,
} from './CollectionAllocationsTable.js';
import type { AllocationFormRow, CommercialTransactionRecord } from './types.js';

type Props = {
  open: boolean;
  onClose: () => void;
  resource: CommercialTransactionResource;
  record: CommercialTransactionRecord;
  onSuccess: () => void;
};

function parseMoneyNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function formatMoney2(n: number): string {
  return formatTimciMoneyOrEmpty(n) || '0.00';
}

/**
 * Edit outgoing allocations of a registered debit/credit/collection without voiding it.
 */
export function ReplaceAllocationsDrawer({
  open,
  onClose,
  resource,
  record,
  onSuccess,
}: Props) {
  const translate = useTranslate();
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const [form] = Form.useForm<{ amount?: string; allocations?: AllocationFormRow[] }>();
  const [saving, setSaving] = useState(false);

  const customerId = record.customerId != null ? String(record.customerId) : '';
  const currencyId = record.currencyId != null ? String(record.currencyId) : '';
  const sourceId = record.id != null ? String(record.id) : '';

  const enabled = open && Boolean(customerId);

  const { result: salesResult, query: salesQuery } = useList<BaseRecord>({
    resource: 'sales',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled },
  });
  const { result: debitsResult, query: debitsQuery } = useList<BaseRecord>({
    resource: 'debits',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled },
  });

  const allocatedByTarget = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of record.allocations ?? []) {
      const id = a.targetTransactionId != null ? String(a.targetTransactionId) : '';
      if (!id) continue;
      const n = parseMoneyNumber(a.amount) ?? 0;
      map.set(id, (map.get(id) ?? 0) + n);
    }
    return map;
  }, [record.allocations]);

  const candidates = useMemo((): AllocationCandidateRow[] => {
    if (!customerId) return [];
    const rows = [...(salesResult.data ?? []), ...(debitsResult.data ?? [])].filter((r) => {
      const id = r.id != null ? String(r.id) : '';
      if (!id || id === sourceId) return false;
      if (String(r.customerId ?? '') !== customerId) return false;
      if (r.status !== 'registered') return false;
      if (currencyId && String(r.currencyId ?? '') !== currencyId) return false;
      const open = parseMoneyNumber(r.openAmount ?? r.amount) ?? 0;
      const held = allocatedByTarget.get(id) ?? 0;
      return open > 0 || held > 0;
    });
    rows.sort((a, b) =>
      String(a.transactionDate ?? '').localeCompare(String(b.transactionDate ?? '')),
    );
    return rows.map((r) => {
      const id = String(r.id);
      const open = parseMoneyNumber(r.openAmount ?? r.amount) ?? 0;
      const held = allocatedByTarget.get(id) ?? 0;
      const available = Math.round((open + held) * 100) / 100;
      return {
        id,
        entityTxnNumber:
          r.entityTxnNumber != null ? Number(r.entityTxnNumber) : undefined,
        type: String(r.type ?? 'sale'),
        transactionDate: r.transactionDate != null ? String(r.transactionDate) : undefined,
        amount: r.amount != null ? String(r.amount) : undefined,
        openAmount: formatMoney2(available),
        concept: typeof r.concept === 'string' ? r.concept : null,
      };
    });
  }, [
    allocatedByTarget,
    currencyId,
    customerId,
    debitsResult.data,
    salesResult.data,
    sourceId,
  ]);

  const loading = Boolean(
    enabled && (salesQuery?.isLoading || debitsQuery?.isLoading),
  );

  useEffect(() => {
    if (!open) return;
    const initialAllocations: AllocationFormRow[] = (record.allocations ?? [])
      .filter((a) => a.targetTransactionId)
      .map((a) => ({
        targetTransactionId: String(a.targetTransactionId),
        amount: formatTimciMoneyOrEmpty(a.amount) || String(a.amount ?? ''),
      }));
    form.setFieldsValue({
      allocations: initialAllocations,
    });
  }, [form, open, record.allocations]);

  const onSave = async () => {
    if (!tenantId || !sourceId) return;
    const allocations = (form.getFieldValue('allocations') as AllocationFormRow[] | undefined) ?? [];
    const payload = allocations
      .filter((a) => a?.targetTransactionId && a?.amount)
      .map((a) => ({
        targetTransactionId: String(a.targetTransactionId),
        amount: String(a.amount),
      }));

    setSaving(true);
    try {
      await timciFetch(
        getCommercialTransactionReplaceAllocationsUrl(tenantId, resource, sourceId),
        {
          method: 'POST',
          body: JSON.stringify({ allocations: payload }),
        },
      );
      message.success(translate('pages.commercialTransactions.replaceAllocationsSuccess'));
      onSuccess();
      onClose();
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : translate('pages.commercialTransactions.replaceAllocationsError');
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={translate('pages.commercialTransactions.replaceAllocationsTitle')}
      open={open}
      onClose={onClose}
      destroyOnHidden
      width={screens.md ? 640 : '100%'}
      styles={{ body: { paddingBottom: 24 } }}
      extra={
        <Space>
          <Button onClick={onClose}>{translate('buttons.cancel')}</Button>
          <Button type="primary" loading={saving} onClick={() => void onSave()}>
            {translate('buttons.save')}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="allocations" noStyle>
          <CollectionAllocationsTable
            candidates={candidates}
            sourceAmount={record.amount}
            disabled={!customerId || !currencyId}
            loading={loading}
            emptyHint={translate('pages.commercialTransactions.fields.allocationsEmpty')}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
