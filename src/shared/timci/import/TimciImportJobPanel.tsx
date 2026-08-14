import { useTranslate } from '@refinedev/core';
import { Alert, Progress, Space, Spin, Table, Tabs, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { translateTimciApiErrorMessage } from '../i18n/apiErrorTranslations.js';
import { TimciPageBackHeader } from '../TimciPageBackHeader.js';
import {
  getTimciImportJob,
  listTimciImportJobRows,
  type TimciImportJob,
  type TimciImportJobRow,
  type TimciImportRowStatus,
} from '../importJobsApi.js';

type Props = {
  tenantId: string | null;
  jobId: string;
  backPath: string;
  titleKey: string;
};

const PAGE_SIZE = 25;
const POLL_MS = 2000;

function isActive(status: TimciImportJob['status']): boolean {
  return status === 'queued' || status === 'running';
}

export function TimciImportJobPanel({ tenantId, jobId, backPath, titleKey }: Props) {
  const translate = useTranslate();
  const [job, setJob] = useState<TimciImportJob | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TimciImportRowStatus>('created');
  const [tabInitialized, setTabInitialized] = useState(false);
  const [rows, setRows] = useState<TimciImportJobRow[]>([]);
  const [rowTotal, setRowTotal] = useState(0);
  const [rowPage, setRowPage] = useState(1);
  const [rowsLoading, setRowsLoading] = useState(false);

  const loadJob = useCallback(async () => {
    if (!tenantId) return;
    try {
      const next = await getTimciImportJob(tenantId, jobId);
      setJob(next);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : translate('import.job.loadError'));
    }
  }, [tenantId, jobId, translate]);

  const loadRows = useCallback(async () => {
    if (!tenantId || !job || isActive(job.status)) return;
    setRowsLoading(true);
    try {
      const page = await listTimciImportJobRows(tenantId, jobId, {
        status: tab,
        skip: (rowPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
      setRows(page.data);
      setRowTotal(page.total);
    } finally {
      setRowsLoading(false);
    }
  }, [tenantId, jobId, job, tab, rowPage]);

  useEffect(() => {
    setJob(null);
    setLoadError(null);
    setTab('created');
    setTabInitialized(false);
    setRowPage(1);
    setRows([]);
    setRowTotal(0);
  }, [jobId]);

  useEffect(() => {
    void loadJob();
  }, [loadJob]);

  useEffect(() => {
    if (!job || isActive(job.status) || tabInitialized) return;
    if (job.failedCount > 0) setTab('failed');
    else if (job.createdCount === 0 && job.skippedCount > 0) setTab('skipped');
    setTabInitialized(true);
  }, [job, tabInitialized]);

  useEffect(() => {
    if (!job || !isActive(job.status)) return;
    const id = window.setInterval(() => {
      void loadJob();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [job, loadJob]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const statusTag = job ? (
    <Tag
      color={
        job.status === 'completed'
          ? 'success'
          : job.status === 'failed'
            ? 'error'
            : job.status === 'running'
              ? 'processing'
              : 'default'
      }
    >
      {translate(`import.job.status.${job.status}`)}
    </Tag>
  ) : null;

  const emptyTableLocale = { emptyText: translate('import.job.emptyRows') };

  return (
    <TimciPageBackHeader backPath={backPath} title={translate(titleKey)} tags={statusTag}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {loadError ? (
        <Alert type="error" showIcon message={loadError} />
      ) : !job ? (
        <Spin />
      ) : (
        <>
          {isActive(job.status) ? (
            <>
              <Alert
                type="info"
                showIcon
                message={translate('import.job.runningHint')}
              />
              <Progress
                percent={
                  job.processedCount > 0
                    ? Math.min(99, Math.round((job.processedCount / Math.max(job.processedCount + 1, 1)) * 100))
                    : job.status === 'running'
                      ? 10
                      : 0
                }
                status="active"
                aria-label={translate('import.job.progress')}
              />
            </>
          ) : job.status === 'failed' && job.batchError ? (
            <Alert
              type="error"
              showIcon
              message={translate('import.job.batchError')}
              description={translateTimciApiErrorMessage(undefined, job.batchError)}
            />
          ) : job.failedCount === 0 ? (
            <Alert
              type="success"
              showIcon
              message={translate('pages.customers.import.batchOk')}
              description={translate('pages.customers.import.batchOkDetail', {
                created: job.createdCount,
                skipped: job.skippedCount,
              })}
            />
          ) : (
            <Alert
              type="warning"
              showIcon
              message={translate('pages.customers.import.batchPartial')}
              description={translate('pages.customers.import.summary', {
                created: job.createdCount,
                skipped: job.skippedCount,
                failed: job.failedCount,
              })}
            />
          )}
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {translate('import.job.progressDetail', {
              created: job.createdCount,
              skipped: job.skippedCount,
              failed: job.failedCount,
              processed: job.processedCount,
            })}
          </Typography.Paragraph>
          {!isActive(job.status) ? (
            <Tabs
              activeKey={tab}
              onChange={(key) => {
                setTab(key as TimciImportRowStatus);
                setRowPage(1);
              }}
              items={[
                {
                  key: 'created',
                  label: `${translate('import.job.created')} (${job.createdCount})`,
                  children: (
                    <Table<TimciImportJobRow>
                      size="small"
                      rowKey={(r) => `c-${r.rowNumber}`}
                      loading={rowsLoading}
                      dataSource={tab === 'created' ? rows : []}
                      locale={emptyTableLocale}
                      pagination={{
                        current: rowPage,
                        pageSize: PAGE_SIZE,
                        total: tab === 'created' ? rowTotal : 0,
                        onChange: (p) => setRowPage(p),
                        showSizeChanger: false,
                      }}
                      aria-label={translate('pages.customers.import.createdTable')}
                      columns={[
                        { title: translate('pages.customers.import.colRow'), dataIndex: 'rowNumber', width: 88 },
                        { title: translate('pages.customers.import.colName'), dataIndex: 'label' },
                        {
                          title: translate('pages.customers.import.colDocument'),
                          dataIndex: 'documentKey',
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: 'skipped',
                  label: `${translate('import.job.skipped')} (${job.skippedCount})`,
                  children: (
                    <Table<TimciImportJobRow>
                      size="small"
                      rowKey={(r) => `s-${r.rowNumber}`}
                      loading={rowsLoading}
                      dataSource={tab === 'skipped' ? rows : []}
                      locale={emptyTableLocale}
                      pagination={{
                        current: rowPage,
                        pageSize: PAGE_SIZE,
                        total: tab === 'skipped' ? rowTotal : 0,
                        onChange: (p) => setRowPage(p),
                        showSizeChanger: false,
                      }}
                      aria-label={translate('pages.customers.import.skippedTable')}
                      columns={[
                        { title: translate('pages.customers.import.colRow'), dataIndex: 'rowNumber', width: 88 },
                        {
                          title: translate('pages.customers.import.colDocument'),
                          dataIndex: 'documentKey',
                        },
                        {
                          title: translate('pages.customers.import.colReason'),
                          dataIndex: 'label',
                          render: () => translate('pages.customers.import.alreadyExists'),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: 'failed',
                  label: `${translate('import.job.failed')} (${job.failedCount})`,
                  children: (
                    <Table<TimciImportJobRow>
                      size="small"
                      rowKey={(r) => `f-${r.rowNumber}`}
                      loading={rowsLoading}
                      dataSource={tab === 'failed' ? rows : []}
                      locale={emptyTableLocale}
                      pagination={{
                        current: rowPage,
                        pageSize: PAGE_SIZE,
                        total: tab === 'failed' ? rowTotal : 0,
                        onChange: (p) => setRowPage(p),
                        showSizeChanger: false,
                      }}
                      aria-label={translate('pages.customers.import.failedTable')}
                      columns={[
                        { title: translate('pages.customers.import.colRow'), dataIndex: 'rowNumber', width: 88 },
                        {
                          title: translate('pages.customers.import.colColumns'),
                          key: 'columns',
                          render: (_: unknown, record) =>
                            (record.errors ?? []).map((e) => e.column).filter(Boolean).join(', ') || '—',
                        },
                        {
                          title: translate('pages.customers.import.colMessage'),
                          key: 'message',
                          render: (_: unknown, record) =>
                            (record.errors ?? [])
                              .map((e) => translateTimciApiErrorMessage(e.code, e.message))
                              .join(' • '),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          ) : null}
        </>
      )}
      </Space>
    </TimciPageBackHeader>
  );
}
