/** `%PDF-` — only bodies with this signature are treated as PDF. */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d] as const;

/**
 * Returns a PDF blob when `raw` starts with `%PDF-`.
 * Other bodies are rejected instead of being relabeled as `application/pdf`.
 */
export async function asPdfBlob(raw: Blob): Promise<Blob | null> {
  if (raw.size < PDF_MAGIC.length) return null;
  const header = new Uint8Array(await raw.slice(0, PDF_MAGIC.length).arrayBuffer());
  for (let i = 0; i < PDF_MAGIC.length; i += 1) {
    if (header[i] !== PDF_MAGIC[i]) return null;
  }
  const bytes = await raw.arrayBuffer();
  return new Blob([bytes], { type: 'application/pdf' });
}

function pdfFallbackName(fallback: string): string {
  const stem = fallback.replace(/\.pdf$/i, '').replace(/[^A-Za-z0-9._-]/g, '');
  if (!stem || /^\.+$/.test(stem)) return 'document.pdf';
  return `${stem}.pdf`;
}

/**
 * Basename limited to `[A-Za-z0-9._-]`, always ending in `.pdf`.
 * Path segments and other extensions (`.html`, `.exe`) cannot survive.
 */
export function safePdfDownloadName(raw: string | null | undefined, fallback: string): string {
  const base = (raw ?? '').trim().split(/[/\\]/).pop() ?? '';
  const stem = base.replace(/\.pdf$/i, '').replace(/[^A-Za-z0-9._-]/g, '');
  if (!stem || /^\.+$/.test(stem)) return pdfFallbackName(fallback);
  return `${stem}.pdf`;
}

/** Reads `filename="..."` and passes it through `safePdfDownloadName`. */
export function pdfFileNameFromContentDisposition(
  header: string | null | undefined,
  fallback: string,
): string {
  const match = /filename="([^"]*)"/i.exec(header ?? '');
  return safePdfDownloadName(match?.[1], fallback);
}
