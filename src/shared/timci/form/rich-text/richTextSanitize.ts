import DOMPurify from 'isomorphic-dompurify';
import { RICH_TEXT_ALLOWED_TAGS } from './richTextPolicy.js';

/** Sanitizes rich-text HTML with the Timci allowed-tag whitelist. */
export function sanitizeRichTextHtml(raw: string): string {
  return DOMPurify.sanitize(String(raw ?? ''), {
    ALLOWED_TAGS: [...RICH_TEXT_ALLOWED_TAGS],
    ALLOWED_ATTR: [],
  });
}
