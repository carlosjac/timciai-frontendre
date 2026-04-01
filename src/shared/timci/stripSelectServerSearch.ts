import type { SelectProps } from 'antd';

/**
 * `useSelect` de @refinedev/antd incluye `filterOption: false` y `onSearch` hacia el data provider;
 * muchos listados Timci no aplican filtro por texto, por lo que la búsqueda en el desplegable no filtra.
 * Quita esas props para poder usar `filterOption` local en el `<Select />`.
 */
export function stripSelectServerSearch(selectProps: SelectProps): SelectProps {
  // onSearch / filterOption se descartan a propósito
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omitidas respecto a selectProps
  const { onSearch, filterOption, ...rest } = selectProps;
  return rest;
}
