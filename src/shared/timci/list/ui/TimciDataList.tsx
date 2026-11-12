import { List, useTable } from '@refinedev/antd';
import {
  useTranslate,
  type BaseRecord,
  type CrudFilter,
  type CrudSort,
  type LogicalFilter,
} from '@refinedev/core';
import { Alert, Button, Checkbox, Popover, Space, Table, theme } from 'antd';
import esES from 'antd/locale/es_ES';
import { DownloadOutlined, FilterOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Link, useNavigate } from 'react-router';
import type { TimciColumnDef } from '../domain/timci-column-def.js';

/** Alineado con `rc-pagination` `es_ES` por si el locale de antd no se resuelve en runtime. */
const RC_PAGINATION_ES_FALLBACK = {
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
} as const;
import { fetchAllListPages } from '../../../lib/fetch-all-pages.js';
import { downloadTextFile, rowsToCsv } from '../../../lib/csv-export.js';
import { fetchTimciListPage } from '../infrastructure/timci-list-http.fetcher.js';
import { getStoredTenantId } from '../../apiUrl.js';
import { isLogicalFilter } from '../../listQuery.js';
import { AppliedFiltersBar } from './applied-filters-bar.js';
import { ColumnFilterDropdown } from './column-filter-dropdown.js';

/** Ant Design clones the header inside an aria-hidden row when the table scrolls. Only the visible copy gets a popover. */
function ColumnFilterTrigger(props: {
  open: boolean;
  label: string;
  iconColor?: string;
  content: ReactNode;
  onOpenChange: (open: boolean) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [inHiddenCopy, setInHiddenCopy] = useState(true);

  useEffect(() => {
    setInHiddenCopy(buttonRef.current?.closest('[aria-hidden="true"]') != null);
  }, []);

  const button = (
    <Button
      ref={buttonRef}
      type="text"
      size="small"
      aria-label={props.label}
      aria-expanded={props.open}
      aria-haspopup="dialog"
      icon={<FilterOutlined aria-hidden style={{ color: props.iconColor }} />}
    />
  );

  if (inHiddenCopy) return button;

  return (
    <Popover
      trigger="click"
      destroyOnHidden
      open={props.open}
      onOpenChange={props.onOpenChange}
      content={props.content}
    >
      {button}
    </Popover>
  );
}
import { useTimciNotify } from '../../notifyTimci.js';
import {
  timciAuditColumnKind,
  timciAuditUserDisplayText,
} from '../../auditUserDisplay.js';

const COLUMN_STORAGE_PREFIX = 'timci-refine-list-cols-';

/** Always visible; excluded from the column picker (edit shortcut). */
function isPinnedListColumn(key: string): boolean {
  return key === 'actions';
}

function withPinnedListColumns(keys: Set<string>, columnKeys: Iterable<string>): Set<string> {
  const next = new Set(keys);
  for (const key of columnKeys) {
    if (isPinnedListColumn(key)) next.add(key);
  }
  return next;
}

function readStoredVisibleKeys(
  storageKey: string,
  columnKeys: string[],
  fallback: Set<string>,
): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return withPinnedListColumns(fallback, columnKeys);
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return withPinnedListColumns(fallback, columnKeys);
    const valid = new Set(columnKeys);
    const next = arr.filter((k): k is string => typeof k === 'string' && valid.has(k));
    if (next.length === 0) return withPinnedListColumns(fallback, columnKeys);
    return withPinnedListColumns(new Set(next), columnKeys);
  } catch {
    return withPinnedListColumns(fallback, columnKeys);
  }
}

/** Pinned columns (e.g. `actions`) render first regardless of `columnDefs` order. */
function orderVisibleListColumnDefs<T extends Record<string, unknown>>(
  defs: TimciColumnDef<T>[],
  visible: Set<string>,
): TimciColumnDef<T>[] {
  const visibleDefs = defs.filter((d) => visible.has(d.key));
  const pinned = visibleDefs.filter((d) => isPinnedListColumn(d.key));
  const rest = visibleDefs.filter((d) => !isPinnedListColumn(d.key));

  return [...pinned, ...rest];
}

