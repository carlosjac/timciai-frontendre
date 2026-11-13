import { describe, expect, it } from 'vitest';
import { REPORT_KEYS } from '../../../features/reports/api.js';
import {
  REPORT_HELP_SECTIONS,
  helpArticleIdForSetupStep,
  helpArticles,
  reportHelpSectionFromPath,
  resolveScreenHelpArticle,
} from './catalog.js';
import {
  groupHelpArticles,
  helpArticlesForReader,
  resolveHelpArticle,
  searchHelpArticles,
  sliceHelpSection,
  type HelpAudience,
} from './domain/help-catalog.js';
import { parseHelpMarkdown } from './domain/parse-help-markdown.js';

function reader(audience: HelpAudience, includeGettingStarted = true) {
  return helpArticlesForReader(helpArticles, { audience, includeGettingStarted });
}

const SCREEN_ARTICLES = [
  'price-lists',
  'sellable-items',
  'monetary-policies',
  'customers',
  'subscriptions',
  'sales',
  'debits',
  'credits',
  'collections',
] as const;

describe('parseHelpMarkdown', () => {
  it('takes the title from the first heading and renders sections and lists', () => {
    const parsed = parseHelpMarkdown(`# Ventas

Una **venta** en \`borrador\`.

## Alta

1. Elige el cliente
- Sin ítems no se guarda

<script>alert(1)</script>
`);

    expect(parsed.title).toBe('Ventas');
    expect(parsed.html).not.toContain('<h1');
    expect(parsed.html).toContain('<h2 id="timci-help-alta">Alta</h2>');
    expect(parsed.html).toContain('<strong>venta</strong>');
    expect(parsed.html).toContain('<code>borrador</code>');
    expect(parsed.html).toContain('<ol><li>Elige el cliente</li></ol>');
    expect(parsed.html).toContain('<ul><li>Sin ítems no se guarda</li></ul>');
    expect(parsed.html).toContain('&lt;script&gt;');
    expect(parsed.html).not.toContain('<script>');
    expect(parsed.sectionIds).toEqual(['alta']);
  });

  it('rejects an article without a title', () => {
    expect(() => parseHelpMarkdown('Solo un párrafo.')).toThrow(/title/);
  });
});

