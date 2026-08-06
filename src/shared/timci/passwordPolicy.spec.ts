import { describe, expect, it } from 'vitest';
import { isTimciPasswordPolicyValid } from './passwordPolicy.js';

describe('isTimciPasswordPolicyValid', () => {
  it('accepts strong passwords', () => {
    expect(isTimciPasswordPolicyValid('Abcdef1!')).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(isTimciPasswordPolicyValid('short1!')).toBe(false);
    expect(isTimciPasswordPolicyValid('alllowercase1!')).toBe(false);
    expect(isTimciPasswordPolicyValid('ALLUPPERCASE1!')).toBe(false);
    expect(isTimciPasswordPolicyValid('NoDigits!!')).toBe(false);
    expect(isTimciPasswordPolicyValid('NoSpecial1')).toBe(false);
  });
});
