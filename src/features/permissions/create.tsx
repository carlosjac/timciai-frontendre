import { Create, useSelect } from '@refinedev/antd';
import {
  useCreate,
  useNavigation,
  useTranslate,
  type BaseRecord,
  type HttpError,
} from '@refinedev/core';
import { Form, Select, Typography } from 'antd';
import { useState } from 'react';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

function nameContains(value: string) {
  const term = value.trim();
  if (!term) return [];
  return [{ field: 'name', operator: 'contains' as const, value: term }];
}

type ActionRow = BaseRecord & { code?: string; name?: string };

const PERMISSION_CREATE_FORM_ID = 'timci-permission-create-form';

export function PermissionCreate() {
  const translate = useTranslate();
  const { list } = useNavigation();
  const notify = useTimciNotify();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const { mutateAsync: createPermission } = useCreate<
    BaseRecord,
    HttpError,
    { roleId: string; tenantId: string; actionId: string }
  >({
    resource: 'permissions',
    successNotification: false,
    errorNotification: false,
  });

  const { selectProps: roleSelect } = useSelect({
    resource: 'roles',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 20 },
    sorters: [{ field: 'name', order: 'asc' }],
    onSearch: nameContains,
  });

  const { selectProps: tenantSelect } = useSelect({
    resource: 'tenants',
    optionLabel: 'name',
    optionValue: 'id',
    filters: [{ field: 'isActive', operator: 'eq', value: true }],
    pagination: { currentPage: 1, pageSize: 20 },
    sorters: [{ field: 'name', order: 'asc' }],
    onSearch: nameContains,
  });

  const { selectProps: actionSelect } = useSelect<ActionRow>({
    resource: 'actions',
    optionLabel: (a) => {
      const code = a.code != null && String(a.code) !== '' ? String(a.code) : '';
      const name = a.name ?? '';
      return code !== '' ? `${code} — ${name}` : name;
    },
    optionValue: (a) => String(a.id ?? ''),
    pagination: { currentPage: 1, pageSize: 20 },
    sorters: [{ field: 'name', order: 'asc' }],
    onSearch: nameContains,
  });

  const handleFinish = async (values: Record<string, unknown>) => {
    const roleId = String(values.roleId ?? '');
    const tenantId = String(values.tenantId ?? '');
    const actionIds = values.actionIds as string[] | undefined;
    if (!Array.isArray(actionIds) || actionIds.length === 0) return;

    setSubmitting(true);
    try {
      for (const actionId of actionIds) {
        await createPermission({
          values: { roleId, tenantId, actionId },
        });
      }
      notify.success(
        translate('create.permission.bulkSuccess', { count: String(actionIds.length) }),
      );
      list('permissions');
    } catch (err) {
      const http = err as HttpError;
      notify.error(
        typeof http?.message === 'string' && http.message !== ''
          ? http.message
          : translate('notifications.error'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Create
      title={translate('pages.permissions.create')}
      isLoading={submitting}
      saveButtonProps={{
        loading: submitting,
        htmlType: 'submit',
        form: PERMISSION_CREATE_FORM_ID,
      }}
    >
      <Form
        id={PERMISSION_CREATE_FORM_ID}
        form={form}
        layout="vertical"
        onFinish={(v) => void handleFinish(v as Record<string, unknown>)}
      >
        <Form.Item
          label={translate('table.permissions.roleName')}
          name="roleId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select {...roleSelect} allowClear />
        </Form.Item>
        <Form.Item
          label={translate('nav.tenants')}
          name="tenantId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select {...tenantSelect} allowClear />
        </Form.Item>
        <Form.Item
          label={translate('create.permission.actionsLabel')}
          name="actionIds"
          rules={[
            { required: true, message: translate('form.validation.requiredField') },
            {
              type: 'array',
              min: 1,
              message: translate('create.permission.actionsMinOne'),
            },
          ]}
          extra={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {translate('create.permission.actionsHint')}
            </Typography.Text>
          }
        >
          <Select
            {...actionSelect}
            mode="multiple"
            allowClear
            maxTagCount="responsive"
          />
        </Form.Item>
      </Form>
    </Create>
  );
}
