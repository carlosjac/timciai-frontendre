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
});
