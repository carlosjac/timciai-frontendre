import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Form, Input } from 'antd';

export function TenantCreate() {
  const translate = useTranslate();
  const { formProps, saveButtonProps } = useForm({ resource: 'tenants' });

  return (
    <Create title={translate('pages.tenants.create', 'Crear inquilino')} saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={translate('table.tenants.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
}
