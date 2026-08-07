import { describe, expect, it } from 'vitest';
import { normalizeRichTextField } from './normalizeRichTextField.js';

describe('normalizeRichTextField', () => {
  it('returns fallback for empty / blank HTML', () => {
    expect(normalizeRichTextField('')).toBe('-');
    expect(normalizeRichTextField('<p></p>')).toBe('-');
    expect(normalizeRichTextField('<p><br></p>', 'n/a')).toBe('n/a');
    expect(normalizeRichTextField(null)).toBe('-');
  });

  it('sanitizes script tags and keeps visible text', () => {
    const out = normalizeRichTextField('<p>Hola<script>alert(1)</script></p>');
    expect(out).toContain('Hola');
    expect(out.toLowerCase()).not.toContain('<script');
  });

  it('keeps non-empty sanitized HTML', () => {
    expect(normalizeRichTextField('<p>Nota</p>')).toMatch(/Nota/);
  });
});
