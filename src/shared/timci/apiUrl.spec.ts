import { beforeEach, describe, expect, it } from 'vitest';
import { LEGACY_TENANT_STORAGE_KEY, TENANT_STORAGE_KEY } from '../../config.js';
import { installMemoryLocalStorage } from '../../test/memoryLocalStorage.js';
import { getResourceApiBase, getStoredTenantId, setStoredTenantId } from './apiUrl.js';

const TENANT = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

describe('apiUrl tenant storage', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it('returns null when empty', () => {
    expect(getStoredTenantId()).toBeNull();
  });

  it('set/get valid tenant id', () => {
    setStoredTenantId(TENANT);
    expect(getStoredTenantId()).toBe(TENANT);
  });

  it('clears storage on invalid set', () => {
    setStoredTenantId(TENANT);
    setStoredTenantId('../bad');
    expect(getStoredTenantId()).toBeNull();
    expect(localStorage.getItem(TENANT_STORAGE_KEY)).toBeNull();
  });

  it('migrates legacy key and clears invalid legacy', () => {
    localStorage.setItem(LEGACY_TENANT_STORAGE_KEY, TENANT);
    expect(getStoredTenantId()).toBe(TENANT);
    expect(localStorage.getItem(TENANT_STORAGE_KEY)).toBe(TENANT);
    expect(localStorage.getItem(LEGACY_TENANT_STORAGE_KEY)).toBeNull();

    localStorage.clear();
    localStorage.setItem(LEGACY_TENANT_STORAGE_KEY, 'not-uuid');
    expect(getStoredTenantId()).toBeNull();
  });

  it('clears invalid current key', () => {
    localStorage.setItem(TENANT_STORAGE_KEY, 'nope');
    expect(getStoredTenantId()).toBeNull();
  });
});

describe('getResourceApiBase', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it('returns global paths without tenant', () => {
    expect(getResourceApiBase('users')).toBe('http://127.0.0.1/v1/authentication/users');
    expect(getResourceApiBase('sessions')).toBe('http://127.0.0.1/v1/auth/sessions');
  });

  it('returns null for tenant resources without tenant', () => {
    expect(getResourceApiBase('countries')).toBeNull();
  });

  it('returns tenant-scoped path when tenant set', () => {
    setStoredTenantId(TENANT);
    expect(getResourceApiBase('countries')).toBe(
      `http://127.0.0.1/v1/tenants/${TENANT}/countries`,
    );
  });

  it('returns null for unknown resource', () => {
    setStoredTenantId(TENANT);
    expect(getResourceApiBase('unknown_thing')).toBeNull();
  });
});
