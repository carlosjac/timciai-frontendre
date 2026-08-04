import { useEffect, useState } from 'react';
import {
  fetchCountryTaxProfileSchema,
  type CountryTaxProfileSchema,
} from '../taxesApi.js';

export function useTaxProfileSchema(
  tenantId: string | null | undefined,
  countryCode: string | null | undefined,
) {
  const [schema, setSchema] = useState<CountryTaxProfileSchema | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = countryCode?.trim().toUpperCase() ?? '';
    if (!tenantId || code.length !== 2) {
      setSchema(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchCountryTaxProfileSchema(tenantId, code)
      .then((result) => {
        if (!cancelled) setSchema(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countryCode, tenantId]);

  return { schema, loading };
}
