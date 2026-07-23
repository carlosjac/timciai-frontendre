import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input, Switch } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';

export function PriceListCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish } = useForm({ resource: 'price_lists' });

  if (!tenantId) {
    return (
      <Create title={translate('pages.priceLists.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.priceLists.create')} saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          await onFinish({
            ...values,
            entityId: tenantId,
            isActive: values.isActive !== false,
          });
        }}
      >
        <Form.Item
          label={translate('table.priceLists.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={255} showCount />
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
