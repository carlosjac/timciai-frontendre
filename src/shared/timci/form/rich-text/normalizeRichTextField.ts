import { isRichTextEmpty } from './isRichTextEmpty.js';
import { sanitizeRichTextHtml } from './richTextSanitize.js';

/** Sanitizes rich text and returns fallback when empty after normalization. */
export function normalizeRichTextField(raw: unknown, fallback = '-'): string {
  const sanitized = sanitizeRichTextHtml(typeof raw === 'string' ? raw : '');
  return isRichTextEmpty(sanitized) ? fallback : sanitized;
}
