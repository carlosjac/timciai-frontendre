import { useTranslate } from '@refinedev/core';
import { App as AntdApp, Button, Space, Table, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getV1Base } from '../../config.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  downloadIssuedDocumentPdf,
  type IssuedDocumentRecord,
} from '../../shared/timci/documentsApi.js';
import { timciFetch } from '../../shared/timci/http.js';

function documentShowPath(id: string): string {
  return `/documents/show/${encodeURIComponent(id)}`;
}

type Props = {
  commercialTransactionId: string;
  canManage?: boolean;
  /** When true, render nothing if the TX has no issued/pending documents. */
  hideWhenEmpty?: boolean;
};

function statusColor(status: string): string {
  switch (status) {
    case 'issued':
      return 'success';
    case 'pending':
      return 'processing';
    case 'failed':
      return 'error';
    case 'skipped':
      return 'default';
    default:
      return 'default';
  }
}

export function CommercialTransactionDocumentsPanel({
  commercialTransactionId,
  canManage = false,
  hideWhenEmpty = false,
}: Props) {
  const translate = useTranslate();
  const { message } = AntdApp.useApp();
  const tenantId = getStoredTenantId();
  const [rows, setRows] = useState<IssuedDocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId || !commercialTransactionId) return;
    setLoading(true);
    try {
      const base = getV1Base();
      const url = `${base}/tenants/${encodeURIComponent(tenantId)}/documents?commercialTransactionId=${encodeURIComponent(commercialTransactionId)}`;
      const { json } = await timciFetch(url);
      setRows(Array.isArray(json) ? (json as IssuedDocumentRecord[]) : []);
    } catch (e) {
      message.error(e instanceof Error ? e.message : translate('documents.loadError'));
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  }, [tenantId, commercialTransactionId, message, translate]);

  useEffect(() => {
    void load();
  }, [load]);

  const download = async (id: string) => {
    const ok = await downloadIssuedDocumentPdf(id);
    if (!ok) message.error(translate('documents.downloadError'));
  };

  const postAction = async (id: string, action: 'retry' | 'skip') => {
    if (!tenantId) return;
    const base = getV1Base();
    const url = `${base}/tenants/${encodeURIComponent(tenantId)}/documents/${encodeURIComponent(id)}/${action}`;
    try {
      await timciFetch(url, { method: 'POST' });
      message.success(translate(`documents.${action}Ok`));
      await load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : translate('documents.actionError'));
    }
  };

  if (hideWhenEmpty && loadedOnce && !loading && rows.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <Typography.Title level={5}>{translate('documents.panelTitle')}</Typography.Title>
      <Table
        size="small"
        rowKey="id"
        loading={loading}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: translate('documents.empty') }}
        columns={[
          {
            title: translate('documents.kind'),
            dataIndex: 'documentKind',
            render: (k: string, row: IssuedDocumentRecord) => (
              <Link to={documentShowPath(row.id)}>
                {translate(`documents.kinds.${k}`, k)}
              </Link>
            ),
          },
          {
            title: translate('documents.number'),
            dataIndex: 'number',
            render: (n: string | null, row: IssuedDocumentRecord) =>
              n ? <Link to={documentShowPath(row.id)}>{n}</Link> : '—',
          },
          {
            title: translate('documents.status'),
            dataIndex: 'status',
            render: (s: string) => (
              <Tag color={statusColor(s)}>{translate(`documents.statuses.${s}`, s)}</Tag>
            ),
          },
          {
            title: translate('documents.actions'),
            key: 'actions',
            render: (_: unknown, row: IssuedDocumentRecord) => (
              <Space size="small" wrap>
                <Link to={documentShowPath(row.id)}>{translate('documents.view')}</Link>
                {row.hasContent ? (
                  <Button size="small" type="link" onClick={() => void download(row.id)}>
                    {translate('documents.download')}
                  </Button>
                ) : null}
                {canManage && row.status === 'failed' ? (
                  <Button size="small" type="link" onClick={() => void postAction(row.id, 'retry')}>
                    {translate('documents.retry')}
                  </Button>
                ) : null}
                {canManage && (row.status === 'pending' || row.status === 'failed') ? (
                  <Button size="small" type="link" onClick={() => void postAction(row.id, 'skip')}>
                    {translate('documents.skip')}
                  </Button>
                ) : null}
              </Space>
            ),
          },
        ]}
      />
      {rows.some((r) => r.errorMessage) ? (
        <Typography.Paragraph type="danger" style={{ marginTop: 8 }}>
          {rows
            .filter((r) => r.errorMessage)
            .map((r) => r.errorMessage)
            .join(' · ')}
        </Typography.Paragraph>
      ) : null}
      <Button size="small" onClick={() => void load()} style={{ marginTop: 8 }}>
        {translate('documents.refresh')}
      </Button>
    </div>
  );
}
