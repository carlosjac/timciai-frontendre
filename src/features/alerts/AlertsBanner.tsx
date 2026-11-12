import { useEffect, useState } from 'react';
import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, Button } from 'antd';
import { useNavigate } from 'react-router';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';

export function AlertsBanner() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canSee =
    (permData?.actionCodes?.includes('alerts.view') ||
      permData?.actionCodes?.includes('menu.alerts')) ??
    false;
  const [count, setCount] = useState(0);
  const alertsBase = getResourceApiBase('alerts');

  useEffect(() => {
    if (!canSee || !alertsBase) {
      return;
    }
    let cancelled = false;
    void timciFetch(`${alertsBase}/unresolved-count`)
      .then(({ json }) => {
        if (!cancelled) setCount(Number((json as { count?: number })?.count ?? 0));
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [alertsBase, canSee]);

  if (!canSee || !alertsBase || count < 1) return null;

  return (
    <Alert
      type="warning"
      showIcon
      banner
      style={{ marginBottom: 0 }}
      message={translate('header.alerts.banner', { count })}
      action={
        <Button size="small" type="primary" aria-label={translate('header.alerts.open')} onClick={() => navigate('/alerts')}>
          {translate('header.alerts.open')}
        </Button>
      }
    />
  );
}
