import { describe, expect, it } from 'vitest';
import {
  asPdfBlob,
  pdfFileNameFromContentDisposition,
  safePdfDownloadName,
} from './pdfBytes.js';

const PDF_HEADER = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

describe('asPdfBlob', () => {
  it('accepts a body that starts with %PDF- and labels it application/pdf', async () => {
    const raw = new Blob([PDF_HEADER], { type: 'application/octet-stream' });
    const pdf = await asPdfBlob(raw);
    expect(pdf).not.toBeNull();
    expect(pdf?.type).toBe('application/pdf');
    const bytes = new Uint8Array(await pdf!.arrayBuffer());
    expect(Array.from(bytes.slice(0, 5))).toEqual([0x25, 0x50, 0x44, 0x46, 0x2d]);
  });

  it('rejects HTML even when the response type claims to be a PDF', async () => {
    const raw = new Blob(['<html><script>alert(1)</script></html>'], { type: 'application/pdf' });
    expect(await asPdfBlob(raw)).toBeNull();
  });

  it('rejects a short body', async () => {
    const raw = new Blob([new Uint8Array([0x25, 0x50])], { type: 'application/pdf' });
    expect(await asPdfBlob(raw)).toBeNull();
  });
});

describe('safePdfDownloadName', () => {
  it('keeps a safe pdf basename', () => {
    expect(safePdfDownloadName('cuenta-corriente-Ada-USD.pdf', 'fallback.pdf')).toBe(
      'cuenta-corriente-Ada-USD.pdf',
    );
  });

  it('drops path segments and forces a .pdf suffix', () => {
    expect(safePdfDownloadName('../factura.html', 'cuenta-corriente.pdf')).toBe('factura.html.pdf');
    expect(safePdfDownloadName('..\\evil.exe', 'cuenta-corriente.pdf')).toBe('evil.exe.pdf');
  });

  it('uses the fallback when the name is empty or only dots', () => {
    expect(safePdfDownloadName('', 'cuenta-corriente-abc.pdf')).toBe('cuenta-corriente-abc.pdf');
    expect(safePdfDownloadName('..', 'cuenta-corriente-abc.pdf')).toBe('cuenta-corriente-abc.pdf');
    expect(safePdfDownloadName('***', 'not safe!.html')).toBe('notsafe.html.pdf');
  });
});

describe('pdfFileNameFromContentDisposition', () => {
  it('sanitizes the quoted filename', () => {
    expect(
      pdfFileNameFromContentDisposition(
        'attachment; filename="../factura.html"',
        'cuenta-corriente-id.pdf',
      ),
    ).toBe('factura.html.pdf');
  });

  it('falls back when the header has no filename', () => {
    expect(pdfFileNameFromContentDisposition(null, 'cuenta-corriente-id.pdf')).toBe(
      'cuenta-corriente-id.pdf',
    );
  });
});
