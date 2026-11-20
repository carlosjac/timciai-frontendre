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
  const key = catalogCacheKey(resource, tenantId);
  const cached = enabled ? readFresh<T>(key) : undefined;
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  if (!enabled) {
    if (loadedKey !== null || rows.length > 0 || loading) {
      setRows([]);
      setLoading(false);
      setLoadedKey(null);
    }
  } else if (cached) {
    if (loadedKey !== key || loading || rows !== cached) {
      setRows(cached);
      setLoading(false);
      setLoadedKey(key);
    }
  } else if (!loading && loadedKey !== key) {
    setLoading(true);
  }

  useEffect(() => {
    if (!enabled || readFresh<T>(key)) return;
    let cancelled = false;
    void loadCatalog<T>(key, resource, getDataProvider)
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setLoadedKey(key);
      })
      .catch(() => {
        if (cancelled) return;
        setRows([]);
        setLoadedKey(key);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, getDataProvider, key, resource]);

  return { rows: enabled ? rows : [], loading: enabled && loading };
}
