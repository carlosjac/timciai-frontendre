import { useList, usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Alert, Button, Select, Space, Spin, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { formatTimciUserDateOnly, formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { SellableItemPriceDrawer } from './SellableItemPriceDrawer.js';

type PriceListRow = BaseRecord & { id: string; name?: string; isActive?: boolean };

type ItemRow = BaseRecord & {
  currencyCode?: string;
  unitPriceAmount?: string;
  validFrom?: string | null;
  validTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export type SellableItemPricesTabProps = {
  entityId: string;
  sellableItemId: string;
  sellableName?: string;
};

export function SellableItemPricesTab({
  entityId,
  sellableItemId,
  sellableName,
}: SellableItemPricesTabProps) {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canUpdate = codes.includes('price_list_items.update');
  const canAdd = codes.includes('price_list_items.add');

  const { query: listsQuery, result: listsResult } = useList<PriceListRow>({
    resource: 'price_lists',
    meta: { entityId },
    pagination: { currentPage: 1, pageSize: 500 },
    sorters: [{ field: 'name', order: 'asc' }],
    queryOptions: { enabled: Boolean(entityId) },
  });

  const priceLists = useMemo(() => listsResult.data ?? [], [listsResult.data]);
  const listsLoading = listsQuery.isLoading || listsQuery.isFetching;

  const [priceListId, setPriceListId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedPriceList = useMemo(
    () => priceLists.find((p) => String(p.id) === String(priceListId)) ?? null,
    [priceLists, priceListId],
  );

  const canMutatePricesForList =
    Boolean(priceListId) && selectedPriceList != null && selectedPriceList.isActive !== false;

  useEffect(() => {
    if (!canMutatePricesForList) {
      setDrawerOpen(false);
      setEditingId(null);
    }
  }, [canMutatePricesForList]);

  const listMeta = useMemo(
    () =>
      ({
        priceListId: priceListId ?? '',
        entityId,
        sellableItemId,
      }) as Record<string, unknown>,
    [priceListId, entityId, sellableItemId],
  );

  const priceItemsInitialSorters = useMemo(() => [{ field: 'validFrom', order: 'desc' as const }], []);

  const columnDefs = useMemo((): TimciColumnDef<ItemRow>[] => {
    const cols: TimciColumnDef<ItemRow>[] = [];
    if (canUpdate && canMutatePricesForList) {
      cols.push({
        key: 'actions',
        dataIndex: 'id',
        titleKey: 'table.priceListItems.actions',
        width: 100,
        render: (_: unknown, record: ItemRow) => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditingId(String(record.id));
              setDrawerOpen(true);
            }}
          >
            {translate('table.priceListItems.edit')}
          </Button>
        ),
        exportValue: () => '',
      });
    }
    cols.push(
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
    );
    return cols;
  }, [canMutatePricesForList, canUpdate, dateFormat, timeZone, translate]);

  if (listsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
        <Spin />
      </div>
    );
  }

  if (priceLists.length === 0) {
    return (
      <Alert type="info" showIcon message={translate('pages.sellableItems.pricesNoPriceLists')} />
    );
  }

  const listReady = Boolean(priceListId && entityId && sellableItemId);

  return (
    <>
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
        <div>
          <Typography.Text strong>{translate('pages.sellableItems.pricesPickList')}</Typography.Text>
          <Select
            style={{ width: '100%', maxWidth: 400, display: 'block', marginTop: 8 }}
            placeholder={translate('pages.sellableItems.pricesPickListPlaceholder')}
            value={priceListId ?? undefined}
            onChange={(v) => {
              setPriceListId(v ? String(v) : null);
            }}
            allowClear
            options={priceLists.map((p) => {
              const base = p.name ?? p.id;
              const suffix =
                p.isActive === false
                  ? ` (${translate('pages.sellableItems.pricesInactiveListSuffix')})`
                  : '';
              return { value: p.id, label: `${base}${suffix}` };
            })}
          />
          <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            {translate('pages.sellableItems.pricesPickListHint')}
          </Typography.Paragraph>
        </div>
      </Space>

      {!priceListId ? (
        <Alert type="info" showIcon message={translate('pages.sellableItems.pricesSelectListFirst')} />
      ) : (
        <>
          <TimciFormInactiveRecordBanner
            messageKey="pages.sellableItems.pricesInactiveListReadOnly"
            isActive={!priceListId || selectedPriceList?.isActive !== false}
          />
        <TimciDataList<ItemRow>
          resource="price_list_items"
          rowKey="id"
          titleKey="pages.sellableItems.pricesTableTitle"
          columnDefs={columnDefs}
          requiresTenant
          meta={listMeta}
          syncWithLocation={false}
          pickerDateFormat={dateFormat}
          columnVisibilityStorageId={`price_list_items:sellable:${sellableItemId}:${priceListId}`}
          hideTitle
          queryOptions={{ enabled: listReady }}
          initialSorters={priceItemsInitialSorters}
          listCreateButtonProps={
            canAdd && canMutatePricesForList
              ? {
                  onClick: (e) => {
                    e.preventDefault();
                    setEditingId(null);
                    setDrawerOpen(true);
                  },
                }
              : undefined
          }
        />
        </>
      )}

      {priceListId && (
        <SellableItemPriceDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setEditingId(null);
          }}
          priceListId={priceListId}
          entityId={entityId}
          sellableItemId={sellableItemId}
          sellableLabel={sellableName}
          editingId={editingId}
        />
      )}
    </>
  );
}
