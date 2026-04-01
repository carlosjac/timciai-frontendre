import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type UserRow = BaseRecord & {
  email: string;
  name: string;
  isActive?: boolean;
};

export function UserList() {
  const translate = useTranslate();
  const { dateFormat } = useUserPreferences();

  const columnDefs = useMemo((): TimciColumnDef<UserRow>[] => {
    return [
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
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.users.active',
        filter: { kind: 'boolean' },
        render: (v: unknown) =>
          v ? (
            <Tag color="green">{translate('table.users.yes')}</Tag>
          ) : (
            <Tag>{translate('table.users.no')}</Tag>
          ),
        exportValue: (r) => (r.isActive ? translate('table.users.yes') : translate('table.users.no')),
      },
    ];
  }, [translate]);

  return (
    <TimciDataList<UserRow>
      resource="users"
      rowKey="id"
      titleKey="pages.users.title"
      columnDefs={columnDefs}
      pickerDateFormat={dateFormat}
    />
  );
}
