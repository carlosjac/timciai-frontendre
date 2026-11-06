import { Edit, useForm } from '@refinedev/antd';
import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, App, Button, Form, Input, Tabs, Typography } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { canFullyEditEntity } from '../../shared/timci/actionCodes.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import {
  filterAttributeDefsForRole,
  normalizeTaxProfile,
  taxProfileFormNamePaths,
} from '../../shared/timci/taxesApi.js';
import { useCountryIsoCodeMap } from '../../shared/timci/tax/useCountryIsoCodeMap.js';
import { useTaxProfileSchema } from '../../shared/timci/tax/useTaxProfileSchema.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { EntityAdminRedirect } from './EntityAdminRedirect.js';
import { EntityGeneralSettingsFields } from './EntityGeneralSettingsFields.js';
import { EntityIdentityFields } from './EntityIdentityFields.js';
import { EntityPaymentOptionsFields } from './EntityPaymentOptionsFields.js';
import { EntityTaxManagementFields } from './EntityTaxManagementFields.js';
import { EntityDocumentEmissionFields } from './EntityDocumentEmissionFields.js';
import { EntityDocumentLogoFields } from './EntityDocumentLogoFields.js';
import { mapPaymentOptionsForSubmit } from './entity-payment-options-utils.js';
import {
  ENTITY_ADVERTISEMENT_FIELD_NAMES,
  ENTITY_DOCUMENTS_FIELD_NAMES,
  ENTITY_EDIT_FIELD_NAMES,
  ENTITY_GENERAL_SETTINGS_FIELD_NAMES,
  ENTITY_IDENTITY_FIELD_NAMES,
  type EntityRecord,
  type PaymentOptionRow,
} from './entity-types.js';
import { useEntityFormResources } from './useEntityFormResources.js';
import { useEntityPaymentOptionToggle } from './useEntityPaymentOptionToggle.js';
import { filterSelectOptionsByIds } from '../../shared/timci/useEntitySupportedCurrencySelect.js';

const IDENTITY_FIELD_NAMES = [...ENTITY_IDENTITY_FIELD_NAMES] as string[];
const PAYMENT_FIELD_NAMES = ['paymentOptions'];

type EntityEditTab = 'identity' | 'general' | 'taxes' | 'documents' | 'payment-options';

function resolveActiveTab(raw: string | null, canFullEdit: boolean): EntityEditTab {
  if (raw === 'payment-options') return 'payment-options';
  if (raw === 'documents' && canFullEdit) return 'documents';
  if (raw === 'taxes' && canFullEdit) return 'taxes';
  if (raw === 'identity' && canFullEdit) return 'identity';
  if (raw === 'general') return 'general';
  return canFullEdit ? 'identity' : 'general';
}