export type TimciDataListProps<T extends BaseRecord> = {
  resource: string;
  rowKey: keyof T & string;
  titleKey: string;
  columnDefs: TimciColumnDef<T>[];
  syncWithLocation?: boolean;
  meta?: Record<string, unknown>;
  queryOptions?: { enabled?: boolean };
  /** When true, list query is disabled until a tenant is selected (tenant-scoped API). */
  requiresTenant?: boolean;
  /** Formato de fechas en filtros (p. ej. `useUserPreferences().dateFormat`). */
  pickerDateFormat?: string;
  /** Clave localStorage para columnas visibles (p. ej. por lista de precios). Por defecto `resource`. */
  columnVisibilityStorageId?: string;
  /** No muestra el título del `List` (p. ej. dentro de pestañas). */
  hideTitle?: boolean;
  /** Reenviado a `List` `createButtonProps` (p. ej. `onClick` si el recurso no tiene ruta `create`). */
  listCreateButtonProps?: ComponentProps<typeof List>['createButtonProps'];
  /** Orden inicial del listado en servidor (sustituye el default de Refine si se indica). */
  initialSorters?: CrudSort[];
  /** Si devuelve ruta, la fila es clicable y navega a la pantalla de detalle (p. ej. show). */
  getRowShowPath?: (record: T) => string | undefined;
  /** Incluye registros inactivos en el listado (envía includeInactive=true al API). */
  includeInactive?: boolean;
  /** Extra actions in the list header (before column picker / export / create). */
  extraHeaderButtons?: ReactNode;
  /** Optional Ant Design row selection, used by bulk list actions. */
  rowSelection?: TableProps<T>['rowSelection'];
};

function filterForField(filters: CrudFilter[] | undefined, field: string): LogicalFilter | undefined {
  return filters?.find((f): f is LogicalFilter => isLogicalFilter(f) && f.field === field);
}

function isRowNavigationTarget(element: EventTarget | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  return (
    element.closest(
      'button,a,[role="button"],.ant-btn,.anticon,svg,[data-timci-row-action]',
    ) != null
  );
}

