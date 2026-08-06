import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';

export function getSellableItemsEntityListUrl(tenantId: string, entityId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/entities/${requireTimciPathSegment(entityId)}/sellable-items`;
}

export function getSellableItemByIdUrl(tenantId: string, itemId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/sellable-items/${requireTimciPathSegment(itemId)}`;
}

export function getSellableItemActivateUrl(tenantId: string, itemId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/sellable-items/${requireTimciPathSegment(itemId)}/activate`;
}

export function getSellableItemDeactivateUrl(tenantId: string, itemId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/sellable-items/${requireTimciPathSegment(itemId)}/deactivate`;
}

export function buildSellableItemCreateBody(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const kind = variables.kind === 'Service' ? 'Service' : 'Product';
  return {
    kind,
    name: String(variables.name ?? ''),
    code:
      variables.code != null && String(variables.code).trim() !== ''
        ? String(variables.code).trim()
        : null,
    description:
      variables.description != null && String(variables.description).trim() !== ''
        ? String(variables.description).trim()
        : null,
    isActive: variables.isActive !== false,
    ...(variables.taxCategoryKey != null && String(variables.taxCategoryKey).trim() !== ''
      ? { taxCategoryKey: String(variables.taxCategoryKey).trim() }
      : {}),
  };
}

export function buildSellableItemUpdateBody(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.kind !== undefined) {
    payload.kind = variables.kind === 'Service' ? 'Service' : 'Product';
  }
  if (variables.name !== undefined) payload.name = String(variables.name);
  if (variables.code !== undefined) {
    payload.code =
      variables.code != null && String(variables.code).trim() !== ''
        ? String(variables.code).trim()
        : null;
  }
  if (variables.description !== undefined) {
    payload.description =
      variables.description != null && String(variables.description).trim() !== ''
        ? String(variables.description).trim()
        : null;
  }
  if (variables.taxCategoryKey !== undefined) {
    payload.taxCategoryKey =
      variables.taxCategoryKey != null && String(variables.taxCategoryKey).trim() !== ''
        ? String(variables.taxCategoryKey).trim()
        : null;
  }
  return payload;
}
