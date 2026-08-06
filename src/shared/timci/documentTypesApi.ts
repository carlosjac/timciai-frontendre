import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';

export function getDocumentTypeByIdUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/document-types/${requireTimciPathSegment(id)}`;
}

export function getDocumentTypeActivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/document-types/${requireTimciPathSegment(id)}/activate`;
}

export function getDocumentTypeDeactivateUrl(tenantId: string, id: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/document-types/${requireTimciPathSegment(id)}/deactivate`;
}

export function buildDocumentTypeUpdateBody(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  if (variables.countryId !== undefined) payload.countryId = variables.countryId;
  if (variables.appliesTo !== undefined) payload.appliesTo = variables.appliesTo;
  if (variables.validationRuleKey !== undefined) {
    const raw = variables.validationRuleKey;
    payload.validationRuleKey =
      typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;
  }
  return payload;
}
