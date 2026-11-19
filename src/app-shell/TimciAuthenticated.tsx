import { useIsAuthenticated } from '@refinedev/core';
import { Spin } from 'antd';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { esMessages } from '../i18n/locale.es.js';

type TimciAuthenticatedProps = {
  children: ReactNode;
};

/**
 * Session gate for the admin shell.
 * The auth check is always stale so a logged-out result cached before submit
 * is refetched after login instead of sending the user back to the form.
 */
export function TimciAuthenticated({ children }: TimciAuthenticatedProps) {
  const location = useLocation();
  const { isFetching, data } = useIsAuthenticated({
    // Drop the logged-out result as soon as this gate unmounts, so the next
    // login refetches /auth/me instead of reusing `authenticated: false`.
    queryOptions: { staleTime: 0, gcTime: 0 },
  });

  if (isFetching || data == null) {
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

  if (data.authenticated) {
    return <>{children}</>;
  }

  const params = new URLSearchParams(location.search);
  const existingTo = params.get('to');
  const returnTo = existingTo ?? `${location.pathname}${location.search}${location.hash}`;
  const search = returnTo.length > 1 ? `?to=${encodeURIComponent(returnTo)}` : '';

  return <Navigate to={{ pathname: '/login', search }} replace />;
}
