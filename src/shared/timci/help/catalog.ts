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
  type HelpArticleMeta,
} from './domain/help-catalog.js';

export const HELP_ARTICLE_META = [
  { id: 'dashboard', group: 'start', audience: 'entity', resources: ['dashboard'] },
  { id: 'getting-started', group: 'start', audience: 'entity', resources: [] },
  { id: 'customers', group: 'main', audience: 'entity', resources: ['customers'] },
  { id: 'sellable-items', group: 'main', audience: 'entity', resources: ['sellable_items'] },
  { id: 'sales', group: 'main', audience: 'entity', resources: ['sales'] },
  { id: 'collections', group: 'main', audience: 'entity', resources: ['collections'] },
  { id: 'debits', group: 'main', audience: 'entity', resources: ['debits'] },
  { id: 'credits', group: 'main', audience: 'entity', resources: ['credits'] },
  { id: 'subscriptions', group: 'main', audience: 'entity', resources: ['subscriptions'] },
  { id: 'documents', group: 'main', audience: 'entity', resources: ['documents'] },
  { id: 'reports', group: 'main', audience: 'entity', resources: ['reports'] },
  {
    id: 'entity-settings',
    group: 'configuration',
    audience: 'entity',
    resources: ['entity_settings'],
    sectionByAction: { list: 'en-esta-pantalla' },
  },
  { id: 'price-lists', group: 'configuration', audience: 'entity', resources: ['price_lists'] },
  {
    id: 'monetary-policies',
    group: 'configuration',
    audience: 'entity',
    resources: ['monetary_policies'],
  },
  { id: 'alerts', group: 'followUp', audience: 'entity', resources: ['alerts'] },
  {
    id: 'outbound-emails-entity',
    group: 'followUp',
    audience: 'entity',
    resources: ['outboundEmails'],
  },
  {
    id: 'email-bounces-entity',
    group: 'followUp',
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

export { helpArticleIdForSetupStep } from './setup-step-help.js';
export {
  REPORT_HELP_SECTIONS,
  replaceAllocationsResourceFromPath,
  reportHelpSectionFromPath,
  resolveScreenHelpArticle,
} from './screen-help.js';
