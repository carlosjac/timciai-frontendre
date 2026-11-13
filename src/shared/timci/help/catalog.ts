import actions from './content/es/actions.md?raw';
import alertsPlatform from './content/es/alerts-platform.md?raw';
import alerts from './content/es/alerts.md?raw';
import assignments from './content/es/assignments.md?raw';
import collections from './content/es/collections.md?raw';
import countries from './content/es/countries.md?raw';
import credits from './content/es/credits.md?raw';
import currencies from './content/es/currencies.md?raw';
import customers from './content/es/customers.md?raw';
import dashboardPlatform from './content/es/dashboard-platform.md?raw';
import dashboard from './content/es/dashboard.md?raw';
import debits from './content/es/debits.md?raw';
import documentTypes from './content/es/document-types.md?raw';
import documents from './content/es/documents.md?raw';
import emailBouncesEntity from './content/es/email-bounces-entity.md?raw';
import emailBounces from './content/es/email-bounces.md?raw';
import entities from './content/es/entities.md?raw';
import entitySettings from './content/es/entity-settings.md?raw';
import entitySignups from './content/es/entity-signups.md?raw';
import gettingStarted from './content/es/getting-started.md?raw';
import monetaryPolicies from './content/es/monetary-policies.md?raw';
import outboundEmailsEntity from './content/es/outbound-emails-entity.md?raw';
import outboundEmails from './content/es/outbound-emails.md?raw';
import permissions from './content/es/permissions.md?raw';
import priceLists from './content/es/price-lists.md?raw';
import rateSnapshots from './content/es/rate-snapshots.md?raw';
import reports from './content/es/reports.md?raw';
import roles from './content/es/roles.md?raw';
import sales from './content/es/sales.md?raw';
import sellableItems from './content/es/sellable-items.md?raw';
import sessions from './content/es/sessions.md?raw';
import subscriptions from './content/es/subscriptions.md?raw';
import tenants from './content/es/tenants.md?raw';
import users from './content/es/users.md?raw';
import {
  buildHelpCatalog,
  resolveHelpArticle,
  type HelpArticle,
  type HelpArticleMeta,
  type HelpMatch,
} from './domain/help-catalog.js';

export const HELP_ARTICLE_META = [
  { id: 'dashboard', group: 'start', audience: 'entity', resources: ['dashboard'] },
  { id: 'getting-started', group: 'start', audience: 'entity', resources: [] },
  {
    id: 'entity-settings',
    group: 'configuration',
    audience: 'entity',
    resources: ['entity_settings'],
    sectionByAction: { list: 'en-esta-pantalla' },
  },
  { id: 'price-lists', group: 'configuration', audience: 'entity', resources: ['price_lists'] },
  { id: 'sellable-items', group: 'configuration', audience: 'entity', resources: ['sellable_items'] },
  {
    id: 'monetary-policies',
    group: 'configuration',
    audience: 'entity',
    resources: ['monetary_policies'],
  },
  { id: 'customers', group: 'configuration', audience: 'entity', resources: ['customers'] },
  { id: 'subscriptions', group: 'daily', audience: 'entity', resources: ['subscriptions'] },
  { id: 'sales', group: 'daily', audience: 'entity', resources: ['sales'] },
  { id: 'debits', group: 'daily', audience: 'entity', resources: ['debits'] },
  { id: 'credits', group: 'daily', audience: 'entity', resources: ['credits'] },
  { id: 'collections', group: 'daily', audience: 'entity', resources: ['collections'] },
  { id: 'documents', group: 'daily', audience: 'entity', resources: ['documents'] },
  { id: 'reports', group: 'daily', audience: 'entity', resources: ['reports'] },
  { id: 'alerts', group: 'daily', audience: 'entity', resources: ['alerts'] },
  {
    id: 'outbound-emails-entity',
    group: 'daily',
    audience: 'entity',
    resources: ['outboundEmails'],
  },
  {
    id: 'email-bounces-entity',
    group: 'daily',
    audience: 'entity',
    resources: ['emailBounces'],
  },
  {
    id: 'dashboard-platform',
    group: 'start',
    audience: 'root',
    resources: ['dashboard'],
  },
  { id: 'entities', group: 'platform', audience: 'root', resources: ['entities'] },
  { id: 'entity-signups', group: 'platform', audience: 'root', resources: ['entitySignups'] },
  { id: 'tenants', group: 'platform', audience: 'root', resources: ['tenants'] },
  { id: 'users', group: 'platform', audience: 'root', resources: ['users'] },
  { id: 'assignments', group: 'platform', audience: 'root', resources: ['userTenantRoles'] },
  { id: 'countries', group: 'catalogs', audience: 'root', resources: ['countries'] },
  { id: 'currencies', group: 'catalogs', audience: 'root', resources: ['currencies'] },
  { id: 'document-types', group: 'catalogs', audience: 'root', resources: ['document_types'] },
  { id: 'rate-snapshots', group: 'catalogs', audience: 'root', resources: ['rateSnapshots'] },
  { id: 'alerts-platform', group: 'mail', audience: 'root', resources: ['alerts'] },
  { id: 'outbound-emails', group: 'mail', audience: 'root', resources: ['outboundEmails'] },
  { id: 'email-bounces', group: 'mail', audience: 'root', resources: ['emailBounces'] },
  { id: 'roles', group: 'access', audience: 'root', resources: ['roles'] },
  { id: 'actions', group: 'access', audience: 'root', resources: ['actions'] },
  { id: 'permissions', group: 'access', audience: 'root', resources: ['permissions'] },
  { id: 'sessions', group: 'access', audience: 'root', resources: ['sessions'] },
] as const satisfies readonly HelpArticleMeta[];

