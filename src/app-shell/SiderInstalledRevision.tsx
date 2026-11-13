import { useTranslate } from '@refinedev/core';
import { theme } from 'antd';
import { useEffect, useState } from 'react';
import {
  installedApiVersionUrl,
  readAdminRevision,
  readVersionRevision,
  shortRevision,
} from './installedRevision.js';

export const SIDER_REVISION_FOOTER_PX = 40;

/**
 * Pie del menú: revisión corta de la API y del admin.
 * El SHA completo queda en el nombre accesible y en el tooltip.
 */
export function SiderInstalledRevision() {
  const translate = useTranslate();
  const { token } = theme.useToken();
  const adminRevision = readAdminRevision();
  const [apiRevision, setApiRevision] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const url = installedApiVersionUrl(import.meta.env.VITE_API_URL as string | undefined);
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        return readVersionRevision(await response.json());
      })
      .then((revision) => {
        if (!cancelled && revision != null) setApiRevision(revision);
      })
      .catch(() => {
        // Si /version no responde, queda solo la revisión del admin.
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const adminShort = shortRevision(adminRevision);
  const visible =
    apiRevision == null
      ? translate('sider.installedRevisionAdminOnly', { admin: adminShort })
      : translate('sider.installedRevision', {
          api: shortRevision(apiRevision),
          admin: adminShort,
        });
  const accessibleName =
    apiRevision == null
      ? translate('sider.installedRevisionAdminOnlyName', { admin: adminRevision })
      : translate('sider.installedRevisionName', {
          api: apiRevision,
          admin: adminRevision,
        });

  return (
    <p
      aria-label={accessibleName}
      title={accessibleName}
      style={{
        margin: 0,
        height: SIDER_REVISION_FOOTER_PX,
        flex: `0 0 ${SIDER_REVISION_FOOTER_PX}px`,
        padding: '8px 16px',
        fontSize: 12,
        lineHeight: '24px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: token.colorTextDescription,
        backgroundColor: token.colorBgContainer,
      }}
    >
      {visible}
    </p>
  );
}
