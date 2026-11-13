import { translateEs } from '../i18n/createI18nProvider.js';

const BRAND = 'Timci';

/** Refine resource name → i18n key for each screen. */
const RESOURCE_TITLES: Record<string, Partial<Record<'list' | 'create' | 'show' | 'edit', string>>> = {
  dashboard: { list: 'dashboard.entityTitle' },
  reports: { list: 'reports.title' },
  countries: {
    list: 'pages.countries.title',
    create: 'pages.countries.create',
    show: 'pages.countries.showTitle',
    edit: 'pages.countries.editTitle',
  },
  currencies: {
    list: 'pages.currencies.title',
    create: 'pages.currencies.create',
    show: 'pages.currencies.showTitle',
    edit: 'pages.currencies.editTitle',
  },
  rateSnapshots: {
    list: 'pages.rateSnapshots.title',
    show: 'pages.rateSnapshots.showTitle',
  },
  document_types: {
    list: 'pages.documentTypes.title',
    create: 'pages.documentTypes.create',
    show: 'pages.documentTypes.showTitle',
    edit: 'pages.documentTypes.editTitle',
  },
  customers: {
    list: 'pages.customers.title',
    create: 'pages.customers.create',
    show: 'pages.customers.showTitle',
    edit: 'pages.customers.editTitle',
  },
  entities: {
    list: 'pages.entities.title',
    create: 'pages.entities.create',
    show: 'pages.entities.showTitle',
    edit: 'pages.entities.editTitle',
  },
  entity_settings: { list: 'pages.entitySettings.title' },
  sellable_items: {
    list: 'pages.sellableItems.title',
    create: 'pages.sellableItems.create',
    show: 'pages.sellableItems.showTitle',
    edit: 'pages.sellableItems.editTitle',
  },
  price_lists: {
    list: 'pages.priceLists.title',
    create: 'pages.priceLists.create',
    show: 'pages.priceLists.showTitle',
    edit: 'pages.priceLists.editTitle',
  },
  monetary_policies: {
    list: 'pages.monetaryPolicies.title',
    create: 'pages.monetaryPolicies.create',
    show: 'pages.monetaryPolicies.showTitle',
    edit: 'pages.monetaryPolicies.editTitle',
  },
  sales: {
    list: 'pages.sales.title',
    create: 'pages.sales.create',
    show: 'pages.sales.showTitle',
    edit: 'pages.sales.editTitle',
  },
  subscriptions: {
    list: 'pages.subscriptions.title',
    create: 'pages.subscriptions.create',
    show: 'pages.subscriptions.showTitle',
    edit: 'pages.subscriptions.editTitle',
  },
  debits: {
    list: 'pages.debits.title',
    create: 'pages.debits.create',
    show: 'pages.debits.showTitle',
    edit: 'pages.debits.editTitle',
  },
  credits: {
    list: 'pages.credits.title',
    create: 'pages.credits.create',
    show: 'pages.credits.showTitle',
    edit: 'pages.credits.editTitle',
  },
  collections: {
    list: 'pages.collections.title',
    create: 'pages.collections.create',
    show: 'pages.collections.showTitle',
    edit: 'pages.collections.editTitle',
  },
  documents: { list: 'pages.documents.title', show: 'pages.documents.showTitle' },
  alerts: { list: 'pages.alerts.title', show: 'pages.alerts.showTitle' },
  outboundEmails: { list: 'pages.outboundEmails.title', show: 'pages.outboundEmails.showTitle' },
  emailBounces: { list: 'pages.emailBounces.title', show: 'pages.emailBounces.showTitle' },
  users: {
    list: 'pages.users.title',
    create: 'pages.users.create',
    show: 'pages.users.showTitle',
    edit: 'pages.users.editTitle',
  },
  sessions: { list: 'pages.sessions.title' },
  tenants: {
    list: 'pages.tenants.title',
    create: 'pages.tenants.create',
    show: 'pages.tenants.showTitle',
    edit: 'pages.tenants.editTitle',
  },
  entitySignups: { list: 'pages.entityRequests.title', show: 'pages.entityRequests.showTitle' },
  roles: {
    list: 'pages.roles.title',
    create: 'pages.roles.create',
    show: 'pages.roles.showTitle',
    edit: 'pages.roles.editTitle',
  },
  actions: { list: 'pages.actions.title', create: 'pages.actions.create' },
  userTenantRoles: { list: 'pages.userTenantRoles.title', create: 'pages.userTenantRoles.create' },
  permissions: { list: 'pages.permissions.title', create: 'pages.permissions.create' },
};

export function withTimciBrand(title: string): string {
  const trimmed = title.replace(/\s+/g, ' ').trim();
  if (!trimmed || trimmed === BRAND) return BRAND;
  if (trimmed.endsWith(`| ${BRAND}`)) return trimmed;
  return `${trimmed} | ${BRAND}`;
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function reportTitle(pathname: string): string | null {
  const match = pathname.match(/^\/reports(?:\/([^/]+))?$/);
  if (!match) return null;
  const key = match[1];
  if (!key) return translateEs('reports.title');
  const kind = translateEs(`reports.kind.${key}`, '');
  if (!kind) return translateEs('reports.title');
  return `${translateEs('reports.title')} · ${kind}`;
}

function pathTitle(pathname: string): string | null {
  if (pathname === '/login') return translateEs('pages.login.title');
  if (pathname === '/signup') return translateEs('pages.signup.title');
  if (pathname === '/preferences') return translateEs('pages.preferences.title');
  if (pathname === '/change-password') return translateEs('pages.changePassword.title');
  if (/^\/customers\/import-jobs\/[^/]+$/.test(pathname)) {
    return translateEs('pages.customers.import.resultsTitle');
  }
  if (pathname === '/customers/import-jobs') return translateEs('pages.customers.import.historyTitle');
  return reportTitle(pathname);
}

function resourceTitle(resourceName: string | undefined, action: string | undefined): string | null {
  if (!resourceName || !action) return null;
  const key = RESOURCE_TITLES[resourceName]?.[action as 'list' | 'create' | 'show' | 'edit'];
  if (!key) return null;
  const label = translateEs(key, '');
  return label || null;
}

/**
 * Tab title for a route. `visibleTitle` is the heading already on screen
 * (record name, selected report, access-denied) and wins over the route fallback.
 */
export function timciDocumentTitle(
  pathname: string,
  resourceName?: string,
  action?: string,
  visibleTitle?: string | null,
): string {
  const visible = visibleTitle?.replace(/\s+/g, ' ').trim();
  if (visible) return withTimciBrand(visible);

  const path = normalizePath(pathname);
  const fromPath = pathTitle(path);
  if (fromPath) return withTimciBrand(fromPath);

  const fromResource = resourceTitle(resourceName, action);
  if (fromResource) return withTimciBrand(fromResource);

  if (path === '/') return BRAND;
  return withTimciBrand(translateEs('pages.notFound.title'));
}

/** Heading the screen already shows, when it is marked for the tab title. */
export function readVisiblePageTitle(root: ParentNode): string | null {
  const marked = root.querySelector('[data-timci-page-title]');
  const markedTitle = marked?.getAttribute('data-timci-page-title')?.replace(/\s+/g, ' ').trim();
  if (markedTitle) return markedTitle;

  const header = root.querySelector('.refine-pageHeader-title');
  const headerTitle = header?.textContent?.replace(/\s+/g, ' ').trim();
  return headerTitle || null;
}
