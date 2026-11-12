import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Button, Descriptions, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type OutboundEmail = {
  id: string;
  status: string;
  subject: string;
  messageKind: string;
  toAddresses: { email: string; name?: string }[];
  attemptCount: number;
  maxAttempts: number;
  lastErrorMessage?: string | null;
  nextAttemptAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
};

type EmailAttempt = {
  id: string;
  attemptNumber: number;
  startedAt: string;
  finishedAt: string;
  outcome: string;
  errorCode?: string | null;
  errorMessage?: string | null;
};

export function OutboundEmailShow() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canManage =
    permData?.actionCodes?.includes('outboundEmails.manage') ?? false;
  const { query } = useShow<OutboundEmail>({ resource: 'outboundEmails' });
  const record = query.data?.data;
  const [attempts, setAttempts] = useState<EmailAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!record?.id) return;
    const base = getResourceApiBase('outboundEmails');
    if (!base) return;
    const emailId = record.id;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setAttemptsLoading(true);
      void timciFetch(`${base}/${encodeURIComponent(emailId)}/attempts`)
        .then(({ json }) => {
          if (!cancelled) setAttempts(Array.isArray(json) ? (json as EmailAttempt[]) : []);
        })
        .catch(() => {
          if (!cancelled) notify.error(translate('pages.outboundEmails.attemptsError'));
        })
        .finally(() => {
          if (!cancelled) setAttemptsLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [notify, record?.id, translate]);

  const retry = async () => {
    if (!record) return;
    const base = getResourceApiBase('outboundEmails');
    if (!base) return;
    setRetrying(true);
    try {
      await timciFetch(`${base}/${encodeURIComponent(record.id)}/retry`, { method: 'POST' });
      notify.success(translate('pages.outboundEmails.retrySuccess'));
      await query.refetch();
    } catch {
      notify.error(translate('pages.outboundEmails.retryError'));
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Show
      isLoading={query.isLoading}
      title={translate('pages.outboundEmails.showTitle')}
      canEdit={false}
      canDelete={false}
      headerButtons={() =>
        record && canManage && record.status === 'failed' ? (
          <Button type="primary" loading={retrying} onClick={() => void retry()}>
            {translate('table.outboundEmails.retry')}
          </Button>
        ) : null
      }
    >
      {record ? (
        <>
          <Descriptions column={{ xs: 1, lg: 2 }} bordered size="small">
            <Descriptions.Item label={translate('table.outboundEmails.status')}>
              <Tag>{translate(`pages.outboundEmails.statuses.${record.status}`, record.status)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.outboundEmails.kind')}>
              {record.messageKind}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.outboundEmails.subject')}>
              {record.subject}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.outboundEmails.to')}>
              {record.toAddresses.map((item) => item.email).join(', ')}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.outboundEmails.attempts')}>
              {record.attemptCount}/{record.maxAttempts}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.outboundEmails.createdAt')}>
              {formatTimciUserDateTime(record.createdAt, { dateFormat, timeZone })}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.outboundEmails.nextAttemptAt')}>
              {formatTimciUserDateTime(record.nextAttemptAt, { dateFormat, timeZone })}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.outboundEmails.sentAt')}>
              {formatTimciUserDateTime(record.sentAt, { dateFormat, timeZone })}
            </Descriptions.Item>
          </Descriptions>
          {record.lastErrorMessage ? (
            <Typography.Paragraph type="danger" style={{ marginTop: 12 }}>
              {record.lastErrorMessage}
            </Typography.Paragraph>
          ) : null}
          <Typography.Title level={5} style={{ marginTop: 20 }}>
            {translate('pages.outboundEmails.attemptsTitle')}
          </Typography.Title>
          <Table<EmailAttempt>
            rowKey="id"
            size="small"
            scroll={{ x: 'max-content' }}
            loading={attemptsLoading}
            dataSource={attempts}
            pagination={false}
            locale={{ emptyText: translate('pages.outboundEmails.noAttempts') }}
            columns={[
              { title: translate('table.outboundEmails.attemptNumber'), dataIndex: 'attemptNumber' },
              {
                title: translate('table.outboundEmails.startedAt'),
                dataIndex: 'startedAt',
                render: (value) => formatTimciUserDateTime(value, { dateFormat, timeZone }),
              },
              {
                title: translate('table.outboundEmails.outcome'),
                dataIndex: 'outcome',
                render: (outcome: string) =>
                  translate(`pages.outboundEmails.outcomes.${outcome}`, outcome),
              },
              { title: translate('table.outboundEmails.lastError'), dataIndex: 'errorMessage' },
            ]}
          />
        </>
      ) : null}
    </Show>
  );
}
