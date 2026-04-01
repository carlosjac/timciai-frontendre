import { getV1Base, LEGACY_TENANT_STORAGE_KEY, TENANT_STORAGE_KEY } from '../../config.js';

const GLOBAL_LIST: Record<string, string> = {
  users: 'authentication/users',
  sessions: 'auth/sessions',
  tenants: 'authorization/tenants',
  roles: 'authorization/roles',
  actions: 'authorization/actions',
  permissions: 'authorization/permissions',
  userTenantRoles: 'authorization/user-tenant-roles',
};

/** Path segment under /tenants/:id/ */
const TENANT_RESOURCE_PATH: Record<string, string> = {
  countries: 'countries',
  entities: 'entities',
  customers: 'customers',
  document_types: 'document-types',
  currencies: 'currencies',
};

export function getStoredTenantId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  const current = localStorage.getItem(TENANT_STORAGE_KEY);
  if (current) return current;
  const legacy = localStorage.getItem(LEGACY_TENANT_STORAGE_KEY);
  if (legacy) {
    localStorage.setItem(TENANT_STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_TENANT_STORAGE_KEY);
    return legacy;
  }
  return null;
}

export function setStoredTenantId(id: string): void {
  localStorage.setItem(TENANT_STORAGE_KEY, id);
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

  return `${v1}/tenants/${tenantId}/${path}`;
}
