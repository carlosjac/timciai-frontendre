import { useEffect, useMemo, useState } from 'react';
import { fetchOverduePolicyCatalog, type OverduePolicyItem } from '../../shared/timci/auxiliaryApi.js';
import { useBoundedCatalog } from '../../shared/timci/useBoundedCatalog.js';
import type { DocTypeRow } from './entity-types.js';

type CountryRow = { id?: string; name?: string };
type CurrencyRow = { id?: string; code?: string; name?: string };

export function useEntityFormResources(tenantId: string | null) {
  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);
  const enabled = !!tenantId;
  const { rows: countries } = useBoundedCatalog<CountryRow>('countries', enabled);
  const { rows: currencies } = useBoundedCatalog<CurrencyRow>('currencies', enabled);
  const { rows: documentTypes } = useBoundedCatalog<DocTypeRow>('document_types', enabled);

  const countrySelect = useMemo(
    () => ({
      options: countries.map((row) => ({
        value: String(row.id),
        label: String(row.name ?? row.id ?? ''),
      })),
      showSearch: true,
      optionFilterProp: 'label' as const,
    }),
    [countries],
  );

  const currencySelect = useMemo(
    () => ({
      options: currencies.map((row) => {
        const code = row.code;
        const name = row.name ?? '';
        return {
          value: String(row.id),
          label: code != null && code !== '' ? `${code} — ${name}` : name,
        };
      }),
      showSearch: true,
      optionFilterProp: 'label' as const,
    }),
    [currencies],
  );

  const docTypes = documentTypes.filter((dt) => dt.isActive !== false);

  useEffect(() => {
    if (!tenantId) return;
    void fetchOverduePolicyCatalog(tenantId).then(setPolicies);
  }, [tenantId]);

  const policyOptions = useMemo(
    () =>
      policies.map((p) => {
        const name = p.description?.trim() ?? '';
        return { value: p.key, label: name !== '' ? name : p.key };
      }),
    [policies],
  );

  const countryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of countries) {
      if (row.id != null) map.set(String(row.id), String(row.name ?? row.id));
    }
    return map;
  }, [countries]);

  const currencyLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of currencies) {
      const id = row.id != null ? String(row.id) : '';
      if (!id) continue;
      const code = (row as { code?: string }).code;
      const name = (row as { name?: string }).name;
      map.set(id, code != null && code !== '' ? `${code} — ${name ?? ''}` : (name ?? id));
    }
    return map;
  }, [currencies]);

  const policyLabelByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of policies) {
      const label = p.description?.trim() ?? '';
      map.set(p.key, label !== '' ? label : p.key);
    }
    return map;
  }, [policies]);

  const resolveCountry = (id: string | undefined) =>
    id != null && id !== '' ? (countryNameById.get(id) ?? id) : '—';

  const resolvePolicy = (key: string | undefined) =>
    key != null && key !== '' ? (policyLabelByKey.get(key) ?? key) : '—';

  return {
    countrySelect,
    currencySelect,
    docTypes,
    policies,
    policyOptions,
    resolveCountry,
    resolvePolicy,
    currencyLabelById,
  };
}
