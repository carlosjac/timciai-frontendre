import { useCan } from '@refinedev/core';
import { Spin } from 'antd';
import type { ReactNode } from 'react';
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
  const { data: canData, isLoading, isFetching } = useCan({ resource, action });

  const waiting = isLoading || (isFetching && canData == null);
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
