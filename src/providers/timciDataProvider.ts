import type {
  BaseRecord,
  CreateParams,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
  GetListParams,
  GetOneParams,
  Pagination,
  UpdateParams,
} from '@refinedev/core';
import { getV1Base } from '../config.js';
import { getResourceApiBase, getStoredTenantId } from '../shared/timci/apiUrl.js';
import { timciFetch, toHttpError } from '../shared/timci/http.js';
import { fetchTimciListPage } from '../shared/timci/list/infrastructure/timci-list-http.fetcher.js';
import {
  buildPriceListItemCreateBody,
  buildPriceListItemUpdateBody,
  getPriceListItemByIdUrl,
  getPriceListItemsListUrl,
} from '../shared/timci/priceListItemsApi.js';
import {
  buildPriceListCreateBody,
  buildPriceListUpdateBody,
  getPriceListByIdUrl,
  getPriceListsEntityListUrl,
} from '../shared/timci/priceListsApi.js';
import {
  buildSellableItemCreateBody,
  buildSellableItemUpdateBody,
  getSellableItemByIdUrl,
  getSellableItemsEntityListUrl,
} from '../shared/timci/sellableItemsApi.js';

function paginationValues(p: Pagination | undefined): { current: number; pageSize: number } {
  const ext = p as Pagination & { current?: number; currentMode?: 'off' | 'server' | 'client' };
  const modeOff = ext?.mode === 'off' || ext?.currentMode === 'off';
  const current = modeOff ? 1 : (ext?.current ?? ext?.currentPage ?? 1);
  const pageSize = ext?.pageSize ?? 25;
  return { current, pageSize };
}

export function createTimciDataProvider(): DataProvider {
  return {
    getApiUrl: () => getV1Base(),

    getList: async <TData extends BaseRecord = BaseRecord>({
      resource,
      pagination,
      filters,
      sorters,
      meta,
    }: GetListParams) => {
      const { current, pageSize } = paginationValues(pagination);
      return fetchTimciListPage<TData>({
        resource,
        page: current,
        pageSize,
        sorters,
        filters,
        meta: meta as Record<string, unknown> | undefined,
      });
    },

    getOne: async <TData extends BaseRecord = BaseRecord>({ resource, id }: GetOneParams) => {
      if (resource === 'sellable_items') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for this resource.');
        }
        const { json } = await timciFetch(getSellableItemByIdUrl(tenantId, String(id)));
        return { data: json as TData };
      }
      if (resource === 'price_lists') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for this resource.');
        }
        const { json } = await timciFetch(getPriceListByIdUrl(tenantId, String(id)));
        return { data: json as TData };
      }
      if (resource === 'price_list_items') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for this resource.');
        }
        const { json } = await timciFetch(getPriceListItemByIdUrl(tenantId, String(id)));
        return { data: json as TData };
      }
      const base = getResourceApiBase(resource);
      if (!base) {
        throw toHttpError(400, 'Select a tenant in the header for this resource.');
      }
      const { json } = await timciFetch(`${base}/${id}`);
      return { data: json as TData };
    },

    create: async <TData extends BaseRecord = BaseRecord, TVariables = Record<string, unknown>>({
      resource,
      variables,
    }: CreateParams<TVariables>) => {
      if (resource === 'sellable_items') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for tenant-scoped resources.');
        }
        const vars = variables as Record<string, unknown>;
        const entityId = String(vars.entityId ?? '');
        if (!entityId) {
          throw toHttpError(400, 'entityId is required to create a sellable item.');
        }
        const url = getSellableItemsEntityListUrl(tenantId, entityId);
        const body = buildSellableItemCreateBody(vars);
        const { json } = await timciFetch(url, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return { data: json as TData };
      }
      if (resource === 'price_lists') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for tenant-scoped resources.');
        }
        const vars = variables as Record<string, unknown>;
        const entityId = String(vars.entityId ?? '');
        if (!entityId) {
          throw toHttpError(400, 'entityId is required to create a price list.');
        }
        const url = getPriceListsEntityListUrl(tenantId, entityId);
        const body = buildPriceListCreateBody(vars);
        const { json } = await timciFetch(url, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return { data: json as TData };
      }
      if (resource === 'price_list_items') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for tenant-scoped resources.');
        }
        const vars = variables as Record<string, unknown>;
        const priceListId = String(vars.priceListId ?? '').trim();
        if (!priceListId) {
          throw toHttpError(400, 'priceListId is required to create a price list item.');
        }
        const url = getPriceListItemsListUrl(tenantId, priceListId);
        const body = buildPriceListItemCreateBody(vars);
        const { json } = await timciFetch(url, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return { data: json as TData };
      }
      const base = getResourceApiBase(resource);
      if (!base) {
        throw toHttpError(
          400,
          'Select a tenant in the header for tenant-scoped resources.',
        );
      }
      const { json } = await timciFetch(base, {
        method: 'POST',
        body: JSON.stringify(variables),
      });
      return { data: json as TData };
    },

    update: async <TData extends BaseRecord = BaseRecord, TVariables = Record<string, unknown>>({
      resource,
      id,
      variables,
    }: UpdateParams<TVariables>) => {
      if (resource === 'sellable_items') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for this resource.');
        }
        const body = buildSellableItemUpdateBody(variables as Record<string, unknown>);
        const { json } = await timciFetch(getSellableItemByIdUrl(tenantId, String(id)), {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return { data: { ...(json as object), id } as TData };
      }
      if (resource === 'price_lists') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for this resource.');
        }
        const body = buildPriceListUpdateBody(variables as Record<string, unknown>);
        const { json } = await timciFetch(getPriceListByIdUrl(tenantId, String(id)), {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return { data: { ...(json as object), id } as TData };
      }
      if (resource === 'price_list_items') {
        const tenantId = getStoredTenantId();
        if (!tenantId) {
          throw toHttpError(400, 'Select a tenant in the header for this resource.');
        }
        const body = buildPriceListItemUpdateBody(variables as Record<string, unknown>);
        const { json } = await timciFetch(getPriceListItemByIdUrl(tenantId, String(id)), {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return { data: { ...(json as object), id } as TData };
      }
      throw toHttpError(501, 'Update is not wired for this resource.');
    },

    deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = Record<string, unknown>>(
      params: DeleteOneParams<TVariables>,
    ): Promise<DeleteOneResponse<TData>> => {
      const { resource, id } = params;
      if (resource === 'sessions') {
        const base = getResourceApiBase(resource);
        if (!base) {
          throw toHttpError(400, 'Invalid resource for delete.');
        }
        await timciFetch(`${base}/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
        return { data: { id } as TData };
      }
      if (resource !== 'userTenantRoles') {
        throw toHttpError(501, 'Delete is not wired for this resource.');
      }
      const base = getResourceApiBase(resource);
      if (!base) {
        throw toHttpError(400, 'Invalid resource for delete.');
      }
      const qs = new URLSearchParams({ id: String(id) });
      await timciFetch(`${base}?${qs}`, { method: 'DELETE' });
      return { data: { id } as TData };
    },
  };
}
