import { useEffect, useState } from 'react';
import {
  fetchCountryTaxProfileSchema,
  type CountryTaxProfileSchema,
} from '../taxesApi.js';

export function useTaxProfileSchema(
  tenantId: string | null | undefined,
  countryCode: string | null | undefined,
) {
  const code = countryCode?.trim().toUpperCase() ?? '';
  const enabled = Boolean(tenantId && code.length === 2);

  const [schema, setSchema] = useState<CountryTaxProfileSchema | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !tenantId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await fetchCountryTaxProfileSchema(tenantId, code);
        if (!cancelled) setSchema(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, code, tenantId]);

  return {
    schema: enabled ? schema : null,
    loading: enabled && loading,
  };
}
