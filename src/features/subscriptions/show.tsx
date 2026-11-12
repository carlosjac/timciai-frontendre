import { Show } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Table, Tag } from 'antd';
import { Link } from 'react-router';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { SubscriptionRecord } from './types.js';

function describeBillingError(
  token: string,
  translate: (key: string, options?: Record<string, string>) => string,
  prefs: { dateFormat: string; timeZone: string },
): string {
  const separator = token.indexOf(':');
  const reason = separator >= 0 ? token.slice(0, separator) : token;
  const date = separator >= 0 ? token.slice(separator + 1) : '';
  if (reason === 'missing_price' || reason === 'missing_fx') {
    return translate(`pages.subscriptions.billingErrors.${reason}`, {
      date: formatTimciUserDateOnly(date, prefs),
    });
  }

  return token;
}

export function SubscriptionShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { query } = useShow<SubscriptionRecord>({ resource: 'subscriptions' });
  const record = query?.data?.data;

  return (
    <Show title={translate('pages.subscriptions.showTitle')} isLoading={query?.isLoading}>
      {record?.lastBillingError ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={translate('pages.subscriptions.billingError')}
          description={describeBillingError(
            record.lastBillingError,
            (key, options) => translate(key, options),
            { dateFormat, timeZone },
          )}
        />
      ) : null}
      <Descriptions bordered column={1}>
        <Descriptions.Item label={translate('table.subscriptions.customer')}>
          {record?.customerName}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.subscriptions.currency')}>
          {record?.currencyCode}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.subscriptions.intervalMonths')}>
          {record?.intervalMonths}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.subscriptions.startsOn')}>
          {formatTimciUserDateOnly(record?.startsOn, { dateFormat, timeZone })}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.subscriptions.endsOn')}>
          {record?.endsOn
            ? formatTimciUserDateOnly(record.endsOn, { dateFormat, timeZone })
            : translate('pages.subscriptions.noEnd')}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.subscriptions.periodMode')}>
          {record?.periodMode
            ? translate(`pages.subscriptions.periodModes.${record.periodMode}`, record.periodMode)
            : ''}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.subscriptions.priceList')}>
          {record?.priceListName}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.subscriptions.monetaryPolicy')}>
          {record?.monetaryPolicyName}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.subscriptions.active')}>
          <Tag color={record?.active ? 'green' : 'default'}>
            {record?.active
              ? translate('pages.subscriptions.active')
              : translate('pages.subscriptions.inactive')}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
      <h2 style={{ marginTop: 24 }}>{translate('pages.subscriptions.lines')}</h2>
      <Table
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
        dataSource={record?.lines ?? []}
        columns={[
          {
            title: translate('table.subscriptions.product'),
            dataIndex: 'sellableItemName',
          },
          {
            title: translate('table.subscriptions.quantity'),
            dataIndex: 'quantity',
          },
        ]}
      />
      <h2 style={{ marginTop: 24 }}>{translate('pages.subscriptions.generatedSales')}</h2>
      <Table
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
        dataSource={record?.generatedSales ?? []}
        locale={{ emptyText: translate('pages.subscriptions.noSales') }}
        columns={[
          {
            title: translate('table.subscriptions.billingDate'),
            dataIndex: 'billingDate',
            render: (value: string) => formatTimciUserDateOnly(value, { dateFormat, timeZone }),
          },
          {
            title: translate('table.subscriptions.concept'),
            dataIndex: 'concept',
            render: (value: string | null, row) => (
              <Link to={`/sales/show/${encodeURIComponent(row.id)}`}>{value || row.id}</Link>
            ),
          },
          {
            title: translate('table.subscriptions.amount'),
            dataIndex: 'amount',
            render: (value: string) => formatTimciMoney(value),
          },
          {
            title: translate('table.subscriptions.status'),
            dataIndex: 'status',
          },
        ]}
      />
    </Show>
  );
}
