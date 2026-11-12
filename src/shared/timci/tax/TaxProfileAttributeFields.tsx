import { useTranslate } from '@refinedev/core';
import { Form, Select, Spin } from 'antd';
import {
  filterAttributeDefsForRole,
  type CountryTaxProfileSchema,
} from '../taxesApi.js';

type Props = {
  schema: CountryTaxProfileSchema | null;
  loading?: boolean;
  /** Form nest path prefix; fields become `taxProfile.<attributeKey>`. */
  namePrefix?: string | (string | number)[];
  role: 'issuer' | 'recipient';
  disabled?: boolean;
};

function namePath(
  prefix: string | (string | number)[] | undefined,
  attributeKey: string,
): (string | number)[] {
  if (prefix == null) return ['taxProfile', attributeKey];
  if (typeof prefix === 'string') return [prefix, attributeKey];
  return [...prefix, attributeKey];
}

/**
 * Dynamic selects for country tax profile attributes (API `name` as label).
 */
export function TaxProfileAttributeFields({
  schema,
  loading = false,
  namePrefix = 'taxProfile',
  role,
  disabled = false,
}: Props) {
  const translate = useTranslate();
  const defs = filterAttributeDefsForRole(schema?.attributeDefs, role);

  if (loading) {
    return (
      <div role="status" aria-label={translate('app.loadingPage')} style={{ marginBottom: 16 }}>
        <Spin size="small" />
      </div>
    );
  }

  if (!defs.length) return null;

  return (
    <>
      {defs.map((def) => (
        <Form.Item
          key={def.attributeKey}
          label={def.name}
          name={namePath(namePrefix, def.attributeKey)}
          rules={
            def.required
              ? [{ required: true, message: translate('form.validation.requiredField') }]
              : undefined
          }
        >
          <Select
            showSearch
            optionFilterProp="label"
            disabled={disabled}
            allowClear={!def.required}
            options={def.values.map((v) => ({
              value: v.valueKey,
              label: v.name,
            }))}
            placeholder={translate('tax.profile.selectPlaceholder')}
            aria-label={def.name}
          />
        </Form.Item>
      ))}
    </>
  );
}
