import { getV1Base } from '../../config.js';
import { timciFetch } from './http.js';

export type TimciImpersonationParty = {
  id: string;
  email: string;
  name: string;
};

export type TimciImpersonationState = {
  active: boolean;
  actor: TimciImpersonationParty;
  target: TimciImpersonationParty;
};

export type TimciMeResponse = {
  id: string;
  email: string;
  name?: string;
  isActive?: boolean;
  timeZone?: string | null;
  theme?: string | null;
  dateFormat?: string;
  impersonation?: TimciImpersonationState | null;
};

export function getImpersonateUrl(): string {
  return `${getV1Base()}/auth/impersonate`;
}

export function getStopImpersonationUrl(): string {
  return `${getV1Base()}/auth/impersonate/stop`;
}

export async function startImpersonation(userId: string): Promise<void> {
  await timciFetch(getImpersonateUrl(), {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function stopImpersonation(): Promise<void> {
  await timciFetch(getStopImpersonationUrl(), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
