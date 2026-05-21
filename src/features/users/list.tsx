import { EditButton } from '@refinedev/antd';
import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { translateUserDateFormat } from './userPreferenceLabels.js';

type UserRow = BaseRecord & {
  email: string;
  name: string;
  isActive?: boolean;
  timeZone?: string;
  dateFormat?: string;
  theme?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function UserList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = permData?.actionCodes?.includes('users.view') ?? false;
  const canUpdate = permData?.actionCodes?.includes('users.update') ?? false;

  const listMeta = useMemo(() => ({ includeInactive: true }), []);

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: UserRow) => `/users/show/${encodeURIComponent(String(record.id))}`
        : undefined,
    [canView],
  );

  const columnDefs = useMemo((): TimciColumnDef<UserRow>[] => {
    const cols: TimciColumnDef<UserRow>[] = [
      {
        key: 'email',
        dataIndex: 'email',
        titleKey: 'table.users.email',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.users.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'timeZone',
        dataIndex: 'timeZone',
        titleKey: 'table.users.timeZone',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'dateFormat',
        dataIndex: 'dateFormat',
        titleKey: 'table.users.dateFormat',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => translateUserDateFormat(translate, v),
        exportValue: (r) => translateUserDateFormat(translate, r.dateFormat),
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.users.active',
        sorter: true,
        filter: { kind: 'boolean' },
        render: (v: unknown) =>
          v ? (
            <Tag color="green">{translate('table.users.yes')}</Tag>
          ) : (
            <Tag color="red">{translate('table.users.no')}</Tag>
          ),
        exportValue: (r) => (r.isActive ? translate('table.users.yes') : translate('table.users.no')),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.users.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.users.updatedAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.users.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.users.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];

    if (canUpdate) {
      cols.push({
        key: 'actions',
        dataIndex: 'id',
        titleKey: 'table.users.actions',
        width: 72,
        render: (_: unknown, record: UserRow) => (
          <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
            <EditButton
              resource="users"
              recordItemId={record.id}
              hideText
              title={translate('table.users.edit')}
              aria-label={translate('table.users.edit')}
            />
          </span>
        ),
        exportValue: () => '',
      });
    }

    return cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<UserRow>
      resource="users"
      rowKey="id"
      titleKey="pages.users.title"
      columnDefs={columnDefs}
      meta={listMeta}
      pickerDateFormat={dateFormat}
      getRowShowPath={getRowShowPath}
    />
  );
}
