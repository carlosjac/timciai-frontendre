import { useMemo } from 'react';
import { type BaseRecord } from '@refinedev/core';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type CountryRow = BaseRecord & {
  name: string;
  isoCode?: string;
};

export function CountryList() {
  const { dateFormat } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<CountryRow>[] => {
    return [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.countries.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'isoCode',
        dataIndex: 'isoCode',
        titleKey: 'table.countries.iso',
        filter: { kind: 'text' },
      },
    ];
  }, []);

  return (
    <TimciDataList<CountryRow>
      resource="countries"
      rowKey="id"
      titleKey="pages.countries.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
    />
  );
}
