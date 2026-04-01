import type { BaseRecord, CrudFilter, LogicalFilter } from '@refinedev/core';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Space, Tag, theme, Typography } from 'antd';
import { isLogicalFilter } from '../../listQuery.js';
import type { TimciColumnDef } from '../domain/timci-column-def.js';
import { type TimciFilterKind } from '../domain/filter-operators.js';

const { Text } = Typography;

type Translate = (key: string, options?: object, defaultMessage?: string) => string;

function filterKindForField<T extends BaseRecord>(
  columnDefs: TimciColumnDef<T>[],
  field: string,
): TimciFilterKind | undefined {
  const def = columnDefs.find((c) => c.dataIndex === field);
  return def?.filter?.kind;
}

function formatChipValue(
  f: LogicalFilter,
  kind: TimciFilterKind | undefined,
  translate: Translate,
): string {
  const op = String(f.operator);
  if (op === 'between' && Array.isArray(f.value)) {
    return `${String(f.value[0] ?? '')} — ${String(f.value[1] ?? '')}`;
  }
  if (kind === 'boolean') {
    return f.value === true
      ? translate('list.filter.boolYes', undefined, 'Sí')
      : translate('list.filter.boolNo', undefined, 'No');
  }
  if (typeof f.value === 'object' && f.value !== null) {
    return JSON.stringify(f.value);
  }
  return String(f.value ?? '');
}

type Props<T extends BaseRecord> = {
  filters: CrudFilter[] | undefined;
  columnDefs: TimciColumnDef<T>[];
  translate: Translate;
  onRemoveField: (field: string) => void;
  onClearAll: () => void;
};

export function AppliedFiltersBar<T extends BaseRecord>(props: Props<T>) {
  const { token } = theme.useToken();
  const { filters, columnDefs, translate, onRemoveField, onClearAll } = props;

  const logical = (filters ?? []).filter((f): f is LogicalFilter => isLogicalFilter(f));
  if (logical.length === 0) return null;

  return (
    <div style={{ marginBottom: token.marginMD }}>
      <Space align="start" wrap size="small" style={{ width: '100%' }}>
        <Text type="secondary" style={{ lineHeight: token.lineHeight }}>
          {translate('list.filter.applied')}
        </Text>
        {logical.map((f) => {
          const kind = filterKindForField(columnDefs, f.field);
          const titleKey = columnDefs.find((c) => c.dataIndex === f.field)?.titleKey;
          const colTitle = titleKey
            ? translate(titleKey, undefined, titleKey)
            : f.field;
          const opKey = `list.filter.op.${String(f.operator)}`;
          const opLabel = translate(opKey, undefined, String(f.operator));
          const valStr = formatChipValue(f, kind, translate);
          const removeLabel = `${translate('list.a11y.removeFilterForColumn')}: ${colTitle}`;
          return (
            <Tag
              key={f.field}
              closable
              closeIcon={
                <span aria-label={removeLabel}>
                  <CloseOutlined aria-hidden />
                </span>
              }
              onClose={() => onRemoveField(f.field)}
              style={{ marginInlineEnd: 0 }}
            >
              <span style={{ fontWeight: token.fontWeightStrong }}>{colTitle}</span>
              {' · '}
              <span>{opLabel}</span>
              {' · '}
              <span>{valStr}</span>
            </Tag>
          );
        })}
        {logical.length > 0 ? (
          <Button type="link" size="small" onClick={onClearAll} style={{ padding: 0, height: 'auto' }}>
            {translate('list.filter.clearAll')}
          </Button>
        ) : null}
      </Space>
    </div>
  );
}
