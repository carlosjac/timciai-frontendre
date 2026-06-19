import { getV1Base } from '../../config.js';

export function getUserByIdUrl(id: string): string {
  return `${getV1Base()}/authentication/users/${encodeURIComponent(id)}`;
}

export function getUserActivateUrl(id: string): string {
  return `${getV1Base()}/authentication/users/${encodeURIComponent(id)}/activate`;
}

export function getUserDeactivateUrl(id: string): string {
  return `${getV1Base()}/authentication/users/${encodeURIComponent(id)}/deactivate`;
}

export function buildUserUpdateBody(variables: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (variables.name !== undefined) payload.name = String(variables.name).trim();
  if (variables.email !== undefined) payload.email = String(variables.email).trim();
  if (variables.timeZone !== undefined) payload.timeZone = String(variables.timeZone).trim();
  if (variables.theme !== undefined) payload.theme = variables.theme === 'dark' ? 'dark' : 'light';
  if (variables.dateFormat !== undefined) payload.dateFormat = variables.dateFormat;
  return payload;
}
