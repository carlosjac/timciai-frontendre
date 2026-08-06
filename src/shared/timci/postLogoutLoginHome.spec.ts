import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  POST_LOGOUT_LOGIN_HOME_KEY,
  consumePostLogoutLoginHome,
  isPostLogoutLoginHome,
  markPostLogoutLoginHome,
} from './postLogoutLoginHome.js';

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

describe('postLogoutLoginHome', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', mockSessionStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('marks, reads, and consumes the flag', () => {
    expect(isPostLogoutLoginHome()).toBe(false);
    markPostLogoutLoginHome();
    expect(isPostLogoutLoginHome()).toBe(true);
    expect(sessionStorage.getItem(POST_LOGOUT_LOGIN_HOME_KEY)).toBe('1');
    expect(consumePostLogoutLoginHome()).toBe(true);
    expect(isPostLogoutLoginHome()).toBe(false);
    expect(consumePostLogoutLoginHome()).toBe(false);
  });
});
