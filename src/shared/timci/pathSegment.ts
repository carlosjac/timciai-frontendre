/**
 * Safe path segment for Timci IDs (UUID / UUID-v7 hex form).
 * Rejects empty, traversal, and non-UUID shapes before encoding.
 */
const TIMCI_ID_SEGMENT_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isTimciIdSegment(id: string | null | undefined): boolean {
  if (id == null) return false;
  const trimmed = id.trim();
  if (!trimmed) return false;
  if (trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('..')) return false;
  return TIMCI_ID_SEGMENT_RE.test(trimmed);
}

/** Encodes a validated Timci id for use in a URL path segment. */
export function encodeTimciPathSegment(id: string): string {
  return encodeURIComponent(id.trim());
}

/**
 * Validates a Timci UUID path segment and returns it encoded.
 * @throws Error when the id is not a safe Timci UUID segment.
 */
export function requireTimciPathSegment(id: string | null | undefined): string {
  if (!isTimciIdSegment(id)) {
    throw new Error('Invalid Timci resource id for URL path segment.');
  }
  return encodeTimciPathSegment(String(id).trim());
}
