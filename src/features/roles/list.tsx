import { useMemo } from 'react';
import { type BaseRecord } from '@refinedev/core';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type RoleRow = BaseRecord & {
  name: string;
  createdAt?: string;
};

export function RoleList() {
  const { dateFormat } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<RoleRow>[] => {
    return [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.roles.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.roles.createdAt',
        defaultVisible: false,
        filter: { kind: 'date' },
      },
    ];
  }, []);

  return (
    <TimciDataList<RoleRow>
      resource="roles"
      rowKey="id"
      titleKey="pages.roles.title"
      columnDefs={columnDefs}
      pickerDateFormat={dateFormat}
    />
  );
}
