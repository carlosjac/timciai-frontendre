import { Edit, SaveButton, useForm, useSelect } from '@refinedev/antd';
import { useList, useTranslate, type BaseRecord } from '@refinedev/core';
import { Alert, Form, Input, InputNumber, Select, Tabs, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import {
  fetchOverduePolicyCatalog,
  fetchPriceListsForEntity,
  type OverduePolicyItem,
  type PriceListRow,
} from '../../shared/timci/auxiliaryApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useTimciInactiveEditRedirect } from '../../shared/timci/form/useTimciInactiveEditRedirect.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { CustomerContactsEditor } from './CustomerContactsEditor.js';
import type { CustomerContactView } from './CustomerContactsReadonlyTab.js';

const CUSTOMER_EDIT_FIELDS = [
  'address',
  'countryId',
  'priceListId',
  'defaultCurrencyId',
  'personType',
  'defaultOverdueNotificationPolicyKey',
  'defaultPaymentTermDays',
] as const;

type DocTypeRow = BaseRecord & {
  id: string;
  name: string;
};

type CustomerRecord = {
  id?: string;
  name?: string;
  isActive?: boolean;
  documentTypeId?: string;
  documentTypeName?: string;
  documentNumber?: string;
  entityId?: string;
  contacts?: CustomerContactView[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function CustomerEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const entityId = tenantId;
  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);
  const [priceLists, setPriceLists] = useState<PriceListRow[]>([]);
  const [activeTab, setActiveTab] = useState('data');

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'customers',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CUSTOMER_EDIT_FIELDS,
  });

  const record = query?.data?.data as CustomerRecord | undefined;

  const showPathForId = useCallback(
    (id: string) => `/customers/show/${encodeURIComponent(id)}`,
    [],
  );

  const isRedirectingInactive = useTimciInactiveEditRedirect({
    formLoading,
    record,
    showPathForId,
    warningMessageKey: 'pages.customers.inactiveCannotEdit',
  });

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

  const documentTypeLabel = useMemo(() => {
    if (record?.documentTypeName?.trim()) return record.documentTypeName.trim();
    const id = record?.documentTypeId;
    if (!id) return '—';
    const dt = (docTypeResult.data ?? []).find((d) => String(d.id) === String(id));
    return dt?.name ?? id;
  }, [docTypeResult.data, record?.documentTypeId, record?.documentTypeName]);

  useEffect(() => {
    if (!tenantId || !entityId) return;
    void fetchOverduePolicyCatalog(tenantId).then(setPolicies);
  }, [tenantId, entityId]);

  useEffect(() => {
    if (!tenantId || !entityId) return;
    let cancelled = false;
    void fetchPriceListsForEntity(tenantId, entityId).then((rows) => {
      if (!cancelled) setPriceLists(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId, entityId]);

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
      <Edit title={translate('pages.customers.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  if (isRedirectingInactive) {
    return <Edit title={translate('pages.customers.editTitle')} isLoading />;
  }

  return (
    <Edit
      title={translate('pages.customers.editTitle')}
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      footerButtons={
        activeTab === 'data'
          ? ({ saveButtonProps: refineSaveProps }) => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <SaveButton {...refineSaveProps} />
              </div>
            )
          : () => null
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'data',
            label: translate('pages.customers.tabData'),
            children: (
              <>
                <TimciFormServerAlert messages={generalMessages} />
                <TimciFormInactiveRecordBanner isActive={record?.isActive} />
                <Typography.Paragraph type="secondary">
                  {translate('pages.customers.readonlyFieldsHint')}
                </Typography.Paragraph>
                <Form
                  {...formProps}
                  layout="vertical"
                  onFinish={async (values: Record<string, unknown>) => {
                    clearServerErrors(form);
                    try {
                      await submitRecord({
                        address: values.address,
                        countryId: values.countryId,
                        entityId: record?.entityId ?? entityId,
                        priceListId: values.priceListId,
                        defaultCurrencyId: values.defaultCurrencyId,
                        personType: values.personType,
                        defaultOverdueNotificationPolicyKey:
                          values.defaultOverdueNotificationPolicyKey,
                        defaultPaymentTermDays: values.defaultPaymentTermDays,
                      });
                    } catch (e) {
                      applyServerError(form, e);
                      throw e;
                    }
                  }}
                >
                  <Form.Item label={translate('table.customers.name')}>
                    <Input value={record?.name ?? ''} disabled />
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
                        {
                          value: 'physical_person',
                          label: translate('create.documentType.physical'),
                        },
                        { value: 'legal_person', label: translate('create.documentType.legal') },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label={translate('create.customer.documentType')}>
                    <Input value={documentTypeLabel} disabled />
                  </Form.Item>
                  <Form.Item label={translate('create.customer.documentNumber')}>
                    <Input value={record?.documentNumber ?? ''} disabled />
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
                </Form>
                {record && (
                  <TimciFormAuditCollapse
                    dateFormat={dateFormat}
                    timeZone={timeZone}
                    createdAt={record.createdAt}
                    updatedAt={record.updatedAt}
                    createdBy={record.createdBy}
                    updatedBy={record.updatedBy}
                  />
                )}
              </>
            ),
          },
          {
            key: 'contacts',
            label: translate('pages.customers.tabContacts'),
            children:
              record?.id != null ? (
                <CustomerContactsEditor
                  customerId={String(record.id)}
                  contacts={record.contacts}
                  onSaved={async () => {
                    await query?.refetch?.();
                  }}
                />
              ) : (
                <Alert type="info" showIcon message={translate('pages.customers.contactsTabWait')} />
              ),
          },
        ]}
      />
    </Edit>
  );
}
