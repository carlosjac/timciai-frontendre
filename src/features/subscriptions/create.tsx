import { Create, useForm } from '@refinedev/antd';
import { useOne, useTranslate } from '@refinedev/core';
import { Alert, Form } from 'antd';
import { useEffect } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import type { EntityRecord } from '../entities/entity-types.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { SubscriptionFormFields } from './SubscriptionFormFields.js';
import { emptySubscriptionLine, normalizeSubscriptionLines } from './subscriptionLineSchedule.js';

export function SubscriptionCreate() {
  const translate = useTranslate();
  const { dateFormat } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish, form } = useForm({ errorNotification: false, resource: 'subscriptions' });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors();
  const { result: entityRecord } = useOne<EntityRecord>({
    resource: 'entities',
    id: tenantId ?? '',
    queryOptions: { enabled: Boolean(tenantId) },
    errorNotification: false,
  });

  useEffect(() => {
    const policyId = entityRecord?.defaultMonetaryPolicyId?.trim();
    if (!form || !policyId) return;
    const current = form.getFieldValue('monetaryPolicyId');
    if (current != null && String(current).trim() !== '') return;
    form.setFieldValue('monetaryPolicyId', policyId);
  }, [entityRecord, form]);

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
          periodMode: 'advance',
          lines: [{ ...emptySubscriptionLine }],
        }}
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await onFinish({
              ...values,
              endsOn: values.endsOn || null,
              intervalMonths: Number(values.intervalMonths),
              lines: normalizeSubscriptionLines(values.lines),
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
