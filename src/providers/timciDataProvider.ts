import type {
  BaseRecord,
  DataProvider,
  GetListParams,
  GetOneParams,
  Pagination,
} from '@refinedev/core';
import { getV1Base } from '../config.js';
import { getResourceApiBase } from '../shared/timci/apiUrl.js';
import { timciFetch, toHttpError } from '../shared/timci/http.js';
import { fetchTimciListPage } from '../shared/timci/list/infrastructure/timci-list-http.fetcher.js';

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
      const base = getResourceApiBase(resource);
      if (!base) {
        throw toHttpError(400, 'Select a tenant in the header for this resource.');
      }
      const { json } = await timciFetch(`${base}/${id}`);
      return { data: json as TData };
    },

    create: async () => {
      throw toHttpError(501, 'Create is not wired in this starter; add routes and forms as needed.');
    },

    update: async () => {
      throw toHttpError(501, 'Update is not wired in this starter.');
    },

    deleteOne: async () => {
      throw toHttpError(501, 'Delete is not wired in this starter.');
    },
  };
}
