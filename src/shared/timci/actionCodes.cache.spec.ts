import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mswServer } from '../../test/msw/server.js';
import {
  fetchTimciActionCodes,
  invalidateTimciActionCodes,
  peekTimciActionCodes,
} from './actionCodes.js';

const API = 'http://127.0.0.1/v1';

describe('fetchTimciActionCodes cache', () => {
  afterEach(() => {
    invalidateTimciActionCodes();
  });

  it('does not keep an empty list', async () => {
    let calls = 0;
    mswServer.use(
      http.get(`${API}/authorization/me/action-codes`, () => {
        calls += 1;
        const actionCodes = calls === 1 ? [] : ['menu.bi'];
        return HttpResponse.json({ actionCodes });
      }),
    );

    await expect(fetchTimciActionCodes()).resolves.toEqual([]);
    expect(peekTimciActionCodes()).toBeNull();
    await expect(fetchTimciActionCodes()).resolves.toEqual(['menu.bi']);
    expect(calls).toBe(2);
  });

  it('keeps a non-empty list for the TTL', async () => {
    let calls = 0;
    mswServer.use(
      http.get(`${API}/authorization/me/action-codes`, () => {
        calls += 1;
        return HttpResponse.json({ actionCodes: ['menu.countries'] });
      }),
    );

    await expect(fetchTimciActionCodes()).resolves.toEqual(['menu.countries']);
    await expect(fetchTimciActionCodes()).resolves.toEqual(['menu.countries']);
    expect(calls).toBe(1);
  });

  it('drops a response that started before invalidate', async () => {
    let releaseFirst: (() => void) | undefined;
    let calls = 0;
    mswServer.use(
      http.get(`${API}/authorization/me/action-codes`, async () => {
        calls += 1;
        if (calls === 1) {
          await new Promise<void>((resolve) => {
            releaseFirst = resolve;
          });
          return HttpResponse.json({ actionCodes: [] });
        }
        return HttpResponse.json({ actionCodes: ['menu.bi', 'menu.sales'] });
      }),
    );

    const first = fetchTimciActionCodes();
    await vi.waitFor(() => expect(calls).toBe(1));
    invalidateTimciActionCodes();
    const second = fetchTimciActionCodes();
    releaseFirst?.();

    await expect(second).resolves.toEqual(['menu.bi', 'menu.sales']);
    await expect(first).resolves.toEqual(['menu.bi', 'menu.sales']);
    expect(peekTimciActionCodes()).toEqual(['menu.bi', 'menu.sales']);
  });
});
