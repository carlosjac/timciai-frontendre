import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type CustomerRow = BaseRecord & {
  name: string;
  documentNumber: string;
  isActive?: boolean;
};

export function CustomerList() {
  const translate = useTranslate();
  const { dateFormat } = useUserPreferences();

  const columnDefs = useMemo((): TimciColumnDef<CustomerRow>[] => {
    return [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.customers.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'documentNumber',
        dataIndex: 'documentNumber',
        titleKey: 'table.customers.document',
        filter: { kind: 'text' },
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.customers.active',
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
    <TimciDataList<CustomerRow>
      resource="customers"
      rowKey="id"
      titleKey="pages.customers.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
    />
  );
}
