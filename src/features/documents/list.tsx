import { useCallback, useMemo, useState, type Key } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Button, Tag } from 'antd';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type DocumentRow = BaseRecord & {
  id: string;
  documentKind: string;
  status: string;
  number: string | null;
  issuedAt?: string | null;
  hasContent?: boolean;
  errorMessage?: string | null;
  attemptCount?: number;
  nextAttemptAt?: string | null;
};

function statusColor(status: string): string {
  switch (status) {
    case 'issued':
      return 'success';
    case 'pending':
      return 'processing';
    case 'failed':
      return 'error';
    case 'skipped':
      return 'default';
    default:
      return 'default';
  }
}

export function DocumentList() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = permData?.actionCodes?.includes('documents.view') ?? false;
  const canManage = permData?.actionCodes?.includes('documents.manage') ?? false;
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [retrying, setRetrying] = useState(false);

  const retry = useCallback(async (ids: string[]) => {
    const base = getResourceApiBase('documents');
    if (!base || ids.length === 0) return;
    setRetrying(true);
    try {
      if (ids.length === 1) {
        await timciFetch(`${base}/${encodeURIComponent(ids[0]!)}/retry`, { method: 'POST' });
      } else {
        await timciFetch(`${base}/retry-batch`, {
          method: 'POST',
          body: JSON.stringify({ ids: ids.slice(0, 50) }),
        });
      }
      notify.success(translate('documents.retryOk'));
      setSelectedKeys([]);
      window.location.reload();
    } catch {
      notify.error(translate('documents.actionError'));
    } finally {
      setRetrying(false);
    }
  }, [notify, translate]);

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: DocumentRow) => `/documents/show/${encodeURIComponent(String(record.id))}`
        : undefined,
    [canView],
  );

  const columnDefs = useMemo((): TimciColumnDef<DocumentRow>[] => {
    return [
      {
        key: 'actions',
        dataIndex: 'id',
        titleKey: 'table.documents.actions',
        width: 110,
        render: (_value: unknown, record: DocumentRow) =>
          canManage && record.status === 'failed' ? (
            <span data-timci-row-action onClick={(event) => event.stopPropagation()}>
              <Button size="small" loading={retrying} onClick={() => void retry([record.id])}>
                {translate('documents.retry')}
              </Button>
            </span>
          ) : null,
        exportValue: () => '',
      },
      {
        key: 'documentKind',
        dataIndex: 'documentKind',
        titleKey: 'table.documents.documentKind',
        sorter: true,
        filter: { kind: 'text' },
        render: (k: unknown) =>
          translate(`documents.kinds.${String(k)}`, String(k ?? '')),
        exportValue: (r) =>
          translate(`documents.kinds.${r.documentKind}`, r.documentKind),
      },
      {
        key: 'number',
        dataIndex: 'number',
        titleKey: 'table.documents.number',
        sorter: true,
        filter: { kind: 'text' },
        render: (n: unknown) => (n != null && String(n).trim() !== '' ? String(n) : '—'),
        exportValue: (r) => r.number ?? '',
      },
      {
        key: 'status',
        dataIndex: 'status',
        titleKey: 'table.documents.status',
        sorter: true,
        filter: { kind: 'text' },
        render: (s: unknown) => (
          <Tag color={statusColor(String(s))}>
            {translate(`documents.statuses.${String(s)}`, String(s ?? ''))}
          </Tag>
        ),
        exportValue: (r) => translate(`documents.statuses.${r.status}`, r.status),
      },
      {
        key: 'errorMessage',
        dataIndex: 'errorMessage',
        titleKey: 'table.documents.errorMessage',
        defaultVisible: false,
      },
      {
        key: 'attemptCount',
        dataIndex: 'attemptCount',
        titleKey: 'table.documents.attemptCount',
        defaultVisible: false,
      },
      {
        key: 'nextAttemptAt',
        dataIndex: 'nextAttemptAt',
        titleKey: 'table.documents.nextAttemptAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
        exportValue: (r) =>
          formatTimciUserDateTime(r.nextAttemptAt, { dateFormat, timeZone }) || '',
      },
      {
        key: 'issuedAt',
        dataIndex: 'issuedAt',
        titleKey: 'table.documents.issuedAt',
        sorter: true,
        filter: { kind: 'date' },
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
        exportValue: (r) =>
          formatTimciUserDateTime(r.issuedAt, { dateFormat, timeZone }) || '',
      },
    ];
  }, [canManage, dateFormat, retry, retrying, timeZone, translate]);

  return (
    <TimciDataList<DocumentRow>
      resource="documents"
      rowKey="id"
      titleKey="pages.documents.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
      initialSorters={[{ field: 'issuedAt', order: 'desc' }]}
      getRowShowPath={getRowShowPath}
      rowSelection={
        canManage
          ? {
              selectedRowKeys: selectedKeys,
              onChange: setSelectedKeys,
              getCheckboxProps: (record) => ({ disabled: record.status !== 'failed' }),
            }
          : undefined
      }
      extraHeaderButtons={
        canManage ? (
          <Button
            disabled={selectedKeys.length === 0}
            loading={retrying}
            onClick={() => void retry(selectedKeys.map(String))}
          >
            {translate('documents.retrySelected', { count: selectedKeys.length })}
          </Button>
        ) : null
      }
      listCreateButtonProps={{ hidden: true }}
    />
  );
}
