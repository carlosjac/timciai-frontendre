import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Link } from 'react-router';
import { Button, Tag } from 'antd';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type PriceListRow = BaseRecord & {
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function PriceListList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const canUpdate = permData?.actionCodes?.includes('price_lists.update') ?? false;

  const listMeta = useMemo(
    () => (tenantId ? { entityId: tenantId } : undefined),
    [tenantId],
  );

  const columnDefs = useMemo((): TimciColumnDef<PriceListRow>[] => {
    const cols: TimciColumnDef<PriceListRow>[] = [];

    if (canUpdate) {
      cols.push({
        key: 'actions',
        dataIndex: 'id',
        titleKey: 'table.priceLists.actions',
        width: 100,
        render: (_: unknown, record: PriceListRow) => (
          <Link to={`/price-lists/edit/${encodeURIComponent(String(record.id))}`}>
            <Button type="link" size="small">
              {translate('table.priceLists.edit')}
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
        titleKey: 'table.priceLists.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.priceLists.active',
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
        titleKey: 'table.priceLists.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.priceLists.updatedAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.priceLists.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.priceLists.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    );

    return cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<PriceListRow>
      resource="price_lists"
      rowKey="id"
      titleKey="pages.priceLists.title"
      columnDefs={columnDefs}
      requiresTenant
      meta={listMeta}
      pickerDateFormat={dateFormat}
    />
  );
}
