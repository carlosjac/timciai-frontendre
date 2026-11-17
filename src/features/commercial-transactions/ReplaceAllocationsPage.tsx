import { useInvalidate, useList, useOne, useShow, useTranslate, type BaseRecord } from '@refinedev/core';
import { Alert, Button, Form, Space, Spin, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { CommercialTransactionResource } from '../../shared/timci/commercialTransactionsApi.js';
import {
  commercialTransactionShowPath,
  getCommercialTransactionReplaceAllocationsUrl,
} from '../../shared/timci/commercialTransactionsApi.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';
import { formatTimciMoney, formatTimciMoneyOrEmpty } from '../../shared/timci/formatMoney.js';
import { TimciPageBackHeader } from '../../shared/timci/TimciPageBackHeader.js';
import {
  compareAllocationRowsByDateThenTxnNumber,
  type AllocationCandidateRow,
} from './collectionAllocations.js';
import { CollectionAllocationsTable } from './CollectionAllocationsTable.js';
import type { AllocationFormRow, CommercialTransactionRecord } from './types.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type Props = {
  resource: CommercialTransactionResource;
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
 * Full-page editor for outgoing allocations of a registered debit, credit or collection.
 */
export function ReplaceAllocationsPage({ resource }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const notify = useTimciNotify();
  const invalidate = useInvalidate();
  const { id: routeId } = useParams();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const [form] = Form.useForm<{ amount?: string; allocations?: AllocationFormRow[] }>();
  const [saving, setSaving] = useState(false);
  const initializedFor = useRef<string | null>(null);
  const redirected = useRef(false);

  const { query, result } = useShow<CommercialTransactionRecord>({
    resource,
    id: routeId,
  });
  const record = (result ?? query?.data?.data) as CommercialTransactionRecord | undefined;
  const isLoading = query?.isLoading ?? false;

  const customerId = record?.customerId != null ? String(record.customerId) : '';
  const currencyId = record?.currencyId != null ? String(record.currencyId) : '';
  const sourceId = record?.id != null ? String(record.id) : routeId ?? '';
  const showPath = sourceId ? commercialTransactionShowPath(resource, sourceId) : `/${resource}`;
  const canEditAllocations =
    record?.status === 'registered' && !record.reversedByTransactionId;

  const { result: salesResult, query: salesQuery } = useList<BaseRecord>({
    resource: 'sales',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: Boolean(customerId) && canEditAllocations },
  });
  const { result: debitsResult, query: debitsQuery } = useList<BaseRecord>({
    resource: 'debits',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: Boolean(customerId) && canEditAllocations },
  });

  const allocatedByTarget = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of record?.allocations ?? []) {
      const id = a.targetTransactionId != null ? String(a.targetTransactionId) : '';
      if (!id) continue;
      const n = parseMoneyNumber(a.amount) ?? 0;
      map.set(id, (map.get(id) ?? 0) + n);
    }
    return map;
  }, [record?.allocations]);

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
      compareAllocationRowsByDateThenTxnNumber(
        {
          transactionDate: a.transactionDate != null ? String(a.transactionDate) : null,
          entityTxnNumber: a.entityTxnNumber != null ? Number(a.entityTxnNumber) : null,
        },
        {
          transactionDate: b.transactionDate != null ? String(b.transactionDate) : null,
          entityTxnNumber: b.entityTxnNumber != null ? Number(b.entityTxnNumber) : null,
        },
      ),
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

  const loadingCandidates = Boolean(
    canEditAllocations && (salesQuery?.isLoading || debitsQuery?.isLoading),
  );

  useEffect(() => {
    if (isLoading || !record?.id || canEditAllocations || redirected.current) return;
    redirected.current = true;
    notify.warning(translate('pages.commercialTransactions.replaceAllocationsUnavailable'));
    navigate(commercialTransactionShowPath(resource, String(record.id)), { replace: true });
  }, [canEditAllocations, isLoading, navigate, notify, record?.id, resource, translate]);

  useEffect(() => {
    if (!record?.id || !canEditAllocations) return;
    const id = String(record.id);
    if (initializedFor.current === id) return;
    initializedFor.current = id;
    const initialAllocations: AllocationFormRow[] = (record.allocations ?? [])
      .filter((a) => a.targetTransactionId)
      .map((a) => ({
        targetTransactionId: String(a.targetTransactionId),
        amount: formatTimciMoneyOrEmpty(a.amount) || String(a.amount ?? ''),
      }));
    form.setFieldsValue({ allocations: initialAllocations });
  }, [canEditAllocations, form, record?.allocations, record?.id]);

  const onSave = async () => {
    if (!tenantId || !sourceId) return;
    const allocations = (form.getFieldValue('allocations') as AllocationFormRow[] | undefined) ?? [];
    const payload = allocations
      .filter((a) => {
        const amount = parseMoneyNumber(a?.amount);
        return Boolean(a?.targetTransactionId) && amount != null && amount > 0;
      })
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
      await invalidate({ resource, invalidates: ['detail'], id: sourceId });
      notify.success(translate('pages.commercialTransactions.replaceAllocationsSuccess'));
      navigate(showPath);
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : translate('pages.commercialTransactions.replaceAllocationsError');
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const { result: currencyResult } = useOne<{ code?: string }>({
    resource: 'currencies',
    id: record?.currencyId ?? '',
    queryOptions: { enabled: Boolean(record?.currencyId) },
    errorNotification: false,
  });

  const sourceHeading = useMemo(() => {
    if (!record) return null;
    const type =
      record.type ??
      (resource === 'collections' ? 'collection' : resource === 'credits' ? 'credit' : 'debit');
    const typeLabel =
      type === 'debit'
        ? translate('pages.commercialTransactions.type.debit')
        : type === 'credit'
          ? translate('pages.commercialTransactions.type.credit')
          : type === 'collection'
            ? translate('pages.commercialTransactions.type.collection')
            : translate('pages.commercialTransactions.type.sale');
    const money = formatTimciMoney(record.amount);
    const code = currencyResult?.code?.trim();
    const amount = code ? `${code} ${money}` : money;
    const number = record.entityTxnNumber != null ? String(record.entityTxnNumber) : '';
    if (number) {
      return translate('pages.commercialTransactions.replaceAllocationsSourceTitle', {
        type: typeLabel,
        number,
        amount,
      });
    }
    return translate('pages.commercialTransactions.replaceAllocationsSourceTitleNoNumber', {
      type: typeLabel,
      amount,
    });
  }, [currencyResult?.code, record, resource, translate]);

  const screenTitle = translate('pages.commercialTransactions.replaceAllocationsTitle');
  const title = sourceHeading ? (
    <span data-timci-page-title={sourceHeading}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {sourceHeading}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontWeight: 400 }}>
        {screenTitle}
      </Typography.Text>
    </span>
  ) : (
    screenTitle
  );

  return (
    <TimciPageBackHeader backPath={showPath} title={title}>
      {!tenantId ? (
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      ) : isLoading ? (
        <div role="status" aria-label={translate('app.loadingPage')} style={{ padding: 24 }}>
          <Spin />
        </div>
      ) : !record || query?.isError ? (
        <Alert type="error" showIcon message={translate('pages.notFound.title')} />
      ) : !canEditAllocations ? (
        <div role="status" aria-label={translate('app.loadingPage')} style={{ padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Space style={{ marginBottom: 16 }} wrap>
            <Button onClick={() => navigate(showPath)}>{translate('buttons.cancel')}</Button>
            <Button type="primary" loading={saving} onClick={() => void onSave()}>
              {translate('buttons.save')}
            </Button>
          </Space>
          <Form.Item name="allocations" noStyle>
            <CollectionAllocationsTable
              candidates={candidates}
              sourceAmount={record.amount}
              disabled={!customerId || !currencyId}
              loading={loadingCandidates}
              emptyHint={translate('pages.commercialTransactions.fields.allocationsEmpty')}
            />
          </Form.Item>
        </Form>
      )}
    </TimciPageBackHeader>
  );
}
