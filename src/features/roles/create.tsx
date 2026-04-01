import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Form, Input } from 'antd';

export function RoleCreate() {
  const translate = useTranslate();
  const { formProps, saveButtonProps } = useForm({ resource: 'roles' });

  return (
    <Create title={translate('pages.roles.create', 'Crear rol')} saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={translate('table.roles.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
}
