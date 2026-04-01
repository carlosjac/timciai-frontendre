import { useMemo } from 'react';
import { type BaseRecord } from '@refinedev/core';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type PermissionRow = BaseRecord & {
  roleName?: string;
  tenantName?: string;
  actionName?: string;
  createdAt?: string;
  createdByName?: string;
};

export function PermissionList() {
  const { dateFormat } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<PermissionRow>[] => {
    return [
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
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.permissions.createdAt',
        defaultVisible: false,
        filter: { kind: 'date' },
      },
      {
        key: 'createdByName',
        dataIndex: 'createdByName',
        titleKey: 'table.permissions.createdByName',
        defaultVisible: false,
        filter: { kind: 'text' },
      },
    ];
  }, []);

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
