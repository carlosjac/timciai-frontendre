/** True when HTML has no visible text (e.g. `<p></p>`, `<p><br></p>`). Plain text is supported. */
export function isRichTextEmpty(html: string): boolean {
  const value = String(html ?? '').trim();
  if (value === '') return true;

  const withoutTags = value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();

  return withoutTags === '';
}
