import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TENANT_STORAGE_KEY } from '../config.js';
import { invalidateTimciActionCodes } from '../shared/timci/actionCodes.js';
import {
  POST_LOGOUT_LOGIN_HOME_KEY,
  isPostLogoutLoginHome,
} from '../shared/timci/postLogoutLoginHome.js';
import { installMemoryLocalStorage } from '../test/memoryLocalStorage.js';
import { mswServer } from '../test/msw/server.js';
import { createTimciAuthProvider } from './authProvider.js';

const API = 'http://127.0.0.1/v1';
const TENANT = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function mockSessionStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (_i: number) => null as string | null,
  };
}

describe('createTimciAuthProvider', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
    vi.stubGlobal('sessionStorage', mockSessionStorage());
    invalidateTimciActionCodes();
  });

  afterEach(() => {
    mswServer.resetHandlers();
    vi.unstubAllGlobals();
    invalidateTimciActionCodes();
  });

  it('login fails locally without credentials', async () => {
    const auth = createTimciAuthProvider();
    const result = await auth.login!({ email: '', password: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  it('login succeeds and opens the dashboard when the user can see it', async () => {
    mswServer.use(
      http.post(`${API}/auth/login`, () => HttpResponse.json({ ok: true })),
      http.get(`${API}/authorization/me/action-codes`, () =>
        HttpResponse.json({ actionCodes: ['menu.bi', 'menu.countries'] }),
      ),
    );
    const auth = createTimciAuthProvider();
    const result = await auth.login!({ email: 'a@b.c', password: 'secret' });
    expect(result).toEqual({ success: true, redirectTo: '/bi' });
  });

  it('login falls back to the first permitted list without the dashboard', async () => {
    mswServer.use(
      http.post(`${API}/auth/login`, () => HttpResponse.json({ ok: true })),
      http.get(`${API}/authorization/me/action-codes`, () =>
        HttpResponse.json({ actionCodes: ['menu.countries'] }),
      ),
    );
    const auth = createTimciAuthProvider();
    const result = await auth.login!({ email: 'a@b.c', password: 'secret' });
    expect(result).toEqual({ success: true, redirectTo: '/countries' });
  });

  it('logout clears tenant and marks post-logout home', async () => {
    localStorage.setItem(TENANT_STORAGE_KEY, TENANT);
    mswServer.use(
      http.post(`${API}/auth/logout`, () => HttpResponse.json({})),
    );
    const auth = createTimciAuthProvider();
    const result = await auth.logout!();
    expect(result).toEqual({ success: true, redirectTo: '/login' });
    expect(localStorage.getItem(TENANT_STORAGE_KEY)).toBeNull();
    expect(isPostLogoutLoginHome()).toBe(true);
    expect(sessionStorage.getItem(POST_LOGOUT_LOGIN_HOME_KEY)).toBe('1');
  });

  it('logout succeeds even if logout API fails', async () => {
    mswServer.use(
      http.post(`${API}/auth/logout`, () => HttpResponse.json({ message: 'x' }, { status: 500 })),
    );
    const auth = createTimciAuthProvider();
    const result = await auth.logout!();
    expect(result.success).toBe(true);
  });

  it('check returns authenticated when /auth/me ok', async () => {
    mswServer.use(http.get(`${API}/auth/me`, () => HttpResponse.json({ id: '1' })));
    const auth = createTimciAuthProvider();
    await expect(auth.check!()).resolves.toEqual({ authenticated: true });
  });

  it('check returns unauthenticated on failure', async () => {
    mswServer.use(
      http.get(`${API}/auth/me`, () => HttpResponse.json({ message: 'no' }, { status: 401 })),
    );
    const auth = createTimciAuthProvider();
    const result = await auth.check!();
    expect(result.authenticated).toBe(false);
    expect(result.redirectTo).toBe('/login');
  });

  it('onError logs out only on 401', async () => {
    const auth = createTimciAuthProvider();
    await expect(auth.onError!({ statusCode: 401, message: 'x' })).resolves.toMatchObject({
      logout: true,
      redirectTo: '/login',
    });
    await expect(auth.onError!({ statusCode: 403, message: 'x' })).resolves.toEqual({});
  });

  it('getIdentity maps /auth/me', async () => {
    mswServer.use(
      http.get(`${API}/auth/me`, () =>
        HttpResponse.json({ id: 'u1', email: 'a@b.c', name: 'Ada', impersonation: null }),
      ),
    );
    const auth = createTimciAuthProvider();
    await expect(auth.getIdentity!()).resolves.toMatchObject({
      id: 'u1',
      email: 'a@b.c',
      name: 'Ada',
      impersonation: null,
    });
  });
});
