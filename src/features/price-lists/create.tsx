import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input, Switch } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';

const PRICE_LIST_FORM_FIELDS = ['name', 'isActive'] as const;

export function PriceListCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish: submitRecord, form } = useForm({
    resource: 'price_lists',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: PRICE_LIST_FORM_FIELDS,
  });

  if (!tenantId) {
    return (
      <Create title={translate('pages.priceLists.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.priceLists.create')} saveButtonProps={saveButtonProps}>
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
          label={translate('table.priceLists.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={255} showCount />
        </Form.Item>
        <Form.Item
          label={translate('table.priceLists.active')}
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
