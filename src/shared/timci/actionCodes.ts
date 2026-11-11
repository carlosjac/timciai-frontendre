import { getV1Base } from '../../config.js';
import { timciFetch } from './http.js';

export type TimciPermissionsData = { actionCodes: string[] };

const ACTION_CODES_TTL_MS = 60_000;

let cached: string[] | null = null;
let cachedAt = 0;
let inflight: Promise<string[]> | null = null;

export function invalidateTimciActionCodes(): void {
  cached = null;
  cachedAt = 0;
  inflight = null;
}

/**
 * GET /authorization/me/action-codes — mismo origen que el menú de timci-admin (react-admin).
 * Respuestas fallidas no se cachean para permitir reintento. Cache TTL 60s.
 */
export async function fetchTimciActionCodes(): Promise<string[]> {
  if (cached !== null && Date.now() - cachedAt < ACTION_CODES_TTL_MS) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const { json } = await timciFetch(`${getV1Base()}/authorization/me/action-codes`);
      const data = json as { actionCodes?: string[] };
      const codes = Array.isArray(data?.actionCodes) ? data.actionCodes : [];
      cached = codes;
      cachedAt = Date.now();
      return codes;
    } catch {
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Root users (menu.allEntities) can edit all entity fields; others with entities.update get a limited set. */
export function canFullyEditEntity(codes: string[]): boolean {
  return codes.includes('menu.allEntities');
}

/** Cross-entity / cross-tenant scope (root): list and manage resources across organizations. */
export function canManageAllEntities(codes: string[]): boolean {
  return codes.includes('menu.allEntities');
}

/** Entity administrators configure the active tenant via /entity-settings (not CRUD list). */
export function canSeeEntitySettingsMenuItem(codes: string[]): boolean {
  return codes.includes('entities.update') && !codes.includes('menu.allEntities');
}

/** Permiso para mostrar la acción Crear (alineado con preHandlers del backend). */
export function canCreateResource(resource: string | undefined, codes: string[]): boolean {
  if (!resource) return false;
  const has = (code: string) => codes.includes(code);
  switch (resource) {
    case 'countries':
      return has('countries.add');
    case 'currencies':
      return has('currencies.add');
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
    case 'monetary_policies':
      return has('monetary_policies.add');
    case 'price_list_items':
      return has('price_list_items.add');
    case 'sales':
      return has('sales.add');
    case 'subscriptions':
      return has('subscriptions.add');
    case 'debits':
      return has('debits.add');
    case 'credits':
      return has('credits.add');
    case 'collections':
      return has('collections.add');
    case 'users':
      return has('users.create');
    case 'tenants':
      return has('tenants.add');
    case 'roles':
      return has('roles.add');
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
      return has('menu.allEntities');
    case 'entity_settings':
      return canSeeEntitySettingsMenuItem(codes);
    case 'sellable_items':
      return has('menu.sellable_items');
    case 'price_lists':
      return has('menu.price_lists');
    case 'monetary_policies':
      return has('menu.monetary_policies');
    case 'sales':
      return has('menu.sales');
    case 'subscriptions':
      return has('menu.subscriptions');
    case 'debits':
      return has('menu.debits');
    case 'credits':
      return has('menu.credits');
    case 'collections':
      return has('menu.collections');
    case 'documents':
      return has('menu.documents');
    case 'alerts':
      return has('menu.alerts');
    case 'outboundEmails':
      return has('menu.outboundEmails');
    case 'emailBounces':
      return has('menu.emailBounces');
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
    case 'rateSnapshots':
      return has('menu.rate_snapshots');
    case 'dashboard':
      return has('menu.bi');
    case 'reports':
      return has('menu.reports');
    default:
      return false;
  }
}

export const TIMCI_RESOURCE_LIST_ORDER: { name: string; path: string }[] = [
  { name: 'dashboard', path: '/bi' },
  { name: 'reports', path: '/reports/aging' },
  { name: 'countries', path: '/countries' },
  { name: 'currencies', path: '/currencies' },
  { name: 'rateSnapshots', path: '/rate-snapshots' },
  { name: 'document_types', path: '/document-types' },
  { name: 'customers', path: '/customers' },
  { name: 'entities', path: '/entities' },
  { name: 'entity_settings', path: '/entity-settings' },
  { name: 'sellable_items', path: '/sellable-items' },
  { name: 'price_lists', path: '/price-lists' },
  { name: 'monetary_policies', path: '/monetary-policies' },
  { name: 'sales', path: '/sales' },
  { name: 'subscriptions', path: '/subscriptions' },
  { name: 'debits', path: '/debits' },
  { name: 'credits', path: '/credits' },
  { name: 'collections', path: '/collections' },
  { name: 'documents', path: '/documents' },
  { name: 'alerts', path: '/alerts' },
  { name: 'outboundEmails', path: '/outbound-emails' },
  { name: 'emailBounces', path: '/email-bounces' },
  { name: 'users', path: '/users' },
  { name: 'sessions', path: '/sessions' },
  { name: 'tenants', path: '/tenants' },
  { name: 'roles', path: '/roles' },
  { name: 'actions', path: '/actions' },
  { name: 'userTenantRoles', path: '/user-tenant-roles' },
  { name: 'permissions', path: '/permissions' },
];

/**
 * Orden de llegada y de menú. Los ítems sueltos van primero; los grupos, después.
 * Root: quien tiene menu.allEntities, o no opera la cuenta corriente de una entidad.
 * Administrador de entidad: menu.sales / menu.customers / menu.collections, sin menu.allEntities.
 */
export type TimciMenuGroup = { key: string; labelKey: string; names: string[] };

export type TimciMenuLayout = { loose: string[]; groups: TimciMenuGroup[] };

export const ENTITY_ADMIN_MENU: TimciMenuLayout = {
  loose: ['dashboard', 'customers', 'sales', 'collections', 'debits', 'credits', 'alerts'],
  groups: [
    {
      key: 'configuration',
      labelKey: 'nav.groupConfiguration',
      names: [
        'entity_settings',
        'sellable_items',
        'price_lists',
        'monetary_policies',
        'subscriptions',
      ],
    },
    {
      key: 'followUp',
      labelKey: 'nav.groupFollowUp',
      names: ['reports', 'documents', 'outboundEmails', 'emailBounces'],
    },
  ],
};

export const ROOT_MENU: TimciMenuLayout = {
  loose: ['dashboard', 'entities', 'tenants', 'users', 'userTenantRoles'],
  groups: [
    {
      key: 'catalogs',
      labelKey: 'nav.groupCatalogs',
      names: ['countries', 'currencies', 'document_types', 'rateSnapshots'],
    },
    {
      key: 'mail',
      labelKey: 'nav.groupMail',
      names: ['alerts', 'outboundEmails', 'emailBounces'],
    },
    {
      key: 'access',
      labelKey: 'nav.groupAccess',
      names: ['roles', 'actions', 'permissions', 'sessions'],
    },
  ],
};

export function menuLayoutForCodes(codes: string[]): TimciMenuLayout {
  const entityOps =
    codes.includes('menu.sales') ||
    codes.includes('menu.customers') ||
    codes.includes('menu.collections');
  if (codes.includes('menu.allEntities') || !entityOps) return ROOT_MENU;
  return ENTITY_ADMIN_MENU;
}

export function orderedResourceNames(codes: string[]): string[] {
  const layout = menuLayoutForCodes(codes);
  const placed = new Set<string>([
    ...layout.loose,
    ...layout.groups.flatMap((group) => group.names),
  ]);
  const rest = TIMCI_RESOURCE_LIST_ORDER.map((row) => row.name).filter((name) => !placed.has(name));
  return [...layout.loose, ...layout.groups.flatMap((group) => group.names), ...rest];
}

/** Primera lista a la que el usuario tiene acceso; si ninguna, preferencias (siempre en cabecera). */
export function getFirstAccessibleListPath(actionCodes: string[]): string {
  for (const name of orderedResourceNames(actionCodes)) {
    const row = TIMCI_RESOURCE_LIST_ORDER.find((item) => item.name === name);
    if (row && canSeeResourceMenuItem(name, actionCodes)) return row.path;
  }
  return '/preferences';
}
