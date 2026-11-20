/**
 * Desktop browsers paint `application/pdf` inside an iframe.
 * Android Chrome, Firefox and Samsung Internet leave that iframe blank.
 */
export function supportsEmbeddedPdfPreview(userAgent: string): boolean {
  return !/Android/i.test(userAgent);
}
