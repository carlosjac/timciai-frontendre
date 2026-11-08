import type { ReactElement, ReactNode } from 'react';
import { Column } from '@ant-design/charts';
import { Card, Statistic, Table, Typography } from 'antd';
import { Link } from 'react-router';
import { useTranslate } from '@refinedev/core';
import { TimciHelpButton } from '../../shared/timci/help/TimciHelpButton.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import type { CurrencySlice, DebtorRow, EntityDashboard, PlatformDashboard, QueueRow } from './api.js';
import type { ListLimit } from './model.js';

function money(amount: string, code: string): string {
  return `${formatTimciMoney(amount)} ${code}`;
}

function sliceOf(data: EntityDashboard, currencyId: string | undefined): { slice: CurrencySlice; code: string } | null {
  if (!currencyId) return null;
  const currency = data.currencies.find((item) => item.id === currencyId);
  const slice = data.byCurrency[currencyId];
  if (!currency || !slice) return null;

  return { slice, code: currency.code };
}

function MissingCurrency(): ReactElement {
  const translate = useTranslate();

  return <Typography.Text type="secondary">{translate('dashboard.currencyUnavailable')}</Typography.Text>;
}

function debtorColumns(code: string, translate: (key: string) => string) {
  return [
    {
      title: translate('dashboard.columns.customer'),
      dataIndex: 'customerName',
      render: (name: string, row: DebtorRow) => (
        <Link to={`/customers/show/${encodeURIComponent(row.customerId)}`}>{name}</Link>
      ),
    },
    {
      title: translate('dashboard.columns.open'),
      dataIndex: 'openAmount',
      align: 'right' as const,
      render: (amount: string) => money(amount, code),
    },
    {
      title: translate('dashboard.columns.overdueDays'),
      dataIndex: 'overdueDays',
      align: 'right' as const,
    },
  ];
}

