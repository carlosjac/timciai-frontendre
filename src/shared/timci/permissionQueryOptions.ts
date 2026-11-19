import type { usePermissions } from '@refinedev/core';
import type { TimciPermissionsData } from './actionCodes.js';

type PermissionQueryOptions = NonNullable<
  Parameters<typeof usePermissions<TimciPermissionsData>>[0]
>['options'];

/**
 * The permissions query must not keep a pre-login empty result for the global 20s stale time.
 * The hook supplies the query key; this object only overrides freshness.
 */
export const freshTimciPermissionQueryOptions = {
  staleTime: 0,
} as unknown as PermissionQueryOptions;
