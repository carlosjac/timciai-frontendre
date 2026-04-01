import { Create, useForm, useSelect } from '@refinedev/antd';
import { useList, useTranslate, type BaseRecord } from '@refinedev/core';
import { useMemo, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Select, Space, Switch, Typography } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import {
  fetchOverduePolicyCatalog,
  type OverduePolicyItem,
} from '../../shared/timci/auxiliaryApi.js';

type DocTypeRow = BaseRecord & {
  id: string;
  name: string;
  countryId?: string | null;
  appliesTo?: string;
};

export function EntityCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);

  const { formProps, saveButtonProps, onFinish, form } = useForm({ resource: 'entities' });
  const defaultCurrencyIdWatched = Form.useWatch('defaultCurrencyId', form);

  const { selectProps: countrySelect } = useSelect({
    resource: 'countries',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const { selectProps: currencySelectRaw } = useSelect({
    resource: 'currencies',
    optionLabel: (item) => {
      const code = (item as { code?: string }).code;
      const name = (item as { name?: string }).name;
      return code != null && code !== '' ? `${code} — ${name ?? ''}` : (name ?? '');
    },
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const currencySelect = stripSelectServerSearch(currencySelectRaw);

  const { result: docTypeResult } = useList<DocTypeRow>({
    resource: 'document_types',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const docTypes = docTypeResult.data ?? [];

  useEffect(() => {
    if (!tenantId) return;
    void fetchOverduePolicyCatalog(tenantId).then(setPolicies);
  }, [tenantId]);

  useEffect(() => {
    if (policies.length === 0) return;
    const first = policies[0].key;
    const currentDefault = form?.getFieldValue('defaultOverdueNotificationPolicyKey');
    if (!currentDefault) {
      form?.setFieldsValue({
        defaultOverdueNotificationPolicyKey: first,
        availableOverduePolicyKeys: [first],
      });
    }
  }, [policies, form]);

  useEffect(() => {
    if (!tenantId || !form || !defaultCurrencyIdWatched) return;
    const list = form.getFieldValue('paymentOptions') as
      | Array<{ currencyIds?: string[] }>
      | undefined;
    if (!list?.[0]) return;
    const cur = list[0].currencyIds;
    if (Array.isArray(cur) && cur.length > 0) return;
    form.setFieldValue(['paymentOptions', 0, 'currencyIds'], [defaultCurrencyIdWatched]);
  }, [tenantId, defaultCurrencyIdWatched, form]);

  const policyOptions = useMemo(
    () =>
      policies.map((p) => {
        const name = p.description?.trim() ?? '';
        return { value: p.key, label: name !== '' ? name : p.key };
      }),
    [policies],
  );

  if (!tenantId) {
    return (
      <Create title={translate('pages.entities.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.entities.create')} saveButtonProps={saveButtonProps}>
      <Typography.Paragraph type="secondary">{translate('create.entity.idHint')}</Typography.Paragraph>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          id: tenantId,
          personType: 'physical_person',
          defaultPaymentTermDays: 30,
          addAdvertisement: false,
          paymentOptions: [{ name: 'Principal', details: '-', currencyIds: [] as string[], isActive: true }],
        }}
        onFinish={async (values: Record<string, unknown>) => {
          const fantasyRaw = values.fantasyName;
          const fantasyName =
            typeof fantasyRaw === 'string' && fantasyRaw.trim() !== '' ? fantasyRaw.trim() : null;

          const rawList = values.paymentOptions as
            | Array<{
                name?: string;
                details?: string;
                currencyIds?: string[];
                isActive?: boolean;
              }>
            | undefined;

          const paymentOptions = (rawList ?? []).map((row, index) => ({
            ordinal: index,
            name:
              typeof row.name === 'string' && row.name.trim() !== '' ? row.name.trim() : 'Principal',
            details:
              typeof row.details === 'string' && row.details.trim() !== '' ? row.details.trim() : '-',
            currencyIds: Array.isArray(row.currencyIds)
              ? row.currencyIds.filter((id) => id != null && String(id).trim() !== '')
              : [],
            isActive: row.isActive !== false,
          }));

          await onFinish({
            id: values.id,
            name: values.name,
            countryId: values.countryId,
            address: values.address,
            email: values.email,
            phone: values.phone,
            defaultCountryId: values.defaultCountryId,
            defaultCurrencyId: values.defaultCurrencyId,
            personType: values.personType,
            documentTypeId: values.documentTypeId,
            documentNumber: values.documentNumber,
            defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
            defaultPaymentTermDays: values.defaultPaymentTermDays,
            availableOverduePolicyKeys: values.availableOverduePolicyKeys,
            addAdvertisement: values.addAdvertisement,
            fantasyName,
            paymentOptions,
          });
        }}
      >
        <Form.Item
          label="Id (UUID)"
          name="id"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          label={translate('create.entity.entityName')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item
          label={translate('create.entity.country')}
          name="countryId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select {...countrySelect} showSearch optionFilterProp="label" />
        </Form.Item>
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
        <Form.Item
          label={translate('create.entity.personType')}
          name="personType"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            options={[
              { value: 'physical_person', label: translate('create.documentType.physical') },
              { value: 'legal_person', label: translate('create.documentType.legal') },
            ]}
          />
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {() => {
            const countryId = form?.getFieldValue('countryId') as string | undefined;
            const personType = form?.getFieldValue('personType') as string | undefined;
            const filtered = docTypes.filter((dt) => {
              if (!countryId) return false;
              if (dt.countryId != null && dt.countryId !== countryId) return false;
              if (dt.countryId == null) {
                const hasSpecific = docTypes.some((x) => x.countryId === countryId);
                if (hasSpecific) return false;
              }
              if (personType === 'physical_person' && dt.appliesTo === 'legal_person') return false;
              if (personType === 'legal_person' && dt.appliesTo === 'physical_person') return false;
              return true;
            });
            return (
              <Form.Item
                label={translate('create.entity.documentType')}
                name="documentTypeId"
                rules={[{ required: true, message: translate('form.validation.requiredField') }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={filtered.map((d) => ({ value: d.id, label: d.name }))}
                  disabled={!countryId}
                />
              </Form.Item>
            );
          }}
        </Form.Item>
        <Form.Item
          label={translate('create.entity.documentNumber')}
          name="documentNumber"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input />
        </Form.Item>
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
                const def = form?.getFieldValue('defaultOverdueNotificationPolicyKey') as string | undefined;
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
        <Form.Item
          label={translate('create.entity.addAdvertisement')}
          name="addAdvertisement"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item label={translate('create.entity.fantasyName')} name="fantasyName">
          <Input />
        </Form.Item>

        <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
          {translate('create.entity.paymentOptionsSection')}
        </Typography.Text>
        <Form.List
          name="paymentOptions"
          rules={[
            {
              validator: async (_, value) => {
                if (!Array.isArray(value) || value.length < 1) {
                  return Promise.reject(new Error(translate('create.entity.paymentOptionsMinOne')));
                }
                if (!value.some((row: { isActive?: boolean }) => row?.isActive !== false)) {
                  return Promise.reject(
                    new Error(translate('create.entity.paymentOptionsAtLeastOneActive')),
                  );
                }
                const normalized = value.map((row: { name?: string }) =>
                  String(row?.name ?? '')
                    .trim()
                    .toLowerCase(),
                );
                const nonEmpty = normalized.filter((n) => n !== '');
                if (new Set(nonEmpty).size !== nonEmpty.length) {
                  return Promise.reject(
                    new Error(translate('create.entity.paymentOptionsDuplicateNames')),
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove, move }) => (
            <>
              {fields.map((field, index) => {
                const { key, name: rowName, ...restField } = field;
                return (
                  <div
                    key={key}
                    style={{
                      marginBottom: 16,
                      padding: 16,
                      border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
                      borderRadius: 8,
                    }}
                  >
                    <Space wrap style={{ marginBottom: 12 }}>
                      <Button
                        type="default"
                        htmlType="button"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      >
                        {translate('create.entity.movePaymentOptionUp')}
                      </Button>
                      <Button
                        type="default"
                        htmlType="button"
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      >
                        {translate('create.entity.movePaymentOptionDown')}
                      </Button>
                      <Button
                        type="default"
                        htmlType="button"
                        danger
                        disabled={fields.length <= 1}
                        onClick={() => remove(rowName)}
                      >
                        {translate('create.entity.removePaymentOption')}
                      </Button>
                    </Space>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'name']}
                      label={translate('create.entity.paymentOptionName')}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input maxLength={120} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'details']}
                      label={translate('create.entity.paymentOptionDetails')}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'currencyIds']}
                      label={translate('create.entity.paymentOptionCurrencies')}
                      rules={[
                        { required: true, message: translate('form.validation.requiredField') },
                        {
                          type: 'array',
                          min: 1,
                          message: translate('create.entity.paymentOptionCurrenciesMinOne'),
                        },
                      ]}
                      style={{ marginBottom: 12 }}
                    >
                      <Select
                        {...currencySelect}
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
                    <Form.Item
                      {...restField}
                      name={[rowName, 'isActive']}
                      label={translate('create.entity.paymentOptionActive')}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </div>
                );
              })}
              <Button
                type="dashed"
                htmlType="button"
                onClick={() =>
                  add({
                    name: '',
                    details: '',
                    currencyIds: defaultCurrencyIdWatched ? [defaultCurrencyIdWatched] : [],
                    isActive: true,
                  })
                }
                block
                style={{ marginBottom: 8 }}
              >
                {translate('create.entity.addPaymentOption')}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Create>
  );
}
