import { describe, expect, it } from 'vitest';
import {
  customerDefaultsPatchFromEntity,
  overduePoliciesForEntity,
} from './customerEntityDefaults.js';

const entity = {
  defaultCountryId: 'country-ar',
  defaultCurrencyId: 'currency-ars',
  defaultMonetaryPolicyId: 'policy-1',
  defaultOverdueNotificationPolicyKey: 'notify_mondays',
  defaultPaymentTermDays: 15,
  availableOverduePolicyKeys: ['notify_mondays', 'notify_daily'],
};

describe('customerDefaultsPatchFromEntity', () => {
  it('fills every empty customer default from the entity', () => {
    expect(customerDefaultsPatchFromEntity(entity, {})).toEqual({
      countryId: 'country-ar',
      defaultCurrencyId: 'currency-ars',
      defaultMonetaryPolicyId: 'policy-1',
      defaultOverdueNotificationPolicyKey: 'notify_mondays',
      defaultPaymentTermDays: 15,
    });
  });

  it('keeps a value the user already chose, including a term of zero', () => {
    expect(
      customerDefaultsPatchFromEntity(entity, {
        countryId: 'country-uy',
        defaultCurrencyId: 'currency-usd',
        defaultMonetaryPolicyId: 'policy-2',
        defaultOverdueNotificationPolicyKey: 'notify_daily',
        defaultPaymentTermDays: 0,
      }),
    ).toEqual({});
  });

  it('reads a numeric term stored as text', () => {
    expect(
      customerDefaultsPatchFromEntity(
        { defaultPaymentTermDays: '7' },
        { defaultPaymentTermDays: '' },
      ),
    ).toEqual({ defaultPaymentTermDays: 7 });
  });
});

describe('overduePoliciesForEntity', () => {
  const catalog = [
    { key: 'notify_mondays' },
    { key: 'notify_daily' },
    { key: 'notify_never' },
  ];

  it('keeps only the policies the entity makes available', () => {
    expect(overduePoliciesForEntity(catalog, entity.availableOverduePolicyKeys)).toEqual([
      { key: 'notify_mondays' },
      { key: 'notify_daily' },
    ]);
  });

  it('keeps the full catalog when the entity has no available list', () => {
    expect(overduePoliciesForEntity(catalog, [])).toEqual(catalog);
  });
});
