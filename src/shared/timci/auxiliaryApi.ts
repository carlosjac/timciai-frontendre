import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';
import { timciFetch } from './http.js';

export type OverduePolicyItem = { key: string; description: string };

export async function fetchOverduePolicyCatalog(tenantId: string): Promise<OverduePolicyItem[]> {
  const { json } = await timciFetch(
    `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/overdue-notification-policies/catalog`,
  );
  const policies = (json as { policies?: OverduePolicyItem[] })?.policies;
  return Array.isArray(policies) ? policies : [];
}

export type PriceListRow = { id: string; name: string };

export async function fetchPriceListsForEntity(
  tenantId: string,
  entityId: string,
): Promise<PriceListRow[]> {
  const qs = new URLSearchParams({
    sort: JSON.stringify(['name', 'ASC']),
    range: JSON.stringify([0, 499]),
    filter: JSON.stringify({}),
  });
  const { json } = await timciFetch(
    `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/entities/${requireTimciPathSegment(entityId)}/price-lists?${qs}`,
  );
  return Array.isArray(json) ? (json as PriceListRow[]) : [];
}
