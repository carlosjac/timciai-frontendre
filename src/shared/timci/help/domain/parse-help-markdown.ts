export type ParsedHelpMarkdown = {
  title: string;
  html: string;
  plainText: string;
  sectionIds: readonly string[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function emphasize(escaped: string): string {
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Inline marks used in help articles: `code` and **bold**. Text is escaped first. */
function formatInline(value: string): string {
  const parts = value.split('`');
  const unpairedTail = parts.length % 2 === 0;
  return parts
    .map((part, index) => {
      const code = index % 2 === 1 && !(unpairedTail && index === parts.length - 1);
      if (code) return `<code>${escapeHtml(part)}</code>`;
      const literal = unpairedTail && index === parts.length - 1 ? `\`${part}` : part;
      return emphasize(escapeHtml(literal));
    })
    .join('');
}

function slugify(value: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'seccion';
}

function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  used.add(slug);
  return slug;
}

/**
 * Small markdown subset for help articles: one title, sections, paragraphs and lists.
 * Output is escaped HTML, so the article body does not need a sanitizer.
 */
export function parseHelpMarkdown(markdown: string): ParsedHelpMarkdown {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  let title = '';
  const html: string[] = [];
  const plain: string[] = [];
  const sectionIds: string[] = [];
  const usedSlugs = new Set<string>();

  const pushParagraph = (buffer: string[]) => {
    if (buffer.length === 0) return;
    const text = buffer.join(' ');
    buffer.length = 0;
    html.push(`<p>${formatInline(text)}</p>`);
    plain.push(text);
  };

  const paragraph: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    const trimmed = line.trim();

    if (trimmed === '') {
      pushParagraph(paragraph);
      index += 1;
      continue;
    }

    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      pushParagraph(paragraph);
      if (!title) title = trimmed.slice(2).trim();
      index += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      pushParagraph(paragraph);
      const heading = trimmed.slice(3).trim();
      const slug = uniqueSlug(slugify(heading), usedSlugs);
      sectionIds.push(slug);
      html.push(`<h2 id="timci-help-${slug}">${formatInline(heading)}</h2>`);
      plain.push(heading);
      index += 1;
      continue;
    }

    if (trimmed.startsWith('- ')) {
      pushParagraph(paragraph);
      const items: string[] = [];
      while (index < lines.length && (lines[index] ?? '').trim().startsWith('- ')) {
        const item = (lines[index] ?? '').trim().slice(2).trim();
        items.push(item);
        index += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ul>`);
      plain.push(...items);
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      pushParagraph(paragraph);
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test((lines[index] ?? '').trim())) {
        const item = (lines[index] ?? '').trim().replace(/^\d+\. /, '').trim();
        items.push(item);
        index += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ol>`);
      plain.push(...items);
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  pushParagraph(paragraph);

  if (!title) throw new Error('Help article is missing a title');

  return {
    title,
    html: html.join(''),
    plainText: [title, ...plain].join('\n'),
    sectionIds,
  };
}
