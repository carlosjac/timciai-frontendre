import { DeleteButton } from '@refinedev/antd';
import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { ROLE_ROOT_ID } from '../../shared/timci/rolesApi.js';
import { GLOBAL_TENANT_ID } from '../../shared/timci/tenantsApi.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type PermissionRow = BaseRecord & {
  id: string;
  roleId?: string;
  tenantId?: string;
  actionId?: string;
  roleName?: string;
  tenantName?: string;
  actionName?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

function shortId(id: unknown): string {
  const s = typeof id === 'string' ? id : '';
  if (s.length <= 10) return s || '—';
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function isProtectedRootGlobalPermission(record: PermissionRow): boolean {
  return record.roleId === ROLE_ROOT_ID && record.tenantId === GLOBAL_TENANT_ID;
}

export function PermissionList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<PermissionRow>[] => {
    const actionsColumn: TimciColumnDef<PermissionRow> = {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.permissions.actions',
      width: 72,
      render: (_, record) => {
        if (isProtectedRootGlobalPermission(record)) return null;
        return (
          <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
            <DeleteButton
              resource="permissions"
              recordItemId={record.id}
              hideText
              title={translate('table.permissions.delete')}
              confirmTitle={translate('pages.permissions.deleteConfirmTitle')}
            />
          </span>
        );
      },
      exportValue: () => '',
    };

    return [
      actionsColumn,
      {
        key: 'roleName',
        dataIndex: 'roleName',
        titleKey: 'table.permissions.roleName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'tenantName',
        dataIndex: 'tenantName',
        titleKey: 'table.permissions.tenantName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'actionName',
        dataIndex: 'actionName',
        titleKey: 'table.permissions.actionName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'actionId',
        dataIndex: 'actionId',
        titleKey: 'table.permissions.actionId',
        width: 120,
        defaultVisible: false,
        render: (v: unknown) => shortId(v),
        exportValue: (r) => String(r.actionId ?? ''),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.permissions.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) =>
          formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.permissions.updatedAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) =>
          formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.permissions.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.permissions.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];
  }, [dateFormat, timeZone, translate]);

  return (
    <TimciDataList<PermissionRow>
      resource="permissions"
      rowKey="id"
      titleKey="pages.permissions.title"
      columnDefs={columnDefs}
      pickerDateFormat={dateFormat}
    />
  );
}
