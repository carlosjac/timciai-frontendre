import { describe, expect, it } from 'vitest';
import { sanitizeLoginReturnTo } from './safeLoginReturnTo.js';

describe('sanitizeLoginReturnTo', () => {
  it('returns null for empty / nullish', () => {
    expect(sanitizeLoginReturnTo(null)).toBeNull();
    expect(sanitizeLoginReturnTo(undefined)).toBeNull();
    expect(sanitizeLoginReturnTo('')).toBeNull();
    expect(sanitizeLoginReturnTo('   ')).toBeNull();
  });

  it('accepts same-origin relative paths with query', () => {
    expect(sanitizeLoginReturnTo('/rate-snapshots?pageSize=10')).toBe(
      '/rate-snapshots?pageSize=10',
    );
    expect(sanitizeLoginReturnTo('/countries')).toBe('/countries');
  });

  it('rejects protocol-relative and schemed URLs', () => {
    expect(sanitizeLoginReturnTo('//evil.example')).toBeNull();
    expect(sanitizeLoginReturnTo('https://evil.example')).toBeNull();
    expect(sanitizeLoginReturnTo('javascript:alert(1)')).toBeNull();
  });

  it('rejects C0 / open-redirect tricks after decode', () => {
    expect(sanitizeLoginReturnTo('/%09//evil.example')).toBeNull();
    expect(sanitizeLoginReturnTo('/%0d//evil.example')).toBeNull();
    expect(sanitizeLoginReturnTo('/%0a//evil.example')).toBeNull();
    expect(sanitizeLoginReturnTo('/\\evil')).toBeNull();
  });

  it('rejects paths that URL() would resolve off-origin', () => {
    expect(sanitizeLoginReturnTo('/..//evil.example')).toBeNull();
  });
});
