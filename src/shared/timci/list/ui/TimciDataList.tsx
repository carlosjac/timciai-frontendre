import { List, useTable } from '@refinedev/antd';
import {
  useTranslate,
  type BaseRecord,
  type CrudFilter,
  type CrudSort,
  type LogicalFilter,
} from '@refinedev/core';
import { Alert, App, Button, Checkbox, Popover, Space, Table, theme } from 'antd';
import { DownloadOutlined, FilterOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from 'react';
import type { TimciColumnDef } from '../domain/timci-column-def.js';
import { fetchAllListPages } from '../../../lib/fetch-all-pages.js';
import { downloadTextFile, rowsToCsv } from '../../../lib/csv-export.js';
import { fetchTimciListPage } from '../infrastructure/timci-list-http.fetcher.js';
import { getStoredTenantId } from '../../apiUrl.js';
import { isLogicalFilter } from '../../listQuery.js';
import { AppliedFiltersBar } from './applied-filters-bar.js';
import { ColumnFilterDropdown } from './column-filter-dropdown.js';
import {
  timciAuditColumnKind,
  timciAuditUserDisplayText,
} from '../../auditUserDisplay.js';

const COLUMN_STORAGE_PREFIX = 'timci-refine-list-cols-';

/** Visually hidden text for filter trigger accessible name (WCAG A). */
const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

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
};

function filterForField(filters: CrudFilter[] | undefined, field: string): LogicalFilter | undefined {
  return filters?.find((f): f is LogicalFilter => isLogicalFilter(f) && f.field === field);
}

export function TimciDataList<T extends BaseRecord>(props: TimciDataListProps<T>) {
  const translate = useTranslate();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const pickerDateFormat = props.pickerDateFormat ?? 'DD/MM/YYYY';
  const columnStorageKey =
    COLUMN_STORAGE_PREFIX + (props.columnVisibilityStorageId ?? props.resource);
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false);

  const tenantReady =
    !props.requiresTenant || (typeof window !== 'undefined' && !!getStoredTenantId());

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
    meta: props.meta,
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
  setFiltersRef.current = setFilters;
  const setFiltersAndResetPage = useCallback(
    (updater: (prev: CrudFilter[]) => CrudFilter[]) => {
      setCurrentPage(1);
      setFiltersRef.current(updater);
    },
    [setCurrentPage],
  );

  const defaultVisible = useMemo(
    () => new Set(props.columnDefs.filter((c) => c.defaultVisible !== false).map((c) => c.key)),
    [props.columnDefs],
  );

  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(() => defaultVisible);

  useEffect(() => {
    setVisibleKeys(defaultVisible);
  }, [defaultVisible]);

  useEffect(() => {
    const raw = localStorage.getItem(columnStorageKey);
    if (!raw) return;
    try {
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr)) return;
      const valid = new Set(props.columnDefs.map((c) => c.key));
      const next = arr.filter((k): k is string => typeof k === 'string' && valid.has(k));
      if (next.length > 0) setVisibleKeys(new Set(next));
    } catch {
      /* ignore */
    }
  }, [columnStorageKey, props.columnDefs]);

  const persistVisible = useCallback(
    (next: Set<string>) => {
      if (next.size === 0) return;
      setVisibleKeys(next);
      localStorage.setItem(columnStorageKey, JSON.stringify([...next]));
    },
    [columnStorageKey],
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
            meta: props.meta,
          }),
        pageSize: 250,
      });

      const visibleDefs = props.columnDefs.filter((d) => visibleKeys.has(d.key));
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
      message.success(translate('list.export.success'));
    } catch {
      message.error(translate('list.export.error'));
    } finally {
      setExporting(false);
    }
  }, [filters, message, props.columnDefs, props.meta, props.resource, sorters, translate, visibleKeys]);

  const antColumns: ColumnsType<T> = useMemo(() => {
    const primarySort = sorters?.[0];
    return props.columnDefs
      .filter((d) => visibleKeys.has(d.key))
      .map((def) => {
        const columnTitleText = translate(def.titleKey, undefined, def.titleKey);
        const sortKey = def.sortField ?? def.key;
        const col: ColumnsType<T>[number] = {
          key: sortKey,
          title: columnTitleText,
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
          col.filteredValue = lf != null ? ['on'] : null;

          const filterBtnLabel = `${translate('list.a11y.openColumnFilter')}: ${columnTitleText}`;
          col.filterIcon = (filtered) => (
            <>
              <span style={SR_ONLY}>{filterBtnLabel}</span>
              <FilterOutlined
                aria-hidden
                style={{ color: filtered ? token.colorPrimary : undefined }}
              />
            </>
          );

          col.filterDropdown = ({ confirm, clearFilters, visible }) => (
            <ColumnFilterDropdown
              kind={filterKind}
              field={field}
              visible={visible}
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
                if (next == null) clearFilters?.();
                confirm();
              }}
            />
          );
        }

        return col;
      });
  }, [
    props.columnDefs,
    filters,
    pickerDateFormat,
    setFiltersAndResetPage,
    sorters,
    token.colorPrimary,
    translate,
    visibleKeys,
  ]);

  const {
    columns: refineColumns,
    rowKey: refineRowKey,
    onChange: refineTableOnChange,
    ...tableRest
  } = tableProps;
  void refineColumns;
  void refineRowKey;

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
      options={props.columnDefs.map((d) => ({
        label: translate(d.titleKey, undefined, d.titleKey),
        value: d.key,
      }))}
      onChange={(vals) => {
        const next = new Set(vals as string[]);
        if (next.size === 0) {
          message.warning(translate('list.columnsMinOne'));
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
        rowKey={props.rowKey}
        columns={antColumns}
        onChange={handleTableChange}
        aria-label={tableAriaLabel}
        locale={{ emptyText: translate('list.emptyData') }}
      />
    </List>
  );
}
