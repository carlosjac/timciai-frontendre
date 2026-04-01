import { getV1Base } from '../../config.js';

export function getSellableItemsEntityListUrl(tenantId: string, entityId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/entities/${entityId}/sellable-items`;
}

export function getSellableItemByIdUrl(tenantId: string, itemId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/sellable-items/${encodeURIComponent(itemId)}`;
}

export function getSellableItemActivateUrl(tenantId: string, itemId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/sellable-items/${encodeURIComponent(itemId)}/activate`;
}

export function getSellableItemDeactivateUrl(tenantId: string, itemId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/sellable-items/${encodeURIComponent(itemId)}/deactivate`;
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
  return payload;
}
