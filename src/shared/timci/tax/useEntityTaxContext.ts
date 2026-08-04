import { useOne } from '@refinedev/core';
import { useMemo } from 'react';
import { useCountryIsoCodeMap } from './useCountryIsoCodeMap.js';
import { useTaxProfileSchema } from './useTaxProfileSchema.js';
import type { CountryTaxProfileSchema } from '../taxesApi.js';

export type EntityTaxContext = {
  taxManagementEnabled: boolean;
  countryId: string | null;
  countryCode: string | null;
  taxProfile: Record<string, string>;
  schema: CountryTaxProfileSchema | null;
  schemaLoading: boolean;
  entityLoading: boolean;
};

type EntityTaxRow = {
  countryId?: string;
  taxManagementEnabled?: boolean;
  taxProfile?: Record<string, string> | null;
};

/**
 * Loads the current entity's tax management flag, ISO country, profile and schema.
 */
export function useEntityTaxContext(
  tenantId: string | null | undefined,
  entityId?: string | null,
): EntityTaxContext {
  const id = entityId ?? tenantId ?? '';
  const { result, query } = useOne<EntityTaxRow>({
    resource: 'entities',
    id,
    queryOptions: { enabled: Boolean(tenantId && id) },
    errorNotification: false,
  });

  const taxManagementEnabled = result?.taxManagementEnabled === true;
  const countryId = result?.countryId != null ? String(result.countryId) : null;
  const taxProfileRaw = result?.taxProfile;

  const taxProfile = useMemo(() => {
    if (!taxProfileRaw || typeof taxProfileRaw !== 'object') return {};
    return taxProfileRaw as Record<string, string>;
  }, [taxProfileRaw]);

  const { resolveIsoCode } = useCountryIsoCodeMap(tenantId);
  const countryCode = resolveIsoCode(countryId);

  const { schema, loading: schemaLoading } = useTaxProfileSchema(
    taxManagementEnabled ? tenantId : null,
    taxManagementEnabled ? countryCode : null,
  );

  return {
    taxManagementEnabled,
    countryId,
    countryCode,
    taxProfile,
    schema,
    schemaLoading,
    entityLoading: query?.isLoading ?? false,
  };
}