export function EntityEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canFullEditEntity = canFullyEditEntity(codes);
  const canActivatePaymentOption =
    codes.includes('entities.activate') || codes.includes('entities.update');
  const canDeactivatePaymentOption =
    codes.includes('entities.deactivate') || codes.includes('entities.update');

  const activeTab = resolveActiveTab(searchParams.get('tab'), canFullEditEntity);

  const { formProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'entities',
    action: 'edit',
    redirect: false,
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: ENTITY_EDIT_FIELD_NAMES,
  });

  const record = query?.data?.data as EntityRecord | undefined;
  const defaultCurrencyIdWatched = Form.useWatch('defaultCurrencyId', form);
  const supportedCurrencyIdsWatched = Form.useWatch('supportedCurrencyIds', form) as
    | string[]
    | undefined;
  const countryIdWatched = Form.useWatch('countryId', form) as string | undefined;
  const taxManagementEnabledWatched = Form.useWatch('taxManagementEnabled', form) as
    | boolean
    | undefined;

  const { countrySelect, currencySelect, docTypes, policyOptions } =
    useEntityFormResources(tenantId);
  const acceptedCurrencySelect = filterSelectOptionsByIds(
    currencySelect,
    supportedCurrencyIdsWatched ?? record?.supportedCurrencyIds,
  );

  const { resolveIsoCode } = useCountryIsoCodeMap(tenantId);
  const countryCodeForTaxes = resolveIsoCode(countryIdWatched);
  const { schema: taxProfileSchema, loading: taxProfileSchemaLoading } = useTaxProfileSchema(
    taxManagementEnabledWatched === true ? tenantId : null,
    taxManagementEnabledWatched === true ? countryCodeForTaxes : null,
  );

  const { paymentToggleLoading, openPaymentToggle, paymentToggleModal } =
    useEntityPaymentOptionToggle({
      tenantId,
      entityId: record?.id,
      onRefetch: async () => {
        const result = await query?.refetch?.();
        const data = result?.data?.data as EntityRecord | undefined;
        if (data?.paymentOptions != null) {
          form.setFieldsValue({ paymentOptions: data.paymentOptions });
        }
      },
    });

  useEffect(() => {
    if (formLoading || record === undefined) return;
    if (record.isActive === false) {
      const entityId = record.id ?? routeId;
      if (entityId) {
        message.warning(translate('pages.entities.inactiveCannotEdit'));
        navigate(`/entities/show/${encodeURIComponent(String(entityId))}`, { replace: true });
      }
    }
  }, [formLoading, message, navigate, record, routeId, translate]);

  if (!tenantId) {
    return (
      <Edit title={translate('pages.entities.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  if (!formLoading && record?.isActive === false) {
    return <Edit title={translate('pages.entities.editTitle')} isLoading />;
  }

  const saveIdentity = async () => {
    clearServerErrors(form);
    try {
      const values = (await form.validateFields(IDENTITY_FIELD_NAMES)) as {
        name: string;
        countryId: string;
        personType: string;
        documentTypeId: string;
        documentNumber: string;
        fantasyName?: string | null;
      };
      const fantasyRaw = values.fantasyName;
      const fantasyName =
        typeof fantasyRaw === 'string' && fantasyRaw.trim() !== '' ? fantasyRaw.trim() : null;

      await submitRecord({
        name: values.name,
        countryId: values.countryId,
        personType: values.personType,
        documentTypeId: values.documentTypeId,
        documentNumber: values.documentNumber,
        fantasyName,
      });
      message.success(translate('pages.entities.savedIdentity'));
    } catch (e) {
      applyServerError(form, e);
    }
  };

  const saveGeneral = async () => {
    clearServerErrors(form);
    try {
      const fieldNames = canFullEditEntity
        ? ([
            ...ENTITY_GENERAL_SETTINGS_FIELD_NAMES,
            ...ENTITY_ADVERTISEMENT_FIELD_NAMES,
            'supportedCurrencyIds',
          ] as string[])
        : ([...ENTITY_GENERAL_SETTINGS_FIELD_NAMES] as string[]);
      const generalFields =
        record?.operatingMode === 'test' ? fieldNames : fieldNames.filter((name) => name !== 'testNotificationEmail');
      const values = (await form.validateFields(generalFields)) as {
        address: string;
        email: string;
        testNotificationEmail?: string;
        phone: string;
        defaultCountryId: string;
        defaultCurrencyId: string;
        baseCurrencyId: string;
        defaultOverdueNotificationPolicyKey: string;
        defaultPaymentTermDays: number;
        defaultMonetaryPolicyId: string;
        availableOverduePolicyKeys: string[];
        supportedCurrencyIds?: string[];
        addAdvertisement?: boolean;
      };

      await submitRecord({
        address: values.address,
        email: values.email,
        ...(record?.operatingMode === 'test'
          ? {
              testNotificationEmail:
                typeof values.testNotificationEmail === 'string' &&
                values.testNotificationEmail.trim() !== ''
                  ? values.testNotificationEmail.trim()
                  : null,
            }
          : {}),
        phone: values.phone,
        defaultCountryId: values.defaultCountryId,
        defaultCurrencyId: values.defaultCurrencyId,
        baseCurrencyId: values.baseCurrencyId,
        defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
        defaultPaymentTermDays: values.defaultPaymentTermDays,
        defaultMonetaryPolicyId: values.defaultMonetaryPolicyId,
        availableOverduePolicyKeys: values.availableOverduePolicyKeys,
        ...(canFullEditEntity
          ? {
              addAdvertisement: values.addAdvertisement === true,
              supportedCurrencyIds: Array.isArray(values.supportedCurrencyIds)
                ? values.supportedCurrencyIds.filter(
                    (id) => id != null && String(id).trim() !== '',
                  )
                : [],
            }
          : {}),
      });
      message.success(translate('pages.entities.savedGeneral'));
    } catch (e) {
      applyServerError(form, e);
    }
  };

  const saveTaxes = async () => {
    clearServerErrors(form);
    try {
      const taxManagementEnabled = form.getFieldValue('taxManagementEnabled') === true;
      if (!taxManagementEnabled) {
        return;
      }

      const countryId = form.getFieldValue('countryId') as string | undefined;
      if (!countryId) {
        message.warning(translate('tax.pickCountryFirst'));
        return;
      }
      const countryCode = resolveIsoCode(countryId);
      if (!countryCode) {
        message.warning(translate('tax.countryIsoMissing'));
        return;
      }
      if (taxProfileSchemaLoading) {
        return;
      }

      const roleDefs = filterAttributeDefsForRole(taxProfileSchema?.attributeDefs, 'issuer');
      const missingRequired = roleDefs.filter((def) => {
        if (!def.required) return false;
        const value = form.getFieldValue(['taxProfile', def.attributeKey]);
        return value == null || String(value).trim() === '';
      });
      if (missingRequired.length > 0) {
        form.setFields(
          missingRequired.map((def) => ({
            name: ['taxProfile', def.attributeKey],
            errors: [translate('form.validation.requiredField')],
          })),
        );
        return;
      }

      const profilePaths = taxProfileFormNamePaths(taxProfileSchema, 'issuer');
      await form.validateFields(profilePaths);

      const taxProfile = form.getFieldValue('taxProfile') as
        | Record<string, string>
        | null
        | undefined;

      await submitRecord({
        taxProfile: normalizeTaxProfile(taxProfile) ?? {},
      });
      message.success(translate('pages.entities.savedTaxes'));
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      applyServerError(form, e);
    }
  };

  const saveDocuments = async () => {
    clearServerErrors(form);
    try {
      await form.validateFields([...ENTITY_DOCUMENTS_FIELD_NAMES]);
      await submitRecord({
        documentEmissionMode: form.getFieldValue('documentEmissionMode') ?? 'unofficial',
      });
      message.success(translate('pages.entities.savedDocuments'));
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      applyServerError(form, e);
    }
  };

  const savePaymentOptions = async () => {
    clearServerErrors(form);
    try {
      await form.validateFields(PAYMENT_FIELD_NAMES);
      const paymentOptions = mapPaymentOptionsForSubmit(
        form.getFieldValue('paymentOptions') as PaymentOptionRow[] | undefined,
      );
      await submitRecord({ paymentOptions });
      message.success(translate('pages.entities.savedPaymentOptions'));
    } catch (e) {
      applyServerError(form, e);
    }
  };

  const tabItems = [
    ...(canFullEditEntity
      ? [
          {
            key: 'identity',
            label: translate('pages.entities.tabs.identity'),
            children: (
              <>
                <EntityIdentityFields
                  form={form}
                  countrySelect={countrySelect}
                  docTypes={docTypes}
                  sections={['nameCountry', 'personDocument', 'fantasyName']}
                />
                <Button type="primary" htmlType="button" onClick={() => void saveIdentity()}>
                  {translate('pages.entities.saveIdentity')}
                </Button>
              </>
            ),
          },
        ]
      : []),
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
            showSupportedCurrencies={canFullEditEntity}
            policyOptions={policyOptions}
            tenantId={tenantId}
            entityId={record?.id ?? tenantId}
            showTestNotificationEmail={record?.operatingMode === 'test'}
          />
          {canFullEditEntity ? (
            <EntityIdentityFields
              form={form}
              countrySelect={countrySelect}
              docTypes={docTypes}
              sections={['advertisement']}
            />
          ) : null}
          <Button type="primary" htmlType="button" onClick={() => void saveGeneral()}>
            {translate('pages.entities.saveGeneral')}
          </Button>
        </>
      ),
    },
    ...(canFullEditEntity
      ? [
          {
            key: 'taxes',
            label: translate('pages.entities.tabs.taxes'),
            children: (
              <>
                <EntityTaxManagementFields
                  form={form}
                  tenantId={tenantId}
                  lockTaxManagementEnabled
                />
                {taxManagementEnabledWatched === true ? (
                  <Button type="primary" htmlType="button" onClick={() => void saveTaxes()}>
                    {translate('pages.entities.saveTaxes')}
                  </Button>
                ) : null}
              </>
            ),
          },
          {
            key: 'documents',
            label: translate('pages.entities.tabs.documents'),
            children: (
              <>
                <EntityDocumentEmissionFields />
                <Button type="primary" htmlType="button" onClick={() => void saveDocuments()}>
                  {translate('pages.entities.saveDocuments')}
                </Button>
                <EntityDocumentLogoFields entityId={record?.id ?? tenantId} />
              </>
            ),
          },
        ]
      : []),
    {
      key: 'payment-options',
      label: translate('pages.entities.tabs.paymentOptions'),
      children: (
        <>
          <EntityPaymentOptionsFields
            form={form}
            currencySelect={acceptedCurrencySelect}
            defaultCurrencyId={defaultCurrencyIdWatched}
            canActivatePaymentOption={canActivatePaymentOption}
            canDeactivatePaymentOption={canDeactivatePaymentOption}
            paymentToggleLoading={paymentToggleLoading}
            onPaymentToggleClick={openPaymentToggle}
          />
          <Button type="primary" htmlType="button" onClick={() => void savePaymentOptions()}>
            {translate('pages.entities.savePaymentOptions')}
          </Button>
        </>
      ),
    },
  ];

  const defaultTab: EntityEditTab = canFullEditEntity ? 'identity' : 'general';

  return (
    <>
      <EntityAdminRedirect />
      <Edit
        title={translate('pages.entities.editTitle')}
        isLoading={formLoading}
        footerButtons={() => null}
      >
        <TimciFormServerAlert messages={generalMessages} />
        <TimciFormInactiveRecordBanner isActive={record?.isActive} />
        {record?.id && (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Id: {record.id}
          </Typography.Paragraph>
        )}
        <Form
          {...formProps}
          form={form}
          layout="vertical"
          onValuesChange={() => clearServerErrors(form)}
        >
          <Form.Item label={translate('pages.entities.operatingMode')}>
            <Input
              value={
                record?.operatingMode === 'test'
                  ? translate('pages.entities.operatingModeTest')
                  : translate('pages.entities.operatingModeProduction')
              }
              readOnly
            />
          </Form.Item>
          <Tabs
            activeKey={activeTab}
            onChange={(key) =>
              setSearchParams(key === defaultTab ? {} : { tab: key }, { replace: true })
            }
            aria-label={translate('pages.entities.tabsLabel')}
            items={tabItems}
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
      </Edit>
      {paymentToggleModal}
    </>
  );
}
