import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';

export function getPriceListsEntityListUrl(tenantId: string, entityId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/entities/${requireTimciPathSegment(entityId)}/price-lists`;
}

export function getPriceListByIdUrl(tenantId: string, listId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/price-lists/${requireTimciPathSegment(listId)}`;
}

export function getPriceListActivateUrl(tenantId: string, listId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/price-lists/${requireTimciPathSegment(listId)}/activate`;
}

export function getPriceListDeactivateUrl(tenantId: string, listId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/price-lists/${requireTimciPathSegment(listId)}/deactivate`;
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
