import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  lineBillingPreview,
  lineExtrasDiffer,
  normalizeSubscriptionLines,
  subscriptionAnchorInMonth,
} from './subscriptionLineSchedule.js';

describe('subscriptionLineSchedule', () => {
  it('uses the subscription day for the chosen month and rejects other months', () => {
    expect(
      subscriptionAnchorInMonth('2026-01-01', 1, '2026-12-31', dayjs('2026-02-01')),
    ).toBe('2026-02-01');
    expect(
      subscriptionAnchorInMonth('2026-01-01', 2, null, dayjs('2026-02-01')),
    ).toBeNull();
    expect(
      subscriptionAnchorInMonth('2026-01-31', 1, null, dayjs('2026-02-01')),
    ).toBe('2026-02-28');
  });

  it('lists the anchors inside the line and marks an open end', () => {
    const closed = lineBillingPreview({
      startsOn: '2026-01-01',
      intervalMonths: 1,
      endsOn: '2026-03-31',
      lineStartsOn: '2026-02-01',
      lineEndsOn: '2026-03-01',
    });
    expect(closed).toEqual({ dates: ['2026-02-01', '2026-03-01'], continues: false });

    const open = lineBillingPreview({
      startsOn: '2026-01-01',
      intervalMonths: 1,
      endsOn: null,
      lineStartsOn: null,
      lineEndsOn: null,
    });
    expect(open.dates).toHaveLength(12);
    expect(open.continues).toBe(true);
  });

  it('treats empty options as the defaults and sends null dates', () => {
    expect(lineExtrasDiffer({ discountPercent: '0', includePeriod: true })).toBe(false);
    expect(lineExtrasDiffer({ includePeriod: false })).toBe(true);
    expect(
      normalizeSubscriptionLines([
        { sellableItemId: 'item', quantity: 1, description: '  ', discountPercent: '' },
      ]),
    ).toEqual([
      {
        sellableItemId: 'item',
        quantity: '1',
        description: null,
        discountPercent: '0',
        startsOn: null,
        endsOn: null,
        includeSellableItemName: true,
        includeDescription: true,
        includePeriod: true,
      },
    ]);
  });
});