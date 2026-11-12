import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert } from 'antd';
import { useEffect, useState } from 'react';
import type { TimciPermissionsData } from '../shared/timci/actionCodes.js';
import { getStoredTenantId } from '../shared/timci/apiUrl.js';
import { getEntityByIdUrl } from '../shared/timci/entitiesApi.js';
import { timciFetch } from '../shared/timci/http.js';

export function TestModeBanner() {
  const translate = useTranslate();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = (permData?.actionCodes ?? []).includes('entities.view');
  const [tenantId, setTenantId] = useState(() => getStoredTenantId());
  const [inTest, setInTest] = useState(false);

  useEffect(() => {
    const syncTenant = () => setTenantId(getStoredTenantId());
    window.addEventListener('timci-tenant-changed', syncTenant);
    window.addEventListener('storage', syncTenant);
    return () => {
      window.removeEventListener('timci-tenant-changed', syncTenant);
      window.removeEventListener('storage', syncTenant);
    };
  }, []);

  if ((!canView || !tenantId) && inTest) {
    setInTest(false);
  }

  useEffect(() => {
    if (!canView || !tenantId) return;
    let cancelled = false;
    void timciFetch(getEntityByIdUrl(tenantId, tenantId))
      .then(({ json }) => {
        if (cancelled) return;
        const mode =
          json && typeof json === 'object' && 'operatingMode' in json
            ? (json as { operatingMode?: unknown }).operatingMode
            : null;
        setInTest(mode === 'test');
      })
      .catch(() => {
        if (!cancelled) setInTest(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canView, tenantId]);

  if (!inTest) return null;

  return (
    <Alert
      type="warning"
      showIcon
      banner
      role="status"
      message={translate('header.testMode.banner')}
    />
  );
}
