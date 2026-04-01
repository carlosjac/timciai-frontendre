/**
 * Versioned API base. In dev with empty VITE_API_URL, use relative /v1 (Vite proxy).
 */
export function getV1Base(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const trimmed = raw?.trim() ?? '';
  if (trimmed === '') return '/v1';
  return `${trimmed.replace(/\/$/, '')}/v1`;
}

/** Misma clave que `frontend` (TenantProvider) para compartir selección entre apps y pestañas. */
export const TENANT_STORAGE_KEY = 'timci_selected_tenant_id';

/** Clave antigua de refine; se migra al leer en `getStoredTenantId`. */
export const LEGACY_TENANT_STORAGE_KEY = 'timci-refine-tenant-id';
