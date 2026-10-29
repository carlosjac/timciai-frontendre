import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type DocumentRow = BaseRecord & {
  id: string;
  documentKind: string;
  status: string;
  number: string | null;
  issuedAt?: string | null;
  hasContent?: boolean;
  errorMessage?: string | null;
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
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = permData?.actionCodes?.includes('documents.view') ?? false;

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
  }, [dateFormat, timeZone, translate]);

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
      listCreateButtonProps={{ hidden: true }}
    />
  );
}
