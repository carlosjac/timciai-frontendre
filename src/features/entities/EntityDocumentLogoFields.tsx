import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, Button, Space, Typography, Upload } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  canFullyEditEntity,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';
import {
  DOCUMENT_LOGO_ACCEPT,
  DOCUMENT_LOGO_MAX_BYTES,
  clearDocumentLogo,
  fetchDocumentLogoMeta,
  fetchDocumentLogoObjectUrl,
  uploadDocumentLogo,
} from '../../shared/timci/documentsApi.js';

type Props = {
  /** Persisted entity id. When null/undefined, upload is disabled (create before save). */
  entityId?: string | null;
  /** Read-only preview (entity show). */
  readOnly?: boolean;
};

/**
 * Entity document branding logo (PDF header). Separate from entity PUT — uses documents API.
 * Gated like the entity Comprobantes tab: root (`menu.allEntities`) configures branding;
 * `documents.*` alone is not enough (and root does not receive those AR codes).
 */
export function EntityDocumentLogoFields({ entityId, readOnly = false }: Props) {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canConfigureEntity = canFullyEditEntity(codes);
  const canView =
    canConfigureEntity ||
    codes.includes('entities.view') ||
    codes.includes('entities.update') ||
    codes.includes('documents.view') ||
    codes.includes('documents.manage') ||
    codes.includes('menu.documents');
  const canManage =
    canConfigureEntity ||
    codes.includes('entities.update') ||
    codes.includes('documents.manage');

  const [hasLogo, setHasLogo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const loadGenRef = useRef(0);

  const reload = useCallback(async () => {
    if (!entityId || !canView) {
      setHasLogo(false);
      setPreviewUrl(null);
      return;
    }
    const gen = ++loadGenRef.current;
    setLoading(true);
    try {
      const meta = await fetchDocumentLogoMeta(entityId);
      if (gen !== loadGenRef.current) return;
      setHasLogo(meta != null);
      if (!meta) {
        setPreviewUrl(null);
        return;
      }
      const url = await fetchDocumentLogoObjectUrl(entityId);
      if (gen !== loadGenRef.current) return;
      setPreviewUrl(url);
    } catch {
      if (gen !== loadGenRef.current) return;
      setHasLogo(false);
      setPreviewUrl(null);
    } finally {
      if (gen === loadGenRef.current) setLoading(false);
    }
  }, [entityId, canView]);

  useEffect(() => {
    void reload();
    return () => {
      loadGenRef.current += 1;
    };
  }, [reload]);

  if (!canView && !canManage) return null;

  if (!entityId) {
    return (
      <Alert
        type="info"
        showIcon
        style={{ marginTop: 16 }}
        message={translate('create.entity.documentLogoSaveEntityFirst')}
      />
    );
  }

  const onUpload = async (file: File) => {
    const type = (file.type || '').toLowerCase();
    if (!DOCUMENT_LOGO_ACCEPT.split(',').includes(type)) {
      notify.error(translate('create.entity.documentLogoInvalidType'));
      return;
    }
    if (file.size > DOCUMENT_LOGO_MAX_BYTES) {
      notify.error(translate('create.entity.documentLogoTooLarge'));
      return;
    }
    setBusy(true);
    try {
      await uploadDocumentLogo(entityId, file);
      notify.success(translate('create.entity.documentLogoUploadOk'));
      // Immediate local preview (data URL), then refresh from API.
      const localPreview = await new Promise<string | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => reject(reader.error ?? new Error('read failed'));
        reader.readAsDataURL(file);
      });
      if (localPreview) {
        setHasLogo(true);
        setPreviewUrl(localPreview);
      }
      await reload();
    } catch (e) {
      notify.error(
        e instanceof Error ? e.message : translate('create.entity.documentLogoUploadError'),
      );
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setBusy(true);
    try {
      await clearDocumentLogo(entityId);
      notify.success(translate('create.entity.documentLogoRemoveOk'));
      setHasLogo(false);
      setPreviewUrl(null);
    } catch (e) {
      notify.error(
        e instanceof Error ? e.message : translate('create.entity.documentLogoRemoveError'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Typography.Text strong>{translate('create.entity.documentLogo')}</Typography.Text>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
        {translate('create.entity.documentLogoHelp')}
      </Typography.Paragraph>
      <Space align="start" size="middle" wrap>
        <div
          style={{
            width: 180,
            height: 64,
            border: '1px solid var(--ant-color-border, #d9d9d9)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ant-color-fill-quaternary)',
            overflow: 'hidden',
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={translate('create.entity.documentLogoPreviewAlt')}
              style={{ maxWidth: 180, maxHeight: 64, objectFit: 'contain' }}
            />
          ) : (
            <Typography.Text type="secondary">
              {loading ? '…' : translate('create.entity.documentLogoNone')}
            </Typography.Text>
          )}
        </div>
        {!readOnly && canManage ? (
          <Space direction="vertical" size="small">
            <Upload
              accept={DOCUMENT_LOGO_ACCEPT}
              showUploadList={false}
              beforeUpload={(file) => {
                void onUpload(file);
                return false;
              }}
              disabled={busy}
            >
              <Button loading={busy}>
                {hasLogo
                  ? translate('create.entity.documentLogoReplace')
                  : translate('create.entity.documentLogoUpload')}
              </Button>
            </Upload>
            {hasLogo ? (
              <Button danger disabled={busy} onClick={() => void onRemove()}>
                {translate('create.entity.documentLogoRemove')}
              </Button>
            ) : null}
          </Space>
        ) : null}
      </Space>
    </div>
  );
}
