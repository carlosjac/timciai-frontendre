import { Navigate } from 'react-router';
import { usePermissions } from '@refinedev/core';
import {
  canFullyEditEntity,
  canSeeEntitySettingsMenuItem,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';

type EntityAdminRedirectProps = {
  tab?: 'general' | 'payment-options';
};

/** Redirects entity administrators away from CRUD routes to /entity-settings. */
export function EntityAdminRedirect({ tab }: EntityAdminRedirectProps) {
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];

  if (!canSeeEntitySettingsMenuItem(codes) || canFullyEditEntity(codes)) {
    return null;
  }

  const search = tab != null ? `?tab=${tab}` : '';
  return <Navigate to={`/entity-settings${search}`} replace />;
}
