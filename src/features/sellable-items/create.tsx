import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input, Select, Switch } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { SELLABLE_ITEM_KINDS } from './kindChoices.js';

const SELLABLE_FORM_FIELDS = ['kind', 'name', 'code', 'description', 'isActive'] as const;

export function SellableItemCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish: submitRecord, form } = useForm({
    resource: 'sellable_items',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: SELLABLE_FORM_FIELDS,
  });

  if (!tenantId) {
    return (
      <Create title={translate('pages.sellableItems.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.sellableItems.create')} saveButtonProps={saveButtonProps}>
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await submitRecord({
              ...values,
              entityId: tenantId,
              kind: values.kind === 'Service' ? 'Service' : 'Product',
              isActive: values.isActive !== false,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <Form.Item name="entityId" hidden initialValue={tenantId}>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          label={translate('table.sellableItems.kind')}
          name="kind"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          initialValue="Product"
        >
          <Select
            options={SELLABLE_ITEM_KINDS.map((k) => ({
              value: k.value,
              label: translate(k.titleKey),
            }))}
          />
        </Form.Item>
        <Form.Item
          label={translate('table.sellableItems.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={255} showCount />
        </Form.Item>
        <Form.Item label={translate('table.sellableItems.code')} name="code">
          <Input maxLength={64} showCount />
        </Form.Item>
        <Form.Item label={translate('table.sellableItems.description')} name="description">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label={translate('table.sellableItems.active')}
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
