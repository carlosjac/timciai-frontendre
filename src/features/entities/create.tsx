import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { useEffect } from 'react';
import { Alert, App, Form, Input, Tabs, Typography } from 'antd';
import { useSearchParams } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { normalizeRichTextField } from '../../shared/timci/form/index.js';
import { normalizeTaxProfile } from '../../shared/timci/taxesApi.js';
import { EntityAdminRedirect } from './EntityAdminRedirect.js';
import { EntityGeneralSettingsFields } from './EntityGeneralSettingsFields.js';
import { EntityIdentityFields } from './EntityIdentityFields.js';
import { EntityPaymentOptionsFields } from './EntityPaymentOptionsFields.js';
import { EntityTaxManagementFields } from './EntityTaxManagementFields.js';
import { EntityDocumentEmissionFields } from './EntityDocumentEmissionFields.js';
import { EntityDocumentLogoFields } from './EntityDocumentLogoFields.js';
import { useEntityFormResources } from './useEntityFormResources.js';
import { filterSelectOptionsByIds } from '../../shared/timci/useEntitySupportedCurrencySelect.js';

type EntityCreateTab = 'identity' | 'general' | 'taxes' | 'documents' | 'payment-options';

function resolveActiveTab(raw: string | null): EntityCreateTab {
  if (raw === 'payment-options') return 'payment-options';
  if (raw === 'documents') return 'documents';
  if (raw === 'taxes') return 'taxes';
  if (raw === 'general') return 'general';
  return 'identity';
}

