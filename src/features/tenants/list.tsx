import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type TenantRow = BaseRecord & {
  name: string;
  isActive?: boolean;
};

export function TenantList() {
  const translate = useTranslate();
  const { dateFormat } = useUserPreferences();

  const columnDefs = useMemo((): TimciColumnDef<TenantRow>[] => {
    return [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.tenants.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.tenants.active',
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
    <TimciDataList<TenantRow>
      resource="tenants"
      rowKey="id"
      titleKey="pages.tenants.title"
      columnDefs={columnDefs}
      pickerDateFormat={dateFormat}
    />
  );
}
