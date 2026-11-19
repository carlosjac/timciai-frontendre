import { useCan } from '@refinedev/core';
import { Spin } from 'antd';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TimciAccessDeniedPage } from './TimciAccessDeniedPage.js';
import { esMessages } from '../i18n/locale.es.js';

type TimciCanAccessRouteProps = {
  resource: string;
  action: string;
  children: ReactNode;
};

/**
 * Route guard: shows an access-denied page when accessControlProvider denies.
 */
export function TimciCanAccessRoute({ resource, action, children }: TimciCanAccessRouteProps) {
  const { data: canData, isLoading, isFetching, refetch } = useCan({
    resource,
    action,
    queryOptions: { staleTime: 0 },
  });
  const [settledDenial, setSettledDenial] = useState(false);
  const denialRetryStarted = useRef(false);

  useEffect(() => {
    if (isLoading || isFetching || canData?.can !== false || denialRetryStarted.current) return;
    denialRetryStarted.current = true;
    void refetch().finally(() => setSettledDenial(true));
  }, [canData?.can, isFetching, isLoading, refetch]);

  const waiting =
    isLoading ||
    canData == null ||
    (isFetching && !canData.can) ||
    (canData.can === false && !settledDenial);
  if (waiting) {
    return (
      <div
        role="status"
        aria-label={esMessages.app.loadingPage}
        style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!canData?.can) {
    return <TimciAccessDeniedPage />;
  }

  return <>{children}</>;
}
