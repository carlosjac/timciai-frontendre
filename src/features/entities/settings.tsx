import { List, useForm } from '@refinedev/antd';
import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, App, Button, Card, Form, Spin, Tabs } from 'antd';
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

const GENERAL_FIELD_NAMES = [...ENTITY_GENERAL_SETTINGS_FIELD_NAMES] as string[];
const PAYMENT_FIELD_NAMES = ['paymentOptions'];

export function EntitySettingsPage() {
  const translate = useTranslate();
  const { message } = App.useApp();
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

  const { countrySelect, currencySelect, policyOptions } = useEntityFormResources(tenantId);

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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}>
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
      const values = (await form.validateFields(GENERAL_FIELD_NAMES)) as {
        address: string;
        email: string;
        phone: string;
        defaultCountryId: string;
        defaultCurrencyId: string;
        defaultOverdueNotificationPolicyKey: string;
        defaultPaymentTermDays: number;
        availableOverduePolicyKeys: string[];
      };
      await submitRecord({
        address: values.address,
        email: values.email,
        phone: values.phone,
        defaultCountryId: values.defaultCountryId,
        defaultCurrencyId: values.defaultCurrencyId,
        defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
        defaultPaymentTermDays: values.defaultPaymentTermDays,
        availableOverduePolicyKeys: values.availableOverduePolicyKeys,
      });
      message.success(translate('pages.entitySettings.savedGeneral'));
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
      message.success(translate('pages.entitySettings.savedPaymentOptions'));
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
                      currencySelect={currencySelect}
                      policyOptions={policyOptions}
                    />
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
                      currencySelect={currencySelect}
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
