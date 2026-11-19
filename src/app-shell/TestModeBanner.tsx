import { useOne, usePermissions, useTranslate } from '@refinedev/core';
import { Alert } from 'antd';
import { useEffect, useState } from 'react';
import type { TimciPermissionsData } from '../shared/timci/actionCodes.js';
import { getStoredTenantId } from '../shared/timci/apiUrl.js';

export function TestModeBanner() {
  const translate = useTranslate();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = (permData?.actionCodes ?? []).includes('entities.view');
  const [tenantId, setTenantId] = useState(() => getStoredTenantId());

  useEffect(() => {
    const syncTenant = () => setTenantId(getStoredTenantId());
    window.addEventListener('timci-tenant-changed', syncTenant);
    window.addEventListener('storage', syncTenant);
    return () => {
      window.removeEventListener('timci-tenant-changed', syncTenant);
      window.removeEventListener('storage', syncTenant);
    };
  }, []);

  const { result } = useOne<{ operatingMode?: string }>({
    resource: 'entities',
    id: tenantId ?? '',
    queryOptions: { enabled: canView && Boolean(tenantId) },
    errorNotification: false,
  });
  const inTest = result?.operatingMode === 'test';

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
