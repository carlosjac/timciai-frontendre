import { useTranslate } from '@refinedev/core';
import { Form, Select } from 'antd';
import type { FormItemProps } from 'antd';
import type { CountryTaxProfileSchema } from '../taxesApi.js';
import type { NamePath } from 'antd/es/form/interface.js';

type Props = {
  schema: CountryTaxProfileSchema | null | undefined;
  name?: NamePath;
  required?: boolean;
  disabled?: boolean;
  labelKey?: string;
  /** Spread onto Form.Item (e.g. Form.List `restField`). */
  formItemProps?: Omit<FormItemProps, 'name' | 'label' | 'rules'>;
};

export function TaxCategorySelect({
  schema,
  name = 'taxCategoryKey',
  required = true,
  disabled = false,
  labelKey = 'tax.category',
  formItemProps,
}: Props) {
  const translate = useTranslate();
  const options = (schema?.taxCategories ?? []).map((c) => ({
    value: c.categoryKey,
    label: c.name,
  }));

  return (
    <Form.Item
      {...formItemProps}
      label={translate(labelKey)}
      name={name}
      rules={
        required
          ? [{ required: true, message: translate('form.validation.requiredField') }]
          : undefined
      }
    >
      <Select
        showSearch
        optionFilterProp="label"
        disabled={disabled || options.length === 0}
        allowClear={!required}
        options={options}
        placeholder={translate('tax.categoryPlaceholder')}
        aria-label={translate(labelKey)}
      />
    </Form.Item>
  );
}
