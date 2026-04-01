import { getV1Base } from '../../config.js';
import { timciFetch } from './http.js';

export type TimciPermissionsData = { actionCodes: string[] };

let cached: string[] | null = null;
let inflight: Promise<string[]> | null = null;

export function invalidateTimciActionCodes(): void {
  cached = null;
  inflight = null;
}

/**
 * GET /authorization/me/action-codes — mismo origen que el menú de timci-admin (react-admin).
 * Respuestas fallidas no se cachean para permitir reintento.
 */
export async function fetchTimciActionCodes(): Promise<string[]> {
  if (cached !== null) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const { json } = await timciFetch(`${getV1Base()}/authorization/me/action-codes`);
      const data = json as { actionCodes?: string[] };
      const codes = Array.isArray(data?.actionCodes) ? data.actionCodes : [];
      cached = codes;
      return codes;
    } catch {
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Permiso para mostrar la acción Crear (alineado con preHandlers del backend). */
export function canCreateResource(resource: string | undefined, codes: string[]): boolean {
  if (!resource) return false;
  const has = (code: string) => codes.includes(code);
  switch (resource) {
    case 'countries':
      return has('countries.add');
    case 'document_types':
      return has('document_types.add');
    case 'customers':
      return has('customers.add');
    case 'entities':
      return has('entities.add');
    case 'sellable_items':
      return has('sellable_items.add');
    case 'price_lists':
      return has('price_lists.add');
    case 'price_list_items':
      return has('price_list_items.add');
    case 'users':
      return has('users.create');
    case 'tenants':
      return has('tenants.admin');
    case 'roles':
      return has('roles.admin');
    case 'actions':
      return has('actions.admin');
    case 'userTenantRoles':
      return has('assignments.admin');
    case 'permissions':
      return has('permissions.admin');
    default:
      return false;
  }
}

export function canSeeResourceMenuItem(resource: string | undefined, codes: string[]): boolean {
  if (!resource) return false;

  const has = (code: string) => codes.includes(code);

  switch (resource) {
    case 'countries':
      return has('menu.countries');
    case 'currencies':
      return has('menu.currencies');
    case 'document_types':
      return has('menu.document_types');
    case 'customers':
      return has('menu.customers');
    case 'entities':
      return (
        has('menu.allEntities') || has('entities.list') || has('entities.update')
      );
    case 'sellable_items':
      return has('menu.sellable_items');
    case 'price_lists':
      return has('menu.price_lists');
    case 'users':
      return has('menu.users');
    case 'tenants':
      return has('menu.tenants');
    case 'roles':
      return has('menu.roles');
    case 'actions':
      return has('menu.actions');
    case 'permissions':
      return has('menu.permissions');
    case 'userTenantRoles':
      return has('menu.assignments');
    case 'sessions':
      return has('menu.sessions');
    default:
      return false;
  }
}

/**
 * Orden alineado al menú de timci-admin: operación primero, luego seguridad.
 */
export const TIMCI_RESOURCE_LIST_ORDER: { name: string; path: string }[] = [
  { name: 'countries', path: '/countries' },
  { name: 'currencies', path: '/currencies' },
  { name: 'document_types', path: '/document-types' },
  { name: 'customers', path: '/customers' },
  { name: 'entities', path: '/entities' },
  { name: 'sellable_items', path: '/sellable-items' },
  { name: 'price_lists', path: '/price-lists' },
  { name: 'users', path: '/users' },
  { name: 'sessions', path: '/sessions' },
  { name: 'tenants', path: '/tenants' },
  { name: 'roles', path: '/roles' },
  { name: 'actions', path: '/actions' },
  { name: 'userTenantRoles', path: '/user-tenant-roles' },
  { name: 'permissions', path: '/permissions' },
];

/** Primera lista a la que el usuario tiene acceso; si ninguna, preferencias (siempre en cabecera). */
export function getFirstAccessibleListPath(actionCodes: string[]): string {
  for (const { name, path } of TIMCI_RESOURCE_LIST_ORDER) {
    if (canSeeResourceMenuItem(name, actionCodes)) return path;
  }
  return '/preferences';
}
