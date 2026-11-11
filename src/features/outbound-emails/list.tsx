import { useCallback, useMemo, useState } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Button, Space, Tag } from 'antd';
import type { Key } from 'react';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type EmailAddress = { email: string; name?: string };

type OutboundEmailRow = BaseRecord & {
  id: string;
  status: string;
  subject: string;
  toAddresses: EmailAddress[];
  attemptCount: number;
  maxAttempts: number;
  lastErrorMessage?: string | null;
  createdAt: string;
};

function statusColor(status: string): string {
  if (status === 'sent') return 'success';
  if (status === 'failed' || status === 'cancelled') return 'error';
  if (status === 'sending') return 'processing';
  return 'default';
}

function recipients(row: OutboundEmailRow): string {
  return (row.toAddresses ?? []).map((item) => item.email).join(', ');
}

export function OutboundEmailList() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canView = codes.includes('outboundEmails.view');
  const canManage = codes.includes('outboundEmails.manage');
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [retrying, setRetrying] = useState(false);

  const retry = useCallback(
    async (ids: string[]) => {
      const base = getResourceApiBase('outboundEmails');
      if (!base || ids.length === 0) return;
      setRetrying(true);
      try {
        if (ids.length === 1) {
          await timciFetch(`${base}/${encodeURIComponent(ids[0]!)}/retry`, { method: 'POST' });
        } else {
          await timciFetch(`${base}/retry-batch`, {
            method: 'POST',
            body: JSON.stringify({ ids: ids.slice(0, 50) }),
          });
        }
        notify.success(translate('pages.outboundEmails.retrySuccess'));
        setSelectedKeys([]);
        window.location.reload();
      } catch {
        notify.error(translate('pages.outboundEmails.retryError'));
      } finally {
        setRetrying(false);
      }
    },
    [notify, translate],
  );

  const columnDefs = useMemo((): TimciColumnDef<OutboundEmailRow>[] => [
    {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.outboundEmails.actions',
      width: 110,
      render: (_value, record) =>
        canManage && record.status === 'failed' ? (
          <span data-timci-row-action onClick={(event) => event.stopPropagation()}>
            <Button size="small" loading={retrying} onClick={() => void retry([record.id])}>
              {translate('table.outboundEmails.retry')}
            </Button>
          </span>
        ) : null,
      exportValue: () => '',
    },
    {
      key: 'status',
      dataIndex: 'status',
      titleKey: 'table.outboundEmails.status',
      sorter: true,
      filter: { kind: 'text' },
      render: (value) => (
        <Tag color={statusColor(String(value))}>
          {translate(`pages.outboundEmails.statuses.${String(value)}`, String(value ?? ''))}
        </Tag>
      ),
    },
    {
      key: 'subject',
      dataIndex: 'subject',
      titleKey: 'table.outboundEmails.subject',
    },
    {
      key: 'toAddresses',
      dataIndex: 'toAddresses',
      titleKey: 'table.outboundEmails.to',
      render: (_value, record) => recipients(record) || '—',
      exportValue: recipients,
    },
    {
      key: 'attemptCount',
      dataIndex: 'attemptCount',
      titleKey: 'table.outboundEmails.attempts',
      render: (_value, record) => `${record.attemptCount}/${record.maxAttempts}`,
      exportValue: (record) => `${record.attemptCount}/${record.maxAttempts}`,
    },
    {
      key: 'lastErrorMessage',
      dataIndex: 'lastErrorMessage',
      titleKey: 'table.outboundEmails.lastError',
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      titleKey: 'table.outboundEmails.createdAt',
      sorter: true,
      filter: { kind: 'date' },
      render: (value) => formatTimciUserDateTime(value, { dateFormat, timeZone }),
      exportValue: (record) =>
        formatTimciUserDateTime(record.createdAt, { dateFormat, timeZone }) || '',
    },
  ], [canManage, dateFormat, retry, retrying, timeZone, translate]);

  const bulkButton = canManage ? (
    <Button
      disabled={selectedKeys.length === 0}
      loading={retrying}
      onClick={() => void retry(selectedKeys.map(String))}
    >
      {translate('pages.outboundEmails.retrySelected', { count: selectedKeys.length })}
    </Button>
  ) : null;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <TimciDataList<OutboundEmailRow>
        resource="outboundEmails"
        rowKey="id"
        titleKey="pages.outboundEmails.title"
        columnDefs={columnDefs}
        requiresTenant
        pickerDateFormat={dateFormat}
        initialSorters={[{ field: 'createdAt', order: 'desc' }]}
        getRowShowPath={
          canView
            ? (record) => `/outbound-emails/show/${encodeURIComponent(record.id)}`
            : undefined
        }
        rowSelection={
          canManage
            ? {
                selectedRowKeys: selectedKeys,
                onChange: setSelectedKeys,
                getCheckboxProps: (record) => ({ disabled: record.status !== 'failed' }),
              }
            : undefined
        }
        extraHeaderButtons={bulkButton}
        listCreateButtonProps={{ hidden: true }}
      />
    </Space>
  );
}
