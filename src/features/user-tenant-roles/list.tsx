import { useMemo } from 'react';
import { type BaseRecord } from '@refinedev/core';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type UserTenantRoleRow = BaseRecord & {
  userName?: string;
  tenantName?: string;
  roleName?: string;
  createdAt?: string;
  createdByName?: string;
};

export function UserTenantRoleList() {
  const { dateFormat } = useUserPreferences();
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
        key: 'tenantName',
        dataIndex: 'tenantName',
        titleKey: 'table.userTenantRoles.tenantName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'roleName',
        dataIndex: 'roleName',
        titleKey: 'table.userTenantRoles.roleName',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.userTenantRoles.createdAt',
        defaultVisible: false,
        filter: { kind: 'date' },
      },
      {
        key: 'createdByName',
        dataIndex: 'createdByName',
        titleKey: 'table.userTenantRoles.createdByName',
        defaultVisible: false,
        filter: { kind: 'text' },
      },
    ];
  }, []);

  return (
    <TimciDataList<UserTenantRoleRow>
      resource="userTenantRoles"
      rowKey="id"
      titleKey="pages.userTenantRoles.title"
      columnDefs={columnDefs}
      pickerDateFormat={dateFormat}
    />
  );
}
