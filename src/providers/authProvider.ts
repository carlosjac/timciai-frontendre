import type { AuthProvider, CheckResponse, HttpError } from '@refinedev/core';
import { getV1Base, LEGACY_TENANT_STORAGE_KEY, TENANT_STORAGE_KEY } from '../config.js';
import { timciFetch } from '../shared/timci/http.js';
import { translateEs } from '../i18n/index.js';
import {
  fetchTimciActionCodes,
  getFirstAccessibleListPath,
  invalidateTimciActionCodes,
  type TimciPermissionsData,
} from '../shared/timci/actionCodes.js';
import { markPostLogoutLoginHome, consumePostLogoutLoginHome } from '../shared/timci/postLogoutLoginHome.js';

function clearStoredTenantSelection(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TENANT_STORAGE_KEY);
  localStorage.removeItem(LEGACY_TENANT_STORAGE_KEY);
}

export function createTimciAuthProvider(): AuthProvider {
  const base = () => getV1Base();

  return {
    login: async (params: Record<string, unknown>) => {
      // Refine Ant Design AuthPage submits `email` + `password` (see LoginFormTypes), not `username`.
      const emailRaw = params.email ?? params.username;
      const email = typeof emailRaw === 'string' ? emailRaw.trim() : '';
      const password = typeof params.password === 'string' ? params.password : '';
      if (!email || !password) {
        return {
          success: false,
          error: new Error(translateEs('auth.login.missingCredentials')),
        };
      }
      await timciFetch(`${base()}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      invalidateTimciActionCodes();
      consumePostLogoutLoginHome();
      const codes = await fetchTimciActionCodes();
      // Home when no `?to=` (e.g. after logout). With menu.bi that home is the dashboard.
      // Deep links keep `?to=` via Authenticated. Empty codes mean the lookup failed: `/` retries it.
      const redirectTo = codes.length > 0 ? getFirstAccessibleListPath(codes) : '/';

      return { success: true, redirectTo };
    },

    logout: async () => {
      invalidateTimciActionCodes();
      clearStoredTenantSelection();
      markPostLogoutLoginHome();
      try {
        await timciFetch(`${base()}/auth/logout`, {
          method: 'POST',
          body: JSON.stringify({}),
        });
      } catch {
        // ignore network errors on logout
      }
      return { success: true, redirectTo: '/login' };
    },

    check: async (): Promise<CheckResponse> => {
      try {
        await timciFetch(`${base()}/auth/me`);
        return { authenticated: true };
      } catch (e: unknown) {
        const err = e as HttpError;
        return {
          authenticated: false,
          redirectTo: '/login',
          error: err,
        };
      }
    },

    onError: async (error: unknown) => {
      const err = error as HttpError;
      // Only unauthenticated (401) ends the session. 403 is permission denied and must not logout.
      if (err?.statusCode === 401) {
        invalidateTimciActionCodes();
        return { logout: true, redirectTo: '/login', error: err };
      }
      return {};
    },

    getIdentity: async () => {
      const { json } = await timciFetch(`${base()}/auth/me`);
      const u = json as {
        id: string;
        email: string;
        name?: string;
        impersonation?: {
          active: boolean;
          actor: { id: string; email: string; name: string };
          target: { id: string; email: string; name: string };
        } | null;
      };
      return {
        id: u.id,
        name: u.name ?? u.email,
        email: u.email,
        impersonation: u.impersonation ?? null,
      };
    },

    getPermissions: async (): Promise<TimciPermissionsData> => {
      const actionCodes = await fetchTimciActionCodes();
      return { actionCodes };
    },
  };
}
