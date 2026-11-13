import { useTranslate } from '@refinedev/core';
import { Alert, Button } from 'antd';
import { useEffect, useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';
import { parseContentRangeTotal } from '../../shared/timci/listQuery.js';

async function fetchPendingSignupCount(): Promise<number> {
  const base = getResourceApiBase('entitySignups');
  if (!base) return 0;
  const params = new URLSearchParams({
    sort: JSON.stringify(['createdAt', 'DESC']),
    range: JSON.stringify([0, 0]),
    filter: JSON.stringify({ status: { operator: 'eq', value: 'pending' } }),
  });
  const { headers } = await timciFetch(`${base}?${params.toString()}`);

  return parseContentRangeTotal(headers) ?? 0;
}

/** Visible warning on the root dashboard while signup requests wait for a decision. */
export function PendingSignupAlert(): ReactElement | null {
  const translate = useTranslate();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void fetchPendingSignupCount()
        .then((next) => {
          if (!cancelled) setCount(next);
        })
        .catch(() => {
          if (!cancelled) setCount(0);
        });
    };
    load();
    window.addEventListener('focus', load);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', load);
    };
  }, []);

  if (count < 1) return null;

  const message =
    count === 1
      ? translate('dashboard.pendingSignups.one')
      : translate('dashboard.pendingSignups.many', { count });

  return (
    <Alert
      type="warning"
      showIcon
      role="alert"
      message={message}
      description={translate('dashboard.pendingSignups.description')}
      action={
        <Button type="primary" onClick={() => navigate('/entity-requests')}>
          {translate('dashboard.pendingSignups.review')}
        </Button>
      }
      style={{ marginBottom: 16 }}
    />
  );
}
