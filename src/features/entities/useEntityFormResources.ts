import { useSelect } from '@refinedev/antd';
import { useList } from '@refinedev/core';
import { useEffect, useMemo, useState } from 'react';
import { fetchOverduePolicyCatalog, type OverduePolicyItem } from '../../shared/timci/auxiliaryApi.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import type { DocTypeRow } from './entity-types.js';

export function useEntityFormResources(tenantId: string | null) {
  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);

  const { selectProps: countrySelect } = useSelect({
    resource: 'countries',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const { selectProps: currencySelectRaw } = useSelect({
    resource: 'currencies',
    optionLabel: (item) => {
      const code = (item as { code?: string }).code;
      const name = (item as { name?: string }).name;
      return code != null && code !== '' ? `${code} — ${name ?? ''}` : (name ?? '');
    },
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const currencySelect = stripSelectServerSearch(currencySelectRaw);

  const { result: docTypeResult } = useList<DocTypeRow>({
    resource: 'document_types',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const { result: countryResult } = useList({
    resource: 'countries',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const { result: currencyResult } = useList({
    resource: 'currencies',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const docTypes = (docTypeResult.data ?? []).filter((dt) => dt.isActive !== false);

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
    for (const row of countryResult.data ?? []) {
      if (row.id != null) map.set(String(row.id), String(row.name ?? row.id));
    }
    return map;
  }, [countryResult.data]);

  const currencyLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of currencyResult.data ?? []) {
      const id = row.id != null ? String(row.id) : '';
      if (!id) continue;
      const code = (row as { code?: string }).code;
      const name = (row as { name?: string }).name;
      map.set(id, code != null && code !== '' ? `${code} — ${name ?? ''}` : (name ?? id));
    }
    return map;
  }, [currencyResult.data]);

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
    policyOptions,
    resolveCountry,
    resolvePolicy,
    currencyLabelById,
  };
}