const MARKDOWN_BY_ID: Record<string, string> = {
  dashboard,
  'getting-started': gettingStarted,
  'entity-settings': entitySettings,
  'price-lists': priceLists,
  'sellable-items': sellableItems,
  'monetary-policies': monetaryPolicies,
  customers,
  subscriptions,
  sales,
  debits,
  credits,
  collections,
  documents,
  reports,
  alerts,
  'outbound-emails-entity': outboundEmailsEntity,
  'email-bounces-entity': emailBouncesEntity,
  'dashboard-platform': dashboardPlatform,
  entities,
  'entity-signups': entitySignups,
  tenants,
  users,
  assignments,
  countries,
  currencies,
  'document-types': documentTypes,
  'rate-snapshots': rateSnapshots,
  'alerts-platform': alertsPlatform,
  'outbound-emails': outboundEmails,
  'email-bounces': emailBounces,
  roles,
  actions,
  permissions,
  sessions,
};

export const helpArticles = buildHelpCatalog(HELP_ARTICLE_META, MARKDOWN_BY_ID);

/** Primeros pasos step key → help article id. */
const SETUP_STEP_ARTICLE_ID: Record<string, string> = {
  settings: 'entity-settings',
  priceLists: 'price-lists',
  products: 'sellable-items',
  monetary: 'monetary-policies',
  customers: 'customers',
  subscriptions: 'subscriptions',
  sales: 'sales',
  collections: 'collections',
};

export function helpArticleIdForSetupStep(stepKey: string): string | null {
  return SETUP_STEP_ARTICLE_ID[stepKey] ?? null;
}

/** Report route key → heading slug in the Informes article. */
export const REPORT_HELP_SECTIONS = {
  aging: 'antiguedad-de-saldos',
  invoiced: 'facturado-del-periodo',
  collected: 'diario-de-cobranzas',
  tax: 'impuestos-por-alicuota',
  period: 'ventas-y-cobranzas',
  allocations: 'imputaciones',
  unallocated: 'remanentes-sin-imputar',
  adjustments: 'ajustes-y-anulaciones',
  portfolio: 'cartera-por-cliente',
  management: 'gestion-de-cobranza',
} as const satisfies Record<string, string>;

/**
 * Help for the current URL. Report paths are not all registered on the Refine
 * resource (only /reports/aging), so those screens are recognized from the path.
 */
export function resolveScreenHelpArticle(
  articles: readonly HelpArticle[],
  resourceName: string | undefined,
  action: string | undefined,
  pathname: string,
): HelpMatch | null {
  const reportSection = reportHelpSectionFromPath(pathname);
  if (reportSection) return resolveHelpArticle(articles, 'reports', 'list', reportSection);
  return resolveHelpArticle(articles, resourceName, action);
}

export function reportHelpSectionFromPath(pathname: string): string | undefined {
  const match = /\/reports\/([^/?#]+)/.exec(pathname);
  if (!match?.[1]) return undefined;
  let key: string;
  try {
    key = decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
  if (!Object.hasOwn(REPORT_HELP_SECTIONS, key)) return undefined;
  return REPORT_HELP_SECTIONS[key as keyof typeof REPORT_HELP_SECTIONS];
}
