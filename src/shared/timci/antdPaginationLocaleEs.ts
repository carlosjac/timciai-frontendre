import esES from 'antd/locale/es_ES';
import type { PaginationLocale } from 'antd/es/pagination/Pagination';

/** Textos de `rc-pagination` si el locale de antd no trae `Pagination` en runtime. */
const RC_PAGINATION_ES_FALLBACK: PaginationLocale = {
  items_per_page: '/ página',
  jump_to: 'Ir a',
  jump_to_confirm: 'confirmar',
  page: 'Página',
  prev_page: 'Página anterior',
  next_page: 'Página siguiente',
  prev_5: '5 páginas previas',
  next_5: '5 páginas siguientes',
  prev_3: '3 páginas previas',
  next_3: '3 páginas siguientes',
  page_size: 'tamaño de página',
};

/**
 * Locale del paginador. Hay que pasarlo en `pagination.locale`: el selector de
 * tamaño muestra "/ page" cuando Ant Design no resuelve el locale del contexto.
 */
export const antdPaginationLocaleEs: PaginationLocale = esES.Pagination ?? RC_PAGINATION_ES_FALLBACK;
