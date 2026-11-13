const DEV_REVISION = 'dev';
const SHORT_REVISION_LENGTH = 7;

export function normalizeRevision(value: string | undefined | null): string {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? DEV_REVISION : trimmed;
}

/** Admin build identity baked by Vite (`VITE_TIMCI_REVISION`). Empty means `pnpm dev`. */
export function readAdminRevision(
  envValue: string | undefined = import.meta.env.VITE_TIMCI_REVISION as string | undefined,
): string {
  return normalizeRevision(envValue);
}

export function shortRevision(revision: string): string {
  return revision.length <= SHORT_REVISION_LENGTH
    ? revision
    : revision.slice(0, SHORT_REVISION_LENGTH);
}

/** Same origin as the API (`VITE_API_URL` empty → relative `/version`, proxied in dev). */
export function installedApiVersionUrl(apiUrl: string | undefined): string {
  const trimmed = apiUrl?.trim() ?? '';
  if (trimmed === '') return '/version';
  return `${trimmed.replace(/\/$/, '')}/version`;
}

export function readVersionRevision(body: unknown): string | null {
  if (body == null || typeof body !== 'object') return null;
  const revision = (body as { revision?: unknown }).revision;
  if (typeof revision !== 'string') return null;
  const trimmed = revision.trim();
  return trimmed === '' ? null : trimmed;
}
