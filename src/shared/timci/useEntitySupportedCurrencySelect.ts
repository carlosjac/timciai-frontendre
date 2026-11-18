import { useOne } from '@refinedev/core';
import type { SelectProps } from 'antd';
import { useMemo } from 'react';
import { useBoundedCatalog } from './useBoundedCatalog.js';

export type TimciCurrencyOption = { value: string; label: string };

function currencyOptionLabel(code: string, name: string, fallback: string): string {
  if (code && name) return `${code} — ${name}`;
  return name || code || fallback;
}

/**
 * Select of currencies the current tenant entity accepts (accepted ∩ active).
 * Labels come from the full currency catalog: a single page of 100 misses names
 * that sort later, and the account selector then falls back to the id.
 * Use everywhere except the global currencies catalog and the root multi-select
 * of supported currencies on entity create/edit.
 */
export function useEntitySupportedCurrencySelect(tenantId: string | null) {
  const { result: entityResult, query: entityQuery } = useOne<{
    supportedCurrencyIds?: string[];
  }>({
    resource: 'entities',
    id: tenantId ?? '',
    queryOptions: { enabled: Boolean(tenantId) },
    errorNotification: false,
  });

  const { rows: currencies, loading: currenciesLoading } = useBoundedCatalog<{
    id?: string;
    code?: string;
    name?: string;
    isActive?: boolean;
  }>('currencies', Boolean(tenantId));

  const catalog = useMemo((): Array<TimciCurrencyOption & { isActive: boolean }> => {
    return currencies
      .filter((c) => c.id)
      .map((c) => {
        const id = String(c.id);
        const code = typeof c.code === 'string' ? c.code.trim() : '';
        const name = typeof c.name === 'string' ? c.name.trim() : '';
        return {
          value: id,
          label: currencyOptionLabel(code, name, id),
          isActive: c.isActive !== false,
        };
      });
  }, [currencies]);

  const options = useMemo((): TimciCurrencyOption[] => {
    const accepted = new Set((entityResult?.supportedCurrencyIds ?? []).map(String));
    return catalog
      .filter((c) => c.isActive && accepted.has(c.value))
      .map(({ value, label }) => ({ value, label }));
  }, [catalog, entityResult?.supportedCurrencyIds]);

  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of catalog) map.set(option.value, option.label);
    return map;
  }, [catalog]);

  const selectProps: SelectProps = {
    options,
    showSearch: true,
    optionFilterProp: 'label',
    filterOption: (input, option) => {
      const label = option?.label;
      const text = typeof label === 'string' ? label : String(label ?? '');
      return text.toLowerCase().includes(input.trim().toLowerCase());
    },
  };

  return {
    selectProps,
    options,
    labelById,
    isLoading: Boolean(entityQuery.isLoading || currenciesLoading),
  };
}

export function filterSelectOptionsByIds(
  selectProps: SelectProps,
  allowedIds: readonly string[] | undefined
): SelectProps {
  const allowed = new Set((allowedIds ?? []).map(String));
  return {
    ...selectProps,
    options: (selectProps.options ?? []).filter((option) => allowed.has(String(option.value ?? ''))),
  };
}
