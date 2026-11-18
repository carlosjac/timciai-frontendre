import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useTranslate } from '@refinedev/core';
import { Alert, Button, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  commercialResourceFromType,
  commercialTransactionShowPath,
} from '../../shared/timci/commercialTransactionsApi.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { TimciHelpButton } from '../../shared/timci/help/TimciHelpButton.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import {
  downloadEntityReport,
  fetchEntityReport,
  isReportKey,
  periodRange,
  REPORT_KEYS,
  type EntityReport,
  type ReportKey,
} from './api.js';

const PERIODS = [7, 30, 90] as const;
const AGING_BUCKETS = ['current', 'd1To30', 'd31To60', 'd61To90', 'd90Plus'] as const;
/** Date range changes these reports. Aging, unallocated and portfolio are a snapshot as of today. */
const PERIOD_REPORTS = new Set<ReportKey>([
  'invoiced',
  'collected',
  'tax',
  'period',
  'allocations',
  'adjustments',
  'management',
]);

type Row = Record<string, unknown>;

export function ReportsPage(): ReactElement {
  const translate = useTranslate();
  const navigate = useNavigate();
  const params = useParams();
  const [search, setSearch] = useSearchParams();
  const { dateFormat, timeZone } = useUserPreferences();
  const reportKey: ReportKey = isReportKey(params.reportKey) ? params.reportKey : 'aging';
  const [tenantId, setTenantId] = useState(() => getStoredTenantId());
  const [loaded, setLoaded] = useState<{ key: string; data: EntityReport | null; error: string | null } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const from = search.get('from') ?? '';
  const to = search.get('to') ?? '';
  const currencyId = search.get('currencyId') ?? '';
  const bucket = search.get('bucket') ?? '';

  useEffect(() => {
    if (!isReportKey(params.reportKey)) {
      navigate(`/reports/aging${search.toString() ? `?${search.toString()}` : ''}`, { replace: true });
    }
  }, [navigate, params.reportKey, search]);

  useEffect(() => {
    if (from && to) return;
    const range = periodRange(30);
    const next = new URLSearchParams(search);
    next.set('from', range.from);
    next.set('to', range.to);
    setSearch(next, { replace: true });
  }, [from, search, setSearch, to]);

  useEffect(() => {
    const sync = () => setTenantId(getStoredTenantId());
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const requestKey = `${tenantId}|${reportKey}|${from}|${to}|${currencyId}|${bucket}|${page}|${pageSize}`;
  const data = loaded?.key === requestKey ? loaded.data : null;
  const error = loaded?.key === requestKey ? loaded.error : null;
  const loading = Boolean(tenantId && from && to && isReportKey(params.reportKey) && loaded?.key !== requestKey);

  useEffect(() => {
    if (!tenantId || !from || !to || !isReportKey(params.reportKey)) return;
    const key = `${tenantId}|${reportKey}|${from}|${to}|${currencyId}|${bucket}|${page}|${pageSize}`;
    const start = (page - 1) * pageSize;
    let cancelled = false;
    void fetchEntityReport({
      tenantId,
      report: reportKey,
      from,
      to,
      currencyId: currencyId || undefined,
      bucket: reportKey === 'aging' && bucket ? bucket : undefined,
      range: [start, start + pageSize - 1],
    })
      .then((value) => {
        if (!cancelled) setLoaded({ key, data: value, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoaded({
            key,
            data: null,
            error: err instanceof Error ? err.message : translate('reports.loadError'),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bucket, currencyId, from, page, pageSize, reportKey, tenantId, to, translate, params.reportKey]);

  const patchSearch = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(search);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      setPage(1);
      setSearch(next);
    },
    [search, setSearch],
  );

  const dateOf = useCallback(
    (value: unknown) => formatTimciUserDateOnly(value, { dateFormat, timeZone }),
    [dateFormat, timeZone],
  );
  const moneyOf = useCallback((value: unknown) => formatTimciMoney(typeof value === 'string' ? value : ''), []);
  const typeOf = useCallback(
    (value: unknown) => (typeof value === 'string' && value ? translate(`reports.types.${value}`) : '—'),
    [translate],
  );

  const onExport = useCallback(() => {
    if (!tenantId || !from || !to) return;
    setExporting(true);
    void downloadEntityReport(
      {
        tenantId,
        report: reportKey,
        from,
        to,
        currencyId: currencyId || undefined,
        bucket: reportKey === 'aging' && bucket ? bucket : undefined,
      },
      dateFormat,
    )
      .catch((err: unknown) => {
        setLoaded({
          key: requestKey,
          data,
          error:
            err instanceof Error && err.name === 'REPORT_EXPORT_TOO_LARGE'
              ? translate('reports.exportTooLarge')
              : translate('reports.exportError'),
        });
      })
      .finally(() => setExporting(false));
  }, [bucket, currencyId, data, dateFormat, from, reportKey, requestKey, tenantId, to, translate]);

  const kindLabel = translate(`reports.kind.${reportKey}`);
  const pageTitle =
    kindLabel === `reports.kind.${reportKey}`
      ? translate('reports.title')
      : `${translate('reports.title')} · ${kindLabel}`;

  if (!tenantId) {
    return (
      <div data-timci-page-title={pageTitle}>
        <Alert type="info" showIcon message={translate('tenant.selectFirst')} />
      </div>
    );
  }

  const currencies = data?.currencies ?? [];

  return (
    <div data-timci-page-title={pageTitle}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {translate('reports.title')}
        </Typography.Title>
        <Select
          aria-label={translate('reports.report')}
          value={reportKey}
          style={{ minWidth: 240 }}
          listHeight={REPORT_KEYS.length * 32}
          options={REPORT_KEYS.map((key) => ({ value: key, label: translate(`reports.kind.${key}`) }))}
          onChange={(value: ReportKey) => navigate(`/reports/${value}?${search.toString()}`)}
        />
        <TimciHelpButton
          topic={translate(`reports.kind.${reportKey}`)}
          text={translate(`reports.help.${reportKey}`)}
        />
        {PERIOD_REPORTS.has(reportKey) ? (
          <div
            role="group"
            aria-label={translate('reports.period')}
            style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 8 }}
          >
            {PERIODS.map((days) => {
              const range = periodRange(days);
              const selected = range.from === from && range.to === to;
              return (
                <Button
                  key={days}
                  type={selected ? 'primary' : 'default'}
                  aria-pressed={selected}
                  onClick={() => patchSearch({ from: range.from, to: range.to })}
                >
                  {translate('reports.periodDays', { count: days })}
                </Button>
              );
            })}
          </div>
        ) : null}
        {PERIOD_REPORTS.has(reportKey) && from && to ? (
          <Typography.Text>
            {translate('reports.activeRange', {
              from: formatTimciUserDateOnly(from, { dateFormat, timeZone }),
              to: formatTimciUserDateOnly(to, { dateFormat, timeZone }),
            })}
          </Typography.Text>
        ) : null}
        <Select
          aria-label={translate('reports.currency')}
          value={currencyId || ''}
          style={{ minWidth: 180 }}
          options={[
            { value: '', label: translate('reports.currencyAll') },
            ...currencies.map((item) => ({ value: item.id, label: item.code })),
          ]}
          onChange={(value: string) => patchSearch({ currencyId: value || null })}
        />
        {reportKey === 'aging' ? (
          <Select
            aria-label={translate('reports.bucket')}
            value={bucket || ''}
            style={{ minWidth: 160 }}
            options={[
              { value: '', label: translate('reports.bucketAll') },
              ...AGING_BUCKETS.map((key) => ({ value: key, label: translate(`dashboard.aging.${key}`) })),
            ]}
            onChange={(value: string) => patchSearch({ bucket: value || null })}
          />
        ) : null}
        <Button onClick={onExport} loading={exporting}>
          {translate('reports.export')}
        </Button>
      </Space>
      {PERIOD_REPORTS.has(reportKey) ? null : (
        <Typography.Paragraph type="secondary">
          {translate(reportKey === 'drafts' ? 'reports.draftsNote' : 'reports.asOfNote')}
        </Typography.Paragraph>
      )}
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
      {data && data.totals.length > 0 ? (
        <Space wrap style={{ marginBottom: 16 }}>
          {data.totals.map((item) => (
            <Typography.Text key={`${item.currencyCode}:${item.key}`} strong>
              {totalLabel(reportKey, item.key, translate)} {item.currencyCode}: {formatTimciMoney(item.amount)}
            </Typography.Text>
          ))}
        </Space>
      ) : null}
      <ReportTables
        reportKey={reportKey}
        report={data}
        loading={loading}
        columnsFor={columnSet(translate, dateOf, moneyOf, typeOf)}
        emptyText={translate('reports.empty')}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize === pageSize ? nextPage : 1);
          setPageSize(nextSize);
        }}
      />
    </div>
  );
}

function draftShowPath(row: Row): string | null {
  const id = typeof row.id === 'string' ? row.id : '';
  if (!id || typeof row.type !== 'string') return null;
  if (row.type === 'subscription') return `/subscriptions/show/${encodeURIComponent(id)}`;
  const resource = commercialResourceFromType(row.type);
  if (!resource) return null;

  return commercialTransactionShowPath(resource, id);
}

function totalLabel(report: ReportKey, key: string, translate: (key: string, options?: { count?: number }) => string): string {
  if (report === 'tax') return `${key} %`;
  if (report === 'aging' && key !== 'open') return translate(`dashboard.aging.${key}`);

  return translate(`reports.totals.${key}`);
}

function columnSet(
  translate: (key: string) => string,
  dateOf: (value: unknown) => string,
  moneyOf: (value: unknown) => string,
  typeOf: (value: unknown) => string,
): Record<string, ColumnsType<Row>> {
  const text = (titleKey: string, dataIndex: string): ColumnsType<Row>[number] => ({
    title: translate(titleKey),
    dataIndex,
    render: (value: unknown) => (value == null || value === '' ? '—' : String(value)),
  });
  const date = (titleKey: string, dataIndex: string): ColumnsType<Row>[number] => ({
    title: translate(titleKey),
    dataIndex,
    render: (value: unknown) => dateOf(value),
  });
  const money = (titleKey: string, dataIndex: string): ColumnsType<Row>[number] => ({
    title: translate(titleKey),
    dataIndex,
    align: 'right',
    render: (value: unknown) => moneyOf(value),
  });
  const kind = (titleKey: string, dataIndex: string): ColumnsType<Row>[number] => ({
    title: translate(titleKey),
    dataIndex,
    render: (value: unknown) => typeOf(value),
  });

  return {
    aging: [
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.document', 'documentNumber'),
      kind('reports.columns.type', 'type'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.open', 'openAmount'),
      date('reports.columns.due', 'dueDate'),
      { title: translate('reports.columns.days'), dataIndex: 'overdueDays', align: 'right' },
      {
        title: translate('reports.columns.bucket'),
        dataIndex: 'bucket',
        render: (value: unknown) => (typeof value === 'string' ? translate(`dashboard.aging.${value}`) : '—'),
      },
      text('reports.columns.concept', 'concept'),
    ],
    invoiced: [
      date('reports.columns.date', 'transactionDate'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.document', 'documentNumber'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.amount', 'amount'),
      text('reports.columns.concept', 'concept'),
    ],
    collected: [
      date('reports.columns.date', 'transactionDate'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.document', 'documentNumber'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.amount', 'amount'),
      text('reports.columns.paymentOption', 'paymentOption'),
      text('reports.columns.concept', 'concept'),
    ],
    tax: [
      date('reports.columns.date', 'transactionDate'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.document', 'documentNumber'),
      kind('reports.columns.type', 'type'),
      text('reports.columns.currency', 'currencyCode'),
      text('reports.columns.percent', 'percent'),
      money('reports.columns.tax', 'amount'),
    ],
    byCustomer: [
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.sales', 'sales'),
      money('reports.columns.collected', 'collected'),
    ],
    byItem: [
      text('reports.columns.item', 'itemName'),
      text('reports.columns.currency', 'currencyCode'),
      text('reports.columns.quantity', 'quantity'),
      money('reports.columns.amount', 'amount'),
    ],
    allocations: [
      date('reports.columns.date', 'sourceDate'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.currency', 'currencyCode'),
      kind('reports.columns.source', 'sourceType'),
      text('reports.columns.sourceNumber', 'sourceNumber'),
      money('reports.columns.sourceAmount', 'sourceAmount'),
      kind('reports.columns.target', 'targetType'),
      text('reports.columns.targetNumber', 'targetNumber'),
      date('reports.columns.due', 'targetDueDate'),
      money('reports.columns.applied', 'appliedAmount'),
      money('reports.columns.targetOpen', 'targetOpenAmount'),
      money('reports.columns.adjustment', 'adjustmentAmount'),
      {
        title: translate('reports.columns.application'),
        dataIndex: 'application',
        render: (value: unknown) => (typeof value === 'string' ? translate(`reports.application.${value}`) : '—'),
      },
    ],
    unallocated: [
      date('reports.columns.date', 'transactionDate'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.document', 'documentNumber'),
      kind('reports.columns.type', 'type'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.amount', 'amount'),
      money('reports.columns.allocated', 'allocatedAmount'),
      money('reports.columns.unallocated', 'unallocatedAmount'),
      {
        title: translate('reports.columns.hold'),
        dataIndex: 'holdFromAutoAllocation',
        render: (value: unknown) => translate(value === true ? 'reports.yes' : 'reports.no'),
      },
    ],
    policy: [
      date('reports.columns.date', 'transactionDate'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.document', 'documentNumber'),
      kind('reports.columns.type', 'type'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.amount', 'amount'),
      money('reports.columns.signed', 'signedAmount'),
      text('reports.columns.triggeredBy', 'triggeredByNumber'),
      text('reports.columns.concept', 'concept'),
    ],
    voids: [
      date('reports.columns.date', 'voidedOn'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.document', 'documentNumber'),
      kind('reports.columns.type', 'type'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.amount', 'amount'),
      text('reports.columns.reverse', 'reverseNumber'),
    ],
    portfolio: [
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.balance', 'balance'),
    ],
    reminders: [
      date('reports.columns.date', 'evaluationDate'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.currency', 'currencyCode'),
    ],
    bounces: [
      date('reports.columns.date', 'occurredOn'),
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.email', 'email'),
      text('reports.columns.subtype', 'subtype'),
      text('reports.columns.diagnostic', 'diagnostic'),
    ],
    drafts: [
      {
        title: translate('reports.columns.view'),
        dataIndex: 'id',
        render: (_value: unknown, row: Row) => {
          const path = draftShowPath(row);
          if (!path) return '—';
          const type =
            typeof row.type === 'string' ? translate(`reports.types.${row.type}`) : '';
          const number =
            row.documentNumber != null && String(row.documentNumber) !== ''
              ? ` ${String(row.documentNumber)}`
              : '';
          const customer = typeof row.customerName === 'string' ? row.customerName : '';
          const label = `${type}${number}`.trim() || translate('reports.view');

          return (
            <Link to={path} aria-label={`${label}${customer ? `, ${customer}` : ''}`}>
              {label}
            </Link>
          );
        },
      },
      text('reports.columns.customer', 'customerName'),
      kind('reports.columns.type', 'type'),
      text('reports.columns.currency', 'currencyCode'),
      money('reports.columns.amount', 'amount'),
      date('reports.columns.date', 'recordDate'),
      text('reports.columns.concept', 'concept'),
    ],
    subscriptions: [
      text('reports.columns.customer', 'customerName'),
      text('reports.columns.currency', 'currencyCode'),
      date('reports.columns.starts', 'startsOn'),
      date('reports.columns.ends', 'endsOn'),
      date('reports.columns.nextBilling', 'nextBillingOn'),
      text('reports.columns.months', 'intervalMonths'),
      {
        title: translate('reports.columns.withNext'),
        dataIndex: 'withNextBilling',
        render: (value: unknown) => translate(value === true ? 'reports.yes' : 'reports.no'),
      },
      {
        title: translate('reports.columns.dueSoon'),
        dataIndex: 'dueIn7Days',
        render: (value: unknown) => translate(value === true ? 'reports.yes' : 'reports.no'),
      },
      {
        title: translate('reports.columns.stopped'),
        dataIndex: 'stopped',
        render: (value: unknown) => translate(value === true ? 'reports.yes' : 'reports.no'),
      },
      text('reports.columns.error', 'lastBillingError'),
    ],
  };
}

function ReportTables(props: {
  reportKey: ReportKey;
  report: EntityReport | null;
  loading: boolean;
  columnsFor: Record<string, ColumnsType<Row>>;
  emptyText: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
}): ReactElement {
  const translate = useTranslate();
  const table = (key: string, rows: Row[] | undefined, total?: number) => (
    <Table<Row>
      size="small"
      rowKey={(_row, index) => `${key}-${index ?? 0}`}
      loading={props.loading}
      columns={props.columnsFor[key] ?? []}
      dataSource={rows ?? []}
      pagination={{
        current: props.page,
        pageSize: props.pageSize,
        total: total ?? rows?.length ?? 0,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        onChange: props.onPageChange,
      }}
      locale={{ emptyText: props.emptyText }}
      scroll={{ x: true }}
    />
  );

  const report = props.report;
  if (!report) {
    const placeholder =
      props.reportKey === 'period'
        ? 'byCustomer'
        : props.reportKey === 'adjustments'
          ? 'policy'
          : props.reportKey === 'management'
            ? 'reminders'
            : props.reportKey;

    return table(placeholder, []);
  }
  if (report.report !== 'period' && report.report !== 'adjustments' && report.report !== 'management') {
    return table(report.report, report.rows, report.total);
  }

  if (report.report === 'period') {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <section>
          <Typography.Title level={4}>{translate('reports.sections.byCustomer')}</Typography.Title>
          {table('byCustomer', report.sections.byCustomer, report.sectionTotals?.byCustomer)}
        </section>
        <section>
          <Typography.Title level={4}>{translate('reports.sections.byItem')}</Typography.Title>
          {table('byItem', report.sections.byItem, report.sectionTotals?.byItem)}
        </section>
      </Space>
    );
  }
  if (report.report === 'adjustments') {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <section>
          <Typography.Title level={4}>{translate('reports.sections.policy')}</Typography.Title>
          {table('policy', report.sections.policy, report.sectionTotals?.policy)}
        </section>
        <section>
          <Typography.Title level={4}>{translate('reports.sections.voids')}</Typography.Title>
          {table('voids', report.sections.voids, report.sectionTotals?.voids)}
        </section>
      </Space>
    );
  }
  if (report.report === 'management') {
    const counts = report.sections.subscriptionTotals ?? [];

    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <section>
          <Typography.Title level={4}>{translate('reports.sections.reminders')}</Typography.Title>
          {table('reminders', report.sections.reminders, report.sectionTotals?.reminders)}
        </section>
        <section>
          <Typography.Title level={4}>{translate('reports.sections.bounces')}</Typography.Title>
          {table('bounces', report.sections.bounces, report.sectionTotals?.bounces)}
        </section>
        <section>
          <Typography.Title level={4}>{translate('reports.sections.subscriptions')}</Typography.Title>
          {counts.map((row) => (
            <Typography.Paragraph key={String(row.currencyCode)}>
              {String(row.currencyCode)}: {translate('dashboard.subscriptions.next')} {String(row.withNextBilling)}
              {' · '}
              {translate('dashboard.subscriptions.week')} {String(row.dueIn7Days)}
              {' · '}
              {translate('dashboard.subscriptions.stopped')} {String(row.stopped)}
            </Typography.Paragraph>
          ))}
          {table('subscriptions', report.sections.subscriptions, report.sectionTotals?.subscriptions)}
        </section>
      </Space>
    );
  }

  return table(report.report, report.rows, report.total);
}
