import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Alert } from 'antd';
import { useMemo } from 'react';
import { formatTimciUserDateOnly, formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type ItemRow = BaseRecord & {
  sellableItemName?: string;
  sellableItemCode?: string | null;
  currencyCode?: string;
  unitPriceAmount?: string;
  validFrom?: string | null;
  validTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export type PriceListItemsReadonlyTabProps = {
  entityId: string;
  priceListId: string;
};

export function PriceListItemsReadonlyTab({ entityId, priceListId }: PriceListItemsReadonlyTabProps) {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();

  const listMeta = useMemo(
    () =>
      ({
        priceListId,
        entityId,
      }) as Record<string, unknown>,
    [priceListId, entityId],
  );

  const initialSorters = useMemo(() => [{ field: 'validFrom', order: 'desc' as const }], []);

  const columnDefs = useMemo((): TimciColumnDef<ItemRow>[] => {
    return [
      {
        key: 'sellableItemName',
        dataIndex: 'sellableItemName',
        titleKey: 'table.priceListItems.sellable',
        filter: { kind: 'text' },
      },
      {
        key: 'sellableItemCode',
        dataIndex: 'sellableItemCode',
        titleKey: 'table.priceListItems.code',
        filter: { kind: 'text' },
        render: (v: unknown) => (v == null || String(v) === '' ? '—' : String(v)),
      },
      {
        key: 'currencyCode',
        dataIndex: 'currencyCode',
        titleKey: 'table.priceListItems.currency',
        filter: { kind: 'text' },
      },
      {
        key: 'unitPriceAmount',
        dataIndex: 'unitPriceAmount',
        titleKey: 'table.priceListItems.unitPrice',
        sorter: true,
        filter: { kind: 'number' },
      },
      {
        key: 'validFrom',
        dataIndex: 'validFrom',
        titleKey: 'table.priceListItems.validFrom',
        sorter: true,
        filter: { kind: 'date' },
        render: (v: unknown) => formatTimciUserDateOnly(v, { dateFormat, timeZone }),
      },
      {
        key: 'validTo',
        dataIndex: 'validTo',
        titleKey: 'table.priceListItems.validTo',
        sorter: true,
        filter: { kind: 'date' },
        render: (v: unknown) => formatTimciUserDateOnly(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.priceListItems.createdAt',
        defaultVisible: false,
        filter: { kind: 'date' },
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.priceListItems.updatedAt',
        defaultVisible: false,
        filter: { kind: 'date' },
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.priceListItems.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.priceListItems.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];
  }, [dateFormat, timeZone]);

  const listReady = Boolean(priceListId && entityId);

  if (!listReady) {
    return (
      <Alert type="info" showIcon message={translate('pages.priceLists.itemsTabWait')} />
    );
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        message={translate('pages.priceLists.itemsReadOnlyHint')}
        style={{ marginBottom: 16 }}
      />
      <TimciDataList<ItemRow>
        resource="price_list_items"
        rowKey="id"
        titleKey="pages.priceLists.itemsTabTableTitle"
        columnDefs={columnDefs}
        requiresTenant
        meta={listMeta}
        syncWithLocation={false}
        pickerDateFormat={dateFormat}
        columnVisibilityStorageId={`price_list_items:priceListEdit:${priceListId}`}
        hideTitle
        queryOptions={{ enabled: listReady }}
        initialSorters={initialSorters}
      />
    </>
  );
}
