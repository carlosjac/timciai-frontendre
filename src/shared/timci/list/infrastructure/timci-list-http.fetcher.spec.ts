import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TENANT_STORAGE_KEY } from '../../../../config.js';
import { installMemoryLocalStorage } from '../../../../test/memoryLocalStorage.js';
import { mswServer } from '../../../../test/msw/server.js';
import { fetchTimciListPage } from './timci-list-http.fetcher.js';

const API = 'http://127.0.0.1/v1';

describe('fetchTimciListPage — sessions (client filter/sort/page)', () => {
  afterEach(() => {
    mswServer.resetHandlers();
  });

  it('filters by userName, sorts, and paginates on the client', async () => {
    mswServer.use(
      http.get(`${API}/auth/sessions`, () =>
        HttpResponse.json({
          sessions: [
            {
              id: 's1',
              startedAt: '2024-01-01T10:00:00.000Z',
              expiresAt: '2024-01-02T10:00:00.000Z',
              current: false,
              userName: 'Ada',
              isOwn: true,
            },
            {
              id: 's2',
              startedAt: '2024-01-03T10:00:00.000Z',
              expiresAt: '2024-01-04T10:00:00.000Z',
              current: true,
              userName: 'Bob',
              isOwn: false,
            },
            {
              id: 's3',
              startedAt: '2024-01-02T10:00:00.000Z',
              expiresAt: '2024-01-05T10:00:00.000Z',
              current: false,
              userName: 'Ada Lovelace',
              isOwn: false,
            },
          ],
        }),
      ),
    );

    const filtered = await fetchTimciListPage({
      resource: 'sessions',
      page: 1,
      pageSize: 10,
      filters: [{ field: 'userName', operator: 'contains', value: 'ada' }],
      sorters: [{ field: 'startedAt', order: 'asc' }],
    });

    expect(filtered.total).toBe(2);
    expect(filtered.data.map((r) => r.id)).toEqual(['s1', 's3']);

    const page = await fetchTimciListPage({
      resource: 'sessions',
      page: 2,
      pageSize: 1,
      filters: [{ field: 'userName', operator: 'contains', value: 'ada' }],
      sorters: [{ field: 'startedAt', order: 'asc' }],
    });

    expect(page.total).toBe(2);
    expect(page.data).toHaveLength(1);
    expect(page.data[0]?.id).toBe('s3');
  });

  it('defaults sort to startedAt desc', async () => {
    mswServer.use(
      http.get(`${API}/auth/sessions`, () =>
        HttpResponse.json({
          sessions: [
            { id: 'old', startedAt: 1000, expiresAt: 2000, current: false },
            { id: 'new', startedAt: 3000, expiresAt: 4000, current: true },
          ],
        }),
      ),
    );

    const result = await fetchTimciListPage({
      resource: 'sessions',
      page: 1,
      pageSize: 10,
    });
    expect(result.data.map((r) => r.id)).toEqual(['new', 'old']);
  });
});

describe('fetchTimciListPage — early empty without tenant', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  afterEach(() => {
    mswServer.resetHandlers();
  });

  it('returns empty for sellable_items / price_lists without tenant (no HTTP)', async () => {
    await expect(
      fetchTimciListPage({ resource: 'sellable_items', page: 1, pageSize: 10 }),
    ).resolves.toEqual({ data: [], total: 0 });

    await expect(
      fetchTimciListPage({ resource: 'price_lists', page: 1, pageSize: 10 }),
    ).resolves.toEqual({ data: [], total: 0 });
  });

  it('returns empty for price_list_items without priceListId even with tenant', async () => {
    localStorage.setItem(TENANT_STORAGE_KEY, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    await expect(
      fetchTimciListPage({ resource: 'price_list_items', page: 1, pageSize: 10 }),
    ).resolves.toEqual({ data: [], total: 0 });
  });
});
