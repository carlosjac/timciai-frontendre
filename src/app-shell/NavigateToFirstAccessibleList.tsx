import { usePermissions } from '@refinedev/core';
import { Spin } from 'antd';
import { Navigate } from 'react-router';
import {
  getFirstAccessibleListPath,
  type TimciPermissionsData,
} from '../shared/timci/actionCodes.js';

/**
 * Inicio (`/`) y el logo: el tablero si el usuario tiene `menu.bi`; si no, el primer listado permitido.
 */
export function NavigateToFirstAccessibleList() {
  const { data, isLoading, isFetching } = usePermissions<TimciPermissionsData>({});

  const waiting = isLoading || (isFetching && data == null);
  if (waiting) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const codes = data?.actionCodes ?? [];
  const to = getFirstAccessibleListPath(codes);
  return <Navigate to={to} replace />;
}
