import type { BaseRecord, CrudFilter, CrudSort } from '@refinedev/core';
import { getResourceApiBase, getStoredTenantId } from '../../apiUrl.js';
import {
  buildSortRangeParams,
  buildTimciFilter,
  isLogicalFilter,
  logicalFilterToTimciCriterion,
  parseContentRangeTotal,
} from '../../listQuery.js';
import { timciFetch, toHttpError } from '../../http.js';
import { getPriceListItemsListUrl } from '../../priceListItemsApi.js';
import { getPriceListsEntityListUrl } from '../../priceListsApi.js';
import { getSellableItemsEntityListUrl } from '../../sellableItemsApi.js';
import { mapTimciListRowsWithAuditFields } from '../../auditUserDisplay.js';
import { hydrateTimciRowsWithUserDirectory } from '../../userDisplayNameHydration.js';

async function mapHydrateTimciListRows<T>(rows: T[]): Promise<T[]> {
  const mapped = mapTimciListRowsWithAuditFields(rows);
  await hydrateTimciRowsWithUserDirectory(mapped as Record<string, unknown>[]);
  return mapped;
}

export type TimciListFetchInput = {
  resource: string;
  page: number;
  pageSize: number;
  sorters?: CrudSort[];
  filters?: CrudFilter[];
  meta?: Record<string, unknown>;
};

/**
 * Single HTTP list request — shared by DataProvider.getList and CSV export.
 */
function parseSessionTime(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

function normalizeSessionRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: String(row.id ?? ''),
    startedAt: parseSessionTime(row.startedAt),
    expiresAt: parseSessionTime(row.expiresAt),
    current: Boolean(row.current),
    userName: typeof row.userName === 'string' ? row.userName : undefined,
    isOwn: row.isOwn === true,
  };
}

function sessionSortValue(row: Record<string, unknown>, field: string): string | number | boolean {
  switch (field) {
    case 'startedAt':
    case 'expiresAt':
      return typeof row[field] === 'number' ? (row[field] as number) : 0;
    case 'current':
      return Boolean(row.current);
    case 'isOwn':
      return Boolean(row.isOwn);
    case 'userName':
      return String(row.userName ?? '').toLowerCase();
    case 'id':
      return String(row.id ?? '');
    default:
      return String(row[field] ?? '');
  }
}

function compareSessionRows(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  field: string,
  asc: boolean,
): number {
  const va = sessionSortValue(a, field);
  const vb = sessionSortValue(b, field);
  let cmp = 0;
  if (va < vb) cmp = -1;
  else if (va > vb) cmp = 1;
  return asc ? cmp : -cmp;
}

function sessionRowMatchesUserNameCriterion(
  row: Record<string, unknown>,
  operator: string,
  rawValue: string,
): boolean {
  const haystack = String(row.userName ?? '').toLowerCase();
  const needle = rawValue.trim().toLowerCase();
  if (needle === '') return true;
  switch (operator) {
    case 'eq':
      return haystack === needle;
    case 'contains':
      return haystack.includes(needle);
    case 'startsWith':
      return haystack.startsWith(needle);
    case 'endsWith':
      return haystack.endsWith(needle);
    default:
      return true;
  }
}

/** Sesiones: lista completa en una respuesta; filtros Refine se aplican en cliente. */
function applySessionListFilters(
  rows: Record<string, unknown>[],
  filters: CrudFilter[] | undefined,
): Record<string, unknown>[] {
  if (!filters?.length) return rows;
  let out = rows;
  for (const f of filters) {
    if (!isLogicalFilter(f) || f.field !== 'userName') continue;
    const crit = logicalFilterToTimciCriterion(f);
    if (!crit) continue;
    const op = String(crit.operator);
    const val = String(crit.value ?? '');
    out = out.filter((row) => sessionRowMatchesUserNameCriterion(row, op, val));
  }
  return out;
}

