import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';
import { timciFetch } from './http.js';

export type MonetaryPolicyKindItem = {
  kind: string;
  description: string;
  capabilities: string[];
};

export type MonetaryPolicyListItem = {
  id: string;
  entityId: string;
  entityName?: string | null;
  kind: string;
  name: string;
  params: Record<string, unknown>;
  isActive: boolean;
};

export function getMonetaryPoliciesEntityListUrl(tenantId: string, entityId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/entities/${requireTimciPathSegment(entityId)}/monetary-policies`;
}

export function getMonetaryPolicyByIdUrl(
  tenantId: string,
  entityId: string,
  policyId: string,
): string {
  return `${getMonetaryPoliciesEntityListUrl(tenantId, entityId)}/${requireTimciPathSegment(policyId)}`;
}

export function getMonetaryPolicyActivateUrl(
  tenantId: string,
  entityId: string,
  policyId: string,
): string {
  return `${getMonetaryPolicyByIdUrl(tenantId, entityId, policyId)}/activate`;
}

export function getMonetaryPolicyDeactivateUrl(
  tenantId: string,
  entityId: string,
  policyId: string,
): string {
  return `${getMonetaryPolicyByIdUrl(tenantId, entityId, policyId)}/deactivate`;
}

export function getMonetaryPolicyKindsUrl(tenantId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/monetary-policy-kinds`;
}

export async function fetchMonetaryPolicyKinds(
  tenantId: string,
): Promise<MonetaryPolicyKindItem[]> {
  const { json } = await timciFetch(getMonetaryPolicyKindsUrl(tenantId));
  return Array.isArray(json) ? (json as MonetaryPolicyKindItem[]) : [];
}

/** Active policies for selects (default assignment). */
export async function fetchActiveMonetaryPolicies(
  tenantId: string,
  entityId: string,
): Promise<MonetaryPolicyListItem[]> {
  const listBase = getMonetaryPoliciesEntityListUrl(tenantId, entityId);
  const filter = encodeURIComponent(
    JSON.stringify({ isActive: { operator: 'eq', value: true } }),
  );
  const { json } = await timciFetch(
    `${listBase}?filter=${filter}&range=${encodeURIComponent(JSON.stringify([0, 199]))}&sort=${encodeURIComponent(JSON.stringify(['name', 'ASC']))}`,
  );
  return Array.isArray(json) ? (json as MonetaryPolicyListItem[]) : [];
}

export function buildMonetaryPolicyCreateBody(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const params =
    variables.params && typeof variables.params === 'object' && !Array.isArray(variables.params)
      ? (variables.params as Record<string, unknown>)
      : {};
  return {
    kind: String(variables.kind ?? '').trim(),
    name: String(variables.name ?? '').trim(),
    params,
  };
}

export function buildMonetaryPolicyUpdateBody(
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  if (variables.params !== undefined) {
    payload.params =
      variables.params && typeof variables.params === 'object' && !Array.isArray(variables.params)
        ? variables.params
        : {};
  }
  return payload;
}