describe('help catalog', () => {
  it('loads one article per topic for each audience', () => {
    expect(reader('entity').map((article) => article.id)).toEqual([
      'dashboard',
      'getting-started',
      'entity-settings',
      'price-lists',
      'sellable-items',
      'monetary-policies',
      'customers',
      'subscriptions',
      'sales',
      'debits',
      'credits',
      'collections',
      'documents',
      'reports',
      'alerts',
      'outbound-emails-entity',
      'email-bounces-entity',
    ]);
    expect(reader('root').map((article) => article.id)).toEqual([
      'dashboard-platform',
      'entities',
      'entity-signups',
      'tenants',
      'users',
      'assignments',
      'countries',
      'currencies',
      'document-types',
      'rate-snapshots',
      'alerts-platform',
      'outbound-emails',
      'email-bounces',
      'roles',
      'actions',
      'permissions',
      'sessions',
    ]);
    for (const audience of ['entity', 'root'] as const) {
      const resources = reader(audience).flatMap((article) => article.resources);
      expect(new Set(resources).size).toBe(resources.length);
    }
  });

  it('keeps platform wording out of the entity articles', () => {
    const entityText = reader('entity')
      .map((article) => article.plainText)
      .join('\n');
    expect(entityText.toLowerCase()).not.toContain('plataforma');
    expect(reader('root').find((article) => article.id === 'dashboard-platform')?.plainText).toContain(
      'plataforma',
    );
    expect(reader('entity').some((article) => article.id === 'sales')).toBe(true);
    expect(reader('root').some((article) => article.id === 'sales')).toBe(false);
  });

  it('points each screen action at the matching section', () => {
    const entityArticles = reader('entity');
    const rootArticles = reader('root');
    expect(resolveHelpArticle(entityArticles, 'sales', 'create')).toMatchObject({
      article: { id: 'sales' },
      sectionId: 'alta',
    });
    expect(resolveHelpArticle(entityArticles, 'sales', 'edit')?.sectionId).toBe('ficha');
    expect(resolveHelpArticle(entityArticles, 'entity_settings', 'list')?.sectionId).toBe(
      'en-esta-pantalla',
    );
    expect(resolveHelpArticle(entityArticles, 'documents', 'show')?.sectionId).toBe('ficha');
    expect(resolveHelpArticle(entityArticles, 'dashboard', 'list')).toMatchObject({
      article: { id: 'dashboard' },
      sectionId: null,
    });
    expect(resolveHelpArticle(entityArticles, 'countries', 'list')).toBeNull();
    expect(resolveHelpArticle(rootArticles, 'dashboard', 'list')).toMatchObject({
      article: { id: 'dashboard-platform' },
      sectionId: null,
    });
    expect(resolveHelpArticle(rootArticles, 'entities', 'create')?.sectionId).toBe('alta');
    expect(resolveHelpArticle(rootArticles, 'sessions', 'list')?.sectionId).toBe('lista');
    expect(resolveHelpArticle(entityArticles, 'alerts', 'list')).toMatchObject({
      article: { id: 'alerts' },
      sectionId: 'lista',
    });
    expect(resolveHelpArticle(rootArticles, 'alerts', 'show')).toMatchObject({
      article: { id: 'alerts-platform' },
      sectionId: 'ficha',
    });
    expect(resolveHelpArticle(entityArticles, 'outboundEmails', 'list')).toMatchObject({
      article: { id: 'outbound-emails-entity' },
      sectionId: 'lista',
    });
    expect(resolveHelpArticle(entityArticles, 'emailBounces', 'show')).toMatchObject({
      article: { id: 'email-bounces-entity' },
      sectionId: 'ficha',
    });
    expect(resolveHelpArticle(rootArticles, 'outboundEmails', 'show')).toMatchObject({
      article: { id: 'outbound-emails' },
      sectionId: 'ficha',
    });
    expect(resolveHelpArticle(rootArticles, 'emailBounces', 'list')).toMatchObject({
      article: { id: 'email-bounces' },
      sectionId: 'lista',
    });
    expect(resolveHelpArticle(helpArticles, undefined, 'list')).toBeNull();
  });

  it('explains how to replace allocations from the show screen of a collection, credit or debit', () => {
    for (const id of ['collections', 'credits', 'debits'] as const) {
      const article = helpArticles.find((item) => item.id === id);
      const ficha = sliceHelpSection(article?.html ?? '', 'ficha');
      expect(ficha?.html).toContain('Modificar imputaciones');
      expect(ficha?.html).toContain('Imputar automáticamente');
      expect(ficha?.html).toContain('junto a Anular');
      expect(ficha?.html).toContain('mismo cliente');
    }
    const collection = sliceHelpSection(
      helpArticles.find((item) => item.id === 'collections')?.html ?? '',
      'ficha',
    );
    expect(collection?.html).toContain('No auto-imputar');
    expect(collection?.html).toContain('política monetaria');
    const debit = sliceHelpSection(
      helpArticles.find((item) => item.id === 'debits')?.html ?? '',
      'ficha',
    );
    expect(debit?.html).toContain('saldo pendiente');
    expect(debit?.html).not.toContain('No auto-imputar');
  });

  it('explains draft versus register on every commercial transaction', () => {
    for (const id of ['sales', 'debits', 'credits', 'collections'] as const) {
      const article = helpArticles.find((item) => item.id === id);
      expect(article?.sectionIds).toContain('borrador-y-registrar');
      const text = article?.plainText ?? '';
      expect(text).toContain('cuenta corriente');
      expect(text).toContain('Registrar');
    }
  });

  it('explains customer tabs, settlement and how the customer is sold to', () => {
    const customers = helpArticles.find((item) => item.id === 'customers');
    expect(customers?.sectionIds).toEqual(
      expect.arrayContaining([
        'datos-generales',
        'como-se-le-vende',
        'contactos',
        'cuenta-corriente',
        'liquidacion',
        'imputaciones',
      ]),
    );
    const text = customers?.plainText ?? '';
    expect(text).toContain('Lista de precios');
    expect(text).toContain('Política monetaria por defecto');
    expect(text).toContain('Total a saldar');
    expect(text).toContain('Sin imputar');
  });

  it('gives list, create and show sections to each operation article', () => {
    for (const id of SCREEN_ARTICLES) {
      const article = helpArticles.find((item) => item.id === id);
      expect(article?.sectionIds).toEqual(expect.arrayContaining(['lista', 'alta', 'ficha']));
    }
    const documents = helpArticles.find((item) => item.id === 'documents');
    expect(documents?.sectionIds).toEqual(expect.arrayContaining(['lista', 'ficha']));
    expect(documents?.sectionIds).not.toContain('alta');
  });

  it('searches titles and body without caring about accents or case', () => {
    const found = searchHelpArticles(helpArticles, 'NOTA de crédito').map((article) => article.id);
    expect(found).toContain('credits');
    expect(searchHelpArticles(helpArticles, '   ').map((article) => article.id)).toEqual(
      helpArticles.map((article) => article.id),
    );
    expect(searchHelpArticles(helpArticles, 'xyzzy-no-existe')).toEqual([]);
  });

  it('groups articles in menu order', () => {
    expect(groupHelpArticles(reader('entity')).map((block) => block.group)).toEqual([
      'start',
      'configuration',
      'daily',
    ]);
    expect(groupHelpArticles(reader('root')).map((block) => block.group)).toEqual([
      'start',
      'platform',
      'catalogs',
      'mail',
      'access',
    ]);
  });

  it('hides primeros pasos after that checklist is closed', () => {
    const visible = reader('entity', false).map((article) => article.id);
    expect(visible).not.toContain('getting-started');
    expect(visible).toContain('dashboard');
    expect(reader('entity', true).map((article) => article.id)).toContain('getting-started');
    expect(reader('root', true).map((article) => article.id)).not.toContain('getting-started');
  });

  it('links every primeros pasos step to an article', () => {
    for (const step of [
      'settings',
      'priceLists',
      'products',
      'monetary',
      'customers',
      'subscriptions',
      'sales',
      'collections',
    ]) {
      const id = helpArticleIdForSetupStep(step);
      expect(helpArticles.some((article) => article.id === id)).toBe(true);
    }
    expect(helpArticleIdForSetupStep('unknown')).toBeNull();
  });

  it('explains every report for the entity admin and opens that section', () => {
    const article = reader('entity').find((item) => item.id === 'reports');
    expect(article?.sectionIds).toEqual(
      expect.arrayContaining(['lista', ...Object.values(REPORT_HELP_SECTIONS)]),
    );
    expect(article?.plainText.toLowerCase()).not.toContain('plataforma');
    expect(Object.keys(REPORT_HELP_SECTIONS).sort()).toEqual([...REPORT_KEYS].sort());
    for (const key of REPORT_KEYS) {
      expect(reportHelpSectionFromPath(`/reports/${key}`)).toBe(REPORT_HELP_SECTIONS[key]);
      expect(resolveHelpArticle(reader('entity'), 'reports', 'list', REPORT_HELP_SECTIONS[key])).toMatchObject({
        article: { id: 'reports' },
        sectionId: REPORT_HELP_SECTIONS[key],
      });
    }
    expect(reportHelpSectionFromPath('/sales')).toBeUndefined();
    expect(resolveHelpArticle(reader('root'), 'reports', 'list')).toBeNull();
  });

  it('keeps only the open report section', () => {
    const article = reader('entity').find((item) => item.id === 'reports');
    const aging = sliceHelpSection(article?.html ?? '', REPORT_HELP_SECTIONS.aging);
    expect(aging?.heading).toBe('Antigüedad de saldos');
    expect(aging?.html).toContain('timci-help-antiguedad-de-saldos');
    expect(aging?.html).not.toContain('Diario de cobranzas');
    expect(aging?.html).not.toContain('Facturado del período');
    const collected = sliceHelpSection(article?.html ?? '', REPORT_HELP_SECTIONS.collected);
    expect(collected?.heading).toBe('Diario de cobranzas');
    expect(collected?.html).not.toContain('Antigüedad de saldos');
    expect(sliceHelpSection(article?.html ?? '', 'no-existe')).toBeNull();
  });

  it('opens the report on screen when that path is not the registered list route', () => {
    const articles = reader('entity');
    for (const key of REPORT_KEYS) {
      expect(resolveScreenHelpArticle(articles, undefined, undefined, `/reports/${key}`)).toMatchObject({
        article: { id: 'reports' },
        sectionId: REPORT_HELP_SECTIONS[key],
      });
    }
    expect(resolveScreenHelpArticle(articles, 'sales', 'list', '/sales')?.article.id).toBe('sales');
  });
});
