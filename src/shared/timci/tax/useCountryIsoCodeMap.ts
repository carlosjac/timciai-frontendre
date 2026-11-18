import { useMemo } from 'react';
import { useBoundedCatalog } from '../useBoundedCatalog.js';

type CountryRow = {
  id?: string;
  isoCode?: string | null;
};

/**
 * Maps country UUID → ISO 3166-1 alpha-2 (uppercase), from the full countries catalog.
 */
export function useCountryIsoCodeMap(tenantId: string | null | undefined) {
  const { rows, loading } = useBoundedCatalog<CountryRow>('countries', Boolean(tenantId));

  const isoByCountryId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      const id = row.id != null ? String(row.id) : '';
      const iso = row.isoCode != null ? String(row.isoCode).trim().toUpperCase() : '';
      if (id && iso.length === 2) map.set(id, iso);
    }
    return map;
  }, [rows]);

  const resolveIsoCode = (countryId: string | null | undefined): string | null => {
    if (!countryId) return null;
    return isoByCountryId.get(String(countryId)) ?? null;
  };

  return {
    isoByCountryId,
    resolveIsoCode,
    isLoading: loading,
  };
}
