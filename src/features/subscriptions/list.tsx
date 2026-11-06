import { EditButton } from '@refinedev/antd';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { useMemo } from 'react';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type SubscriptionLine = { sellableItemName?: string };

type SubscriptionRow = BaseRecord & {
  id: string;
  customerName?: string;
  startsOn?: string;
  endsOn?: string | null;
  intervalMonths?: number;
  periodMode?: string;
  priceListName?: string;
  active?: boolean;
  lines?: SubscriptionLine[];
};

function productNames(record: SubscriptionRow): string {
  return (record.lines ?? [])
    .map((line) => line.sellableItemName?.trim() ?? '')
    .filter((name) => name.length > 0)
    .join(', ');
}

export function SubscriptionList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = permData?.actionCodes?.includes('subscriptions.view') ?? false;
  const canUpdate = permData?.actionCodes?.includes('subscriptions.update') ?? false;

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: SubscriptionRow) => `/subscriptions/show/${encodeURIComponent(record.id)}`
        : undefined,
    [canView],
  );

  const columnDefs = useMemo((): TimciColumnDef<SubscriptionRow>[] => {
    const editColumn: TimciColumnDef<SubscriptionRow> = {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.subscriptions.actions',
      width: 72,
      render: (_value, record) => (
        <span data-timci-row-action onClick={(event) => event.stopPropagation()}>
          <EditButton
            resource="subscriptions"
            recordItemId={record.id}
            hideText
            title={translate('table.subscriptions.edit')}
            aria-label={translate('table.subscriptions.edit')}
          />
        </span>
      ),
      exportValue: () => '',
    };
    const cols: TimciColumnDef<SubscriptionRow>[] = [
      {
        key: 'customerName',
        dataIndex: 'customerName',
        titleKey: 'table.subscriptions.customer',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'products',
        dataIndex: 'lines',
        titleKey: 'table.subscriptions.products',
        render: (_value, record) => productNames(record),
        exportValue: (record) => productNames(record),
      },
      {
        key: 'startsOn',
        dataIndex: 'startsOn',
        titleKey: 'table.subscriptions.startsOn',
        sorter: true,
        filter: { kind: 'date' },
        render: (value) => formatTimciUserDateOnly(value, { dateFormat, timeZone }),
        exportValue: (record) =>
          formatTimciUserDateOnly(record.startsOn, { dateFormat, timeZone }) || '',
      },
      {
        key: 'endsOn',
        dataIndex: 'endsOn',
        titleKey: 'table.subscriptions.endsOn',
        sorter: true,
        filter: { kind: 'date' },
        render: (value) =>
          value
            ? formatTimciUserDateOnly(value, { dateFormat, timeZone })
            : translate('pages.subscriptions.noEnd'),
        exportValue: (record) =>
          record.endsOn
            ? formatTimciUserDateOnly(record.endsOn, { dateFormat, timeZone }) || ''
            : translate('pages.subscriptions.noEnd'),
      },
      {
        key: 'intervalMonths',
        dataIndex: 'intervalMonths',
        titleKey: 'table.subscriptions.intervalMonths',
        sorter: true,
        filter: { kind: 'number' },
      },
      {
        key: 'periodMode',
        dataIndex: 'periodMode',
        titleKey: 'table.subscriptions.periodMode',
        render: (value) =>
          translate(`pages.subscriptions.periodModes.${String(value)}`, String(value ?? '')),
        exportValue: (record) =>
          translate(
            `pages.subscriptions.periodModes.${String(record.periodMode)}`,
            String(record.periodMode ?? ''),
          ),
      },
      {
        key: 'priceListName',
        dataIndex: 'priceListName',
        titleKey: 'table.subscriptions.priceList',
      },
      {
        key: 'active',
        dataIndex: 'active',
        titleKey: 'table.subscriptions.active',
        filter: { kind: 'boolean' },
        render: (value) => (
          <Tag color={value ? 'green' : 'default'}>
            {value ? translate('pages.subscriptions.active') : translate('pages.subscriptions.inactive')}
          </Tag>
        ),
        exportValue: (record) =>
          record.active
            ? translate('pages.subscriptions.active')
            : translate('pages.subscriptions.inactive'),
      },
    ];

    return canUpdate ? [editColumn, ...cols] : cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<SubscriptionRow>
      resource="subscriptions"
      rowKey="id"
      titleKey="pages.subscriptions.title"
      columnDefs={columnDefs}
      requiresTenant
      getRowShowPath={getRowShowPath}
    />
  );
}
