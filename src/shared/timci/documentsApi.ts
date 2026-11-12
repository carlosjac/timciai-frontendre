import { getV1Base } from '../../config.js';
import { getStoredTenantId } from './apiUrl.js';
import { asPdfBlob } from './pdfBytes.js';
import { encodeTimciPathSegment } from './pathSegment.js';
import { timciFetch } from './http.js';

export const DOCUMENT_LOGO_MAX_BYTES = 512 * 1024;
export const DOCUMENT_LOGO_ACCEPT = 'image/png,image/jpeg,image/webp';

function documentBrandingLogoUrl(tenantId: string, entityId: string): string {
  return `${getV1Base()}/tenants/${encodeTimciPathSegment(tenantId)}/entities/${encodeTimciPathSegment(entityId)}/document-branding/logo`;
}

export type DocumentLogoMeta = {
  path: string;
  contentType: string;
};

/** Returns logo metadata or null when the entity has no logo (404). */
export async function fetchDocumentLogoMeta(
  entityId: string,
): Promise<DocumentLogoMeta | null> {
  const tenantId = getStoredTenantId();
  if (!tenantId) return null;
  try {
    const { json } = await timciFetch(documentBrandingLogoUrl(tenantId, entityId));
    return json as DocumentLogoMeta;
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    if (status === 404) return null;
    throw e;
  }
}

/**
 * Data URL for preview (no revoke needed; avoids StrictMode blob: URL races).
 * Forces MIME from Content-Type so the browser can decode the image.
 */
export async function fetchDocumentLogoObjectUrl(entityId: string): Promise<string | null> {
  const tenantId = getStoredTenantId();
  if (!tenantId) return null;
  const url = `${documentBrandingLogoUrl(tenantId, entityId)}/content`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'X-Use-Session': 'true', Accept: 'image/png,image/jpeg,image/webp,*/*' },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 8) return null;
  const magic = new Uint8Array(buf, 0, 4);
  const isPng = magic[0] === 0x89 && magic[1] === 0x50 && magic[2] === 0x4e && magic[3] === 0x47;
  const isJpeg = magic[0] === 0xff && magic[1] === 0xd8;
  const isRiff = magic[0] === 0x52 && magic[1] === 0x49 && magic[2] === 0x46 && magic[3] === 0x46;
  if (!isPng && !isJpeg && !isRiff) return null;
  const headerCt = (res.headers.get('Content-Type') || '').split(';')[0]?.trim().toLowerCase();
  const ct =
    headerCt && headerCt.startsWith('image/')
      ? headerCt
      : isPng
        ? 'image/png'
        : isJpeg
          ? 'image/jpeg'
          : 'image/webp';
  const blob = new Blob([buf], { type: ct });
  return await new Promise<string | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read logo'));
    reader.readAsDataURL(blob);
  });
}

export async function uploadDocumentLogo(entityId: string, file: File): Promise<void> {
  const tenantId = getStoredTenantId();
  if (!tenantId) throw new Error('Tenant required');
  const body = new FormData();
  body.append('file', file);
  await timciFetch(documentBrandingLogoUrl(tenantId, entityId), {
    method: 'PUT',
    body,
  });
}

export async function clearDocumentLogo(entityId: string): Promise<void> {
  const tenantId = getStoredTenantId();
  if (!tenantId) throw new Error('Tenant required');
  await timciFetch(documentBrandingLogoUrl(tenantId, entityId), { method: 'DELETE' });
}

export type IssuedDocumentRecord = {
  id: string;
  tenantId?: string;
  entityId?: string;
  customerId?: string;
  commercialTransactionId?: string;
  documentKind: string;
  jurisdiction?: string;
  txType?: string;
  originKind?: string;
  emitterKey?: string;
  status: string;
  number: string | null;
  series?: string | null;
  relatedDocumentId?: string | null;
  errorMessage: string | null;
  issuedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  hasContent: boolean;
  commercialTransactionEntityTxnNumber?: number | null;
  commercialTransactionConcept?: string | null;
  countryName?: string | null;
};

function documentsBaseUrl(tenantId: string): string {
  return `${getV1Base()}/tenants/${encodeTimciPathSegment(tenantId)}/documents`;
}

/** Fetches PDF bytes as a Blob (session cookie). Caller must revoke object URLs. */
export async function fetchIssuedDocumentPdfBlob(documentId: string): Promise<Blob | null> {
  const tenantId = getStoredTenantId();
  if (!tenantId) return null;
  const url = `${documentsBaseUrl(tenantId)}/${encodeTimciPathSegment(documentId)}/content`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'X-Use-Session': 'true', Accept: 'application/pdf' },
  });
  if (!res.ok) return null;
  const raw = await res.blob();
  return asPdfBlob(raw);
}

/** Downloads issued document PDF; returns false if content is missing or the request fails. */
export async function downloadIssuedDocumentPdf(documentId: string): Promise<boolean> {
  const blob = await fetchIssuedDocumentPdfBlob(documentId);
  if (!blob) return false;
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `document-${documentId}.pdf`;
  a.click();
  URL.revokeObjectURL(href);
  return true;
}
