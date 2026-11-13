import { describe, expect, it } from 'vitest';
import {
  installedApiVersionUrl,
  normalizeRevision,
  readVersionRevision,
  shortRevision,
} from './installedRevision.js';

describe('installedRevision', () => {
  it('uses dev when the baked revision is empty', () => {
    expect(normalizeRevision(undefined)).toBe('dev');
    expect(normalizeRevision('  ')).toBe('dev');
  });

  it('keeps a configured revision and shortens it to 7 characters', () => {
    expect(normalizeRevision(' abc123def456 ')).toBe('abc123def456');
    expect(shortRevision('abc123def456')).toBe('abc123d');
    expect(shortRevision('dev')).toBe('dev');
  });

  it('points at /version on the API origin', () => {
    expect(installedApiVersionUrl(undefined)).toBe('/version');
    expect(installedApiVersionUrl(' http://127.0.0.1:3000/ ')).toBe('http://127.0.0.1:3000/version');
  });

  it('reads the revision field from the API payload', () => {
    expect(readVersionRevision({ service: 'timci-api', revision: ' abc ' })).toBe('abc');
    expect(readVersionRevision({ revision: '  ' })).toBeNull();
    expect(readVersionRevision(null)).toBeNull();
    expect(readVersionRevision({ revision: 1 })).toBeNull();
  });
});
