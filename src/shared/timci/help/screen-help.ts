import { resolveHelpArticle, type HelpArticle, type HelpMatch } from './domain/help-catalog.js';

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
  drafts: 'borradores',
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
  const allocationsResource = replaceAllocationsResourceFromPath(pathname);
  if (allocationsResource) {
    return resolveHelpArticle(articles, allocationsResource, 'show', 'modificar-imputaciones');
  }
  return resolveHelpArticle(articles, resourceName, action);
}

/** Cobro, crédito o débito en la página Modificar imputaciones. */
export function replaceAllocationsResourceFromPath(pathname: string): string | undefined {
  const match = /^\/(collections|credits|debits)\/show\/[^/]+\/allocations\/?$/.exec(pathname);
  return match?.[1];
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
