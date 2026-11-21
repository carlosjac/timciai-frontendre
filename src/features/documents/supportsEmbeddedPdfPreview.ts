/**
 * Desktop browsers paint `application/pdf` inside an iframe.
 * Android and iOS leave that iframe blank. iPadOS in desktop mode reports a
 * Macintosh user agent, so a multi-touch Macintosh is treated as an iPad.
 */
export function supportsEmbeddedPdfPreview(userAgent: string, maxTouchPoints = 0): boolean {
  if (/Android/i.test(userAgent)) return false;
  if (/iPhone|iPad|iPod|CriOS|FxiOS|EdgiOS/i.test(userAgent)) return false;
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return false;
  return true;
}
