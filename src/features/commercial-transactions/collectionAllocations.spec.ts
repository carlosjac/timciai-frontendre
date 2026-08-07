import { describe, expect, it } from 'vitest';
import {
  buildFifoAllocations,
  cashAllocatedToNominal,
  cashDisplayForCollectionAllocation,
  cashDisplayForStoredAllocation,
  nominalAllocatedToCash,
  parsePositiveAmount,
  type AllocationCandidateRow,
} from './collectionAllocations.js';

const candidates = (rows: AllocationCandidateRow[]) => rows;

describe('buildFifoAllocations', () => {
  it('returns empty when collection amount is not positive', () => {
    expect(buildFifoAllocations(0, [{ id: 'a', openAmount: '10', settlementAmount: '10' }])).toEqual(
      [],
    );
    expect(buildFifoAllocations(-5, [{ id: 'a', openAmount: '10', settlementAmount: '10' }])).toEqual(
      [],
    );
  });

  it('skips candidates with open or settlement <= 0', () => {
    expect(
      buildFifoAllocations(
        100,
        candidates([
          { id: 'zero', openAmount: '0', settlementAmount: '10' },
          { id: 'neg-settle', openAmount: '10', settlementAmount: '0' },
          { id: 'ok', openAmount: '40', settlementAmount: '40' },
        ]),
      ),
    ).toEqual([{ targetTransactionId: 'ok', amount: '40.00' }]);
  });

  it('partial take is 1:1 even when settlement differs from open', () => {
    const out = buildFifoAllocations(
      50,
      candidates([{ id: 'a', openAmount: '100', settlementAmount: '90' }]),
    );
    expect(out).toEqual([{ targetTransactionId: 'a', amount: '50.00' }]);
  });

  it('closing take uses settlement ratio', () => {
    const out = buildFifoAllocations(
      90,
      candidates([{ id: 'a', openAmount: '100', settlementAmount: '90' }]),
    );
    expect(out).toEqual([{ targetTransactionId: 'a', amount: '100.00' }]);
  });

  it('allocates FIFO: full close then partial 1:1', () => {
    const out = buildFifoAllocations(
      150,
      candidates([
        { id: 'first', openAmount: '100', settlementAmount: '100' },
        { id: 'second', openAmount: '100', settlementAmount: '90' },
      ]),
    );
    expect(out).toEqual([
      { targetTransactionId: 'first', amount: '100.00' },
      // remaining cash 50 < settlement 90 → partial 1:1
      { targetTransactionId: 'second', amount: '50.00' },
    ]);
  });

  it('uses amount when openAmount missing', () => {
    expect(
      buildFifoAllocations(30, candidates([{ id: 'a', amount: '50', settlementAmount: '50' }])),
    ).toEqual([{ targetTransactionId: 'a', amount: '30.00' }]);
  });
});

describe('parsePositiveAmount', () => {
  it('returns formatted positive amounts', () => {
    expect(parsePositiveAmount('1,5')).toBe('1.50');
    expect(parsePositiveAmount(2)).toBe('2.00');
  });

  it('returns null for empty or non-positive', () => {
    expect(parsePositiveAmount('')).toBeNull();
    expect(parsePositiveAmount(0)).toBeNull();
    expect(parsePositiveAmount(-1)).toBeNull();
    expect(parsePositiveAmount('abc')).toBeNull();
  });
});

describe('nominalAllocatedToCash / cashAllocatedToNominal', () => {
  it('round-trips on close with discount (open 181500 → settle 163350)', () => {
    const open = 181500;
    const settlement = 163350;
    const cash = nominalAllocatedToCash({
      nominalAllocated: open,
      openAmount: open,
      settlementAmount: settlement,
    });
    expect(cash).toBe(163350);
    expect(
      cashAllocatedToNominal({
        cashAllocated: cash,
        openAmount: open,
        settlementAmount: settlement,
      }),
    ).toBe(181500);
  });

  it('partial is 1:1 even when settlement differs from open', () => {
    expect(
      nominalAllocatedToCash({
        nominalAllocated: 40,
        openAmount: 100,
        settlementAmount: 90,
      }),
    ).toBe(40);
    expect(
      cashAllocatedToNominal({
        cashAllocated: 40,
        openAmount: 100,
        settlementAmount: 90,
      }),
    ).toBe(40);
  });

  it('is identity when settlement equals open', () => {
    expect(
      nominalAllocatedToCash({
        nominalAllocated: 40,
        openAmount: 100,
        settlementAmount: 100,
      }),
    ).toBe(40);
    expect(
      cashAllocatedToNominal({
        cashAllocated: 40,
        openAmount: 100,
        settlementAmount: 100,
      }),
    ).toBe(40);
  });
});

describe('cashDisplayForCollectionAllocation', () => {
  it('converts draft full nominal to settlement cash on close', () => {
    expect(
      cashDisplayForCollectionAllocation({
        storedAmount: 181500,
        openAmount: 181500,
        settlementAmount: 163350,
        isDraft: true,
      }),
    ).toBe(163350);
  });

  it('keeps registered settlement amount as-is', () => {
    expect(
      cashDisplayForCollectionAllocation({
        storedAmount: 163350,
        openAmount: 0,
        settlementAmount: 0,
        isDraft: false,
      }),
    ).toBe(163350);
  });
});

describe('cashDisplayForStoredAllocation', () => {
  it('returns stored when convert is false', () => {
    expect(
      cashDisplayForStoredAllocation({
        storedAmount: 181500,
        openAmount: 181500,
        settlementAmount: 163350,
        convertNominalToCash: false,
      }),
    ).toBe(181500);
  });

  it('keeps stored when open/settlement missing', () => {
    expect(
      cashDisplayForStoredAllocation({
        storedAmount: 181500,
        openAmount: 0,
        settlementAmount: 0,
        convertNominalToCash: true,
      }),
    ).toBe(181500);
  });
});
