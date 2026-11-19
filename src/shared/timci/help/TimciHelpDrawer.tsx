import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useGetIdentity, useParsed, useTranslate } from '@refinedev/core';
import { Button, Drawer, Input } from 'antd';
import { useLocation } from 'react-router';
import { getStoredTenantId } from '../apiUrl.js';
import { canManageAllEntities, fetchTimciActionCodes, peekTimciActionCodes } from '../actionCodes.js';
import { isReadyBannerDismissed } from '../setupProgress.js';
import { resolveScreenHelpArticle } from './screen-help.js';
import {
  groupHelpArticles,
  helpArticlesForReader,
  searchHelpArticles,
  sliceHelpSection,
  type HelpArticle,
} from './domain/help-catalog.js';
import { useTimciHelp } from './TimciHelpContext.js';

let helpCatalogPromise: Promise<readonly HelpArticle[]> | null = null;

function loadHelpCatalog(): Promise<readonly HelpArticle[]> {
  helpCatalogPromise ??= import('./catalog.js').then((mod) => mod.helpArticles);
  return helpCatalogPromise;
}

function useReaderHelpArticles(enabled: boolean): HelpArticle[] {
  const { data } = useGetIdentity<{ id: string }>();
  const [codes, setCodes] = useState<string[] | null>(() => peekTimciActionCodes());
  const [catalog, setCatalog] = useState<readonly HelpArticle[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void loadHelpCatalog().then((articles) => {
      if (active) setCatalog(articles);
    });
    return () => {
      active = false;
    };
  }, [enabled]);
  useEffect(() => {
    let active = true;
    void fetchTimciActionCodes().then((next) => {
      if (active) setCodes(next);
    });
    return () => {
      active = false;
    };
  }, []);
  const tenantId = typeof window === 'undefined' ? null : getStoredTenantId();
  const includeGettingStarted = !(
    data?.id &&
    tenantId &&
    isReadyBannerDismissed(data.id, tenantId)
  );
  if (!enabled || !catalog || !codes) return [];
  return helpArticlesForReader(catalog, {
    audience: canManageAllEntities(codes) ? 'root' : 'entity',
    includeGettingStarted,
  });
}

function focusedHelpSection(
  article: HelpArticle | null | undefined,
  sectionId: string | null,
  onThisScreen: boolean,
) {
  if (!article || !onThisScreen || !sectionId) return null;
  if (article.id !== 'reports' && sectionId !== 'modificar-imputaciones') return null;
  return sliceHelpSection(article.html, sectionId);
}

function TimciHelpPanel(): ReactElement {
  const translate = useTranslate();
  const articles = useReaderHelpArticles(true);
  const { pinnedArticleId, pinArticle } = useTimciHelp();
  const { resource, action } = useParsed();
  const { pathname } = useLocation();
  const routeMatch = resolveScreenHelpArticle(articles, resource?.name, action, pathname);
  const pinned = pinnedArticleId
    ? articles.find((article) => article.id === pinnedArticleId)
    : undefined;
  const shown = pinned ?? routeMatch?.article ?? null;
  const sectionId = shown && routeMatch?.article.id === shown.id ? routeMatch.sectionId : null;
  const [query, setQuery] = useState('');
  const aligned = useRef(false);
  const results = searchHelpArticles(articles, query);
  const groups = groupHelpArticles(results);
  const onThisScreen = shown != null && routeMatch?.article.id === shown.id;
  const reportSection = focusedHelpSection(shown, sectionId, onThisScreen);
  const bodyHtml = reportSection?.html ?? shown?.html;

  useEffect(() => {
    const delay = aligned.current ? 0 : 300;
    const timer = window.setTimeout(() => {
      aligned.current = true;
      const body = document.querySelector<HTMLElement>('.timci-help-body');
      if (!body) return;
      if (!sectionId) {
        body.scrollTop = 0;
        return;
      }
      const target = body.querySelector<HTMLElement>(`#timci-help-${CSS.escape(sectionId)}`);
      if (!target) return;
      target.tabIndex = -1;
      const top =
        target.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
      body.scrollTop = Math.max(0, top - 8);
      target.focus({ preventScroll: true });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [sectionId, shown?.id]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <label htmlFor="timci-help-search" style={{ display: 'block', marginBottom: 4 }}>
          {translate('help.center.search')}
        </label>
        <Input
          id="timci-help-search"
          type="search"
          autoComplete="off"
          value={query}
          placeholder={translate('help.center.searchPlaceholder')}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {shown ? (
        <article className="timci-help-article" aria-label={reportSection?.heading ?? shown.title}>
          {onThisScreen ? <p>{translate('help.center.current')}</p> : null}
          <div dangerouslySetInnerHTML={{ __html: bodyHtml ?? '' }} />
        </article>
      ) : (
        <p style={{ margin: 0 }}>{translate('help.center.noArticle')}</p>
      )}

      {results.length === 0 ? (
        <p style={{ margin: 0 }}>{translate('help.center.noResults')}</p>
      ) : (
        <nav aria-label={translate('help.center.index')}>
          <h2 style={{ fontSize: '1rem', margin: '0 0 8px' }}>{translate('help.center.index')}</h2>
          {groups.map((block) => (
            <section key={block.group} aria-labelledby={`timci-help-group-${block.group}`}>
              <h3 id={`timci-help-group-${block.group}`} style={{ fontSize: '0.95rem', margin: '12px 0 4px' }}>
                {translate(`help.center.groups.${block.group}`)}
              </h3>
              <ul className="timci-help-index">
                {block.articles.map((article) => {
                  const current = shown?.id === article.id;
                  return (
                    <li key={article.id}>
                      <Button
                        type="link"
                        aria-current={current ? 'true' : undefined}
                        onClick={() => pinArticle(article.id)}
                        style={{
                          height: 'auto',
                          paddingInline: 0,
                          whiteSpace: 'normal',
                          textAlign: 'left',
                          fontWeight: current ? 600 : 400,
                          textDecoration: current ? 'underline' : undefined,
                        }}
                      >
                        {article.title}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
      )}
    </div>
  );
}

export function TimciHelpDrawer(): ReactElement {
  const translate = useTranslate();
  const { open, closeHelp, pinnedArticleId } = useTimciHelp();
  const articles = useReaderHelpArticles(open);
  const { resource, action } = useParsed();
  const { pathname } = useLocation();
  const routeMatch = resolveScreenHelpArticle(articles, resource?.name, action, pathname);
  const pinned = pinnedArticleId
    ? articles.find((article) => article.id === pinnedArticleId)
    : undefined;
  const pinnedOther = pinned && pinned.id !== routeMatch?.article.id ? pinned : undefined;
  const reportSection = focusedHelpSection(
    pinnedOther ? null : routeMatch?.article,
    routeMatch?.sectionId ?? null,
    !pinnedOther,
  );
  const title =
    pinnedOther?.title ??
    reportSection?.heading ??
    pinned?.title ??
    routeMatch?.article.title ??
    translate('help.center.title');

  return (
    <Drawer
      open={open}
      onClose={closeHelp}
      destroyOnHidden
      placement="right"
      width="min(28rem, 100vw)"
      title={title}
      closable={{ 'aria-label': translate('buttons.close') }}
      classNames={{ body: 'timci-help-body' }}
    >
      {open ? <TimciHelpPanel /> : null}
    </Drawer>
  );
}
