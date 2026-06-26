import { getV1Base } from '../../config.js';

/** Id del rol root; no se puede desactivar. */
export const ROLE_ROOT_ID = '00000000-0000-0000-0000-000000000001';

export function getRoleByIdUrl(id: string): string {
  return `${getV1Base()}/authorization/roles/${encodeURIComponent(id)}`;
}

export function getRoleActivateUrl(id: string): string {
  return `${getV1Base()}/authorization/roles/${encodeURIComponent(id)}/activate`;
}

export function getRoleDeactivateUrl(id: string): string {
  return `${getV1Base()}/authorization/roles/${encodeURIComponent(id)}/deactivate`;
}

export function buildRoleUpdateBody(variables: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  return payload;
}
