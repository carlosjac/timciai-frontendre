import { Form, Input, InputNumber, Select } from 'antd';
import { useTranslate } from '@refinedev/core';
import type { FormInstance, SelectProps } from 'antd';
import { MonetaryPolicyDefaultSelect } from '../monetary-policies/MonetaryPolicyDefaultSelect.js';

export type EntityGeneralSettingsSection = 'contact' | 'policies';

type EntityGeneralSettingsFieldsProps = {
  form: FormInstance;
  countrySelect: SelectProps;
  currencySelect: SelectProps;
  /** Global catalog. Used when showSupportedCurrencies is true (create, root edit, entity settings). */
  allCurrencySelect?: SelectProps;
  showSupportedCurrencies?: boolean;
  policyOptions: Array<{ value: string; label: string }>;
  sections?: EntityGeneralSettingsSection[];
  /** Required to load monetary policy options for default select. */
  tenantId?: string | null;
  entityId?: string | null;
};

function addCurrencyToSupported(form: FormInstance, currencyId: string | undefined) {
  if (!currencyId) return;
  const current = (form.getFieldValue('supportedCurrencyIds') as string[] | undefined) ?? [];
  if (current.includes(currencyId)) return;
  form.setFieldsValue({ supportedCurrencyIds: [...current, currencyId] });
}

export function EntityGeneralSettingsFields({
  form,
  countrySelect,
  currencySelect,
  allCurrencySelect,
  showSupportedCurrencies = false,
  policyOptions,
  sections = ['contact', 'policies'],
  tenantId,
  entityId,
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
          {showSupportedCurrencies ? (
            <Form.Item
              label={translate('create.entity.supportedCurrencies')}
              name="supportedCurrencyIds"
              extra={translate('create.entity.supportedCurrenciesHint')}
              rules={[
                { required: true, message: translate('form.validation.requiredField') },
                {
                  validator: async (_, value: string[]) => {
                    if (!Array.isArray(value) || value.length < 1) {
                      throw new Error(translate('create.entity.supportedCurrenciesMinOne'));
                    }
                  },
                },
              ]}
            >
              <Select
                {...(allCurrencySelect ?? currencySelect)}
                mode="multiple"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) => {
                  const label = option?.label;
                  const text = typeof label === 'string' ? label : String(label ?? '');
                  return text.toLowerCase().includes(input.trim().toLowerCase());
                }}
              />
            </Form.Item>
          ) : null}
          <Form.Item
            label={translate('create.entity.defaultCurrency')}
            name="defaultCurrencyId"
            rules={[
              { required: true, message: translate('form.validation.requiredField') },
              {
                validator: async (_, value: string) => {
                  if (!showSupportedCurrencies || !value) return;
                  const accepted = form.getFieldValue('supportedCurrencyIds') as string[] | undefined;
                  if (Array.isArray(accepted) && accepted.length > 0 && !accepted.includes(value)) {
                    throw new Error(translate('create.entity.defaultCurrencyMustBeSupported'));
                  }
                },
              },
            ]}
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
              onChange={(value) => addCurrencyToSupported(form, value as string | undefined)}
            />
          </Form.Item>
          <Form.Item
            label={translate('create.entity.baseCurrency')}
            name="baseCurrencyId"
            rules={[
              { required: true, message: translate('form.validation.requiredField') },
              {
                validator: async (_, value: string) => {
                  if (!showSupportedCurrencies || !value) return;
                  const accepted = form.getFieldValue('supportedCurrencyIds') as string[] | undefined;
                  if (Array.isArray(accepted) && accepted.length > 0 && !accepted.includes(value)) {
                    throw new Error(translate('create.entity.baseCurrencyMustBeSupported'));
                  }
                },
              },
            ]}
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
              onChange={(value) => addCurrencyToSupported(form, value as string | undefined)}
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
          {tenantId && entityId ? (
            <MonetaryPolicyDefaultSelect tenantId={tenantId} entityId={entityId} />
          ) : null}
        </>
      ) : null}
    </>
  );
}