export function WidgetBody(props: {
  type: string;
  currencyId?: string;
  limit?: ListLimit;
  entity?: EntityDashboard;
  platform?: PlatformDashboard;
}): ReactElement {
  const translate = useTranslate();
  const { type, currencyId, limit = 10, entity, platform } = props;

  if (type === 'bouncedEmails' && entity) {
    return <Statistic title={translate('dashboard.widgets.bouncedEmails')} value={entity.bouncedEmails} />;
  }

  if (entity && type !== 'bouncedEmails') {
    const found = sliceOf(entity, currencyId);
    if (!found) return <MissingCurrency />;
    const { slice, code } = found;

    if (type === 'openAmount') return <Statistic title={code} value={formatTimciMoney(slice.openAmount)} />;
    if (type === 'invoiced') return <Statistic title={code} value={formatTimciMoney(slice.invoiced)} />;
    if (type === 'collected') return <Statistic title={code} value={formatTimciMoney(slice.collected)} />;
    if (type === 'customerCredit') return <Statistic title={code} value={formatTimciMoney(slice.customerCredit)} />;
    if (type === 'overdue60') return <Statistic title={code} value={slice.overdue60CustomerCount} />;
    if (type === 'collectionPace') {
      const ratio = slice.pace.ratio == null ? '—' : `${Math.round(Number(slice.pace.ratio) * 100)} %`;

      return (
        <>
          <Statistic title={code} value={ratio} />
          <Typography.Text type="secondary">
            {translate('dashboard.paceDetail', {
              invoiced: money(slice.pace.invoiced, code),
              collected: money(slice.pace.collected, code),
            })}
          </Typography.Text>
        </>
      );
    }
    if (type === 'aging') {
      const rows = [
        { bucket: translate('dashboard.aging.current'), amount: Number(slice.aging.current) },
        { bucket: translate('dashboard.aging.d1To30'), amount: Number(slice.aging.d1To30) },
        { bucket: translate('dashboard.aging.d31To60'), amount: Number(slice.aging.d31To60) },
        { bucket: translate('dashboard.aging.d61To90'), amount: Number(slice.aging.d61To90) },
        { bucket: translate('dashboard.aging.d90Plus'), amount: Number(slice.aging.d90Plus) },
      ];

      return (
        <Column
          data={rows}
          xField="bucket"
          yField="amount"
          height={160}
          axis={{ y: { labelFormatter: (value: number) => formatTimciMoney(value) } }}
        />
      );
    }
    if (type === 'periodNet') {
      const rows: [string, string][] = [
        ['dashboard.period.sales', slice.periodNet.sales],
        ['dashboard.period.debits', slice.periodNet.debits],
        ['dashboard.period.credits', slice.periodNet.credits],
        ['dashboard.period.net', slice.periodNet.net],
        ['dashboard.period.policy', slice.periodNet.policyAdjustments],
      ];

      return (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {rows.map(([key, amount]) => (
            <li key={key}>
              {translate(key)}: {money(amount, code)}
            </li>
          ))}
          <li>
            {translate('dashboard.period.voids')}: {slice.periodNet.voidCount} ({money(slice.periodNet.voidAmount, code)})
          </li>
        </ul>
      );
    }
    if (type === 'subscriptions') {
      return (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>
            {translate('dashboard.subscriptions.next')}: {slice.subscriptions.withNextBilling}
          </li>
          <li>
            {translate('dashboard.subscriptions.week')}: {slice.subscriptions.dueIn7Days}
          </li>
          <li>
            {translate('dashboard.subscriptions.stopped')}: {slice.subscriptions.stopped}
          </li>
        </ul>
      );
    }
    if (type === 'tax') {
      if (slice.tax.length === 0) return <Typography.Text type="secondary">{translate('dashboard.empty')}</Typography.Text>;

      return (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {slice.tax.map((row) => (
            <li key={row.percent}>
              {row.percent} %: {money(row.amount, code)}
            </li>
          ))}
        </ul>
      );
    }
    if (type === 'collectionQueue') {
      return (
        <Table<QueueRow>
          size="small"
          pagination={false}
          rowKey="customerId"
          dataSource={slice.collectionQueue.slice(0, limit)}
          columns={[
            ...debtorColumns(code, translate),
            {
              title: translate('dashboard.columns.lastCollection'),
              dataIndex: 'lastCollectionDate',
              render: (value: string | null) => value ?? '—',
            },
            {
              title: translate('dashboard.columns.reason'),
              dataIndex: 'reason',
              render: (reason: QueueRow['reason']) => translate(`dashboard.reasons.${reason}`),
            },
          ]}
        />
      );
    }
    if (type === 'topDebtors' || type === 'oldestDebtors') {
      const rows = type === 'topDebtors' ? slice.topDebtors : slice.oldestDebtors;

      return (
        <Table<DebtorRow>
          size="small"
          pagination={false}
          rowKey="customerId"
          dataSource={rows.slice(0, limit)}
          columns={debtorColumns(code, translate)}
        />
      );
    }
  }

  if (platform) {
    if (type === 'tenants') {
      return (
        <Statistic
          title={translate('dashboard.platform.inactive', { count: platform.tenantsInactive })}
          value={platform.tenantsActive}
        />
      );
    }
    if (type === 'users') {
      return (
        <Statistic
          title={translate('dashboard.platform.unassigned', { count: platform.usersWithoutAssignment })}
          value={platform.users}
        />
      );
    }
    if (type === 'sessions') return <Statistic value={platform.openSessions} />;
    if (type === 'entitiesInTest') return <Statistic value={platform.entitiesInTest} />;
    if (type === 'activity') {
      return (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>
            {translate('dashboard.platform.sales')}: {platform.activity.sales}
          </li>
          <li>
            {translate('dashboard.platform.collections')}: {platform.activity.collections}
          </li>
          <li>
            {translate('dashboard.platform.subscriptionErrors')}: {platform.activity.subscriptionsWithError}
          </li>
          <li>
            {translate('dashboard.platform.silent')}: {platform.activity.silentTenants}
          </li>
        </ul>
      );
    }
    if (type === 'health') {
      const age = platform.health.fxSnapshotAgeMinutes;

      return (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>
            {translate('dashboard.platform.fxAge')}: {age == null ? '—' : translate('dashboard.platform.minutes', { count: age })}
          </li>
          <li>
            {translate('dashboard.platform.docFailed')}: {platform.health.documentIssueFailed}
          </li>
          <li>
            {translate('dashboard.platform.smtpFailed')}: {platform.health.smtpTransportFailed}
          </li>
          <li>
            {translate('dashboard.platform.documents', {
              issued: platform.health.documentsIssued,
              pending: platform.health.documentsPending,
              failed: platform.health.documentsFailed,
            })}
          </li>
        </ul>
      );
    }
    if (type === 'readiness') {
      return (
        <Table
          size="small"
          pagination={false}
          rowKey="entityId"
          dataSource={platform.readiness}
          columns={[
            { title: translate('dashboard.columns.entity'), dataIndex: 'name' },
            {
              title: translate('dashboard.columns.emission'),
              dataIndex: 'emissionMode',
              render: (value: string) => translate(`dashboard.emission.${value}`),
            },
            {
              title: translate('dashboard.columns.taxes'),
              render: (_: unknown, row: (typeof platform.readiness)[number]) =>
                !row.taxEnabled
                  ? translate('dashboard.readiness.taxOff')
                  : row.taxProfileComplete
                    ? translate('dashboard.readiness.ok')
                    : translate('dashboard.readiness.incomplete'),
            },
            {
              title: translate('dashboard.columns.payments'),
              dataIndex: 'hasActivePaymentOption',
              render: (value: boolean) => (value ? translate('dashboard.readiness.ok') : translate('dashboard.readiness.missing')),
            },
            {
              title: translate('dashboard.columns.logo'),
              dataIndex: 'hasLogo',
              render: (value: boolean) => (value ? translate('dashboard.readiness.ok') : translate('dashboard.readiness.missing')),
            },
          ]}
        />
      );
    }
  }

  return <Typography.Text type="secondary">{translate('dashboard.empty')}</Typography.Text>;
}

export function WidgetCard(props: {
  title: string;
  help?: string;
  extra?: ReactNode;
  children: ReactElement;
}): ReactElement {
  return (
    <Card
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {props.title}
          {props.help ? <TimciHelpButton topic={props.title} text={props.help} /> : null}
        </span>
      }
      extra={props.extra}
      size="small"
      style={{ height: '100%', overflow: 'auto' }}
    >
      {props.children}
    </Card>
  );
}
