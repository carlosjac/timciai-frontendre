import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { HttpError } from '@refinedev/core';
import { TENANT_STORAGE_KEY } from '../config.js';
import { createTimciDataProvider } from './timciDataProvider.js';
import { installMemoryLocalStorage } from '../test/memoryLocalStorage.js';
import { mswServer } from '../test/msw/server.js';

const API = 'http://127.0.0.1/v1';
const TENANT = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const COUNTRY_ID = '11111111-2222-3333-4444-555555555555';

describe('createTimciDataProvider', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  afterEach(() => {
    mswServer.resetHandlers();
  });

  it('getApiUrl returns v1 base from VITE_API_URL', () => {
    const dp = createTimciDataProvider();
    expect(dp.getApiUrl()).toBe(API);
  });

  it('getList fetches global users with sort/range and Content-Range total', async () => {
    let requestedUrl = '';
    mswServer.use(
      http.get(`${API}/authentication/users`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json([{ id: 'u1', email: 'a@b.c' }], {
          headers: { 'Content-Range': 'items 0-0/3' },
        });
      }),
    );

    const dp = createTimciDataProvider();
    const result = await dp.getList({
      resource: 'users',
      pagination: { current: 1, pageSize: 10 },
      sorters: [{ field: 'email', order: 'asc' }],
      filters: [],
    });

    expect(result.data).toEqual([{ id: 'u1', email: 'a@b.c' }]);
    expect(result.total).toBe(3);
    const u = new URL(requestedUrl);
    expect(u.searchParams.get('sort')).toBe(JSON.stringify(['email', 'ASC']));
    expect(u.searchParams.get('range')).toBe(JSON.stringify([0, 9]));
    expect(requestedUrl.startsWith(`${API}/authentication/users`)).toBe(true);
  });

  it('getList for tenant resource without tenant throws 400', async () => {
    const dp = createTimciDataProvider();
    await expect(
      dp.getList({
        resource: 'countries',
        pagination: { current: 1, pageSize: 10 },
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('getOne country uses tenant path and returns record', async () => {
    localStorage.setItem(TENANT_STORAGE_KEY, TENANT);
    mswServer.use(
      http.get(`${API}/tenants/${TENANT}/countries/${COUNTRY_ID}`, () =>
        HttpResponse.json({ id: COUNTRY_ID, name: 'Uruguay', isoCode: 'UY' }),
      ),
    );

    const dp = createTimciDataProvider();
    const { data } = await dp.getOne({ resource: 'countries', id: COUNTRY_ID });
    expect(data).toMatchObject({ id: COUNTRY_ID, name: 'Uruguay', isoCode: 'UY' });
  });

  it('getOne rejects invalid id before fetch', async () => {
    localStorage.setItem(TENANT_STORAGE_KEY, TENANT);
    const dp = createTimciDataProvider();
    try {
      // Fallback getOne path (sales) maps requireTimciPathSegment failure → 400 HttpError.
      await dp.getOne({ resource: 'sales', id: '../etc/passwd' });
      expect.unreachable('should throw');
    } catch (e) {
      const err = e as HttpError;
      expect(err.statusCode).toBe(400);
      expect(String(err.message)).toMatch(/Invalid resource id/i);
    }
  });

  it('update entities PATCH includes supportedCurrencyIds', async () => {
    const entityId = '01933a1b-2c3d-7e4f-8a0b-1c2d3e4f5a6b';
    const usd = '01933a1b-2c3d-7001-8a0b-1c2d3e4f5a6b';
    const eur = '01933a1b-2c3d-7009-8a0b-1c2d3e4f5a6b';
    let body: unknown;
    localStorage.setItem(TENANT_STORAGE_KEY, TENANT);
    mswServer.use(
      http.patch(`${API}/tenants/${TENANT}/entities/${entityId}`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ id: entityId, supportedCurrencyIds: [usd, eur] });
      }),
    );

    const dp = createTimciDataProvider();
    await dp.update({
      resource: 'entities',
      id: entityId,
      variables: { address: 'Street 1', supportedCurrencyIds: [usd, eur] },
    });

    expect(body).toMatchObject({
      address: 'Street 1',
      supportedCurrencyIds: [usd, eur],
    });
  });
});
