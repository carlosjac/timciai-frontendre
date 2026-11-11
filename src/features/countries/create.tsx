import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input, Switch } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';

const COUNTRY_CREATE_FIELDS = ['name', 'isoCode', 'isActive'] as const;

export function CountryCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish: submitRecord, form } = useForm({
    errorNotification: false,
    resource: 'countries',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: COUNTRY_CREATE_FIELDS,
  });

  if (!tenantId) {
    return (
      <Create title={translate('pages.countries.create', 'Crear país')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.countries.create', 'Crear país')} saveButtonProps={saveButtonProps}>
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await submitRecord({
              ...values,
              name: typeof values.name === 'string' ? values.name.trim() : values.name,
              isoCode: typeof values.isoCode === 'string' ? values.isoCode.trim() : values.isoCode,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <Form.Item
          label={translate('table.countries.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item
          label={translate('table.countries.iso')}
          name="isoCode"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={8} />
        </Form.Item>
        <Form.Item
          label={translate('table.users.active')}
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
