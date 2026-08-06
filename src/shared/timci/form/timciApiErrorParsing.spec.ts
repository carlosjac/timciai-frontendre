import { describe, expect, it } from 'vitest';
import {
  parseTimciHttpError,
  timciErrorSourceToFieldName,
} from './timciApiErrorParsing.js';

describe('timciErrorSourceToFieldName', () => {
  it('maps body/field and dotted sources to form names', () => {
    expect(timciErrorSourceToFieldName('body/currentPassword')).toBe('currentPassword');
    expect(timciErrorSourceToFieldName('entity.name')).toBe('name');
    expect(timciErrorSourceToFieldName('email')).toBe('email');
  });

  it('returns null for general sources', () => {
    expect(timciErrorSourceToFieldName('*')).toBeNull();
    expect(timciErrorSourceToFieldName('')).toBeNull();
    expect(timciErrorSourceToFieldName(null)).toBeNull();
  });
});

describe('parseTimciHttpError', () => {
  it('extracts items from HttpError.errors body', () => {
    const err = Object.assign(new Error('Request failed'), {
      errors: {
        message: 'Validation failed',
        errors: [{ message: 'Required', source: 'body/name', code: 'required' }],
      },
    });
    const parsed = parseTimciHttpError(err);
    expect(parsed.topLevelMessage).toBe('Validation failed');
    expect(parsed.items).toEqual([
      { message: 'Required', source: 'body/name', code: 'required' },
    ]);
    expect(parsed.fallbackMessage).toBe('Request failed');
  });

  it('handles non-objects', () => {
    expect(parseTimciHttpError('boom')).toEqual({
      items: [],
      fallbackMessage: 'Error',
    });
  });
});
