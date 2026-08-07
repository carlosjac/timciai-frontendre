import { describe, expect, it } from 'vitest';
import { validateRelativeBandsCoverageForForm } from './relativeBandsCoverage.js';

describe('validateRelativeBandsCoverageForForm', () => {
  it('requires at least one band', () => {
    expect(validateRelativeBandsCoverageForForm([])).toEqual([{ code: 'bandsRequired' }]);
    expect(validateRelativeBandsCoverageForForm(null)).toEqual([{ code: 'bandsRequired' }]);
  });

  it('accepts open-ended coverage without gaps', () => {
    expect(
      validateRelativeBandsCoverageForForm([
        { from: null, to: 10 },
        { from: 11, to: 'eom' },
        { from: 'start_next_month', to: null },
      ]),
    ).toEqual([]);
  });

  it('flags missing open ends and gaps', () => {
    const errors = validateRelativeBandsCoverageForForm([
      { from: 1, to: 5 },
      { from: 10, to: 20 },
    ]);
    expect(errors.map((e) => e.code)).toEqual(
      expect.arrayContaining(['openFromRequired', 'openToRequired', 'overlapOrGap']),
    );
  });
});
