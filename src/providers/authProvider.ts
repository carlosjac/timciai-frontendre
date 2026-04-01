import type { AuthProvider, CheckResponse, HttpError } from '@refinedev/core';
import { getV1Base } from '../config.js';
import { timciFetch } from '../shared/timci/http.js';
import { translateEs } from '../i18n/index.js';
import {
  fetchTimciActionCodes,
  invalidateTimciActionCodes,
  type TimciPermissionsData,
} from '../shared/timci/actionCodes.js';

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
      return { success: true, redirectTo: '/' };
    },

    logout: async () => {
      invalidateTimciActionCodes();
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
      if (err?.statusCode === 401 || err?.statusCode === 403) {
        invalidateTimciActionCodes();
        return { logout: true, redirectTo: '/login', error: err };
      }
      return {};
    },

    getIdentity: async () => {
      const { json } = await timciFetch(`${base()}/auth/me`);
      const u = json as { id: string; email: string; name?: string };
      return {
        id: u.id,
        name: u.name ?? u.email,
        email: u.email,
      };
    },

    getPermissions: async (): Promise<TimciPermissionsData> => {
      const actionCodes = await fetchTimciActionCodes();
      return { actionCodes };
    },
  };
}
