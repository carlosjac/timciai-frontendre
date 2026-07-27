import { getV1Base } from '../../config.js';
import { timciFetch } from './http.js';

/** Id del tenant global (__global__); no se puede desactivar. */
export const GLOBAL_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export type TenantOption = { id: string; name: string };

export function getTenantsListUrl(): string {
  return `${getV1Base()}/authorization/tenants`;
}

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

/** Active business organizations for selects (excludes __global__). Requires tenants.list. */
export async function fetchActiveTenantsForSelect(): Promise<TenantOption[]> {
  const qs = new URLSearchParams({
    range: JSON.stringify([0, 199]),
    sort: JSON.stringify(['name', 'ASC']),
  });
  const { json } = await timciFetch(`${getTenantsListUrl()}?${qs.toString()}`);
  const rows = Array.isArray(json) ? json : [];
  return rows
    .map((row) => {
      const r = row as { id?: unknown; name?: unknown };
      const id = typeof r.id === 'string' ? r.id : '';
      const name = typeof r.name === 'string' ? r.name : '';
      return { id, name };
    })
    .filter((t) => t.id !== '' && t.id !== GLOBAL_TENANT_ID);
}
