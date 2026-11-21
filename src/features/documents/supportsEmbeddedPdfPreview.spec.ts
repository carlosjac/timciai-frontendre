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

  it('rejects iPhone, iPad and iOS browsers, which do not paint a PDF inside an iframe', () => {
    expect(
      supportsEmbeddedPdfPreview(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false);
    expect(
      supportsEmbeddedPdfPreview(
        'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false);
    expect(
      supportsEmbeddedPdfPreview(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false);
  });

  it('treats an iPad that reports a Macintosh user agent as a device without an embedded PDF viewer', () => {
    const ipadDesktop =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
    expect(supportsEmbeddedPdfPreview(ipadDesktop, 5)).toBe(false);
    expect(supportsEmbeddedPdfPreview(ipadDesktop, 0)).toBe(true);
  });

  it('keeps the native viewer on desktop', () => {
    expect(
      supportsEmbeddedPdfPreview(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      ),
    ).toBe(true);
    expect(
      supportsEmbeddedPdfPreview(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        0,
      ),
    ).toBe(true);
  });
});
