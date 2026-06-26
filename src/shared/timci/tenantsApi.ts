import { getV1Base } from '../../config.js';

/** Id del tenant global (__global__); no se puede desactivar. */
export const GLOBAL_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export function getTenantByIdUrl(id: string): string {
  return `${getV1Base()}/authorization/tenants/${encodeURIComponent(id)}`;
}

export function getTenantActivateUrl(id: string): string {
  return `${getV1Base()}/authorization/tenants/${encodeURIComponent(id)}/activate`;
}

export function getTenantDeactivateUrl(id: string): string {
  return `${getV1Base()}/authorization/tenants/${encodeURIComponent(id)}/deactivate`;
}

export function buildTenantUpdateBody(variables: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  return payload;
}
