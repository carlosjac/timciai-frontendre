import { describe, expect, it } from 'vitest';
import { buildEntityUpdateBody } from './entitiesApi.js';

describe('buildEntityUpdateBody', () => {
  it('includes supportedCurrencyIds when the form sends them', () => {
    const usd = '01933a1b-2c3d-7001-8a0b-1c2d3e4f5a6b';
    const eur = '01933a1b-2c3d-7009-8a0b-1c2d3e4f5a6b';
    const body = buildEntityUpdateBody({
      address: 'Street 1',
      supportedCurrencyIds: [usd, eur, ''],
    });

    expect(body.supportedCurrencyIds).toEqual([usd, eur]);
    expect(body.address).toBe('Street 1');
  });

  it('omits supportedCurrencyIds when the field is not in the payload', () => {
    const body = buildEntityUpdateBody({ address: 'Street 1' });

    expect(body).not.toHaveProperty('supportedCurrencyIds');
  });
});
