import { Create, useForm, useSelect } from '@refinedev/antd';
import { useList, useTranslate, type BaseRecord } from '@refinedev/core';
import { useMemo, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Select, Space, Switch, Typography } from 'antd';
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

const emptyContactRow = () => ({
  name: '',
  email: '',
  phone: '',
  notifySales: false,
  notifyCreditos: false,
  notifyDebits: false,
  notifyCollections: false,
  notifyOverduePayments: false,
});

export function CustomerCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  /** Misma convención que alta de entidad: id de entidad = organización actual del header. */
  const entityId = tenantId;
  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);
  const [priceLists, setPriceLists] = useState<PriceListRow[]>([]);

  const { formProps, saveButtonProps, onFinish, form } = useForm({ resource: 'customers' });

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

  const { result: docTypeResult } = useList<DocTypeRow>({
    resource: 'document_types',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const docTypes = docTypeResult.data ?? [];

  useEffect(() => {
    if (!tenantId || !entityId) return;
    void fetchOverduePolicyCatalog(tenantId).then(setPolicies);
  }, [tenantId, entityId]);

  useEffect(() => {
    if (!tenantId || !entityId) return;
    let cancelled = false;
    void fetchPriceListsForEntity(tenantId, entityId).then((rows) => {
      if (cancelled) return;
      setPriceLists(rows);
      const current = form?.getFieldValue('priceListId') as string | undefined;
      if (current && !rows.some((r) => r.id === current)) {
        form?.setFieldValue('priceListId', rows[0]?.id);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId, entityId, form]);

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

  if (!tenantId || !entityId) {
    return (
      <Create title={translate('pages.customers.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.customers.create')} saveButtonProps={saveButtonProps}>
      <Typography.Paragraph type="secondary">
        {translate('create.customer.entityFromHeaderHint')}
      </Typography.Paragraph>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          personType: 'physical_person',
          defaultPaymentTermDays: 30,
          isActive: true,
          contacts: [emptyContactRow()],
        }}
        onFinish={async (values: Record<string, unknown>) => {
          const rawContacts = values.contacts as
            | Array<{
                name?: string;
                email?: string;
                phone?: string;
                notifySales?: boolean;
                notifyCreditos?: boolean;
                notifyDebits?: boolean;
                notifyCollections?: boolean;
                notifyOverduePayments?: boolean;
              }>
            | undefined;

          const contacts = (rawContacts ?? []).map((row) => ({
            name: String(row.name ?? '').trim(),
            email: String(row.email ?? '').trim(),
            phone: String(row.phone ?? '').trim(),
            notifySales: row.notifySales === true,
            notifyCreditos: row.notifyCreditos === true,
            notifyDebits: row.notifyDebits === true,
            notifyCollections: row.notifyCollections === true,
            notifyOverduePayments: row.notifyOverduePayments === true,
          }));

          await onFinish({
            name: values.name,
            address: values.address,
            countryId: values.countryId,
            entityId,
            priceListId: values.priceListId,
            defaultCurrencyId: values.defaultCurrencyId,
            personType: values.personType,
            documentTypeId: values.documentTypeId,
            documentNumber: values.documentNumber,
            defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
            defaultPaymentTermDays: values.defaultPaymentTermDays,
            isActive: values.isActive !== false,
            contacts,
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
          label={translate('create.customer.priceList')}
          name="priceListId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            disabled={priceLists.length === 0}
            options={priceLists.map((p) => ({ value: p.id, label: p.name }))}
            placeholder={priceLists.length === 0 ? '…' : undefined}
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

        <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
          {translate('create.customer.contactsSection')}
        </Typography.Text>
        <Form.List
          name="contacts"
          rules={[
            {
              validator: async (_, value) => {
                if (!Array.isArray(value) || value.length < 1) {
                  return Promise.reject(new Error(translate('create.customer.contactsMinOne')));
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
                        {translate('create.customer.moveContactUp')}
                      </Button>
                      <Button
                        type="default"
                        htmlType="button"
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      >
                        {translate('create.customer.moveContactDown')}
                      </Button>
                      <Button
                        type="default"
                        htmlType="button"
                        danger
                        disabled={fields.length <= 1}
                        onClick={() => remove(rowName)}
                      >
                        {translate('create.customer.removeContact')}
                      </Button>
                    </Space>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'name']}
                      label={translate('create.customer.contactName')}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input maxLength={120} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'email']}
                      label={translate('create.customer.contactEmail')}
                      rules={[
                        { required: true, message: translate('form.validation.requiredField') },
                        { type: 'email', message: translate('pages.login.errors.validEmail') },
                      ]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input type="email" autoComplete="off" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'phone']}
                      label={translate('create.customer.contactPhone')}
                      style={{ marginBottom: 12 }}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifySales']}
                      label={translate('create.customer.notifySales')}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifyCreditos']}
                      label={translate('create.customer.notifyCreditos')}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifyDebits']}
                      label={translate('create.customer.notifyDebits')}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifyCollections']}
                      label={translate('create.customer.notifyCollections')}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifyOverduePayments']}
                      label={translate('create.customer.notifyOverduePayments')}
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
                onClick={() => add(emptyContactRow())}
                block
                style={{ marginBottom: 8 }}
              >
                {translate('create.customer.addContact')}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Create>
  );
}
