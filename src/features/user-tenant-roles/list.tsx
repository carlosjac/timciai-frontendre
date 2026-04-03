import { DeleteButton } from '@refinedev/antd';
import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type UserTenantRoleRow = BaseRecord & {
  id: string;
  userId?: string;
  tenantId?: string;
  roleId?: string;
  userName?: string;
  tenantName?: string;
  roleName?: string;
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

export function UserTenantRoleList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<UserTenantRoleRow>[] => {
    return [
      {
        key: 'userName',
        dataIndex: 'userName',
        titleKey: 'table.userTenantRoles.userName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'userId',
        dataIndex: 'userId',
        titleKey: 'table.userTenantRoles.userId',
        width: 120,
        defaultVisible: false,
        render: (v: unknown) => shortId(v),
        exportValue: (r) => String(r.userId ?? ''),
      },
      {
        key: 'tenantName',
        dataIndex: 'tenantName',
        titleKey: 'table.userTenantRoles.tenantName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'tenantId',
        dataIndex: 'tenantId',
        titleKey: 'table.userTenantRoles.tenantId',
        width: 120,
        defaultVisible: false,
        render: (v: unknown) => shortId(v),
        exportValue: (r) => String(r.tenantId ?? ''),
      },
      {
        key: 'roleName',
        dataIndex: 'roleName',
        titleKey: 'table.userTenantRoles.roleName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'roleId',
        dataIndex: 'roleId',
        titleKey: 'table.userTenantRoles.roleId',
        width: 120,
        defaultVisible: false,
        render: (v: unknown) => shortId(v),
        exportValue: (r) => String(r.roleId ?? ''),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.userTenantRoles.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.userTenantRoles.updatedAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.userTenantRoles.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.userTenantRoles.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'actions',
        dataIndex: 'id',
        titleKey: 'table.userTenantRoles.actions',
        width: 72,
        render: (_, record) => (
          <DeleteButton
            resource="userTenantRoles"
            recordItemId={record.id}
            hideText
            confirmTitle={translate('pages.userTenantRoles.deleteConfirmTitle')}
          />
        ),
        exportValue: () => '',
      },
    ];
  }, [dateFormat, timeZone, translate]);

  return (
    <TimciDataList<UserTenantRoleRow>
      resource="userTenantRoles"
      rowKey="id"
      titleKey="pages.userTenantRoles.title"
      columnDefs={columnDefs}
      initialSorters={[{ field: 'userName', order: 'asc' }]}
      pickerDateFormat={dateFormat}
    />
  );
}
