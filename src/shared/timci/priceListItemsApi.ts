import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';
import { timciFetch } from './http.js';

export function getPriceListItemsListUrl(tenantId: string, priceListId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/price-lists/${requireTimciPathSegment(priceListId)}/items`;
}

export type PriceListUnitPriceRow = {
  id: string;
  sellableItemId?: string;
  currencyId?: string;
  unitPriceAmount?: string;
};

async function listPriceListItemRows(params: {
  tenantId: string;
  priceListId: string;
  sellableItemId?: string;
  currencyId?: string;
  validAt?: string;
  take?: number;
}): Promise<PriceListUnitPriceRow[]> {
  const filter: Record<string, unknown> = {};
  if (params.sellableItemId) {
    filter.sellableItemId = { operator: 'eq', value: params.sellableItemId };
  }
  if (params.currencyId) {
    filter.currencyId = { operator: 'eq', value: params.currencyId };
  }
  if (params.validAt) {
    filter.validAt = String(params.validAt).slice(0, 10);
  }
  const take = params.take ?? 50;
  const qs = new URLSearchParams({
    sort: JSON.stringify(['validFrom', 'DESC']),
    range: JSON.stringify([0, take - 1]),
    filter: JSON.stringify(filter),
  });
  const { json } = await timciFetch(
    `${getPriceListItemsListUrl(params.tenantId, params.priceListId)}?${qs}`,
  );
  return Array.isArray(json) ? (json as PriceListUnitPriceRow[]) : [];
}

/**
 * Precio unitario vigente en la lista para producto + moneda (y fecha de validez).
 * Devuelve null si no hay ítem coincidente.
 */
export async function fetchUnitPriceFromPriceList(params: {
  tenantId: string;
  priceListId: string;
  sellableItemId: string;
  currencyId: string;
  validAt?: string;
}): Promise<string | null> {
  const pickAmount = (rows: PriceListUnitPriceRow[]): string | null => {
    const match =
      rows.find((r) => String(r.currencyId ?? '') === String(params.currencyId)) ??
      (rows.length === 1 ? rows[0] : undefined);
    const amount = match?.unitPriceAmount;
    return amount != null && String(amount).trim() !== '' ? String(amount).trim() : null;
  };

  let rows = await listPriceListItemRows({
    tenantId: params.tenantId,
    priceListId: params.priceListId,
    sellableItemId: params.sellableItemId,
    currencyId: params.currencyId,
    validAt: params.validAt,
    take: 5,
  });
  let amount = pickAmount(rows);
  if (amount != null) return amount;

  if (params.validAt) {
    rows = await listPriceListItemRows({
      tenantId: params.tenantId,
      priceListId: params.priceListId,
      sellableItemId: params.sellableItemId,
      currencyId: params.currencyId,
      take: 5,
    });
    amount = pickAmount(rows);
    if (amount != null) return amount;
  }

  rows = await listPriceListItemRows({
    tenantId: params.tenantId,
    priceListId: params.priceListId,
    sellableItemId: params.sellableItemId,
    take: 5,
  });
  return pickAmount(rows);
}

export function getPriceListItemByIdUrl(tenantId: string, itemId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/price-list-items/${requireTimciPathSegment(itemId)}`;
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
