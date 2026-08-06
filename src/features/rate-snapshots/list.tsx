import { useMemo } from 'react';
import { type BaseRecord } from '@refinedev/core';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type RateSnapshotRow = BaseRecord & {
  id: string;
  provider: string;
  providerBaseCode: string;
  asOf?: string;
  fetchedAt?: string;
  rateCount?: number;
};

export function RateSnapshotList() {
  const { dateFormat, timeZone } = useUserPreferences();

  const columnDefs = useMemo((): TimciColumnDef<RateSnapshotRow>[] => {
    return [
      {
        key: 'provider',
        dataIndex: 'provider',
        titleKey: 'table.rateSnapshots.provider',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'providerBaseCode',
        dataIndex: 'providerBaseCode',
        titleKey: 'table.rateSnapshots.providerBaseCode',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'asOf',
        dataIndex: 'asOf',
        titleKey: 'table.rateSnapshots.asOf',
        sorter: true,
        filter: { kind: 'date' },
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'fetchedAt',
        dataIndex: 'fetchedAt',
        titleKey: 'table.rateSnapshots.fetchedAt',
        sorter: true,
        filter: { kind: 'date' },
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'rateCount',
        dataIndex: 'rateCount',
        titleKey: 'table.rateSnapshots.rateCount',
        sorter: true,
      },
    ];
  }, [dateFormat, timeZone]);

  return (
    <TimciDataList<RateSnapshotRow>
      resource="rateSnapshots"
      rowKey="id"
      titleKey="pages.rateSnapshots.title"
      columnDefs={columnDefs}
      pickerDateFormat={dateFormat}
      getRowShowPath={(record) =>
        record.id != null ? `/rate-snapshots/show/${record.id}` : undefined
      }
    />
  );
}
