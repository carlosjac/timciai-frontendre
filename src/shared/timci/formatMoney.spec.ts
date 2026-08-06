import { describe, expect, it } from 'vitest';
import { formatTimciMoney, formatTimciMoneyOrEmpty } from './formatMoney.js';

describe('formatTimciMoney', () => {
  it('formats with exactly 2 decimals (half-up)', () => {
    expect(formatTimciMoney(10)).toBe('10.00');
    expect(formatTimciMoney(10.5)).toBe('10.50');
    expect(formatTimciMoney(10.556)).toBe('10.56');
    expect(formatTimciMoney('1,25')).toBe('1.25');
  });

  it('returns em dash for empty/invalid', () => {
    expect(formatTimciMoney(null)).toBe('—');
    expect(formatTimciMoney('')).toBe('—');
    expect(formatTimciMoney('abc')).toBe('—');
  });
});

describe('formatTimciMoneyOrEmpty', () => {
  it('returns empty string for empty/invalid', () => {
    expect(formatTimciMoneyOrEmpty(null)).toBe('');
    expect(formatTimciMoneyOrEmpty(undefined)).toBe('');
  });

  it('formats valid amounts', () => {
    expect(formatTimciMoneyOrEmpty(3.1)).toBe('3.10');
  });
});
