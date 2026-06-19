import { getV1Base } from '../../config.js';

export function getCurrencyByIdUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/currencies/${encodeURIComponent(id)}`;
}

export function getCurrencyActivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/currencies/${encodeURIComponent(id)}/activate`;
}

export function getCurrencyDeactivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${tenantId}/currencies/${encodeURIComponent(id)}/deactivate`;
}

export function buildCurrencyUpdateBody(variables: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.code !== undefined) payload.code = String(variables.code).trim();
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  return payload;
}
