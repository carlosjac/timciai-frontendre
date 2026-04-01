import { DeleteButton } from '@refinedev/antd';
import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type UserTenantRoleRow = BaseRecord & {
  id: string;
  userName?: string;
  tenantName?: string;
  roleName?: string;
  createdAt?: string;
  createdByName?: string;
};

export function UserTenantRoleList() {
  const translate = useTranslate();
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
  }, [translate]);

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
