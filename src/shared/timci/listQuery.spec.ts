import { describe, expect, it } from 'vitest';
import {
  buildSortRangeParams,
  buildTimciFilter,
  parseContentRangeTotal,
  timciLogicalFilter,
} from './listQuery.js';

describe('buildTimciFilter', () => {
  it('maps logical filters to Timci criteria', () => {
    expect(
      buildTimciFilter([
        timciLogicalFilter('name', 'contains', 'acme'),
        timciLogicalFilter('amount', 'between', [1, 10]),
        timciLogicalFilter('empty', 'eq', ''),
      ]),
    ).toEqual({
      name: { operator: 'contains', value: 'acme' },
      amount: { operator: 'between', value: 1, value2: 10 },
    });
  });

  it('returns empty object for no filters', () => {
    expect(buildTimciFilter(undefined)).toEqual({});
    expect(buildTimciFilter([])).toEqual({});
  });
});

describe('buildSortRangeParams', () => {
  it('builds sort, range, and filter query', () => {
    const q = buildSortRangeParams({
      sorters: [{ field: 'code', order: 'desc' }],
      page: 2,
      pageSize: 10,
      filterObj: { name: { operator: 'eq', value: 'x' } },
      extraQuery: { includeInactive: 'true' },
    });
    expect(q.get('sort')).toBe(JSON.stringify(['code', 'DESC']));
    expect(q.get('range')).toBe(JSON.stringify([10, 19]));
    expect(q.get('filter')).toBe(JSON.stringify({ name: { operator: 'eq', value: 'x' } }));
    expect(q.get('includeInactive')).toBe('true');
  });
});

describe('parseContentRangeTotal', () => {
  it('parses total from Content-Range', () => {
    const headers = new Headers({ 'Content-Range': 'items 0-9/42' });
    expect(parseContentRangeTotal(headers)).toBe(42);
  });

  it('returns undefined when missing', () => {
    expect(parseContentRangeTotal(new Headers())).toBeUndefined();
  });
});
