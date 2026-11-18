import { useSelect } from '@refinedev/antd';

const PAGE_SIZE = 20;

/**
 * Server-side name search for resources that are not a bounded catalog.
 * `useSelect` keeps `onSearch` / `filterOption: false` so the list is not downloaded.
 */
export function useTimciNameSelect(resource: string, enabled: boolean, selectedId?: string | null) {
  const selected = useSelect({
    resource,
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: PAGE_SIZE },
    sorters: [{ field: 'name', order: 'asc' }],
    defaultValue: selectedId ? selectedId : undefined,
    queryOptions: { enabled },
  });
  const { defaultValue: _formValue, ...selectProps } = selected.selectProps;

  return { selectProps, query: selected.query };
}
