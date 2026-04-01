import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Link } from 'react-router';
import { Button, Tag } from 'antd';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { sellableKindTitleKey } from './kindChoices.js';

type SellableItemRow = BaseRecord & {
  name: string;
  kind?: string;
  code?: string | null;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

export function SellableItemList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const canUpdate = permData?.actionCodes?.includes('sellable_items.update') ?? false;

  const listMeta = useMemo(
    () => (tenantId ? { entityId: tenantId } : undefined),
    [tenantId],
  );

  const columnDefs = useMemo((): TimciColumnDef<SellableItemRow>[] => {
    const cols: TimciColumnDef<SellableItemRow>[] = [];

    if (canUpdate) {
      cols.push({
        key: 'actions',
        dataIndex: 'id',
        titleKey: 'table.sellableItems.actions',
        width: 100,
        render: (_: unknown, record: SellableItemRow) => (
          <Link to={`/sellable-items/edit/${encodeURIComponent(String(record.id))}`}>
            <Button type="link" size="small">
              {translate('table.sellableItems.edit')}
            </Button>
          </Link>
        ),
        exportValue: () => '',
      });
    }

    cols.push(
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
            <Tag>{translate('table.users.no')}</Tag>
          ),
        exportValue: (r) => (r.isActive ? translate('table.users.yes') : translate('table.users.no')),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.sellableItems.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        render: (v: unknown) =>
          formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
    );

    return cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<SellableItemRow>
      resource="sellable_items"
      rowKey="id"
      titleKey="pages.sellableItems.title"
      columnDefs={columnDefs}
      requiresTenant
      meta={listMeta}
      pickerDateFormat={dateFormat}
    />
  );
}
