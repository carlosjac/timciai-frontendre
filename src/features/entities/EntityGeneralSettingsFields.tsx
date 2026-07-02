import { Form, Input, InputNumber, Select } from 'antd';
import { useTranslate } from '@refinedev/core';
import type { FormInstance, SelectProps } from 'antd';

export type EntityGeneralSettingsSection = 'contact' | 'policies';

type EntityGeneralSettingsFieldsProps = {
  form: FormInstance;
  countrySelect: SelectProps;
  currencySelect: SelectProps;
  policyOptions: Array<{ value: string; label: string }>;
  sections?: EntityGeneralSettingsSection[];
};

export function EntityGeneralSettingsFields({
  form,
  countrySelect,
  currencySelect,
  policyOptions,
  sections = ['contact', 'policies'],
}: EntityGeneralSettingsFieldsProps) {
  const translate = useTranslate();
  const show = (section: EntityGeneralSettingsSection) => sections.includes(section);

  return (
    <>
      {show('contact') ? (
        <>
          <Form.Item
            label={translate('create.entity.address')}
            name="address"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.email')}
            name="email"
            rules={[
              { required: true, message: translate('form.validation.requiredField') },
              { type: 'email', message: translate('pages.login.errors.validEmail') },
            ]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.phone')}
            name="phone"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.defaultCountry')}
            name="defaultCountryId"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select {...countrySelect} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.defaultCurrency')}
            name="defaultCurrencyId"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select
              {...currencySelect}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) => {
                const label = option?.label;
                const text = typeof label === 'string' ? label : String(label ?? '');
                return text.toLowerCase().includes(input.trim().toLowerCase());
              }}
            />
          </Form.Item>
        </>
      ) : null}
      {show('policies') ? (
        <>
          <Form.Item
            label={translate('create.entity.defaultOverduePolicy')}
            name="defaultOverdueNotificationPolicyKey"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Select showSearch optionFilterProp="label" options={policyOptions} />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.availableOverduePolicies')}
            name="availableOverduePolicyKeys"
            rules={[
              { required: true, message: translate('form.validation.requiredField') },
              {
                validator: async (_, value: string[]) => {
                  const def = form?.getFieldValue('defaultOverdueNotificationPolicyKey') as
                    | string
                    | undefined;
                  if (def && Array.isArray(value) && !value.includes(def)) {
                    throw new Error(translate('create.entity.defaultPolicyMustBeInAvailable'));
                  }
                },
              },
            ]}
          >
            <Select mode="multiple" showSearch optionFilterProp="label" options={policyOptions} />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.defaultPaymentTermDays')}
            name="defaultPaymentTermDays"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </>
      ) : null}
    </>
  );
}
