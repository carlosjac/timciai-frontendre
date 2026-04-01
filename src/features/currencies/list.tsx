import { useMemo } from 'react';
import { type BaseRecord } from '@refinedev/core';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type CurrencyRow = BaseRecord & {
  code: string;
  name: string;
};

export function CurrencyList() {
  const { dateFormat } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<CurrencyRow>[] => {
    return [
      {
        key: 'code',
        dataIndex: 'code',
        titleKey: 'table.currencies.code',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.currencies.name',
        sorter: true,
        filter: { kind: 'text' },
      },
    ];
  }, []);

  return (
    <TimciDataList<CurrencyRow>
      resource="currencies"
      rowKey="id"
      titleKey="pages.currencies.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
    />
  );
}
