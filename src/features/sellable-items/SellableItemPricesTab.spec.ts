import { describe, expect, it } from 'vitest';
import { solePriceListId } from './SellableItemPricesTab.js';

describe('solePriceListId', () => {
  it('returns the only price list of the entity', () => {
    expect(solePriceListId(1, [{ id: 'list-1' }], false)).toBe('list-1');
  });

  it('does not pick a list when the entity has more than one', () => {
    expect(solePriceListId(2, [{ id: 'list-1' }], false)).toBeNull();
  });

  it('does not treat a one-row search page as the only list', () => {
    expect(solePriceListId(1, [{ id: 'list-1' }], true)).toBeNull();
  });
});
