import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input, Switch } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';

const CURRENCY_CREATE_FIELDS = ['code', 'name', 'isActive'] as const;

export function CurrencyCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish: submitRecord, form } = useForm({
    resource: 'currencies',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CURRENCY_CREATE_FIELDS,
  });

  if (!tenantId) {
    return (
      <Create title={translate('pages.currencies.create', 'Crear moneda')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.currencies.create', 'Crear moneda')} saveButtonProps={saveButtonProps}>
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await submitRecord({
              ...values,
              code: typeof values.code === 'string' ? values.code.trim() : values.code,
              name: typeof values.name === 'string' ? values.name.trim() : values.name,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <Form.Item
          label={translate('table.currencies.code')}
          name="code"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={3} />
        </Form.Item>
        <Form.Item
          label={translate('table.currencies.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item
          label={translate('table.currencies.active')}
          name="isActive"
          valuePropName="checked"
          initialValue
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
}
