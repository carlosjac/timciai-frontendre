import { describe, expect, it } from 'vitest';
import {
  normalizeMonetaryPolicyParams,
  validateNormalizedRelativeBandsParams,
} from './monetaryPolicyParamsForm.js';

describe('validateNormalizedRelativeBandsParams', () => {
  it('rejects incomplete coverage like sale-40 snapshot', () => {
    const issues = validateNormalizedRelativeBandsParams({
      anchor: 'document_date',
      bands: [
        {
          from: 6,
          to: null,
          unit: 'days',
          effect: 'surcharge',
          chargeMode: 'daily_rate',
          rate: '0.01',
        },
      ],
    });
    expect(issues.map((i) => i.code)).toContain('openFromRequired');
  });

  it('accepts full open coverage with daily surcharge', () => {
    const normalized = normalizeMonetaryPolicyParams('relative_bands', {
      anchor: 'document_date',
      unit: 'days',
      bands: [
        {
          fromMode: 'open',
          fromValue: null,
          toMode: 'number',
          toValue: 0,
          effect: 'none',
          chargeMode: 'flat_percent',
        },
        {
          fromMode: 'number',
          fromValue: 1,
          toMode: 'open',
          toValue: null,
          effect: 'surcharge',
          chargeMode: 'daily_rate',
          ratePercent: 1,
        },
      ],
    });
    expect(validateNormalizedRelativeBandsParams(normalized)).toEqual([]);
  });
});
