import { List, useForm } from '@refinedev/antd';
import { useGetIdentity, usePermissions, useTranslate } from '@refinedev/core';
import { Alert, Button, Card, Form, Spin, Tabs } from 'antd';
import { Navigate, useSearchParams } from 'react-router';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  canFullyEditEntity,
  canSeeEntitySettingsMenuItem,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { EntityGeneralSettingsFields } from './EntityGeneralSettingsFields.js';
import { PromoteToProductionButton } from './PromoteToProductionButton.js';
import { EntityPaymentOptionsFields } from './EntityPaymentOptionsFields.js';
import { mapPaymentOptionsForSubmit } from './entity-payment-options-utils.js';
import {
  ENTITY_EDIT_FIELD_NAMES,
  ENTITY_GENERAL_SETTINGS_FIELD_NAMES,
  type EntityRecord,
  type PaymentOptionRow,
} from './entity-types.js';
import { useEntityFormResources } from './useEntityFormResources.js';
import { useEntityPaymentOptionToggle } from './useEntityPaymentOptionToggle.js';
import { filterSelectOptionsByIds } from '../../shared/timci/useEntitySupportedCurrencySelect.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';
import { markEntitySettingsReviewed } from '../../shared/timci/setupProgress.js';

const GENERAL_FIELD_NAMES = [
  ...ENTITY_GENERAL_SETTINGS_FIELD_NAMES,
  'supportedCurrencyIds',
] as string[];
const PAYMENT_FIELD_NAMES = ['paymentOptions'];

export function EntitySettingsPage() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const identity = useGetIdentity<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const { data: permData, isLoading, isFetching } = usePermissions<TimciPermissionsData>({});
  const permissionsWaiting = isLoading || (isFetching && permData == null);
  const codes = permData?.actionCodes ?? [];
  const canActivatePaymentOption =
    codes.includes('entities.activate') || codes.includes('entities.update');
  const canDeactivatePaymentOption =
    codes.includes('entities.deactivate') || codes.includes('entities.update');

  const activeTab =
    searchParams.get('tab') === 'payment-options' ? 'payment-options' : 'general';

  const { formProps, form, onFinish: submitRecord, query, formLoading } = useForm({
    errorNotification: false,
    resource: 'entities',
    action: 'edit',
    id: tenantId ?? undefined,
    redirect: false,
    queryOptions: { enabled: !!tenantId },
  });

  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: ENTITY_EDIT_FIELD_NAMES,
  });

  const record = query?.data?.data as EntityRecord | undefined;
  const defaultCurrencyIdWatched = Form.useWatch('defaultCurrencyId', form);
  const supportedCurrencyIdsWatched = Form.useWatch('supportedCurrencyIds', form) as
    | string[]
    | undefined;

  const { countrySelect, currencySelect, policyOptions } = useEntityFormResources(tenantId);
  const acceptedCurrencySelect = filterSelectOptionsByIds(
    currencySelect,
    supportedCurrencyIdsWatched ?? record?.supportedCurrencyIds,
  );

  const { paymentToggleLoading, openPaymentToggle, paymentToggleModal } =
    useEntityPaymentOptionToggle({
      tenantId,
      entityId: record?.id ?? tenantId ?? undefined,
      onRefetch: async () => {
        const result = await query?.refetch?.();
        const data = result?.data?.data as EntityRecord | undefined;
        if (data?.paymentOptions != null) {
          form.setFieldsValue({ paymentOptions: data.paymentOptions });
        }
      },
    });

  if (permissionsWaiting) {
    return (
      <List title={translate('pages.entitySettings.title')}>
        <div
          role="status"
          aria-label={translate('app.loadingPage')}
          style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}
        >
          <Spin size="large" />
        </div>
      </List>
    );
  }

  if (canFullyEditEntity(codes)) {
    return <Navigate to="/entities" replace />;
  }

  if (!canSeeEntitySettingsMenuItem(codes)) {
    return <Navigate to="/preferences" replace />;
  }

  if (!tenantId) {
    return (
      <List title={translate('pages.entitySettings.title')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </List>
    );
  }

  const saveGeneral = async () => {
    clearServerErrors(form);
    try {
      const generalFields =
        record?.operatingMode === 'test'
          ? GENERAL_FIELD_NAMES
          : GENERAL_FIELD_NAMES.filter((name) => name !== 'testNotificationEmail');
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
        supportedCurrencyIds: string[];
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
        supportedCurrencyIds: Array.isArray(values.supportedCurrencyIds)
          ? values.supportedCurrencyIds.filter((id) => id != null && String(id).trim() !== '')
          : [],
      });
      notify.success(translate('pages.entitySettings.savedGeneral'));
      if (identity.data?.id && tenantId) markEntitySettingsReviewed(identity.data.id, tenantId);
    } catch (e) {
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
      notify.success(translate('pages.entitySettings.savedPaymentOptions'));
      if (identity.data?.id && tenantId) markEntitySettingsReviewed(identity.data.id, tenantId);
    } catch (e) {
      applyServerError(form, e);
    }
  };

  return (
    <List title={translate('pages.entitySettings.title')}>
      <Card style={{ maxWidth: 960, width: '100%' }} loading={formLoading}>
        <Form
          {...formProps}
          form={form}
          layout="vertical"
          onValuesChange={() => clearServerErrors(form)}
        >
          <TimciFormServerAlert messages={generalMessages} />
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setSearchParams(key === 'general' ? {} : { tab: key })}
            aria-label={translate('pages.entitySettings.tabsLabel')}
            items={[
              {
                key: 'general',
                label: translate('pages.entitySettings.tabs.general'),
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
                      entityId={tenantId}
                      showTestNotificationEmail={record?.operatingMode === 'test'}
                    />
                    {record?.operatingMode === 'test' &&
                    codes.includes('entities.promoteToProduction') &&
                    record.id &&
                    tenantId ? (
                      <div style={{ marginBottom: 16 }}>
                        <PromoteToProductionButton
                          tenantId={tenantId}
                          entityId={record.id}
                          entityName={record.name ?? ''}
                          onPromoted={() => {
                            void query?.refetch?.();
                          }}
                        />
                      </div>
                    ) : null}
                    <Button type="primary" htmlType="button" onClick={() => void saveGeneral()}>
                      {translate('pages.entitySettings.saveGeneral')}
                    </Button>
                  </>
                ),
              },
              {
                key: 'payment-options',
                label: translate('pages.entitySettings.tabs.paymentOptions'),
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
                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => void savePaymentOptions()}
                    >
                      {translate('pages.entitySettings.savePaymentOptions')}
                    </Button>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Card>
      {paymentToggleModal}
    </List>
  );
}
