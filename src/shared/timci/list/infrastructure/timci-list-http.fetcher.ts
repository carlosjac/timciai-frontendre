import type { BaseRecord, CrudFilter, CrudSort } from '@refinedev/core';
import { getResourceApiBase } from '../../apiUrl.js';
import { buildSortRangeParams, buildTimciFilter, parseContentRangeTotal } from '../../listQuery.js';
import { timciFetch, toHttpError } from '../../http.js';

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
export async function fetchTimciListPage<TData extends BaseRecord = BaseRecord>(
  input: TimciListFetchInput,
): Promise<{ data: TData[]; total: number }> {
  const base = getResourceApiBase(input.resource);
  if (!base) {
    throw toHttpError(
      400,
      'Select a tenant in the header for tenant-scoped resources.',
    );
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
  const data = Array.isArray(json) ? (json as TData[]) : [];
  const total = parseContentRangeTotal(headers) ?? data.length;

  return { data, total };
}
