import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TENANT_STORAGE_KEY } from '../../../../config.js';
import { installMemoryLocalStorage } from '../../../../test/memoryLocalStorage.js';
import { mswServer } from '../../../../test/msw/server.js';
import { fetchTimciListPage } from './timci-list-http.fetcher.js';

const API = 'http://127.0.0.1/v1';

describe('fetchTimciListPage — sessions (server range and filter)', () => {
  afterEach(() => {
    mswServer.resetHandlers();
  });

  it('sends range, sort and userName, and reads Content-Range', async () => {
    let requestUrl = '';
    mswServer.use(
      http.get(`${API}/auth/sessions`, ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json(
          {
            sessions: [
              {
                id: 's3',
                startedAt: '2024-01-02T10:00:00.000Z',
                expiresAt: '2024-01-05T10:00:00.000Z',
                current: false,
                userName: 'Ada Lovelace',
                isOwn: false,
              },
            ],
          },
          { headers: { 'Content-Range': 'sessions 1-1/2' } },
        );
      }),
    );

    const page = await fetchTimciListPage({
      resource: 'sessions',
      page: 2,
      pageSize: 1,
      filters: [{ field: 'userName', operator: 'contains', value: 'ada' }],
      sorters: [{ field: 'startedAt', order: 'asc' }],
    });

    const url = new URL(requestUrl);
    expect(JSON.parse(url.searchParams.get('range') ?? '')).toEqual([1, 1]);
    expect(JSON.parse(url.searchParams.get('sort') ?? '')).toEqual(['startedAt', 'ASC']);
    expect(JSON.parse(url.searchParams.get('filter') ?? '')).toEqual({
      userName: { operator: 'contains', value: 'ada' },
    });
    expect(page.total).toBe(2);
    expect(page.data).toHaveLength(1);
    expect(page.data[0]?.id).toBe('s3');
  });

  it('defaults sort to startedAt desc', async () => {
    let requestUrl = '';
    mswServer.use(
      http.get(`${API}/auth/sessions`, ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json(
          {
            sessions: [{ id: 'new', startedAt: 3000, expiresAt: 4000, current: true }],
          },
          { headers: { 'Content-Range': 'sessions 0-9/1' } },
        );
      }),
    );

    const result = await fetchTimciListPage({
      resource: 'sessions',
      page: 1,
      pageSize: 10,
    });
    const url = new URL(requestUrl);
    expect(JSON.parse(url.searchParams.get('sort') ?? '')).toEqual(['startedAt', 'DESC']);
    expect(result.data.map((r) => r.id)).toEqual(['new']);
    expect(result.total).toBe(1);
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
