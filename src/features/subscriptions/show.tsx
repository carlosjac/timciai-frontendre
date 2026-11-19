import { DeleteButton, RefreshButton, Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, App as AntdApp, Button, Descriptions, Space, Table, Tag, Typography } from 'antd';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { commercialStatusTagColor } from '../commercial-transactions/statusLabel.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';
import { TimciEditLink, TimciListLink } from '../../shared/timci/TimciResourceLink.js';
import { requireTimciPathSegment } from '../../shared/timci/pathSegment.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { SubscriptionRecord } from './types.js';

/** At most two decimal places. Integers stay without a fractional part. */
function formatSubscriptionQuantity(value: unknown): string {
  if (value == null || String(value).trim() === '') return '—';
  const n = Number(String(value).trim().replace(',', '.'));
  if (!Number.isFinite(n)) return String(value);
  const rounded = (Math.round(n * 100) / 100).toFixed(2);
  return rounded.replace(/0+$/, '').replace(/\.$/, '');
}

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
  const navigate = useNavigate();
  const { modal } = AntdApp.useApp();
  const notify = useTimciNotify();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canUpdate = codes.includes('subscriptions.update');
  const canDelete = codes.includes('subscriptions.delete');
  const canRegister = codes.includes('subscriptions.register');
  const { query } = useShow<SubscriptionRecord>({ resource: 'subscriptions' });
  const record = query?.data?.data;
  const isDraft = record?.status === 'draft';
  const [registerLoading, setRegisterLoading] = useState(false);

  const confirmRegister = useCallback(() => {
    if (!record?.id) return;
    modal.confirm({
      title: translate('pages.subscriptions.registerConfirmTitle'),
      content: translate('pages.subscriptions.registerConfirmBody'),
      okText: translate('pages.subscriptions.register'),
      cancelText: translate('buttons.cancel'),
      onOk: async () => {
        const base = getResourceApiBase('subscriptions');
        if (!base) return;
        setRegisterLoading(true);
        try {
          await timciFetch(`${base}/${requireTimciPathSegment(record.id)}/register`, {
            method: 'POST',
          });
          notify.success(translate('pages.subscriptions.registered'));
          await query?.refetch?.();
        } catch {
          notify.error(translate('pages.subscriptions.registerError'));
        } finally {
          setRegisterLoading(false);
        }
      },
    });
  }, [modal, notify, query, record, translate]);

  return (
    <Show
      title={translate('pages.subscriptions.showTitle')}
      isLoading={query?.isLoading}
      canEdit={canUpdate}
      canDelete={false}
      headerButtons={({ listButtonProps, editButtonProps, refreshButtonProps }) => (
        <Space wrap size="middle">
          {listButtonProps ? (
            <TimciListLink resource="subscriptions" label={translate('buttons.list')} />
          ) : null}
          {canUpdate && editButtonProps ? (
            <TimciEditLink
              resource="subscriptions"
              recordItemId={record?.id}
              label={translate('buttons.edit')}
            />
          ) : null}
          {refreshButtonProps ? <RefreshButton {...refreshButtonProps} /> : null}
          {canRegister && isDraft ? (
            <Button type="primary" onClick={confirmRegister} loading={registerLoading}>
              {translate('pages.subscriptions.register')}
            </Button>
          ) : null}
          {canDelete && isDraft ? (
            <DeleteButton
              resource="subscriptions"
              recordItemId={record?.id}
              onSuccess={() => navigate('/subscriptions')}
              confirmTitle={translate('pages.subscriptions.deleteConfirmTitle')}
            />
          ) : null}
        </Space>
      )}
    >
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
      {record ? (
        <div style={{ marginBottom: 16 }}>
          <Tag color={commercialStatusTagColor(record.status)}>
            {translate(
              record.status === 'draft'
                ? 'pages.subscriptions.status.draft'
                : 'pages.subscriptions.status.registered',
            )}
          </Tag>
        </div>
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
            render: (value: string) => formatSubscriptionQuantity(value),
          },
          {
            title: translate('table.subscriptions.description'),
            dataIndex: 'description',
            render: (value: string | null) => value || '—',
          },
          {
            title: translate('table.subscriptions.discountPercent'),
            dataIndex: 'discountPercent',
            render: (value: string) => {
              const formatted = formatTimciMoney(value);
              return formatted === '—' ? '—' : `${formatted}%`;
            },
          },
          {
            title: translate('table.subscriptions.lineStartsOn'),
            dataIndex: 'startsOn',
            render: (value: string | null) =>
              value
                ? formatTimciUserDateOnly(value, { dateFormat, timeZone })
                : translate('pages.subscriptions.firstBilling'),
          },
          {
            title: translate('table.subscriptions.lineEndsOn'),
            dataIndex: 'endsOn',
            render: (value: string | null) =>
              value
                ? formatTimciUserDateOnly(value, { dateFormat, timeZone })
                : record?.endsOn
                  ? translate('pages.subscriptions.untilSubscriptionEnd')
                  : translate('pages.subscriptions.noEndLine'),
          },
          {
            title: translate('pages.subscriptions.includeSellableItemName'),
            dataIndex: 'includeSellableItemName',
            render: (value: boolean) =>
              value ? translate('table.users.yes') : translate('table.users.no'),
          },
          {
            title: translate('pages.subscriptions.includeDescription'),
            dataIndex: 'includeDescription',
            render: (value: boolean) =>
              value ? translate('table.users.yes') : translate('table.users.no'),
          },
          {
            title: translate('pages.subscriptions.includePeriod'),
            dataIndex: 'includePeriod',
            render: (value: boolean) =>
              value ? translate('table.users.yes') : translate('table.users.no'),
          },
        ]}
      />
      <h2 style={{ marginTop: 24 }}>{translate('pages.subscriptions.generatedSales')}</h2>
      {(record?.generatedSalesTotal ?? 0) > (record?.generatedSales.length ?? 0) ? (
        <Typography.Paragraph type="secondary">
          {translate('pages.subscriptions.generatedSalesShown', {
            shown: String(record?.generatedSales.length ?? 0),
            total: String(record?.generatedSalesTotal ?? 0),
          })}
        </Typography.Paragraph>
      ) : null}
      <Table
        rowKey="id"
        pagination={{ pageSize: 25, showSizeChanger: false }}
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
