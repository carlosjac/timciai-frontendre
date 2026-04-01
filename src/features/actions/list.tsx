import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type ActionRow = BaseRecord & {
  code: string;
  name: string;
  isGlobal?: boolean;
};

export function ActionList() {
  const translate = useTranslate();
  const { dateFormat } = useUserPreferences();

  const columnDefs = useMemo((): TimciColumnDef<ActionRow>[] => {
    return [
      {
        key: 'code',
        dataIndex: 'code',
        titleKey: 'table.actions.code',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.actions.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'isGlobal',
        dataIndex: 'isGlobal',
        titleKey: 'table.actions.global',
        filter: { kind: 'boolean' },
        render: (v: unknown) =>
          v ? <Tag color="blue">{translate('table.users.yes')}</Tag> : <Tag>{translate('table.users.no')}</Tag>,
        exportValue: (r) => (r.isGlobal ? translate('table.users.yes') : translate('table.users.no')),
      },
    ];
  }, [translate]);

  return (
    <TimciDataList<ActionRow>
      resource="actions"
      rowKey="id"
      titleKey="pages.actions.title"
      columnDefs={columnDefs}
      pickerDateFormat={dateFormat}
    />
  );
}
