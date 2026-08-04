import { useList } from '@refinedev/core';
import { useMemo } from 'react';

type CountryRow = {
  id?: string;
  isoCode?: string | null;
};

/**
 * Maps country UUID → ISO 3166-1 alpha-2 (uppercase), from the countries list resource.
 */
export function useCountryIsoCodeMap(tenantId: string | null | undefined) {
  const { result, query } = useList<CountryRow>({
    resource: 'countries',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: Boolean(tenantId) },
  });

  const isoByCountryId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of result.data ?? []) {
      const id = row.id != null ? String(row.id) : '';
      const iso = row.isoCode != null ? String(row.isoCode).trim().toUpperCase() : '';
      if (id && iso.length === 2) map.set(id, iso);
    }
    return map;
  }, [result.data]);

  const resolveIsoCode = (countryId: string | null | undefined): string | null => {
    if (!countryId) return null;
    return isoByCountryId.get(String(countryId)) ?? null;
  };

  return {
    isoByCountryId,
    resolveIsoCode,
    isLoading: query?.isLoading ?? false,
  };
}
