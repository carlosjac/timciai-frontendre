import type { LogicalFilter } from '@refinedev/core';
import { Button, Card, DatePicker, Input, InputNumber, Select, Space, theme } from 'antd';
import { antdDatePickerLocaleEs } from '../../antdPickerLocaleEs.js';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  defaultOperatorForKind,
  normalizeStoredOperator,
  operatorsForKind,
  type TimciFilterKind,
} from '../domain/filter-operators.js';
import { timciLogicalFilter } from '../../listQuery.js';

function toDayjs(s: string): Dayjs | null {
  if (!s || s.length < 10) return null;
  const d = dayjs(s.slice(0, 10));
  return d.isValid() ? d : null;
}

type Translate = (key: string, options?: object, defaultMessage?: string) => string;

type Props = {
  kind: TimciFilterKind;
  field: string;
  visible: boolean;
  current: LogicalFilter | undefined;
  translate: Translate;
  onApply: (f: LogicalFilter | null) => void;
  onSearchLabel: string;
  onResetLabel: string;
  placeholder: string;
  /** Visible column title, used in accessible names for the filter controls. */
  columnLabel: string;
  /** Ant Design DatePicker format (p. ej. preferencia de usuario). */
  pickerDateFormat: string;
  /** Choices when `kind` is `select`. */
  options?: ReadonlyArray<{ value: string; label: string }>;
};

function initialFromCurrent(kind: TimciFilterKind, current: LogicalFilter | undefined) {
  const nextOp = normalizeStoredOperator(kind, current?.operator as string | undefined);
  let textVal = '';
  let num: number | null = null;
  let num2: number | null = null;
  let boolVal: boolean | null = null;
  let dateSingle = '';
  let dateRange: [string, string] | null = null;
  let selectVal = '';

  if (current) {
    const v = current.value;
    const lfOp = String(current.operator);
    switch (kind) {
      case 'text':
        textVal = String(v ?? '');
        break;
      case 'number':
        if (lfOp === 'between' && Array.isArray(v)) {
          num = v[0] != null && v[0] !== '' ? Number(v[0]) : null;
          num2 = v[1] != null && v[1] !== '' ? Number(v[1]) : null;
        } else if (v != null && v !== '') {
          num = Number(v);
        }
        break;
      case 'boolean':
        if (typeof v === 'boolean') boolVal = v;
        break;
      case 'date':
        if (lfOp === 'between' && Array.isArray(v)) {
          dateRange = [String(v[0] ?? '').slice(0, 10), String(v[1] ?? '').slice(0, 10)];
        } else {
          dateSingle = String(v ?? '').slice(0, 10);
        }
        break;
      case 'select':
        selectVal = String(v ?? '');
        break;
      default:
        break;
    }
  }

  return { nextOp, textVal, num, num2, boolVal, dateSingle, dateRange, selectVal };
}

/**
 * Body remounts when the filter panel opens so local fields sync from Refine filters
 * without setState-in-effect.
 */