export async function fetchTimciListPage<TData extends BaseRecord = BaseRecord>(
  input: TimciListFetchInput,
): Promise<{ data: TData[]; total: number }> {
  if (input.resource === 'sellable_items') {
    const tenantId = getStoredTenantId();
    const entityId =
      (input.meta?.entityId as string | undefined) ?? (tenantId ?? undefined) ?? '';
    if (!tenantId || !entityId) {
      return { data: [], total: 0 };
    }
    const listBase = getSellableItemsEntityListUrl(tenantId, entityId);
    const filterObj = buildTimciFilter(input.filters);
    const qs = buildSortRangeParams({
      sorters: input.sorters,
      page: input.page,
      pageSize: input.pageSize,
      filterObj,
    });
    const { json, headers } = await timciFetch(`${listBase}?${qs.toString()}`);
    const data = await mapHydrateTimciListRows(Array.isArray(json) ? (json as TData[]) : []);
    const total = parseContentRangeTotal(headers) ?? data.length;
    return { data, total };
  }

  if (input.resource === 'price_lists') {
    const tenantId = getStoredTenantId();
    const entityId =
      (input.meta?.entityId as string | undefined) ?? (tenantId ?? undefined) ?? '';
    if (!tenantId || !entityId) {
      return { data: [], total: 0 };
    }
    const listBase = getPriceListsEntityListUrl(tenantId, entityId);
    const filterObj = buildTimciFilter(input.filters);
    const qs = buildSortRangeParams({
      sorters: input.sorters,
      page: input.page,
      pageSize: input.pageSize,
      filterObj,
    });
    const { json, headers } = await timciFetch(`${listBase}?${qs.toString()}`);
    const data = await mapHydrateTimciListRows(Array.isArray(json) ? (json as TData[]) : []);
    const total = parseContentRangeTotal(headers) ?? data.length;
    return { data, total };
  }

  if (input.resource === 'price_list_items') {
    const tenantId = getStoredTenantId();
    const priceListId = String(input.meta?.priceListId ?? '').trim();
    if (!tenantId || !priceListId) {
      return { data: [], total: 0 };
    }
    const filterObj = buildTimciFilter(input.filters) as Record<string, unknown>;
    delete filterObj.priceListId;
    const sellableFromMeta =
      typeof input.meta?.sellableItemId === 'string' ? input.meta.sellableItemId.trim() : '';
    if (sellableFromMeta) {
      filterObj.sellableItemId = { operator: 'eq', value: sellableFromMeta };
    }
    const listBase = getPriceListItemsListUrl(tenantId, priceListId);
    const qs = buildSortRangeParams({
      sorters: input.sorters,
      page: input.page,
      pageSize: input.pageSize,
      filterObj,
    });
    const { json, headers } = await timciFetch(`${listBase}?${qs.toString()}`);
    const data = await mapHydrateTimciListRows(Array.isArray(json) ? (json as TData[]) : []);
    const total = parseContentRangeTotal(headers) ?? data.length;
    return { data, total };
  }

  const base = getResourceApiBase(input.resource);
  if (!base) {
    throw toHttpError(
      400,
      'Select a tenant in the header for tenant-scoped resources.',
    );
  }

  if (input.resource === 'sessions') {
    const { json } = await timciFetch(base);
    const raw = Array.isArray((json as { sessions?: unknown }).sessions)
      ? (json as { sessions: Record<string, unknown>[] }).sessions
      : [];
    const normalized = raw.map((r) => normalizeSessionRow(r)) as TData[];
    const filtered = applySessionListFilters(
      normalized as Record<string, unknown>[],
      input.filters,
    ) as TData[];
    const sortField =
      input.sorters?.[0]?.field != null ? String(input.sorters[0].field) : 'startedAt';
    const asc =
      input.sorters?.[0]?.order != null
        ? String(input.sorters[0].order).toLowerCase() === 'asc'
        : false;
    filtered.sort((a, b) =>
      compareSessionRows(a as Record<string, unknown>, b as Record<string, unknown>, sortField, asc),
    );
    const total = filtered.length;
    const start = (input.page - 1) * input.pageSize;
    const data = filtered.slice(start, start + input.pageSize);
    return { data, total };
  }

  const filterObj = buildTimciFilter(input.filters);
  const extra: Record<string, string> = {};

  if (input.resource === 'tenants') {
    const inc = filterObj.includeInactive as { operator?: string; value?: unknown } | undefined;
    delete filterObj.includeInactive;
    const on =
      inc &&
      (inc.value === true || inc.value === 'true') &&
      (inc.operator === 'eq' || inc.operator === undefined);
    if (on) extra.includeInactive = 'true';
  }

  if (
    input.meta &&
    typeof input.meta === 'object' &&
    'includeInactive' in input.meta &&
    input.meta.includeInactive === true
  ) {
    extra.includeInactive = 'true';
  }

  if (input.resource === 'tenants' && !('includeInactive' in extra)) {
    extra.includeInactive = 'true';
  }

  const qs = buildSortRangeParams({
    sorters: input.sorters,
    page: input.page,
    pageSize: input.pageSize,
    filterObj,
    extraQuery: Object.keys(extra).length ? extra : undefined,
  });

  const { json, headers } = await timciFetch(`${base}?${qs.toString()}`);
  const data = await mapHydrateTimciListRows(Array.isArray(json) ? (json as TData[]) : []);
  const total = parseContentRangeTotal(headers) ?? data.length;

  return { data, total };
}
