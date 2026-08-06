import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';
import { Alert, Button, Form, InputNumber, Radio, Select, Space, Typography } from 'antd';
import { useEffect } from 'react';
import { MonetaryPolicyLiveSummary } from './MonetaryPolicyLiveSummary.js';
import {
  validateRelativeBandsCoverageForForm,
  type CoverageBound,
} from './relativeBandsCoverage.js';
import { isBoundSymbol, modeToBound } from './monetaryPolicyParamsForm.js';

const EFFECT_OPTIONS = ['discount', 'surcharge', 'none'] as const;
const CHARGE_MODES = ['flat_percent', 'daily_rate'] as const;

type BoundMode = 'number' | 'eom' | 'start_next_month' | 'open';

type Props = {
  disabled?: boolean;
  /** When kind is none, hide params editor. */
  kind?: string;
};

type BoundFieldProps = {
  field: { key: number; name: number };
  bound: 'from' | 'to';
  unit: string | undefined;
  disabled?: boolean;
  label: string;
  tooltip: string;
  t: (key: string) => string;
};

/** Bound editor: mode selector (number/end-of-month/start-of-next-month/open) + number input. */
function BoundField({ field, bound, unit, disabled, label, tooltip, t }: BoundFieldProps) {
  const translate = useTranslate();
  const form = Form.useFormInstance();
  const modeName = `${bound}Mode`;
  const valueName = `${bound}Value`;
  const modePath = ['params', 'bands', field.name, modeName];
  const mode = Form.useWatch(modePath, form) as BoundMode | undefined;
  const anchor = Form.useWatch(['params', 'anchor'], form) as string | undefined;
  const allowSymbol = unit !== 'months';

  const unitFragment = translate(
    `pages.monetaryPolicies.params.boundMode.numberUnit.${unit === 'months' ? 'months' : 'days'}`,
  );
  const anchorFragment = translate(
    `pages.monetaryPolicies.params.boundMode.numberAnchor.${
      anchor === 'document_date' ? 'document_date' : 'due_date'
    }`,
  );
  const numberLabel = translate('pages.monetaryPolicies.params.boundMode.number', {
    unit: unitFragment,
    anchor: anchorFragment,
  });

  const modeOptions: Array<{ value: BoundMode; label: string }> = [
    { value: 'number', label: numberLabel },
    ...(allowSymbol
      ? [
          { value: 'eom' as const, label: t('boundMode.eom') },
          { value: 'start_next_month' as const, label: t('boundMode.start_next_month') },
        ]
      : []),
    { value: 'open', label: t('boundMode.open') },
  ];

  return (
    <Form.Item label={label} tooltip={tooltip} style={{ marginBottom: 0 }}>
      <Space.Compact>
        {mode === 'number' && (
          <Form.Item {...field} name={[field.name, valueName]} noStyle>
            <InputNumber disabled={disabled} precision={0} style={{ width: 90 }} />
          </Form.Item>
        )}
        <Form.Item {...field} name={[field.name, modeName]} noStyle>
          <Select disabled={disabled} style={{ width: 300 }} options={modeOptions} />
        </Form.Item>
      </Space.Compact>
    </Form.Item>
  );
}

/**
 * Form fields for relative_bands params (anchor + bands).
 * Rates are edited as percentages and converted on submit.
 */
