import { usePermissions } from '@refinedev/core';
import { Spin } from 'antd';
import { Navigate } from 'react-router';
import { esMessages } from '../i18n/locale.es.js';
import {
  getFirstAccessibleListPath,
  type TimciPermissionsData,
} from '../shared/timci/actionCodes.js';
import { freshTimciPermissionQueryOptions } from '../shared/timci/permissionQueryOptions.js';

/**
 * Inicio (`/`) y el logo: el tablero si el usuario tiene `menu.bi`; si no, el primer listado permitido.
 */
export function NavigateToFirstAccessibleList() {
  const { data, isLoading, isFetching } = usePermissions<TimciPermissionsData>({
    options: freshTimciPermissionQueryOptions,
  });

  const codes = data?.actionCodes;
  const waiting = isLoading || codes == null || (codes.length === 0 && isFetching);
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

  const to = getFirstAccessibleListPath(codes ?? []);
  return <Navigate to={to} replace />;
}
