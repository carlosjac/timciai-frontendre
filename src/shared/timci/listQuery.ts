import type { CrudFilter, CrudSort, LogicalFilter } from '@refinedev/core';

export function isLogicalFilter(f: CrudFilter): f is LogicalFilter {
  if (!f || typeof f !== 'object' || !('field' in f) || !('operator' in f)) return false;
  const op = String((f as { operator: string }).operator);
  if (op === 'or' || op === 'and') return false;
  return true;
}

/** Build a logical filter Refine accepts at runtime (operators may exceed CrudOperators for dates). */
export function timciLogicalFilter(field: string, operator: string, value: unknown): LogicalFilter {
  return { field, operator: operator as LogicalFilter['operator'], value } as LogicalFilter;
}

function refineAliasToTimciOperator(op: string): string {
  if (op === 'startswith') return 'startsWith';
  if (op === 'endswith') return 'endsWith';
  return op;
}

/**
 * One logical filter → Timci criterion object, or null if empty / invalid.
 */
export function logicalFilterToTimciCriterion(f: LogicalFilter): Record<string, unknown> | null {
  const opRaw = String(f.operator);
  const op = refineAliasToTimciOperator(opRaw);
  const v = f.value;

  if (op === 'between') {
    if (Array.isArray(v) && v.length === 2) {
      return { operator: 'between', value: v[0], value2: v[1] };
    }
    return null;
  }

  if (v === '' || v === undefined || v === null) return null;
  return { operator: op, value: v };
}

/**
 * Maps Refine table filters to Timci JSON filter object per field.
 */
export function buildTimciFilter(filters: CrudFilter[] | undefined): Record<string, unknown> {
  if (!filters?.length) return {};
  const out: Record<string, unknown> = {};
  for (const f of filters) {
    if (!isLogicalFilter(f)) continue;
    const crit = logicalFilterToTimciCriterion(f);
    if (crit) out[f.field] = crit;
  }
  return out;
}

export function buildSortRangeParams(options: {
  sorters: CrudSort[] | undefined;
  page: number;
  pageSize: number;
  filterObj: Record<string, unknown>;
  /** Extra query entries (e.g. includeInactive for tenants). */
  extraQuery?: Record<string, string>;
}): URLSearchParams {
  const sortField = options.sorters?.[0]?.field ?? 'name';
  const sortOrder = (options.sorters?.[0]?.order ?? 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  const start = (options.page - 1) * options.pageSize;
  const end = start + options.pageSize - 1;

  const q = new URLSearchParams({
    sort: JSON.stringify([sortField, sortOrder]),
    range: JSON.stringify([start, end]),
  });

  if (Object.keys(options.filterObj).length > 0) {
    q.set('filter', JSON.stringify(options.filterObj));
  }

  if (options.extraQuery) {
    for (const [k, v] of Object.entries(options.extraQuery)) {
      q.set(k, v);
    }
  }

  return q;
}

export function parseContentRangeTotal(headers: Headers): number | undefined {
  const header = headers.get('Content-Range') ?? '';
  const m = header.match(/\/(\d+)\s*$/);
  if (m) return parseInt(m[1], 10);
  return undefined;
}
