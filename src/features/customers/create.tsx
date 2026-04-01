import { Create, useForm, useSelect } from '@refinedev/antd';
import { useList, useTranslate, type BaseRecord } from '@refinedev/core';
import { useMemo, useEffect, useState } from 'react';
import { Alert, Form, Input, InputNumber, Select, Switch } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import {
  fetchOverduePolicyCatalog,
  fetchPriceListsForEntity,
  type OverduePolicyItem,
  type PriceListRow,
} from '../../shared/timci/auxiliaryApi.js';

type DocTypeRow = BaseRecord & {
  id: string;
  name: string;
  countryId?: string | null;
  appliesTo?: string;
};

export function CustomerCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);
  const [priceLists, setPriceLists] = useState<PriceListRow[]>([]);

  const { formProps, saveButtonProps, onFinish, form } = useForm({ resource: 'customers' });

  const entityIdWatched = Form.useWatch('entityId', form);

  const { selectProps: countrySelect } = useSelect({
    resource: 'countries',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const { selectProps: currencySelectRaw } = useSelect({
    resource: 'currencies',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const currencySelect = stripSelectServerSearch(currencySelectRaw);

  const { selectProps: entitySelect } = useSelect({
    resource: 'entities',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 200 },
    queryOptions: { enabled: !!tenantId },
  });

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
    if (!tenantId || !entityIdWatched) {
      setPriceLists([]);
      form?.setFieldValue('priceListId', undefined);
      return;
    }
    void fetchPriceListsForEntity(tenantId, String(entityIdWatched)).then((rows) => {
      setPriceLists(rows);
      const current = form?.getFieldValue('priceListId') as string | undefined;
      if (current && !rows.some((r) => r.id === current)) {
        form?.setFieldValue('priceListId', rows[0]?.id);
      }
    });
  }, [tenantId, entityIdWatched, form]);

  useEffect(() => {
    if (policies.length === 0) return;
    const first = policies[0].key;
    const currentDefault = form?.getFieldValue('defaultOverdueNotificationPolicyKey');
    if (!currentDefault) {
      form?.setFieldsValue({ defaultOverdueNotificationPolicyKey: first });
    }
  }, [policies, form]);

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
      <Create title={translate('pages.customers.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.customers.create')} saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          entityId: tenantId,
          personType: 'physical_person',
          defaultPaymentTermDays: 30,
          isActive: true,
        }}
        onFinish={async (values: Record<string, unknown>) => {
          await onFinish({
            name: values.name,
            address: values.address,
            countryId: values.countryId,
            entityId: values.entityId,
            priceListId: values.priceListId,
            defaultCurrencyId: values.defaultCurrencyId,
            personType: values.personType,
            documentTypeId: values.documentTypeId,
            documentNumber: values.documentNumber,
            defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
            defaultPaymentTermDays: values.defaultPaymentTermDays,
            isActive: values.isActive !== false,
          });
        }}
      >
        <Form.Item
          label={translate('table.customers.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={translate('create.customer.address')}
          name="address"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={translate('create.customer.country')}
          name="countryId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select {...countrySelect} showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item
          label={translate('create.customer.entity')}
          name="entityId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select {...entitySelect} showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item
          label={translate('create.customer.priceList')}
          name="priceListId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            disabled={!entityIdWatched || priceLists.length === 0}
            options={priceLists.map((p) => ({ value: p.id, label: p.name }))}
            placeholder={
              !entityIdWatched
                ? translate('create.customer.entity')
                : priceLists.length === 0
                  ? '…'
                  : undefined
            }
          />
        </Form.Item>
        <Form.Item
          label={translate('create.customer.defaultCurrency')}
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
          label={translate('create.customer.personType')}
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
                label={translate('create.customer.documentType')}
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
          label={translate('create.customer.documentNumber')}
          name="documentNumber"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={translate('create.customer.defaultOverduePolicy')}
          name="defaultOverdueNotificationPolicyKey"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select showSearch optionFilterProp="label" options={policyOptions} />
        </Form.Item>
        <Form.Item
          label={translate('create.customer.defaultPaymentTermDays')}
          name="defaultPaymentTermDays"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label={translate('create.customer.active')}
          name="isActive"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
}
