import { getV1Base } from '../../config.js';

export function getPriceListItemsListUrl(tenantId: string, priceListId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/price-lists/${encodeURIComponent(priceListId)}/items`;
}

export function getPriceListItemByIdUrl(tenantId: string, itemId: string): string {
  return `${getV1Base()}/tenants/${tenantId}/price-list-items/${encodeURIComponent(itemId)}`;
}

/** Fecha API (YYYY-MM-DD) o null para “sin límite”. */
function toApiDate(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'string') return v.trim() === '' ? null : v.trim().slice(0, 10);
  return null;
}

export function buildPriceListItemCreateBody(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  return {
    sellableItemId: String(variables.sellableItemId ?? ''),
    currencyId: String(variables.currencyId ?? ''),
    entityId: String(variables.entityId ?? ''),
    unitPriceAmount: String(variables.unitPriceAmount ?? '').trim(),
    validFrom: toApiDate(variables.validFrom),
    validTo: toApiDate(variables.validTo),
  };
}

export function buildPriceListItemUpdateBody(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.currencyId !== undefined) payload.currencyId = String(variables.currencyId);
  if (variables.unitPriceAmount !== undefined) {
    payload.unitPriceAmount = String(variables.unitPriceAmount).trim();
  }
  if (variables.validFrom !== undefined) payload.validFrom = toApiDate(variables.validFrom);
  if (variables.validTo !== undefined) payload.validTo = toApiDate(variables.validTo);
  return payload;
}