export function MonetaryPolicyParamsFields({ disabled, kind }: Props) {
  const translate = useTranslate();
  const t = (key: string) => translate(`pages.monetaryPolicies.params.${key}`);
  const required = [{ required: true, message: translate('form.validation.requiredField') }];
  const form = Form.useFormInstance();
  const unit = Form.useWatch(['params', 'unit'], form) as string | undefined;

  useEffect(() => {
    if (unit !== 'months' || !form) return;
    const bands = form.getFieldValue(['params', 'bands']) as
      | Array<Record<string, unknown>>
      | undefined;
    const needsFix = bands?.some(
      (b) =>
        b?.chargeMode === 'daily_rate' ||
        isBoundSymbol(b?.fromMode) ||
        isBoundSymbol(b?.toMode),
    );
    if (!needsFix) return;
    form.setFieldValue(
      ['params', 'bands'],
      bands!.map((b) => {
        if (!b) return b;
        const next = { ...b };
        if (next.chargeMode === 'daily_rate') next.chargeMode = 'flat_percent';
        if (isBoundSymbol(next.fromMode)) next.fromMode = 'open';
        if (isBoundSymbol(next.toMode)) next.toMode = 'open';
        return next;
      }),
    );
  }, [unit, form]);

  if (kind === 'none') {
    return (
      <Alert type="info" showIcon message={translate('pages.monetaryPolicies.noneKindHint')} />
    );
  }

  return (
    <>
      <Form.Item
        label={translate('pages.monetaryPolicies.anchorLabel')}
        name={['params', 'anchor']}
        rules={required}
        extra={translate('pages.monetaryPolicies.anchorHint')}
      >
        <Radio.Group disabled={disabled}>
          <Radio.Button value="document_date">
            {translate('pages.monetaryPolicies.anchor.document_date')}
          </Radio.Button>
          <Radio.Button value="due_date">
            {translate('pages.monetaryPolicies.anchor.due_date')}
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label={translate('pages.monetaryPolicies.unitLabel')}
        name={['params', 'unit']}
        rules={required}
        extra={translate('pages.monetaryPolicies.unitHint')}
      >
        <Radio.Group disabled={disabled}>
          <Radio.Button value="days">{translate('pages.monetaryPolicies.unit.days')}</Radio.Button>
          <Radio.Button value="months">{translate('pages.monetaryPolicies.unit.months')}</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Typography.Title level={5} style={{ marginTop: 8 }}>
        {translate('pages.monetaryPolicies.bandsSection')}
      </Typography.Title>

      <Form.List
        name={['params', 'bands']}
        rules={[
          {
            validator: async (_, bands) => {
              const unit = form.getFieldValue(['params', 'unit']) === 'months' ? 'months' : 'days';
              const raw = Array.isArray(bands) ? bands : [];
              const normalized = raw.map((band) => {
                if (!band || typeof band !== 'object') {
                  return { from: null as CoverageBound, to: null as CoverageBound };
                }
                const b = band as Record<string, unknown>;
                let from = modeToBound(b.fromMode, b.fromValue) as CoverageBound;
                let to = modeToBound(b.toMode, b.toValue) as CoverageBound;
                if (unit === 'months') {
                  if (typeof from !== 'number') from = null;
                  if (typeof to !== 'number') to = null;
                }
                return { from, to };
              });
              const coverageErrors = validateRelativeBandsCoverageForForm(normalized);
              if (coverageErrors.length === 0) return;

              const messages = coverageErrors.map((err) => {
                if (err.code === 'bandsRequired') return t('bandsRequired');
                if (err.code === 'openFromRequired') return t('coverageOpenFrom');
                if (err.code === 'openToRequired') return t('coverageOpenTo');
                return translate('pages.monetaryPolicies.params.coverageOverlapOrGap', {
                  a: String(err.a ?? ''),
                  b: String(err.b ?? ''),
                });
              });

              return Promise.reject(messages);
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field) => (
              <div
                key={field.key}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
                  borderRadius: 8,
                }}
              >
                <Space wrap align="start" style={{ width: '100%' }}>
                  <BoundField
                    field={field}
                    bound="from"
                    unit={unit}
                    disabled={disabled}
                    label={t('from')}
                    tooltip={t('fromHint')}
                    t={t}
                  />
                  <BoundField
                    field={field}
                    bound="to"
                    unit={unit}
                    disabled={disabled}
                    label={t('to')}
                    tooltip={t('toHint')}
                    t={t}
                  />
                  <Form.Item
                    {...field}
                    label={t('effectLabel')}
                    name={[field.name, 'effect']}
                    rules={required}
                  >
                    <Select
                      disabled={disabled}
                      style={{ width: 140 }}
                      options={EFFECT_OPTIONS.map((v) => ({
                        value: v,
                        label: t(`effect.${v}`),
                      }))}
                    />
                  </Form.Item>
                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const effect = form.getFieldValue([
                        'params',
                        'bands',
                        field.name,
                        'effect',
                      ]);
                      if (effect === 'none') return null;

                      return (
                        <Form.Item
                          {...field}
                          label={t('chargeMode')}
                          name={[field.name, 'chargeMode']}
                          rules={required}
                          extra={unit === 'months' ? t('dailyRateRequiresDays') : undefined}
                        >
                          <Select
                            disabled={disabled || unit === 'months'}
                            style={{ width: 160 }}
                            options={CHARGE_MODES.map((v) => ({
                              value: v,
                              label: t(`chargeModeOptions.${v}`),
                              disabled: v === 'daily_rate' && unit === 'months',
                            }))}
                          />
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const effect = form.getFieldValue([
                        'params',
                        'bands',
                        field.name,
                        'effect',
                      ]);
                      if (effect === 'none') return null;

                      const chargeMode = form.getFieldValue([
                        'params',
                        'bands',
                        field.name,
                        'chargeMode',
                      ]);

                      return (
                        <Form.Item
                          {...field}
                          label={
                            chargeMode === 'daily_rate'
                              ? t('rateDailyPercent')
                              : t('ratePercent')
                          }
                          name={[field.name, 'ratePercent']}
                          rules={required}
                        >
                          <InputNumber
                            disabled={disabled}
                            min={0}
                            max={100}
                            step={0.01}
                            addonAfter="%"
                            style={{ width: 140 }}
                          />
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                  {!disabled && (
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      aria-label={t('removeBand')}
                      onClick={() => remove(field.name)}
                      style={{ marginTop: 30 }}
                    />
                  )}
                </Space>
              </div>
            ))}
            {!disabled && (
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      fromMode: 'number',
                      fromValue: 0,
                      toMode: 'open',
                      toValue: null,
                      effect: 'discount',
                      chargeMode: 'flat_percent',
                      ratePercent: 10,
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  {t('addBand')}
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            )}
          </>
        )}
      </Form.List>

      <MonetaryPolicyLiveSummary />
    </>
  );
}
