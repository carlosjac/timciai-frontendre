import { describe, expect, it } from 'vitest';
import {
  encodeTimciPathSegment,
  isTimciIdSegment,
  requireTimciPathSegment,
} from './pathSegment.js';

const UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

describe('isTimciIdSegment', () => {
  it('accepts UUID shape', () => {
    expect(isTimciIdSegment(UUID)).toBe(true);
    expect(isTimciIdSegment(` ${UUID} `)).toBe(true);
  });

  it('rejects empty, traversal, and non-UUID', () => {
    expect(isTimciIdSegment(null)).toBe(false);
    expect(isTimciIdSegment('')).toBe(false);
    expect(isTimciIdSegment('../x')).toBe(false);
    expect(isTimciIdSegment('a/b')).toBe(false);
    expect(isTimciIdSegment('not-a-uuid')).toBe(false);
  });
});

describe('requireTimciPathSegment', () => {
  it('returns encoded segment for valid id', () => {
    expect(requireTimciPathSegment(UUID)).toBe(encodeTimciPathSegment(UUID));
  });

  it('throws for invalid id', () => {
    expect(() => requireTimciPathSegment('../x')).toThrow(/Invalid Timci resource id/);
    expect(() => requireTimciPathSegment(null)).toThrow(/Invalid Timci resource id/);
  });
});
