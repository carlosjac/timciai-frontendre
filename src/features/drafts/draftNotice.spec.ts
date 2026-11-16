import { describe, expect, it } from 'vitest';
import { draftNoticeMessage, type DraftNoticeItem } from './draftNotice.js';

function item(partial: Pick<DraftNoticeItem, 'resource' | 'count' | 'noun'>): DraftNoticeItem {
  return { path: `/${partial.resource}`, ...partial };
}

describe('draftNoticeMessage', () => {
  it('names the only list, in singular or plural', () => {
    expect(draftNoticeMessage([item({ resource: 'sales', count: 1, noun: 'venta' })])).toBe(
      'Hay 1 venta en borrador.',
    );
    expect(draftNoticeMessage([item({ resource: 'sales', count: 2, noun: 'ventas' })])).toBe(
      'Hay 2 ventas en borrador.',
    );
  });

  it('lists every list that has drafts, in menu order, with y before the last', () => {
    expect(
      draftNoticeMessage([
        item({ resource: 'sales', count: 2, noun: 'ventas' }),
        item({ resource: 'collections', count: 1, noun: 'cobro' }),
        item({ resource: 'subscriptions', count: 1, noun: 'abono' }),
      ]),
    ).toBe('Hay borradores sin registrar: 2 ventas, 1 cobro y 1 abono.');
  });

  it('skips lists with no drafts', () => {
    expect(
      draftNoticeMessage([
        item({ resource: 'sales', count: 0, noun: 'ventas' }),
        item({ resource: 'subscriptions', count: 3, noun: 'abonos' }),
      ]),
    ).toBe('Hay 3 abonos en borrador.');
  });
});
