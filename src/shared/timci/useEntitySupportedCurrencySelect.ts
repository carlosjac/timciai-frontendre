import { useList, useOne } from '@refinedev/core';
import type { SelectProps } from 'antd';
import { useMemo } from 'react';

export type TimciCurrencyOption = { value: string; label: string };

function currencyOptionLabel(code: string, name: string, fallback: string): string {
  if (code && name) return `${code} — ${name}`;
  return name || code || fallback;
}

/**
 * Select of currencies the current tenant entity accepts (accepted ∩ active).
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

  const { result: currenciesResult, query: currenciesQuery } = useList<{
    id?: string;
    code?: string;
    name?: string;
    isActive?: boolean;
  }>({
    resource: 'currencies',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: Boolean(tenantId) },
  });

  const options = useMemo((): TimciCurrencyOption[] => {
    const accepted = new Set((entityResult?.supportedCurrencyIds ?? []).map(String));
    return (currenciesResult?.data ?? [])
      .filter((c) => c.isActive !== false && accepted.has(String(c.id ?? '')))
      .map((c) => {
        const id = String(c.id ?? '');
        const code = typeof c.code === 'string' ? c.code.trim() : '';
        const name = typeof c.name === 'string' ? c.name.trim() : '';
        return { value: id, label: currencyOptionLabel(code, name, id) };
      });
  }, [currenciesResult?.data, entityResult?.supportedCurrencyIds]);

  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of options) map.set(option.value, option.label);
    return map;
  }, [options]);

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
    isLoading: Boolean(entityQuery.isLoading || currenciesQuery.isLoading),
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