function ColumnFilterDropdownBody(props: Props) {
  const { token } = theme.useToken();
  const {
    kind,
    field,
    current,
    translate,
    onApply,
    onSearchLabel,
    onResetLabel,
    placeholder,
    columnLabel,
    pickerDateFormat,
    options = [],
  } = props;

  const initial = initialFromCurrent(kind, current);
  const [op, setOp] = useState(() => initial.nextOp || defaultOperatorForKind(kind));
  const [textVal, setTextVal] = useState(() => initial.textVal);
  const [num, setNum] = useState<number | null>(() => initial.num);
  const [num2, setNum2] = useState<number | null>(() => initial.num2);
  const [boolVal, setBoolVal] = useState<boolean | null>(() => initial.boolVal);
  const [dateSingle, setDateSingle] = useState(() => initial.dateSingle);
  const [dateRange, setDateRange] = useState<[string, string] | null>(() => initial.dateRange);
  const [selectVal, setSelectVal] = useState(() => initial.selectVal);

  const opOptions = operatorsForKind(kind).map((o) => ({
    value: o,
    label: translate(`list.filter.op.${o}`, undefined, o),
  }));

  const buildFilter = (): LogicalFilter | null => {
    switch (kind) {
      case 'text': {
        const t = textVal.trim();
        if (!t) return null;
        return timciLogicalFilter(field, op, t);
      }
      case 'number': {
        if (op === 'between') {
          if (num == null || num2 == null) return null;
          return timciLogicalFilter(field, 'between', [num, num2]);
        }
        if (num == null) return null;
        return timciLogicalFilter(field, op, num);
      }
      case 'boolean': {
        if (boolVal === null) return null;
        return timciLogicalFilter(field, 'eq', boolVal);
      }
      case 'date': {
        if (op === 'between') {
          if (!dateRange || dateRange[0].length < 10 || dateRange[1].length < 10) return null;
          return timciLogicalFilter(field, 'between', [dateRange[0], dateRange[1]]);
        }
        if (dateSingle.length < 10) return null;
        return timciLogicalFilter(field, op, dateSingle);
      }
      case 'select': {
        if (!selectVal) return null;
        return timciLogicalFilter(field, 'eq', selectVal);
      }
      default:
        return null;
    }
  };

  const handleApply = () => {
    onApply(buildFilter());
  };

  const handleClear = () => {
    onApply(null);
  };

  const operatorLabel = translate('list.a11y.filterOperator', { column: columnLabel });
  const valueLabel = translate('list.a11y.filterValue', { column: columnLabel });
  const valueFromLabel = translate('list.a11y.filterValueFrom', { column: columnLabel });
  const valueToLabel = translate('list.a11y.filterValueTo', { column: columnLabel });
  const dateLabel = translate('list.a11y.filterDate', { column: columnLabel });
  const dateFromLabel = translate('list.a11y.filterDateFrom', { column: columnLabel });
  const dateToLabel = translate('list.a11y.filterDateTo', { column: columnLabel });

  const opSelect =
    kind === 'boolean' || kind === 'select' ? null : (
      <Select
        aria-label={operatorLabel}
        style={{ width: '100%', marginBottom: token.marginSM }}
        value={op}
        options={opOptions}
        onChange={(v) => {
          setOp(v);
          if (kind === 'number' && v !== 'between') setNum2(null);
        }}
      />
    );

  const valueBlock = (() => {
    switch (kind) {
      case 'text':
        return (
          <Input
            aria-label={valueLabel}
            placeholder={placeholder}
            value={textVal}
            onChange={(e) => setTextVal(e.target.value)}
            style={{ marginBottom: token.marginSM }}
          />
        );
      case 'number':
        if (op === 'between') {
          return (
            <Space.Compact style={{ width: '100%', marginBottom: token.marginSM }}>
              <InputNumber
                aria-label={valueFromLabel}
                style={{ width: '50%' }}
                value={num ?? undefined}
                onChange={(n) => setNum(n)}
              />
              <InputNumber
                aria-label={valueToLabel}
                style={{ width: '50%' }}
                value={num2 ?? undefined}
                onChange={(n) => setNum2(n)}
              />
            </Space.Compact>
          );
        }
        return (
          <InputNumber
            aria-label={valueLabel}
            style={{ width: '100%', marginBottom: token.marginSM }}
            value={num ?? undefined}
            onChange={(n) => setNum(n)}
          />
        );
      case 'boolean':
        return (
          <Select
            aria-label={valueLabel}
            style={{ width: '100%', marginBottom: token.marginSM }}
            allowClear
            placeholder={translate('list.filter.boolPlaceholder')}
            value={boolVal === null ? undefined : boolVal}
            options={[
              { value: true, label: translate('list.filter.boolYes', undefined, 'Sí') },
              { value: false, label: translate('list.filter.boolNo', undefined, 'No') },
            ]}
            onChange={(v) => setBoolVal(v === undefined ? null : v)}
          />
        );
      case 'date':
        if (op === 'between') {
          const start = dateRange?.[0] ?? '';
          const end = dateRange?.[1] ?? '';
          return (
            <Space direction="vertical" style={{ width: '100%', marginBottom: token.marginSM }}>
              <DatePicker
                aria-label={dateFromLabel}
                style={{ width: '100%' }}
                format={pickerDateFormat}
                locale={antdDatePickerLocaleEs}
                value={toDayjs(start)}
                onChange={(d) => {
                  const nextStart = d ? d.format('YYYY-MM-DD') : '';
                  setDateRange(nextStart || end ? [nextStart, end] : null);
                }}
              />
              <DatePicker
                aria-label={dateToLabel}
                style={{ width: '100%' }}
                format={pickerDateFormat}
                locale={antdDatePickerLocaleEs}
                value={toDayjs(end)}
                onChange={(d) => {
                  const nextEnd = d ? d.format('YYYY-MM-DD') : '';
                  setDateRange(start || nextEnd ? [start, nextEnd] : null);
                }}
              />
            </Space>
          );
        }
        return (
          <DatePicker
            aria-label={dateLabel}
            style={{ width: '100%', marginBottom: token.marginSM }}
            format={pickerDateFormat}
            locale={antdDatePickerLocaleEs}
            value={toDayjs(dateSingle)}
            onChange={(d) => setDateSingle(d ? d.format('YYYY-MM-DD') : '')}
          />
        );
      case 'select':
        return (
          <Select
            aria-label={valueLabel}
            style={{ width: '100%', marginBottom: token.marginSM }}
            placeholder={translate('list.filter.boolPlaceholder')}
            value={selectVal || undefined}
            options={options.map((option) => ({ value: option.value, label: option.label }))}
            onChange={(value) => setSelectVal(String(value))}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Card
      size="small"
      styles={{ body: { padding: token.paddingSM, width: 260, maxWidth: 'calc(100vw - 32px)' } }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {opSelect}
      {valueBlock}
      <Space>
        <Button type="primary" size="small" onClick={handleApply}>
          {onSearchLabel}
        </Button>
        <Button size="small" onClick={handleClear}>
          {onResetLabel}
        </Button>
      </Space>
    </Card>
  );
}

export function ColumnFilterDropdown(props: Props) {
  if (!props.visible) return null;
  const syncKey = `${props.field}:${props.kind}:${JSON.stringify(props.current ?? null)}`;
  return <ColumnFilterDropdownBody key={syncKey} {...props} />;
}
