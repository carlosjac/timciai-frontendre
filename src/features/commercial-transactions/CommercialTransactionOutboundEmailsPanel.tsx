import { useTranslate } from '@refinedev/core';
import { App, Button, Space, Table, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getResourceApiBase, getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  getCommercialTransactionResendNotificationUrl,
  type CommercialTransactionResource,
} from '../../shared/timci/commercialTransactionsApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type OutboundEmailRow = {
  id: string;
  status: string;
  subject: string;
};

type Props = {
  commercialTransactionId: string;
  resource: CommercialTransactionResource;
  transactionStatus?: string | null;
  canManage?: boolean;
};

export function CommercialTransactionOutboundEmailsPanel({
  commercialTransactionId,
  resource,
  transactionStatus,
  canManage = false,
}: Props) {
  const translate = useTranslate();
  const { modal } = App.useApp();
  const notify = useTimciNotify();
  const [rows, setRows] = useState<OutboundEmailRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const load = useCallback(async () => {
    const base = getResourceApiBase('outboundEmails');
    if (!base || !commercialTransactionId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        range: JSON.stringify([0, 49]),
        filter: JSON.stringify({ commercialTransactionId }),
      });
      const { json } = await timciFetch(`${base}?${params.toString()}`);
      setRows(Array.isArray(json) ? (json as OutboundEmailRow[]) : []);
    } catch {
      notify.error(translate('pages.outboundEmails.loadError'));
    } finally {
      setLoading(false);
    }
  }, [commercialTransactionId, notify, translate]);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = async (id: string) => {
    const base = getResourceApiBase('outboundEmails');
    if (!base) return;
    try {
      await timciFetch(`${base}/${encodeURIComponent(id)}/retry`, { method: 'POST' });
      notify.success(translate('pages.outboundEmails.retrySuccess'));
      await load();
    } catch {
      notify.error(translate('pages.outboundEmails.retryError'));
    }
  };

  const confirmResend = () => {
    const tenantId = getStoredTenantId();
    if (!tenantId || !commercialTransactionId) return;
    modal.confirm({
      title: translate('pages.outboundEmails.resendConfirmTitle'),
      content: translate('pages.outboundEmails.resendConfirmBody'),
      okText: translate('pages.outboundEmails.resend'),
      cancelText: translate('buttons.cancel'),
      onOk: async () => {
        setResendLoading(true);
        try {
          await timciFetch(
            getCommercialTransactionResendNotificationUrl(
              tenantId,
              resource,
              commercialTransactionId
            ),
            { method: 'POST' }
          );
          notify.success(translate('pages.outboundEmails.resendSuccess'));
          await load();
        } catch (e: unknown) {
          const detail =
            e instanceof Error && e.message.trim() !== ''
              ? e.message.trim()
              : translate('pages.outboundEmails.resendError');
          notify.error(detail);
        } finally {
          setResendLoading(false);
        }
      },
    });
  };

  const isRegistered = transactionStatus === 'registered';
  const canResend = canManage && isRegistered;
  if (!loading && rows.length === 0 && !isRegistered) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}
        align="center"
        wrap
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          {translate('pages.outboundEmails.panelTitle')}
        </Typography.Title>
        {canResend ? (
          <Button onClick={confirmResend} loading={resendLoading}>
            {translate('pages.outboundEmails.resend')}
          </Button>
        ) : null}
      </Space>
      <Table<OutboundEmailRow>
        rowKey="id"
        size="small"
        loading={loading}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: translate('pages.outboundEmails.empty') }}
        columns={[
          {
            title: translate('table.outboundEmails.status'),
            dataIndex: 'status',
            render: (status: string) => (
              <Tag>{translate(`pages.outboundEmails.statuses.${status}`, status)}</Tag>
            ),
          },
          { title: translate('table.outboundEmails.subject'), dataIndex: 'subject' },
          {
            title: translate('table.outboundEmails.actions'),
            key: 'actions',
            render: (_value, row) => (
              <Space>
                <Link to={`/outbound-emails/show/${encodeURIComponent(row.id)}`}>
                  {translate('pages.outboundEmails.view')}
                </Link>
                {canManage && (row.status === 'failed' || row.status === 'cancelled') ? (
                  <Button size="small" type="link" onClick={() => void retry(row.id)}>
                    {translate('table.outboundEmails.retry')}
                  </Button>
                ) : null}
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
