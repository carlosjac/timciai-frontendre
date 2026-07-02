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
import { sellableKindTitleKey } from './kindChoices.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type SellableItemRow = BaseRecord & {
  name: string;
  kind?: string;
  code?: string | null;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function SellableItemList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = permData?.actionCodes?.includes('sellable_items.view') ?? false;
  const canUpdate = permData?.actionCodes?.includes('sellable_items.update') ?? false;

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: SellableItemRow) =>
            `/sellable-items/show/${encodeURIComponent(String(record.id))}`
        : undefined,
    [canView],
  );

  const columnDefs = useMemo((): TimciColumnDef<SellableItemRow>[] => {
    const editColumn: TimciColumnDef<SellableItemRow> = {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.sellableItems.actions',
      width: 72,
      render: (_: unknown, record: SellableItemRow) =>
        record.isActive === false ? null : (
          <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
            <EditButton
              resource="sellable_items"
              recordItemId={record.id}
              hideText
              title={translate('table.sellableItems.edit')}
              aria-label={translate('table.sellableItems.edit')}
            />
          </span>
        ),
      exportValue: () => '',
    };

    const cols: TimciColumnDef<SellableItemRow>[] = [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.sellableItems.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'kind',
        dataIndex: 'kind',
        titleKey: 'table.sellableItems.kind',
        sorter: true,
        render: (v: unknown) => translate(sellableKindTitleKey(typeof v === 'string' ? v : undefined)),
        exportValue: (r) => translate(sellableKindTitleKey(r.kind)),
      },
      {
        key: 'code',
        dataIndex: 'code',
        titleKey: 'table.sellableItems.code',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => (v != null && String(v) !== '' ? String(v) : '—'),
      },
      {
        key: 'description',
        dataIndex: 'description',
        titleKey: 'table.sellableItems.description',
        sorter: true,
        filter: { kind: 'text' },
        defaultVisible: false,
        render: (v: unknown) => (v != null && String(v) !== '' ? String(v) : '—'),
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.sellableItems.active',
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
        titleKey: 'table.sellableItems.createdAt',
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.sellableItems.updatedAt',
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.sellableItems.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.sellableItems.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];

    return canUpdate ? [editColumn, ...cols] : cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<SellableItemRow>
      resource="sellable_items"
      rowKey="id"
      titleKey="pages.sellableItems.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
      getRowShowPath={getRowShowPath}
    />
  );
}
