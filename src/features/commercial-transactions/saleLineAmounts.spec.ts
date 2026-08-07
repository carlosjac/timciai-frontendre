import { describe, expect, it } from 'vitest';
import { computeSaleItemsTotal, computeSaleLineAmounts } from './saleLineAmounts.js';

describe('computeSaleLineAmounts', () => {
  it('computes discount and subtotal', () => {
    expect(
      computeSaleLineAmounts({ quantity: 2, unitPriceAmount: 10, discountPercent: 10 }),
    ).toEqual({ discountAmount: '2.00', subtotal: '18.00' });
  });

  it('returns null for missing or invalid inputs', () => {
    expect(computeSaleLineAmounts({ quantity: 1 })).toBeNull();
    expect(
      computeSaleLineAmounts({ quantity: -1, unitPriceAmount: 10, discountPercent: 0 }),
    ).toBeNull();
    expect(
      computeSaleLineAmounts({ quantity: 1, unitPriceAmount: 10, discountPercent: 101 }),
    ).toBeNull();
  });
});

describe('computeSaleItemsTotal', () => {
  it('sums valid line subtotals', () => {
    expect(
      computeSaleItemsTotal([
        { quantity: 1, unitPriceAmount: 10, discountPercent: 0 },
        { quantity: 2, unitPriceAmount: 5, discountPercent: 0 },
      ]),
    ).toBe('20.00');
  });

  it('returns empty for no items or all invalid', () => {
    expect(computeSaleItemsTotal([])).toBe('');
    expect(computeSaleItemsTotal(null)).toBe('');
    expect(computeSaleItemsTotal([{ quantity: 'x', unitPriceAmount: 1 }])).toBe('');
  });
});
