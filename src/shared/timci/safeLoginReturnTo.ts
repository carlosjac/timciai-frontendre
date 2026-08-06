/**
 * Allowlist for Refine login `?to=` return paths (open-redirect defense).
 * Accepts same-origin relative paths only; rejects protocol-relative and schemed URLs.
 */
export function sanitizeLoginReturnTo(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let value = String(raw).trim();
  if (!value) return null;

  try {
    value = decodeURIComponent(value);
  } catch {
    return null;
  }
  value = value.trim();
  if (!value) return null;

  // Reject C0 controls / DEL (e.g. /%09//evil → "/\t//evil" open-redirect via URL parser).
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return null;
  }

  // Must be a single-origin relative path: "/foo", not "//evil", "https:...", "\evil".
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//')) return null;
  if (value.includes('\\')) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return null;
  // Guard "/\evil" and encoded tricks after decode.
  if (value.length > 1 && value[1] === '\\') return null;

  // Final check: resolve against a fixed base; reject if origin escapes.
  try {
    const resolved = new URL(value, 'https://timci.invalid');
    if (resolved.origin !== 'https://timci.invalid') return null;
    if (!resolved.pathname.startsWith('/') || resolved.pathname.startsWith('//')) return null;
  } catch {
    return null;
  }

  return value;
}
