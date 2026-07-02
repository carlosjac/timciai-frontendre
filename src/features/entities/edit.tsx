import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, App, Form, Typography } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { canFullyEditEntity } from '../../shared/timci/actionCodes.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { EntityAdminRedirect } from './EntityAdminRedirect.js';
import { EntityGeneralSettingsFields } from './EntityGeneralSettingsFields.js';
import { EntityIdentityFields } from './EntityIdentityFields.js';
import { EntityPaymentOptionsFields } from './EntityPaymentOptionsFields.js';
import { mapPaymentOptionsForSubmit } from './entity-payment-options-utils.js';
import {
  ENTITY_EDIT_FIELD_NAMES,
  type EntityRecord,
  type PaymentOptionRow,
} from './entity-types.js';
import { useEntityFormResources } from './useEntityFormResources.js';
import { useEntityPaymentOptionToggle } from './useEntityPaymentOptionToggle.js';

export function EntityEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canFullEditEntity = canFullyEditEntity(codes);
  const canActivatePaymentOption =
    codes.includes('entities.activate') || codes.includes('entities.update');
  const canDeactivatePaymentOption =
    codes.includes('entities.deactivate') || codes.includes('entities.update');

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'entities',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: ENTITY_EDIT_FIELD_NAMES,
  });

  const record = query?.data?.data as EntityRecord | undefined;
  const defaultCurrencyIdWatched = Form.useWatch('defaultCurrencyId', form);

  const {
    countrySelect,
    currencySelect,
    docTypes,
    policyOptions,
  } = useEntityFormResources(tenantId);

  const { paymentToggleLoading, openPaymentToggle, paymentToggleModal } =
    useEntityPaymentOptionToggle({
      tenantId,
      entityId: record?.id,
      onRefetch: () => query?.refetch?.(),
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

  return (
    <>
      <EntityAdminRedirect />
      <Edit
        title={translate('pages.entities.editTitle')}
        isLoading={formLoading}
        saveButtonProps={saveButtonProps}
        footerButtons={({ saveButtonProps: refineSaveProps }) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexWrap: 'wrap',
              width: '100%',
              columnGap: 24,
              rowGap: 12,
            }}
          >
            <SaveButton {...refineSaveProps} />
          </div>
        )}
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
          layout="vertical"
          onFinish={async (values: Record<string, unknown>) => {
            clearServerErrors(form);

            const paymentOptions = mapPaymentOptionsForSubmit(
              values.paymentOptions as PaymentOptionRow[] | undefined,
            );

            if (canFullEditEntity) {
              const fantasyRaw = values.fantasyName;
              const fantasyName =
                typeof fantasyRaw === 'string' && fantasyRaw.trim() !== ''
                  ? fantasyRaw.trim()
                  : null;

              try {
                await submitRecord({
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
              } catch (e) {
                applyServerError(form, e);
                throw e;
              }

              return;
            }

            try {
              await submitRecord({
                address: values.address,
                email: values.email,
                phone: values.phone,
                defaultCountryId: values.defaultCountryId,
                defaultCurrencyId: values.defaultCurrencyId,
                defaultOverdueNotificationPolicyKey: values.defaultOverdueNotificationPolicyKey,
                defaultPaymentTermDays: values.defaultPaymentTermDays,
                availableOverduePolicyKeys: values.availableOverduePolicyKeys,
                paymentOptions,
              });
            } catch (e) {
              applyServerError(form, e);
              throw e;
            }
          }}
        >
          <EntityIdentityFields
            form={form}
            countrySelect={countrySelect}
            docTypes={docTypes}
            disabled={!canFullEditEntity}
            sections={['nameCountry']}
          />
          <EntityGeneralSettingsFields
            form={form}
            countrySelect={countrySelect}
            currencySelect={currencySelect}
            policyOptions={policyOptions}
            sections={['contact']}
          />
          <EntityIdentityFields
            form={form}
            countrySelect={countrySelect}
            docTypes={docTypes}
            disabled={!canFullEditEntity}
            sections={['personDocument']}
          />
          <EntityGeneralSettingsFields
            form={form}
            countrySelect={countrySelect}
            currencySelect={currencySelect}
            policyOptions={policyOptions}
            sections={['policies']}
          />
          {canFullEditEntity ? (
            <EntityIdentityFields
              form={form}
              countrySelect={countrySelect}
              docTypes={docTypes}
              sections={['advertisement']}
            />
          ) : null}
          <EntityPaymentOptionsFields
            form={form}
            currencySelect={currencySelect}
            defaultCurrencyId={defaultCurrencyIdWatched}
            canActivatePaymentOption={canActivatePaymentOption}
            canDeactivatePaymentOption={canDeactivatePaymentOption}
            paymentToggleLoading={paymentToggleLoading}
            onPaymentToggleClick={openPaymentToggle}
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
