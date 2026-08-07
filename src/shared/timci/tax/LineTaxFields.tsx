import { useTranslate } from '@refinedev/core';
import { Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import type { NamePath } from 'antd/es/form/interface.js';
import {
  sortedLineTaxFieldDefs,
  type CountryTaxLineFieldDef,
  type CountryTaxProfileSchema,
} from '../taxesApi.js';

type Props = {
  schema: CountryTaxProfileSchema | null | undefined;
  /**
   * Path prefix for the taxAttributes map.
   * Default `taxAttributes` → fields at `taxAttributes.<fieldKey>`.
   * For Form.List lines use e.g. `[name, 'taxAttributes']`.
   */
  namePrefix?: NamePath;
  /** When set, overrides each def's `required` (e.g. optional when sellable is selected). */
  requiredOverride?: boolean;
  disabled?: boolean;
  /** Spread onto each Form.Item (e.g. Form.List `restField`). */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'rules' | 'extra' | 'tooltip'>;
  /** i18n key used only when schema has no lineTaxFieldDefs (legacy fallback). */
  fallbackLabelKey?: string;
};

function toPathSegments(path: NamePath | undefined): (string | number)[] {
  if (path == null) return ['taxAttributes'];
  if (Array.isArray(path)) return path as (string | number)[];
  return [path as string | number];
}

function fieldName(prefix: NamePath | undefined, fieldKey: string): (string | number)[] {
  return [...toPathSegments(prefix), fieldKey];
}

/**
 * Dynamic line/product tax fields from country `lineTaxFieldDefs`.
 * Labels and help come from the catalog (not fixed i18n).
 */
export function LineTaxFields({
  schema,
  namePrefix = 'taxAttributes',
  requiredOverride,
  disabled = false,
  formItemProps,
  fallbackLabelKey = 'tax.category',
}: Props) {
  const translate = useTranslate();
  const defs = sortedLineTaxFieldDefs(schema);

  const effectiveDefs: CountryTaxLineFieldDef[] =
    defs.length > 0
      ? defs
      : (schema?.taxCategories?.length ?? 0) > 0
        ? [
            {
              fieldKey: 'iva_rate',
              name: translate(fallbackLabelKey),
              helpText: null,
              uiControl: 'select',
              optionsSource: 'tax_categories',
              required: true,
              ordinal: 0,
            },
          ]
        : [];

  if (!effectiveDefs.length) return null;

  const categoryOptions = (schema?.taxCategories ?? []).map((c) => ({
    value: c.categoryKey,
    label: c.name,
  }));

  return (
    <>
      {effectiveDefs.map((def) => {
        const required = requiredOverride !== undefined ? requiredOverride : def.required;
        const help = def.helpText?.trim() || undefined;
        const itemName = fieldName(namePrefix, def.fieldKey);

        if (def.uiControl === 'text' && def.optionsSource === 'none') {
          return (
            <Form.Item
              key={def.fieldKey}
              {...formItemProps}
              label={def.name}
              name={itemName}
              extra={help}
              rules={
                required
                  ? [{ required: true, message: translate('form.validation.requiredField') }]
                  : undefined
              }
            >
              <Input
                disabled={disabled}
                allowClear={!required}
                aria-label={def.name}
              />
            </Form.Item>
          );
        }

        // select + tax_categories (AR iva_rate)
        return (
          <Form.Item
            key={def.fieldKey}
            {...formItemProps}
            label={def.name}
            name={itemName}
            extra={help}
            rules={
              required
                ? [{ required: true, message: translate('form.validation.requiredField') }]
                : undefined
            }
          >
            <Select
              showSearch
              optionFilterProp="label"
              disabled={disabled || categoryOptions.length === 0}
              allowClear={!required}
              options={categoryOptions}
              placeholder={translate('tax.categoryPlaceholder')}
              aria-label={def.name}
            />
          </Form.Item>
        );
      })}
    </>
  );
}
