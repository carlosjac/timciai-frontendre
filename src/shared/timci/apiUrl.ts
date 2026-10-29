import { getV1Base, LEGACY_TENANT_STORAGE_KEY, TENANT_STORAGE_KEY } from '../../config.js';
import { encodeTimciPathSegment, isTimciIdSegment } from './pathSegment.js';

const GLOBAL_LIST: Record<string, string> = {
  users: 'authentication/users',
  sessions: 'auth/sessions',
  tenants: 'authorization/tenants',
  roles: 'authorization/roles',
  actions: 'authorization/actions',
  permissions: 'authorization/permissions',
  userTenantRoles: 'authorization/user-tenant-roles',
  rateSnapshots: 'currency-conversion/rate-snapshots',
};

/** Path segment under /tenants/:id/ */
const TENANT_RESOURCE_PATH: Record<string, string> = {
  countries: 'countries',
  entities: 'entities',
  customers: 'customers',
  document_types: 'document-types',
  currencies: 'currencies',
  sales: 'sales',
  debits: 'debits',
  credits: 'credits',
  collections: 'collections',
  documents: 'documents',
};

function clearStoredTenantKeys(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TENANT_STORAGE_KEY);
  localStorage.removeItem(LEGACY_TENANT_STORAGE_KEY);
}

export function getStoredTenantId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  const current = localStorage.getItem(TENANT_STORAGE_KEY);
  if (current) {
    if (!isTimciIdSegment(current)) {
      clearStoredTenantKeys();
      return null;
    }
    return current.trim();
  }
  const legacy = localStorage.getItem(LEGACY_TENANT_STORAGE_KEY);
  if (legacy) {
    if (!isTimciIdSegment(legacy)) {
      clearStoredTenantKeys();
      return null;
    }
    const trimmed = legacy.trim();
    localStorage.setItem(TENANT_STORAGE_KEY, trimmed);
    localStorage.removeItem(LEGACY_TENANT_STORAGE_KEY);
    return trimmed;
  }
  return null;
}

export function setStoredTenantId(id: string): void {
  if (!isTimciIdSegment(id)) {
    clearStoredTenantKeys();
    return;
  }
  localStorage.setItem(TENANT_STORAGE_KEY, id.trim());
}

/**
 * Base URL for list/get of a Refine resource, or null if tenant is required but missing.
 */
export function getResourceApiBase(resource: string): string | null {
  const v1 = getV1Base();
  const g = GLOBAL_LIST[resource];
  if (g) return `${v1}/${g}`;

  const path = TENANT_RESOURCE_PATH[resource];
  if (!path) return null;

  const tenantId = getStoredTenantId();
  if (!tenantId) return null;

  return `${v1}/tenants/${encodeTimciPathSegment(tenantId)}/${path}`;
}
