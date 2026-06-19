import { getV1Base } from '../../config.js';

export function getCountryByIdUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/countries/${encodeURIComponent(id)}`;
}

export function getCountryActivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/countries/${encodeURIComponent(id)}/activate`;
}

export function getCountryDeactivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/countries/${encodeURIComponent(id)}/deactivate`;
}

export function buildCountryUpdateBody(variables: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  if (variables.isoCode !== undefined) payload.isoCode = String(variables.isoCode).trim();
  return payload;
}
