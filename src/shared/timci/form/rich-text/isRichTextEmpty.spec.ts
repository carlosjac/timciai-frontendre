import { describe, expect, it } from 'vitest';
import { isRichTextEmpty } from './isRichTextEmpty.js';

describe('isRichTextEmpty', () => {
  it('treats blank and empty markup as empty', () => {
    expect(isRichTextEmpty('')).toBe(true);
    expect(isRichTextEmpty('   ')).toBe(true);
    expect(isRichTextEmpty('<p></p>')).toBe(true);
    expect(isRichTextEmpty('<p><br></p>')).toBe(true);
    expect(isRichTextEmpty('<p>&nbsp;</p>')).toBe(true);
  });

  it('detects visible text', () => {
    expect(isRichTextEmpty('<p>hola</p>')).toBe(false);
    expect(isRichTextEmpty('plain')).toBe(false);
  });
});
