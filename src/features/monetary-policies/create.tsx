import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import {
  MonetaryPolicyParamsFields,
  normalizeMonetaryPolicyParams,
} from './MonetaryPolicyParamsFields.js';

const CREATE_KIND = 'relative_bands';
const CREATE_FIELDS = ['name', 'params'] as const;

export function MonetaryPolicyCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish, form } = useForm({
    resource: 'monetary_policies',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CREATE_FIELDS,
  });

  if (!tenantId) {
    return (
      <Create title={translate('pages.monetaryPolicies.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.monetaryPolicies.create')} saveButtonProps={saveButtonProps}>
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          params: {
            anchor: 'due_date',
            unit: 'days',
            bands: [
              {
                fromMode: 'number',
                fromValue: 0,
                toMode: 'open',
                toValue: null,
                effect: 'discount',
                chargeMode: 'flat_percent',
                ratePercent: 10,
              },
            ],
          },
        }}
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await onFinish({
              kind: CREATE_KIND,
              name: values.name,
              params: normalizeMonetaryPolicyParams(
                CREATE_KIND,
                values.params as Record<string, unknown> | undefined,
              ),
              entityId: tenantId,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <Form.Item
          label={translate('table.monetaryPolicies.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input.TextArea rows={4} maxLength={2000} showCount />
        </Form.Item>
        <MonetaryPolicyParamsFields kind={CREATE_KIND} />
      </Form>
    </Create>
  );
}
