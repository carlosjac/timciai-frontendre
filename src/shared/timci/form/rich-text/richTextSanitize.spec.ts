import { describe, expect, it } from 'vitest';
import { sanitizeRichTextHtml } from './richTextSanitize.js';

describe('sanitizeRichTextHtml', () => {
  it('keeps allowed tags', () => {
    const html = sanitizeRichTextHtml('<p>Hola <strong>mundo</strong></p>');
    expect(html).toContain('<p>');
    expect(html).toContain('<strong>');
    expect(html).toContain('Hola');
  });

  it('strips scripts and attributes', () => {
    const html = sanitizeRichTextHtml(
      '<p onclick="alert(1)">x</p><script>alert(1)</script><a href="https://x">y</a>',
    );
    expect(html).not.toContain('script');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('href');
    expect(html).toContain('x');
    expect(html).toContain('y');
  });

  it('strips script, onerror and href before that HTML reaches the editor', () => {
    const html = sanitizeRichTextHtml(
      '<p>hola</p><img src=x onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">y</a>',
    );
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('script');
    expect(html).not.toContain('href');
    expect(html).not.toContain('<img');
    expect(html).toContain('hola');
    expect(html).toContain('y');
  });
});
