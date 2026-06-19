import { EditButton } from '@refinedev/antd';
import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type CurrencyRow = BaseRecord & {
  code: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function CurrencyList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = permData?.actionCodes?.includes('currencies.view') ?? false;
  const canUpdate = permData?.actionCodes?.includes('currencies.update') ?? false;

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: CurrencyRow) => `/currencies/show/${encodeURIComponent(String(record.id))}`
        : undefined,
    [canView],
  );

  const columnDefs = useMemo((): TimciColumnDef<CurrencyRow>[] => {
    const editColumn: TimciColumnDef<CurrencyRow> = {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.currencies.actions',
      width: 72,
      render: (_: unknown, record: CurrencyRow) => (
        <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
          <EditButton
            resource="currencies"
            recordItemId={record.id}
            hideText
            title={translate('table.currencies.edit')}
            aria-label={translate('table.currencies.edit')}
          />
        </span>
      ),
      exportValue: () => '',
    };

    const cols: TimciColumnDef<CurrencyRow>[] = [
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
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.currencies.active',
        sorter: true,
        filter: { kind: 'boolean' },
        render: (v: unknown) =>
          v ? (
            <Tag color="green">{translate('table.users.yes')}</Tag>
          ) : (
            <Tag color="red">{translate('table.users.no')}</Tag>
          ),
        exportValue: (r) => (r.isActive ? translate('table.users.yes') : translate('table.users.no')),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.currencies.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.currencies.updatedAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.currencies.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.currencies.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];

    return canUpdate ? [editColumn, ...cols] : cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<CurrencyRow>
      resource="currencies"
      rowKey="id"
      titleKey="pages.currencies.title"
      columnDefs={columnDefs}
      requiresTenant
      includeInactive
      pickerDateFormat={dateFormat}
      getRowShowPath={getRowShowPath}
    />
  );
}
