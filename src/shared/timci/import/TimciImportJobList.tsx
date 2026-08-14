import { useTranslate } from '@refinedev/core';
import { Table, Tag } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { formatTimciUserDateTime } from '../formatUserDateTime.js';
import type { TimciUserDateTimePrefs } from '../formatUserDateTime.js';
import { listTimciImportJobs, type TimciImportJob, type TimciImportJobStatus } from '../importJobsApi.js';
import { TimciPageBackHeader } from '../TimciPageBackHeader.js';

type Props = {
  tenantId: string | null;
  resource: string;
  detailPath: (jobId: string) => string;
  backPath: string;
  titleKey: string;
  datePrefs: TimciUserDateTimePrefs;
};

const PAGE_SIZE = 25;

function statusColor(status: TimciImportJobStatus): string {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'running') return 'processing';
  return 'default';
}

export function TimciImportJobList({
  tenantId,
  resource,
  detailPath,
  backPath,
  titleKey,
  datePrefs,
}: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TimciImportJob[]>([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const result = await listTimciImportJobs(tenantId, resource, (page - 1) * PAGE_SIZE, PAGE_SIZE);
      setData(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [tenantId, resource, page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <TimciPageBackHeader backPath={backPath} title={translate(titleKey)}>
      <Table<TimciImportJob>
        rowKey="id"
        loading={loading}
        dataSource={data}
        locale={{ emptyText: translate('import.job.empty') }}
        aria-label={translate(titleKey)}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        onRow={(record) => ({
          onClick: () => navigate(detailPath(record.id)),
          style: { cursor: 'pointer' },
        })}
        columns={[
          {
            title: translate('import.job.createdAt'),
            dataIndex: 'createdAt',
            render: (v: string) => formatTimciUserDateTime(v, datePrefs),
          },
          {
            title: translate('import.job.createdBy'),
            key: 'createdBy',
            render: (_: unknown, r) => r.createdBy?.name || r.createdBy?.id || '—',
          },
          {
            title: translate('import.job.statusLabel'),
            dataIndex: 'status',
            render: (status: TimciImportJobStatus) => (
              <Tag color={statusColor(status)}>{translate(`import.job.status.${status}`)}</Tag>
            ),
          },
          {
            title: translate('import.job.created'),
            dataIndex: 'createdCount',
          },
          {
            title: translate('import.job.skipped'),
            dataIndex: 'skippedCount',
          },
          {
            title: translate('import.job.failed'),
            dataIndex: 'failedCount',
          },
        ]}
      />
    </TimciPageBackHeader>
  );
}
