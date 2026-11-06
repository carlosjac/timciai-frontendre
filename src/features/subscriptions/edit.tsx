import { Edit, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { SubscriptionFormFields } from './SubscriptionFormFields.js';
import type { SubscriptionRecord } from './types.js';

export function SubscriptionEdit() {
  const translate = useTranslate();
  const { dateFormat } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish, form, query, formLoading } = useForm({
    resource: 'subscriptions',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors();
  const record = query?.data?.data as SubscriptionRecord | undefined;
  const lockIdentity = (record?.generatedSales?.length ?? 0) > 0;

  if (!tenantId) {
    return (
      <Edit title={translate('pages.subscriptions.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  return (
    <Edit
      title={translate('pages.subscriptions.editTitle')}
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
    >
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          const payload: Record<string, unknown> = {
            intervalMonths: Number(values.intervalMonths),
            endsOn: values.endsOn || null,
            periodMode: values.periodMode,
            priceListId: values.priceListId,
            monetaryPolicyId: values.monetaryPolicyId,
            lines: values.lines,
          };
          if (!lockIdentity) {
            payload.customerId = values.customerId;
            payload.startsOn = values.startsOn;
          }
          try {
            await onFinish(payload);
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <SubscriptionFormFields
          form={form}
          tenantId={tenantId}
          pickerDateFormat={dateFormat}
          lockIdentity={lockIdentity}
        />
      </Form>
    </Edit>
  );
}
