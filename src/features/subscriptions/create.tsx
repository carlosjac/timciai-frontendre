import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form } from 'antd';
import dayjs from 'dayjs';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { SubscriptionFormFields } from './SubscriptionFormFields.js';

export function SubscriptionCreate() {
  const translate = useTranslate();
  const { dateFormat } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish, form } = useForm({ resource: 'subscriptions' });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors();

  if (!tenantId) {
    return (
      <Create title={translate('pages.subscriptions.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.subscriptions.create')} saveButtonProps={saveButtonProps}>
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          intervalMonths: 1,
          startsOn: dayjs().format('YYYY-MM-DD'),
          periodMode: 'advance',
          lines: [{ quantity: '1' }],
        }}
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await onFinish({
              ...values,
              endsOn: values.endsOn || null,
              intervalMonths: Number(values.intervalMonths),
            });
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
          lockIdentity={false}
        />
      </Form>
    </Create>
  );
}
