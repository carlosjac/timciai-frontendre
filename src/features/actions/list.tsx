import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type ActionRow = BaseRecord & {
  code: string;
  name: string;
  isGlobal?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function ActionList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();

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
        sorter: true,
        render: (v: unknown) =>
          v ? <Tag color="blue">{translate('table.users.yes')}</Tag> : <Tag>{translate('table.users.no')}</Tag>,
        exportValue: (r) => (r.isGlobal ? translate('table.users.yes') : translate('table.users.no')),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.actions.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) =>
          formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.actions.updatedAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) =>
          formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.actions.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.actions.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];
  }, [dateFormat, timeZone, translate]);

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
