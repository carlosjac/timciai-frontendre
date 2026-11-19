import { describe, expect, it } from 'vitest';
import { preferredAccountCurrency } from './useCustomerAccountCurrencyParam.js';

const accounts = [{ currencyId: 'usd' }, { currencyId: 'ars' }];

describe('preferredAccountCurrency', () => {
  it('keeps the currency already chosen', () => {
    expect(preferredAccountCurrency(accounts, 'ars', 'usd')).toBe('usd');
  });

  it('selects the customer default when that account exists', () => {
    expect(preferredAccountCurrency(accounts, 'ars', undefined)).toBe('ars');
  });

  it('uses the only account when the default has no account yet', () => {
    expect(preferredAccountCurrency([{ currencyId: 'usd' }], 'ars', undefined)).toBe('usd');
  });

  it('leaves the selector empty when the default is not among several accounts', () => {
    expect(preferredAccountCurrency(accounts, 'eur', undefined)).toBeUndefined();
  });
});
