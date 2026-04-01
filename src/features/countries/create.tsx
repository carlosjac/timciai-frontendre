import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input, Switch } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';

export function CountryCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps } = useForm({ resource: 'countries' });

  if (!tenantId) {
    return (
      <Create title={translate('pages.countries.create', 'Crear país')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.countries.create', 'Crear país')} saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={translate('table.countries.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input />
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