export function EntityCreate() {
  const translate = useTranslate();
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const activeTab = resolveActiveTab(searchParams.get('tab'));

  const { formProps, saveButtonProps, onFinish, form } = useForm({ resource: 'entities' });
  const defaultCurrencyIdWatched = Form.useWatch('defaultCurrencyId', form);
  const supportedCurrencyIdsWatched = Form.useWatch('supportedCurrencyIds', form) as
    | string[]
    | undefined;

  const { countrySelect, currencySelect, docTypes, policyOptions, policies } =
    useEntityFormResources(tenantId);
  const acceptedCurrencySelect = filterSelectOptionsByIds(
    currencySelect,
    supportedCurrencyIdsWatched,
  );

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

  if (!tenantId) {
    return (
      <Create title={translate('pages.entities.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <>
      <EntityAdminRedirect />
      <Create title={translate('pages.entities.create')} saveButtonProps={saveButtonProps}>
        <Typography.Paragraph type="secondary">
          {translate('create.entity.idHint')}
        </Typography.Paragraph>
        <Form
          {...formProps}
          form={form}
          layout="vertical"
          initialValues={{
            id: tenantId,
            personType: 'physical_person',
            defaultPaymentTermDays: 30,
            addAdvertisement: false,
            taxManagementEnabled: false,
            documentEmissionMode: 'unofficial',
            paymentOptions: [
              { name: 'Principal', details: '-', currencyIds: [] as string[], isActive: true },
            ],
          }}
          onFinish={async (values: Record<string, unknown>) => {
            const fantasyRaw = values.fantasyName;
            const fantasyName =
              typeof fantasyRaw === 'string' && fantasyRaw.trim() !== ''
                ? fantasyRaw.trim()
                : null;

            const taxManagementEnabled = values.taxManagementEnabled === true;
            if (taxManagementEnabled && !values.countryId) {
              message.warning(translate('tax.pickCountryFirst'));
              throw new Error(translate('tax.pickCountryFirst'));
            }

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
                typeof row.name === 'string' && row.name.trim() !== ''
                  ? row.name.trim()
                  : 'Principal',
              details: normalizeRichTextField(row.details),
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
              baseCurrencyId: values.baseCurrencyId,
              personType: values.personType,
              documentTypeId: values.documentTypeId,
              documentNumber: values.documentNumber,
              defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
              defaultPaymentTermDays: values.defaultPaymentTermDays,
              availableOverduePolicyKeys: values.availableOverduePolicyKeys,
              supportedCurrencyIds: Array.isArray(values.supportedCurrencyIds)
                ? values.supportedCurrencyIds.filter(
                    (id) => id != null && String(id).trim() !== '',
                  )
                : [],
              addAdvertisement: values.addAdvertisement,
              fantasyName,
              taxManagementEnabled,
              documentEmissionMode: values.documentEmissionMode ?? 'unofficial',
              taxProfile: taxManagementEnabled
                ? (normalizeTaxProfile(values.taxProfile) ?? {})
                : null,
              paymentOptions,
            });
          }}
          onFinishFailed={(info) => {
            const names = info.errorFields?.map((f) => f.name).flat() ?? [];
            const joined = names.map(String).join(' ');
            let tab: EntityCreateTab = 'identity';
            if (
              joined.includes('address') ||
              joined.includes('email') ||
              joined.includes('phone') ||
              joined.includes('defaultCountry') ||
              joined.includes('defaultCurrency') ||
              joined.includes('baseCurrency') ||
              joined.includes('supportedCurrency') ||
              joined.includes('Overdue') ||
              joined.includes('PaymentTerm') ||
              joined.includes('addAdvertisement')
            ) {
              tab = 'general';
            } else if (joined.includes('tax') || joined.includes('taxProfile')) {
              tab = 'taxes';
            } else if (joined.includes('documentEmission')) {
              tab = 'documents';
            } else if (joined.includes('paymentOptions')) {
              tab = 'payment-options';
            }
            setSearchParams(tab === 'identity' ? {} : { tab }, { replace: true });
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) =>
              setSearchParams(key === 'identity' ? {} : { tab: key }, { replace: true })
            }
            aria-label={translate('pages.entities.tabsLabel')}
            items={[
              {
                key: 'identity',
                label: translate('pages.entities.tabs.identity'),
                children: (
                  <>
                    <Form.Item
                      label="Id (UUID)"
                      name="id"
                      rules={[
                        {
                          required: true,
                          message: translate('form.validation.requiredField'),
                        },
                      ]}
                    >
                      <Input autoComplete="off" />
                    </Form.Item>
                    <EntityIdentityFields
                      form={form}
                      countrySelect={countrySelect}
                      docTypes={docTypes}
                      sections={['nameCountry', 'personDocument', 'fantasyName']}
                    />
                  </>
                ),
              },
              {
                key: 'general',
                label: translate('pages.entities.tabs.general'),
                children: (
                  <>
                    <EntityGeneralSettingsFields
                      form={form}
                      countrySelect={countrySelect}
                      currencySelect={acceptedCurrencySelect}
                      allCurrencySelect={currencySelect}
                      showSupportedCurrencies
                      policyOptions={policyOptions}
                      tenantId={tenantId}
                    />
                    <EntityIdentityFields
                      form={form}
                      countrySelect={countrySelect}
                      docTypes={docTypes}
                      sections={['advertisement']}
                    />
                  </>
                ),
              },
              {
                key: 'taxes',
                label: translate('pages.entities.tabs.taxes'),
                children: <EntityTaxManagementFields form={form} tenantId={tenantId} />,
              },
              {
                key: 'documents',
                label: translate('pages.entities.tabs.documents'),
                children: (
                  <>
                    <EntityDocumentEmissionFields />
                    <EntityDocumentLogoFields entityId={null} />
                  </>
                ),
              },
              {
                key: 'payment-options',
                label: translate('pages.entities.tabs.paymentOptions'),
                children: (
                  <EntityPaymentOptionsFields
                    form={form}
                    currencySelect={acceptedCurrencySelect}
                    defaultCurrencyId={defaultCurrencyIdWatched}
                    canActivatePaymentOption={false}
                    canDeactivatePaymentOption={false}
                    paymentToggleLoading={false}
                    onPaymentToggleClick={() => undefined}
                  />
                ),
              },
            ]}
          />
        </Form>
      </Create>
    </>
  );
}
