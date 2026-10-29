import { Show } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { App as AntdApp, Button, Descriptions, Spin, Tag, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  downloadIssuedDocumentPdf,
  fetchIssuedDocumentPdfBlob,
  type IssuedDocumentRecord,
} from '../../shared/timci/documentsApi.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

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

function commercialTransactionShowPath(
  txType: string | undefined,
  commercialTransactionId: string | undefined,
): string | undefined {
  if (!commercialTransactionId) return undefined;
  switch (txType) {
    case 'sale':
      return `/sales/show/${encodeURIComponent(commercialTransactionId)}`;
    case 'debit':
      return `/debits/show/${encodeURIComponent(commercialTransactionId)}`;
    case 'credit':
      return `/credits/show/${encodeURIComponent(commercialTransactionId)}`;
    case 'collection':
      return `/collections/show/${encodeURIComponent(commercialTransactionId)}`;
    default:
      return undefined;
  }
}

export function DocumentShow() {
  const translate = useTranslate();
  const { message } = AntdApp.useApp();
  const { dateFormat, timeZone } = useUserPreferences();
  const { query } = useShow<IssuedDocumentRecord>({ resource: 'documents' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const [downloading, setDownloading] = useState(false);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    setPdfObjectUrl(null);
    setPdfError(false);

    const loadPdf = async () => {
      if (!record?.id || !record.hasContent) {
        setPdfLoading(false);
        return;
      }
      setPdfLoading(true);
      try {
        const blob = await fetchIssuedDocumentPdfBlob(String(record.id));
        if (cancelled) return;
        if (!blob) {
          setPdfError(true);
          return;
        }
        // Chrome/Edge PDF viewer: default zoom 100% via fragment.
        objectUrl = `${URL.createObjectURL(blob)}#zoom=100`;
        setPdfObjectUrl(objectUrl);
      } catch {
        if (!cancelled) setPdfError(true);
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        const base = objectUrl.split('#')[0] ?? objectUrl;
        URL.revokeObjectURL(base);
      }
    };
  }, [record?.id, record?.hasContent]);

  const onDownload = async () => {
    if (!record?.id) return;
    setDownloading(true);
    try {
      const ok = await downloadIssuedDocumentPdf(String(record.id));
      if (!ok) message.error(translate('documents.downloadError'));
    } finally {
      setDownloading(false);
    }
  };

  const kindLabel = record?.documentKind
    ? translate(`documents.kinds.${record.documentKind}`, record.documentKind)
    : null;
  const numberLabel =
    record?.number != null && String(record.number).trim() !== ''
      ? String(record.number).trim()
      : null;
  const comprobanteLabel = [kindLabel, numberLabel].filter(Boolean).join(' - ') || '—';

  const txTypeLabel = record?.txType
    ? translate(`documents.txTypes.${record.txType}`, record.txType)
    : '';
  const txnNumber =
    record?.commercialTransactionEntityTxnNumber != null
      ? String(record.commercialTransactionEntityTxnNumber)
      : null;
  const concept = record?.commercialTransactionConcept?.trim() || null;
  const txLinkLabel = [txTypeLabel, txnNumber ? `#${txnNumber}` : null, concept]
    .filter(Boolean)
    .join(' · ');
  const txShowPath = commercialTransactionShowPath(
    record?.txType,
    record?.commercialTransactionId,
  );

  const jurisdictionLabel =
    record?.countryName?.trim() ||
    (record?.jurisdiction
      ? translate(`documents.jurisdictions.${record.jurisdiction}`, record.jurisdiction)
      : '—');

  const emitterLabel = record?.emitterKey
    ? translate(`documents.emitters.${record.emitterKey}`, record.emitterKey)
    : '—';

  return (
    <Show
      title={translate('pages.documents.showTitle')}
      isLoading={isLoading}
      canEdit={false}
      canDelete={false}
      headerButtons={() =>
        record?.hasContent ? (
          <Button
            type="primary"
            icon={<DownloadOutlined aria-hidden />}
            loading={downloading}
            onClick={() => void onDownload()}
            aria-label={translate('documents.download')}
          >
            {translate('documents.download')}
          </Button>
        ) : null
      }
    >
      <Descriptions
        column={{ xs: 1, sm: 2, lg: 3 }}
        bordered
        size="small"
        style={{ marginBottom: 8 }}
        styles={{ label: { width: 120 }, content: { padding: '4px 8px' } }}
      >
        <Descriptions.Item label={translate('table.documents.comprobante')}>
          {comprobanteLabel}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.documents.commercialTransaction')}>
          {txLinkLabel && txShowPath ? (
            <Link to={txShowPath}>{txLinkLabel}</Link>
          ) : txLinkLabel ? (
            txLinkLabel
          ) : (
            '—'
          )}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.documents.status')}>
          {record?.status ? (
            <Tag color={statusColor(record.status)}>
              {translate(`documents.statuses.${record.status}`, record.status)}
            </Tag>
          ) : (
            '—'
          )}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.documents.issuedAt')}>
          {formatTimciUserDateTime(record?.issuedAt, { dateFormat, timeZone })}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.documents.createdAt')}>
          {formatTimciUserDateTime(record?.createdAt, { dateFormat, timeZone })}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.documents.emitterKey')}>
          {emitterLabel}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.documents.jurisdiction')}>
          {jurisdictionLabel}
        </Descriptions.Item>
      </Descriptions>

      {record?.errorMessage ? (
        <Typography.Paragraph type="danger" style={{ marginBottom: 8 }}>
          {record.errorMessage}
        </Typography.Paragraph>
      ) : null}

      {record?.hasContent ? (
        <div style={{ marginTop: 8 }}>
          {pdfLoading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin tip={translate('documents.previewLoading')} />
            </div>
          ) : pdfError || !pdfObjectUrl ? (
            <Typography.Paragraph type="secondary">
              {translate('documents.previewError')}
            </Typography.Paragraph>
          ) : (
            <iframe
              title={translate('documents.previewTitle')}
              src={pdfObjectUrl}
              style={{
                width: '100%',
                height: 'calc(100vh - 220px)',
                minHeight: 520,
                border: '1px solid var(--ant-color-border, #d9d9d9)',
                borderRadius: 8,
                background: '#fff',
              }}
            />
          )}
        </div>
      ) : (
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          {translate('documents.noContent')}
        </Typography.Paragraph>
      )}
    </Show>
  );
}
