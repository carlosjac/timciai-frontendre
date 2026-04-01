import { getV1Base } from '../../config.js';

export function getPriceListsEntityListUrl(tenantId: string, entityId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/entities/${entityId}/price-lists`;
}

export function getPriceListByIdUrl(tenantId: string, listId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/price-lists/${encodeURIComponent(listId)}`;
}

export function getPriceListActivateUrl(tenantId: string, listId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/price-lists/${encodeURIComponent(listId)}/activate`;
}

export function getPriceListDeactivateUrl(tenantId: string, listId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/price-lists/${encodeURIComponent(listId)}/deactivate`;
}

export function buildPriceListCreateBody(variables: Record<string, unknown>): Record<string, unknown> {
  return {
    name: String(variables.name ?? '').trim(),
    isActive: variables.isActive !== false,
  };
}

export function buildPriceListUpdateBody(variables: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  return payload;
}
