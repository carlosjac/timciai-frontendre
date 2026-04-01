import { useMemo } from 'react';
import { type BaseRecord } from '@refinedev/core';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type DocTypeRow = BaseRecord & {
  name: string;
};

export function DocumentTypeList() {
  const { dateFormat } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<DocTypeRow>[] => {
    return [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.documentTypes.name',
        sorter: true,
        filter: { kind: 'text' },
      },
    ];
  }, []);

  return (
    <TimciDataList<DocTypeRow>
      resource="document_types"
      rowKey="id"
      titleKey="pages.documentTypes.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
    />
  );
}
