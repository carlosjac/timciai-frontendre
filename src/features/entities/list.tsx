import { useMemo } from 'react';
import { type BaseRecord } from '@refinedev/core';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type EntityRow = BaseRecord & {
  name: string;
};

export function EntityList() {
  const { dateFormat } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<EntityRow>[] => {
    return [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.entities.name',
        sorter: true,
        filter: { kind: 'text' },
      },
    ];
  }, []);

  return (
    <TimciDataList<EntityRow>
      resource="entities"
      rowKey="id"
      titleKey="pages.entities.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
    />
  );
}
