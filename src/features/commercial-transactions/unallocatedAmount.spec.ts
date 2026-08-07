import { describe, expect, it } from 'vitest';
import { unallocatedAmount, unallocatedRemainderKind } from './unallocatedAmount.js';

describe('unallocatedRemainderKind', () => {
  it('only applies to collection/credit', () => {
    expect(unallocatedRemainderKind({ type: 'sale', unallocatedAmount: 1 })).toBeNull();
    expect(unallocatedRemainderKind({ type: 'collection', unallocatedAmount: null })).toBeNull();
  });

  it('maps remanente', () => {
    expect(unallocatedRemainderKind({ type: 'collection', unallocatedAmount: 0 })).toBe('allocated');
    expect(unallocatedRemainderKind({ type: 'credit', unallocatedAmount: '5' })).toBe('unallocated');
  });
});

describe('unallocatedAmount', () => {
  it('prefers API field when present', () => {
    expect(
      unallocatedAmount({
        type: 'collection',
        amount: '100',
        unallocatedAmount: '12.50',
        allocations: [{ amount: '100' }],
      }),
    ).toBe('12.50');
  });

  it('computes amount − allocations when API field missing', () => {
    expect(
      unallocatedAmount({
        type: 'credit',
        amount: '100',
        allocations: [{ amount: '40' }, { amount: '10' }],
      }),
    ).toBe('50');
  });

  it('clamps remanente at zero', () => {
    expect(
      unallocatedAmount({
        type: 'collection',
        amount: '10',
        allocations: [{ amount: '40' }],
      }),
    ).toBe('0');
  });

  it('for non collection/credit only returns API field if set', () => {
    expect(unallocatedAmount({ type: 'sale', amount: '10' })).toBeNull();
    expect(unallocatedAmount({ type: 'sale', unallocatedAmount: '1' })).toBe('1');
  });
});