export function TimciDataList<T extends BaseRecord>(props: TimciDataListProps<T>) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const notify = useTimciNotify();
  const { token } = theme.useToken();
  const pickerDateFormat = props.pickerDateFormat ?? 'DD/MM/YYYY';
  const columnStorageKey =
    COLUMN_STORAGE_PREFIX + (props.columnVisibilityStorageId ?? props.resource);
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);

  const tenantReady =
    !props.requiresTenant || (typeof window !== 'undefined' && !!getStoredTenantId());

  const listQueryMeta = useMemo(() => {
    const base = props.meta ?? {};
    if (!props.includeInactive) return base;
    return { ...base, includeInactive: true, _timciListIncludeInactive: true };
  }, [props.meta, props.includeInactive]);

  const {
    tableProps,
    filters,
    setFilters,
    setCurrentPage,
    sorters,
    currentPage,
    pageSize,
    result,
  } = useTable<T>({
    resource: props.resource,
    syncWithLocation: props.syncWithLocation ?? true,
    meta: listQueryMeta,
    sorters:
      props.initialSorters != null && props.initialSorters.length > 0
        ? { initial: props.initialSorters, mode: 'server' }
        : undefined,
    queryOptions: {
      ...props.queryOptions,
      enabled: tenantReady && (props.queryOptions?.enabled !== false),
    },
  });

  /** If the URL (or stale state) points past the last page for the current total, jump to page 1. */
  useEffect(() => {
    const total = result.total;
    if (total === undefined || currentPage <= 1) return;
    if (total === 0 || (currentPage - 1) * pageSize >= total) {
      setCurrentPage(1);
    }
  }, [result.total, currentPage, pageSize, setCurrentPage]);

  /** Refine does not reset the table page when filters change via setFilters; avoid empty pages after filtering. */
  const setFiltersRef = useRef(setFilters);
  useEffect(() => {
    setFiltersRef.current = setFilters;
  }, [setFilters]);
  const setFiltersAndResetPage = useCallback(
    (updater: (prev: CrudFilter[]) => CrudFilter[]) => {
      setCurrentPage(1);
      setFiltersRef.current(updater);
    },
    [setCurrentPage],
  );

  const columnKeys = useMemo(
    () => props.columnDefs.map((c) => c.key),
    [props.columnDefs],
  );

  const defaultVisible = useMemo(
    () => new Set(props.columnDefs.filter((c) => c.defaultVisible !== false).map((c) => c.key)),
    [props.columnDefs],
  );

  const columnScope = `${columnStorageKey}\0${columnKeys.join('\0')}`;
  const defaultScope = [...defaultVisible].sort().join('\0');
  const [columnVisibility, setColumnVisibility] = useState(() => ({
    columnScope,
    defaultScope,
    keys: readStoredVisibleKeys(columnStorageKey, columnKeys, defaultVisible),
  }));
  if (columnVisibility.columnScope !== columnScope) {
    setColumnVisibility({
      columnScope,
      defaultScope,
      keys: readStoredVisibleKeys(columnStorageKey, columnKeys, defaultVisible),
    });
  } else if (columnVisibility.defaultScope !== defaultScope) {
    setColumnVisibility({
      columnScope,
      defaultScope,
      keys: withPinnedListColumns(defaultVisible, columnKeys),
    });
  }
  const visibleKeys = columnVisibility.keys;
  const setVisibleKeys = useCallback((next: Set<string>) => {
    setColumnVisibility((current) => ({ ...current, keys: next }));
  }, []);

  const persistVisible = useCallback(
    (next: Set<string>) => {
      const merged = withPinnedListColumns(next, columnKeys);
      if (merged.size === 0) return;
      setVisibleKeys(merged);
      localStorage.setItem(
        columnStorageKey,
        JSON.stringify([...merged].filter((k) => !isPinnedListColumn(k))),
      );
    },
    [columnStorageKey, columnKeys, setVisibleKeys],
  );

  const removeFilterField = useCallback(
    (field: string) => {
      setFiltersAndResetPage((prev) => prev.filter((f) => !isLogicalFilter(f) || f.field !== field));
    },
    [setFiltersAndResetPage],
  );

  const clearAllFilters = useCallback(() => {
    setFiltersAndResetPage((prev) => prev.filter((f) => !isLogicalFilter(f)));
  }, [setFiltersAndResetPage]);

  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const rows = await fetchAllListPages({
        fetchPage: async (page, pageSize) =>
          fetchTimciListPage<T>({
            resource: props.resource,
            page,
            pageSize,
            sorters,
            filters,
            meta: listQueryMeta,
            includeInactive: props.includeInactive,
          }),
        pageSize: 250,
      });

      const visibleDefs = orderVisibleListColumnDefs(props.columnDefs, visibleKeys);
      const csvCols = visibleDefs.map((d) => ({
        header: translate(d.titleKey, undefined, d.titleKey),
        accessor: (row: T) => {
          if (d.exportValue) return d.exportValue(row);
          const auditKind = timciAuditColumnKind(String(d.dataIndex));
          if (auditKind) {
            return timciAuditUserDisplayText(row as Record<string, unknown>, auditKind);
          }
          const v = row[d.dataIndex as keyof T];
          if (v == null) return '';
          if (typeof v === 'object') return JSON.stringify(v);
          return String(v);
        },
      }));

      const csv = rowsToCsv(rows, csvCols);
      downloadTextFile(`${props.resource}-export.csv`, csv);
      notify.success(translate('list.export.success'));
    } catch {
      notify.error(translate('list.export.error'));
    } finally {
      setExporting(false);
    }
  }, [filters, notify, listQueryMeta, props.columnDefs, props.includeInactive, props.resource, sorters, translate, visibleKeys]);

  const antColumns: ColumnsType<T> = useMemo(() => {
    const primarySort = sorters?.[0];
    const dataColumns = orderVisibleListColumnDefs(props.columnDefs, visibleKeys).map((def) => {
        const columnTitleText = translate(def.titleKey, undefined, def.titleKey);
        const sortKey = def.sortField ?? def.key;
        let title: ColumnsType<T>[number]['title'] = columnTitleText;
        const col: ColumnsType<T>[number] = {
          key: sortKey,
          title,
          dataIndex: def.dataIndex as string,
          sorter: def.sorter,
          width: def.width,
        };
        if (
          def.sorter &&
          primarySort &&
          String(primarySort.field) === String(sortKey)
        ) {
          col.sortOrder = primarySort.order === 'desc' ? 'descend' : 'ascend';
        }
        const auditKind = timciAuditColumnKind(String(def.dataIndex));
        if (def.render) {
          col.render = (value, record) => def.render!(value, record as T);
        } else if (auditKind) {
          col.render = (_, record) => {
            const text = timciAuditUserDisplayText(record as Record<string, unknown>, auditKind);
            return text ? (
              text
            ) : (
              <span style={{ color: token.colorTextSecondary }}>—</span>
            );
          };
        }

        if (def.filter) {
          const field = def.dataIndex as string;
          const filterKind = def.filter.kind;
          const lf = filterForField(filters, field);
          const filterBtnLabel = `${translate('list.a11y.openColumnFilter')}: ${columnTitleText}`;
          title = (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>{columnTitleText}</span>
              <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                <ColumnFilterTrigger
                  open={openFilterKey === def.key}
                  label={filterBtnLabel}
                  iconColor={lf ? token.colorPrimary : undefined}
                  onOpenChange={(open) => setOpenFilterKey(open ? def.key : null)}
                  content={
                    <ColumnFilterDropdown
                      kind={filterKind}
                      field={field}
                      visible
                      columnLabel={columnTitleText}
                      current={lf}
                      translate={translate}
                      placeholder={translate('list.filter.placeholder')}
                      onSearchLabel={translate('list.filter.search')}
                      onResetLabel={translate('list.filter.reset')}
                      pickerDateFormat={pickerDateFormat}
                      onApply={(next) => {
                        setFiltersAndResetPage((prev) => {
                          const rest = prev.filter((f) => !isLogicalFilter(f) || f.field !== field);
                          if (next == null) return rest;
                          return [...rest, next];
                        });
                        setOpenFilterKey(null);
                      }}
                    />
                  }
                />
              </span>
            </span>
          );
          col.title = title;
        }

        if (def.key === 'actions' && props.getRowShowPath) {
          col.onCell = () => ({
            onClick: (e) => e.stopPropagation(),
          });
        }

        return col;
      });
    const getPath = props.getRowShowPath;
    if (!getPath) return dataColumns;
    const showColumn: ColumnsType<T>[number] = {
      key: 'show',
      title: translate('list.view'),
      width: 72,
      render: (_value, record) => {
        const path = getPath(record);
        if (!path) return null;
        return (
          <span data-timci-row-action onClick={(event) => event.stopPropagation()}>
            <Link to={path}>{translate('list.view')}</Link>
          </span>
        );
      },
    };
    return [showColumn, ...dataColumns];
  }, [
    props.columnDefs,
    props.getRowShowPath,
    filters,
    pickerDateFormat,
    setFiltersAndResetPage,
    sorters,
    token.colorPrimary,
    token.colorTextSecondary,
    translate,
    visibleKeys,
    openFilterKey,
  ]);

  const {
    columns: refineColumns,
    rowKey: refineRowKey,
    onChange: refineTableOnChange,
    pagination: tablePagination,
    ...tableRest
  } = tableProps;
  void refineColumns;
  void refineRowKey;

  /**
   * Fuerza textos de rc-pagination en español ("Página", "/ página", etc.).
   * El locale debe ir **después** de cualquier `tablePagination.locale`: Ant Design puede reinyectar
   * cadenas en inglés al propagar el estado de paginación y, con el orden anterior, machacaban el español.
   */
  const paginationWithEsLocale = useMemo(() => {
    if (tablePagination === false) return false;
    if (tablePagination == null) return tablePagination;
    const prevLocale =
      typeof tablePagination === 'object' &&
      tablePagination.locale != null &&
      typeof tablePagination.locale === 'object'
        ? tablePagination.locale
        : {};
    const rcEs = esES.Pagination ?? RC_PAGINATION_ES_FALLBACK;
    return {
      ...tablePagination,
      locale: { ...prevLocale, ...rcEs },
    };
  }, [tablePagination]);

  /**
   * Refine `useTable` maps Ant Design `filters` back into CrudFilters. We only use `filteredValue`
   * as a visual marker (`['on']`) for custom column filters; real criteria live in Refine `filters`.
   * On pagination/sort, Ant passes those sentinels and would corrupt API filters (e.g. tenantName → ['on']).
   */
  const handleTableChange = useCallback<NonNullable<TableProps<T>['onChange']>>(
    (pagination, _antdFilters, sorter, extra) => {
      refineTableOnChange?.(pagination, {}, sorter, extra);
    },
    [refineTableOnChange],
  );

  const tableOnRow = useMemo((): TableProps<T>['onRow'] | undefined => {
    const getPath = props.getRowShowPath;
    if (!getPath) return undefined;
    return (record) => {
      const path = getPath(record);
      if (!path) return {};
      return {
        style: { cursor: 'pointer' },
        onClick: (e) => {
          if (isRowNavigationTarget(e.target)) return;
          navigate(path);
        },
      };
    };
  }, [navigate, props.getRowShowPath]);

  if (props.requiresTenant && !tenantReady) {
    return (
      <List
        resource={props.resource}
        title={props.hideTitle ? false : translate(props.titleKey)}
        breadcrumb={props.hideTitle ? false : undefined}
        createButtonProps={props.listCreateButtonProps}
      >
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </List>
    );
  }

  const columnPicker = (
    <Checkbox.Group
      aria-label={translate('list.a11y.columnPickerGroup')}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}
      value={[...visibleKeys]}
      options={props.columnDefs
        .filter((d) => !isPinnedListColumn(d.key))
        .map((d) => ({
          label: translate(d.titleKey, undefined, d.titleKey),
          value: d.key,
        }))}
      onChange={(vals) => {
        const next = withPinnedListColumns(new Set(vals as string[]), columnKeys);
        const togglableCount = [...next].filter((k) => !isPinnedListColumn(k)).length;
        if (togglableCount === 0) {
          notify.warning(translate('list.columnsMinOne'));
          return;
        }
        persistVisible(next);
      }}
    />
  );

  const listTitle = translate(props.titleKey, undefined, props.titleKey);
  const tableAriaLabel = `${translate('list.a11y.listTable')}: ${listTitle}`;

  return (
    <List
      resource={props.resource}
      title={props.hideTitle ? false : listTitle}
      breadcrumb={props.hideTitle ? false : undefined}
      createButtonProps={props.listCreateButtonProps}
      headerButtons={({ defaultButtons }) => (
        <Space wrap>
          <Popover
            title={translate('list.columns')}
            trigger="click"
            content={columnPicker}
            destroyOnHidden
            open={columnPopoverOpen}
            onOpenChange={setColumnPopoverOpen}
          >
            <Button
              icon={<SettingOutlined aria-hidden />}
              aria-expanded={columnPopoverOpen}
              aria-haspopup="dialog"
            >
              {translate('list.columns')}
            </Button>
          </Popover>
          <Button
            icon={<DownloadOutlined aria-hidden />}
            loading={exporting}
            onClick={() => void handleExport()}
          >
            {translate('list.export.button')}
          </Button>
          {props.extraHeaderButtons}
          {defaultButtons}
        </Space>
      )}
    >
      <AppliedFiltersBar
        filters={filters}
        columnDefs={props.columnDefs}
        translate={translate}
        onRemoveField={removeFilterField}
        onClearAll={clearAllFilters}
      />
      <Table<T>
        {...tableRest}
        pagination={paginationWithEsLocale}
        rowKey={props.rowKey}
        rowSelection={props.rowSelection}
        columns={antColumns}
        onChange={handleTableChange}
        onRow={tableOnRow}
        scroll={{ x: 'max-content' }}
        aria-label={tableAriaLabel}
        locale={{
          emptyText: translate('list.emptyData'),
          selectAll: translate('list.a11y.selectAll'),
          selectInvert: translate('list.a11y.selectInvert'),
          selectionAll: translate('list.a11y.selectAll'),
        }}
      />
    </List>
  );
}
