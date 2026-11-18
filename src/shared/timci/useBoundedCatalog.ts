import { useDataProvider, type BaseRecord, type GetListResponse } from '@refinedev/core';
import { useEffect, useState } from 'react';
import { fetchAllListPages } from '../lib/fetch-all-pages.js';
import { getStoredTenantId } from './apiUrl.js';

const CATALOG_TTL_MS = 5 * 60 * 1000;

type CatalogEntry = { at: number; rows: BaseRecord[] };

const catalogCache = new Map<string, CatalogEntry>();
const catalogInflight = new Map<string, Promise<BaseRecord[]>>();

/** Document types follow the tenant. Countries and currencies do not. */
function catalogCacheKey(resource: string, tenantId: string): string {
  if (resource === 'document_types') return `${resource}:${tenantId}`;

  return resource;
}

function readFresh<T extends BaseRecord>(key: string): T[] | undefined {
  const hit = catalogCache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at >= CATALOG_TTL_MS) return undefined;

  return hit.rows as T[];
}

function loadCatalog<T extends BaseRecord>(
  key: string,
  resource: string,
  getDataProvider: ReturnType<typeof useDataProvider>,
): Promise<T[]> {
  const fresh = readFresh<T>(key);
  if (fresh) return Promise.resolve(fresh);
  const pending = catalogInflight.get(key);
  if (pending) return pending as Promise<T[]>;

  const promise = fetchAllListPages<T>({
    pageSize: 100,
    fetchPage: async (page, pageSize) => {
      const result: GetListResponse<T> = await getDataProvider().getList<T>({
        resource,
        pagination: { currentPage: page, pageSize },
      });

      return { data: result.data, total: result.total };
    },
  })
    .then((rows) => {
      catalogCache.set(key, { at: Date.now(), rows });
      catalogInflight.delete(key);

      return rows;
    })
    .catch((error: unknown) => {
      catalogInflight.delete(key);
      throw error;
    });
  catalogInflight.set(key, promise as Promise<BaseRecord[]>);

  return promise;
}

/**
 * Loads a bounded catalog (countries, currencies, document types) in pages of 100.
 * Mounts of the same resource share one request and reuse it for five minutes.
 */
export function useBoundedCatalog<T extends BaseRecord>(
  resource: string,
  enabled: boolean,
): { rows: T[]; loading: boolean } {
  const getDataProvider = useDataProvider();
  const tenantId = resource === 'document_types' ? (getStoredTenantId() ?? '') : '';
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      setLoading(false);
      return;
    }
    const key = catalogCacheKey(resource, tenantId);
    const fresh = readFresh<T>(key);
    if (fresh) {
      setRows(fresh);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void loadCatalog<T>(key, resource, getDataProvider)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, getDataProvider, resource, tenantId]);

  return { rows, loading };
}
