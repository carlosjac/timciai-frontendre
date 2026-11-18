import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Alert, Button, Form, Input, InputNumber, Select, Space, Tabs, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { useBoundedCatalog } from '../../shared/timci/useBoundedCatalog.js';
import { useEntitySupportedCurrencySelect } from '../../shared/timci/useEntitySupportedCurrencySelect.js';
import { useTimciNameSelect } from '../../shared/timci/useTimciNameSelect.js';
import {
  fetchOverduePolicyCatalog,
  type OverduePolicyItem,
} from '../../shared/timci/auxiliaryApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useTimciInactiveEditRedirect } from '../../shared/timci/form/useTimciInactiveEditRedirect.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { MonetaryPolicyDefaultSelect } from '../monetary-policies/MonetaryPolicyDefaultSelect.js';
import { CustomerContactsEditor } from './CustomerContactsEditor.js';
import type { CustomerContactView } from './CustomerContactsReadonlyTab.js';
import { CustomerTaxProfileFields } from './CustomerTaxProfileFields.js';
import { normalizeTaxProfile } from '../../shared/timci/taxesApi.js';
import { useEntityTaxContext } from '../../shared/timci/tax/useEntityTaxContext.js';

const CUSTOMER_EDIT_FIELDS = [
  'address',
  'countryId',
  'priceListId',
  'defaultCurrencyId',
  'personType',
  'defaultOverdueNotificationPolicyKey',
  'defaultPaymentTermDays',
  'defaultMonetaryPolicyId',
  'taxProfile',
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
  taxProfile?: Record<string, string> | null;
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
  const { taxManagementEnabled } = useEntityTaxContext(tenantId, entityId);
  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);
  const [activeTab, setActiveTab] = useState('data');
  const [termsOpen, setTermsOpen] = useState(false);

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    errorNotification: false,
    resource: 'customers',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CUSTOMER_EDIT_FIELDS,
  });

  const record = query?.data?.data as CustomerRecord | undefined;
  const watchedCurrencyId = Form.useWatch('defaultCurrencyId', form);
  const watchedPolicy = Form.useWatch('defaultOverdueNotificationPolicyKey', form);
  const watchedTerm = Form.useWatch('defaultPaymentTermDays', form);

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

  const { rows: countries } = useBoundedCatalog<BaseRecord & { id?: string; name?: string }>(
    'countries',
    !!tenantId,
  );
  const countrySelect = useMemo(
    () => ({
      options: countries.map((row) => ({ value: String(row.id), label: String(row.name ?? row.id) })),
      showSearch: true,
      optionFilterProp: 'label' as const,
    }),
    [countries],
  );

  const { selectProps: currencySelect } = useEntitySupportedCurrencySelect(tenantId);
  const priceListId = Form.useWatch('priceListId', form) as string | undefined;
  const { selectProps: priceListSelect } = useTimciNameSelect(
    'price_lists',
    Boolean(tenantId && entityId),
    priceListId,
  );

  const { rows: documentTypeRows } = useBoundedCatalog<DocTypeRow>('document_types', !!tenantId);

  const documentTypeLabel = useMemo(() => {
    if (record?.documentTypeName?.trim()) return record.documentTypeName.trim();
    const id = record?.documentTypeId;
    if (!id) return '—';
    const dt = documentTypeRows.find((d) => String(d.id) === String(id));
    return dt?.name ?? id;
  }, [documentTypeRows, record]);

  useEffect(() => {
    if (!tenantId || !entityId) return;
    void fetchOverduePolicyCatalog(tenantId).then(setPolicies);
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
        aria-label={translate('tabs.group')}
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
                        defaultMonetaryPolicyId: values.defaultMonetaryPolicyId,
                        ...(taxManagementEnabled
                          ? { taxProfile: normalizeTaxProfile(values.taxProfile) ?? {} }
                          : {}),
                      });
                    } catch (e) {
                      applyServerError(form, e);
                      throw e;
                    }
                  }}
                >
                  <Typography.Title level={5}>{translate('pages.customers.who')}</Typography.Title>
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
                  <Typography.Title level={5}>{translate('pages.customers.howSold')}</Typography.Title>
                  <Form.Item
                    label={translate('create.customer.priceList')}
                    name="priceListId"
                    rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      {...priceListSelect}
                    />
                  </Form.Item>
                  {watchedCurrencyId && watchedPolicy && watchedTerm != null && !termsOpen ? (
                    <Space wrap style={{ marginBottom: 16 }}>
                      <Typography.Text type="secondary">
                        {translate('pages.customers.termsLine')}
                        {`: ${watchedTerm}`}
                      </Typography.Text>
                      <Button type="link" onClick={() => setTermsOpen(true)}>
                        {translate('pages.customers.changeTerms')}
                      </Button>
                    </Space>
                  ) : null}
                  <div hidden={Boolean(watchedCurrencyId && watchedPolicy && watchedTerm != null && !termsOpen)}>
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
                  {tenantId && entityId ? (
                    <MonetaryPolicyDefaultSelect
                      tenantId={tenantId}
                      entityId={record?.entityId ?? entityId}
                      labelKey="create.customer.defaultMonetaryPolicy"
                    />
                  ) : null}
                  </div>
                  <CustomerTaxProfileFields
                    tenantId={tenantId}
                    entityId={record?.entityId ?? entityId}
                  />
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
