import type { ParsedHelpMarkdown } from './parse-help-markdown.js';
import { parseHelpMarkdown } from './parse-help-markdown.js';

export const HELP_GROUP_ORDER = [
  'start',
  'configuration',
  'daily',
  'platform',
  'catalogs',
  'mail',
  'access',
] as const;

export type HelpGroupId = (typeof HELP_GROUP_ORDER)[number];

/** Entity administrator operates one entity. Root manages the platform. */
export type HelpAudience = 'entity' | 'root';

export const HELP_SCREEN_ACTIONS = ['list', 'create', 'show', 'edit'] as const;

export type HelpScreenAction = (typeof HELP_SCREEN_ACTIONS)[number];

const DEFAULT_SECTION: Record<HelpScreenAction, string> = {
  list: 'lista',
  create: 'alta',
  show: 'ficha',
  edit: 'ficha',
};

export type HelpArticleMeta = {
  id: string;
  group: HelpGroupId;
  audience: HelpAudience;
  resources: readonly string[];
  /** Heading slug for a screen action. Missing actions use Lista, Alta or Ficha. */
  sectionByAction?: Partial<Record<HelpScreenAction, string>>;
};

export type HelpArticle = HelpArticleMeta & ParsedHelpMarkdown;

export type HelpMatch = {
  article: HelpArticle;
  sectionId: string | null;
};

export type HelpGroupBlock = {
  group: HelpGroupId;
  articles: HelpArticle[];
};

function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function asHelpScreenAction(action: string | undefined): HelpScreenAction | null {
  if (action === 'list' || action === 'create' || action === 'show' || action === 'edit') return action;
  return null;
}

export function buildHelpCatalog(
  meta: readonly HelpArticleMeta[],
  markdownById: Readonly<Record<string, string>>,
): HelpArticle[] {
  return meta.map((item) => {
    const markdown = markdownById[item.id];
    if (markdown == null) throw new Error(`Missing help article: ${item.id}`);
    const parsed = parseHelpMarkdown(markdown);
    for (const slug of Object.values(item.sectionByAction ?? {})) {
      if (!parsed.sectionIds.includes(slug)) {
        throw new Error(`Help article ${item.id} has no section ${slug}`);
      }
    }
    return { ...item, ...parsed };
  });
}

/** One help section, from its heading through the paragraph before the next heading. */
export function sliceHelpSection(html: string, sectionId: string): { html: string; heading: string } | null {
  if (!/^[a-z0-9-]+$/.test(sectionId)) return null;
  const startTag = `<h2 id="timci-help-${sectionId}">`;
  const start = html.indexOf(startTag);
  if (start < 0) return null;
  const headingEnd = html.indexOf('</h2>', start + startTag.length);
  if (headingEnd < 0) return null;
  const heading = html.slice(start + startTag.length, headingEnd).replace(/<[^>]+>/g, '');
  const next = html.indexOf('<h2 id="timci-help-', headingEnd);
  return {
    html: next < 0 ? html.slice(start) : html.slice(start, next),
    heading,
  };
}

export function resolveHelpArticle(
  articles: readonly HelpArticle[],
  resourceName: string | undefined,
  action: string | undefined,
  sectionHint?: string,
): HelpMatch | null {
  if (!resourceName) return null;
  const article = articles.find((item) => item.resources.includes(resourceName));
  if (!article) return null;
  const screenAction = asHelpScreenAction(action);
  if (!screenAction) return { article, sectionId: null };
  const hinted = sectionHint && article.sectionIds.includes(sectionHint) ? sectionHint : null;
  const slug = hinted ?? article.sectionByAction?.[screenAction] ?? DEFAULT_SECTION[screenAction];
  return {
    article,
    sectionId: article.sectionIds.includes(slug) ? slug : null,
  };
}

export function searchHelpArticles(articles: readonly HelpArticle[], query: string): HelpArticle[] {
  const tokens = fold(query).split(/\s+/).filter((token) => token.length > 0);
  if (tokens.length === 0) return [...articles];
  return articles.filter((article) => {
    const haystack = fold(`${article.title}\n${article.plainText}`);
    return tokens.every((token) => haystack.includes(token));
  });
}

export const GETTING_STARTED_ARTICLE_ID = 'getting-started';

/** Articles for one signed-in profile. Primeros pasos stays only while that checklist is on screen. */
export function helpArticlesForReader(
  articles: readonly HelpArticle[],
  options: { audience: HelpAudience; includeGettingStarted: boolean },
): HelpArticle[] {
  return articles.filter((article) => {
    if (article.audience !== options.audience) return false;
    if (!options.includeGettingStarted && article.id === GETTING_STARTED_ARTICLE_ID) return false;
    return true;
  });
}

export function groupHelpArticles(articles: readonly HelpArticle[]): HelpGroupBlock[] {
  return HELP_GROUP_ORDER.flatMap((group) => {
    const inGroup = articles.filter((article) => article.group === group);
    return inGroup.length > 0 ? [{ group, articles: inGroup }] : [];
  });
}
