import { useEffect, useState } from 'react';
import { useTranslate } from '@refinedev/core';
import { Alert, Button } from 'antd';
import { Link } from 'react-router';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';

type Props = {
  commercialTransactionId: string;
};

export function CommercialTransactionOpenAlertsBanner({ commercialTransactionId }: Props) {
  const translate = useTranslate();
  const [alertId, setAlertId] = useState<string | null>(null);

  useEffect(() => {
    const base = getResourceApiBase('alerts');
    if (!base || !commercialTransactionId) {
      setAlertId(null);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({
      range: JSON.stringify([0, 0]),
      filter: JSON.stringify({
        unresolvedOnly: true,
        commercialTransactionId,
      }),
    });
    void timciFetch(`${base}?${params.toString()}`)
      .then(({ json }) => {
        if (cancelled) return;
        const rows = Array.isArray(json) ? json : [];
        const first = rows[0] as { id?: string } | undefined;
        setAlertId(first?.id ? String(first.id) : null);
      })
      .catch(() => {
        if (!cancelled) setAlertId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [commercialTransactionId]);

  if (!alertId) return null;

  return (
    <Alert
      type="warning"
      showIcon
      style={{ marginTop: 16, marginBottom: 8 }}
      message={translate('pages.alerts.openRelated')}
      action={
        <Link to={`/alerts/show/${encodeURIComponent(alertId)}`}>
          <Button size="small" type="primary" aria-label={translate('header.alerts.open')}>
            {translate('header.alerts.open')}
          </Button>
        </Link>
      }
    />
  );
}
