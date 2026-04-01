import type { LogicalFilter } from '@refinedev/core';
import { Button, Card, DatePicker, Input, InputNumber, Select, Space, theme } from 'antd';
import { antdDatePickerLocaleEs } from '../../antdPickerLocaleEs.js';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  defaultOperatorForKind,
  normalizeStoredOperator,
  operatorsForKind,
  type TimciFilterKind,
} from '../domain/filter-operators.js';
import { timciLogicalFilter } from '../../listQuery.js';

const { RangePicker } = DatePicker;

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
  /** Ant Design DatePicker format (p. ej. preferencia de usuario). */
  pickerDateFormat: string;
};

export function ColumnFilterDropdown(props: Props) {
  const { token } = theme.useToken();
  const {
    kind,
    field,
    visible,
    current,
    translate,
    onApply,
    onSearchLabel,
    onResetLabel,
    placeholder,
    pickerDateFormat,
  } = props;

  const [op, setOp] = useState(() => defaultOperatorForKind(kind));
  const [textVal, setTextVal] = useState('');
  const [num, setNum] = useState<number | null>(null);
  const [num2, setNum2] = useState<number | null>(null);
  const [boolVal, setBoolVal] = useState<boolean | null>(null);
  const [dateSingle, setDateSingle] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // When the Ant Table filter panel opens, align local fields with Refine `filters` (source of truth).
  /* eslint-disable react-hooks/set-state-in-effect -- single batch reset on open; no external subscription */
  useEffect(() => {
    if (!visible) return;
    const lf = current;
    const nextOp = normalizeStoredOperator(kind, lf?.operator as string | undefined);
    setOp(nextOp);
    setTextVal('');
    setNum(null);
    setNum2(null);
    setBoolVal(null);
    setDateSingle('');
    setDateRange(null);
    if (!lf) return;

    const v = lf.value;
    const lfOp = String(lf.operator);
    switch (kind) {
      case 'text':
        setTextVal(String(v ?? ''));
        break;
      case 'number':
        if (lfOp === 'between' && Array.isArray(v)) {
          setNum(v[0] != null && v[0] !== '' ? Number(v[0]) : null);
          setNum2(v[1] != null && v[1] !== '' ? Number(v[1]) : null);
        } else if (v != null && v !== '') {
          setNum(Number(v));
        }
        break;
      case 'boolean':
        if (typeof v === 'boolean') setBoolVal(v);
        break;
      case 'date':
        if (lfOp === 'between' && Array.isArray(v)) {
          setDateRange([String(v[0] ?? '').slice(0, 10), String(v[1] ?? '').slice(0, 10)]);
        } else {
          setDateSingle(String(v ?? '').slice(0, 10));
        }
        break;
      default:
        break;
    }
  }, [visible, current, kind]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  const opSelect =
    kind === 'boolean' ? null : (
      <Select
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
              <InputNumber style={{ width: '50%' }} value={num ?? undefined} onChange={(n) => setNum(n)} />
              <InputNumber style={{ width: '50%' }} value={num2 ?? undefined} onChange={(n) => setNum2(n)} />
            </Space.Compact>
          );
        }
        return (
          <InputNumber
            style={{ width: '100%', marginBottom: token.marginSM }}
            value={num ?? undefined}
            onChange={(n) => setNum(n)}
          />
        );
      case 'boolean':
        return (
          <Select
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
          return (
            <RangePicker
              style={{ width: '100%', marginBottom: token.marginSM }}
              format={pickerDateFormat}
              locale={antdDatePickerLocaleEs}
              value={
                dateRange
                  ? [toDayjs(dateRange[0]), toDayjs(dateRange[1])]
                  : null
              }
              onChange={(dates) => {
                if (!dates || !dates[0] || !dates[1]) {
                  setDateRange(null);
                  return;
                }
                setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
              }}
            />
          );
        }
        return (
          <DatePicker
            style={{ width: '100%', marginBottom: token.marginSM }}
            format={pickerDateFormat}
            locale={antdDatePickerLocaleEs}
            value={toDayjs(dateSingle)}
            onChange={(d) => setDateSingle(d ? d.format('YYYY-MM-DD') : '')}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Card
      size="small"
      styles={{ body: { padding: token.paddingSM, width: kind === 'date' && op === 'between' ? 320 : 260 } }}
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
