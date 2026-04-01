import { Create, useForm, useSelect } from '@refinedev/antd';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { useEffect, useMemo } from 'react';
import { Alert, Form, Input, Select, Switch } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import { documentTypeValidationRulesForCountryIso } from './validationRuleChoices.js';

type CountryRow = BaseRecord & { id: string; name?: string; isoCode?: string };

export function DocumentTypeCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish, form } = useForm({ resource: 'document_types' });
  const { selectProps: countrySelectRaw, query: countriesQuery } = useSelect({
    resource: 'countries',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const countrySelect = stripSelectServerSearch(countrySelectRaw);

  const countryId = Form.useWatch('countryId', form);

  const countries = useMemo(
    () => (countriesQuery.data?.data ?? []) as CountryRow[],
    [countriesQuery.data],
  );
  const selectedCountryIso = useMemo(() => {
    const row = countries.find((c) => c.id === countryId);
    return row?.isoCode;
  }, [countries, countryId]);

  const validationRuleOptions = useMemo(
    () => documentTypeValidationRulesForCountryIso(selectedCountryIso),
    [selectedCountryIso],
  );

  useEffect(() => {
    const key = form?.getFieldValue('validationRuleKey') as string | undefined;
    if (!key) return;
    const stillValid = validationRuleOptions.some((o) => o.value === key);
    if (!stillValid) form?.setFieldValue('validationRuleKey', undefined);
  }, [countryId, validationRuleOptions, form]);

  if (!tenantId) {
    return (
      <Create title={translate('pages.documentTypes.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.documentTypes.create')} saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          const rawRule = values.validationRuleKey;
          const validationRuleKey =
            typeof rawRule === 'string' && rawRule.trim() !== '' ? rawRule.trim() : null;
          await onFinish({
            ...values,
            validationRuleKey,
            isActive: values.isActive !== false,
          });
        }}
      >
        <Form.Item
          label={translate('create.documentType.typeName')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item
          label={translate('create.documentType.country')}
          name="countryId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            {...countrySelect}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) => {
              const label = option?.label;
              const text = typeof label === 'string' ? label : String(label ?? '');
              return text.toLowerCase().includes(input.trim().toLowerCase());
            }}
          />
        </Form.Item>
        <Form.Item
          label={translate('create.documentType.appliesTo')}
          name="appliesTo"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            options={[
              { value: 'physical_person', label: translate('create.documentType.physical') },
              { value: 'legal_person', label: translate('create.documentType.legal') },
              { value: 'both', label: translate('create.documentType.both') },
            ]}
          />
        </Form.Item>
        <Form.Item label={translate('create.documentType.validationRuleNumber')} name="validationRuleKey">
          <Select
            allowClear
            disabled={!countryId}
            placeholder={
              !countryId
                ? translate('create.documentType.validationRulePickCountry')
                : validationRuleOptions.length === 0
                  ? translate('create.documentType.validationRuleNoneForCountry')
                  : translate('create.documentType.validationRulePlaceholder')
            }
            options={validationRuleOptions}
          />
        </Form.Item>
        <Form.Item
          label={translate('table.users.active')}
          name="isActive"
          valuePropName="checked"
          initialValue
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
}
