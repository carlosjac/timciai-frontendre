import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { timciLogicalFilter } from '../../shared/timci/listQuery.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type SignupStatus = 'pending' | 'accepted' | 'rejected';

type SignupRow = BaseRecord & {
  id: string;
  status: SignupStatus;
  entityName: string;
  entityEmail: string;
  adminName: string;
  adminEmail: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: 'pending', labelKey: 'pages.entityRequests.status.pending' },
  { value: 'accepted', labelKey: 'pages.entityRequests.status.accepted' },
  { value: 'rejected', labelKey: 'pages.entityRequests.status.rejected' },
] as const;

function statusColor(status: string): string {
  if (status === 'accepted') return 'success';
  if (status === 'rejected') return 'error';
  return 'processing';
}

export function EntitySignupListPage() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();

  const initialFilters = useMemo(
    () => [timciLogicalFilter('status', 'eq', 'pending')],
    [],
  );
  const initialSorters = useMemo(
    () => [{ field: 'createdAt', order: 'desc' as const }],
    [],
  );
  const getRowShowPath = useMemo(
    () => (record: SignupRow) => `/entity-requests/show/${encodeURIComponent(String(record.id))}`,
    [],
  );

  const columnDefs = useMemo((): TimciColumnDef<SignupRow>[] => {
    const statusLabel = (status: string) =>
      translate(`pages.entityRequests.status.${status}`, undefined, status);

    return [
      {
        key: 'entityName',
        dataIndex: 'entityName',
        titleKey: 'table.entitySignups.entityName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'entityEmail',
        dataIndex: 'entityEmail',
        titleKey: 'table.entitySignups.entityEmail',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'adminName',
        dataIndex: 'adminName',
        titleKey: 'table.entitySignups.adminName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'adminEmail',
        dataIndex: 'adminEmail',
        titleKey: 'table.entitySignups.adminEmail',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.entitySignups.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        render: (value: unknown) => formatTimciUserDateTime(value, { dateFormat, timeZone }),
      },
      {
        key: 'status',
        dataIndex: 'status',
        titleKey: 'table.entitySignups.status',
        sorter: true,
        filter: { kind: 'select', options: STATUS_OPTIONS },
        render: (value: unknown) => {
          const status = String(value ?? '');
          return <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>;
        },
        exportValue: (row) => statusLabel(row.status),
      },
    ];
  }, [dateFormat, timeZone, translate]);

  return (
    <TimciDataList<SignupRow>
      resource="entitySignups"
      rowKey="id"
      titleKey="pages.entityRequests.title"
      columnDefs={columnDefs}
      pickerDateFormat={dateFormat}
      initialSorters={initialSorters}
      initialFilters={initialFilters}
      getRowShowPath={getRowShowPath}
    />
  );
}
