import { describe, expect, it } from 'vitest';
import { supportsEmbeddedPdfPreview } from './supportsEmbeddedPdfPreview.js';

describe('supportsEmbeddedPdfPreview', () => {
  it('rejects Android browsers, which do not paint a PDF inside an iframe', () => {
    expect(
      supportsEmbeddedPdfPreview(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
      ),
    ).toBe(false);
    expect(
      supportsEmbeddedPdfPreview(
        'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36',
      ),
    ).toBe(false);
  });

  it('keeps the native viewer on desktop', () => {
    expect(
      supportsEmbeddedPdfPreview(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ),
    ).toBe(true);
  });
});
