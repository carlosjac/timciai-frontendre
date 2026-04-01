import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Form, Input, Switch } from 'antd';

export function ActionCreate() {
  const translate = useTranslate();
  const { formProps, saveButtonProps, onFinish } = useForm({ resource: 'actions' });

  return (
    <Create title={translate('pages.actions.create', 'Crear acción')} saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          await onFinish({
            ...values,
            code: String(values.code ?? '').trim(),
          });
        }}
      >
        <Form.Item
          label={translate('table.actions.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={translate('create.actionCode')}
          name="code"
          rules={[
            { required: true, message: translate('form.validation.requiredField') },
            {
              validator: async (_, value) => {
                if (value != null && String(value).trim() === '') {
                  throw new Error(translate('form.validation.requiredField'));
                }
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={translate('create.actionGlobal')}
          name="isGlobal"
          valuePropName="checked"
          initialValue={false}
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
}
