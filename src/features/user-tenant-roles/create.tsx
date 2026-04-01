import { Create, useForm, useSelect } from '@refinedev/antd';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { useCallback } from 'react';
import { Form, Select, Typography } from 'antd';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';

type UserRow = BaseRecord & { name?: string; email?: string };

function userSearchToFilters(value: string) {
  const t = value.trim();
  if (!t) return [];
  if (t.includes('@')) {
    return [{ field: 'email', operator: 'contains' as const, value: t }];
  }
  return [{ field: 'name', operator: 'contains' as const, value: t }];
}

export function UserTenantRoleCreate() {
  const translate = useTranslate();
  const { formProps, saveButtonProps, onFinish } = useForm({ resource: 'userTenantRoles' });

  const onUserSearch = useCallback((value: string) => userSearchToFilters(value), []);

  const { selectProps: userSelectRaw } = useSelect<UserRow>({
    resource: 'users',
    optionLabel: (u) => `${u.name ?? '—'} (${u.email ?? ''})`,
    optionValue: (u) => String(u.id ?? ''),
    pagination: { currentPage: 1, pageSize: 100 },
    sorters: [{ field: 'name', order: 'asc' }],
    onSearch: onUserSearch,
  });

  const { selectProps: tenantSelectRaw } = useSelect({
    resource: 'tenants',
    optionLabel: 'name',
    optionValue: 'id',
    filters: [{ field: 'isActive', operator: 'eq', value: true }],
    pagination: { currentPage: 1, pageSize: 500 },
  });
  const tenantSelect = stripSelectServerSearch(tenantSelectRaw);

  const { selectProps: roleSelectRaw } = useSelect({
    resource: 'roles',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
  });
  const roleSelect = stripSelectServerSearch(roleSelectRaw);

  return (
    <Create title={translate('pages.userTenantRoles.create')} saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          await onFinish({
            userId: values.userId,
            tenantId: values.tenantId,
            roleId: values.roleId,
          });
        }}
      >
        <Form.Item
          label={translate('table.userTenantRoles.userName')}
          name="userId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          extra={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {translate('create.userTenantRole.userSearchHint')}
            </Typography.Text>
          }
        >
          <Select {...userSelectRaw} allowClear placeholder={translate('create.userTenantRole.userPlaceholder')} />
        </Form.Item>
        <Form.Item
          label={translate('nav.tenants')}
          name="tenantId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select {...tenantSelect} showSearch optionFilterProp="label" allowClear />
        </Form.Item>
        <Form.Item
          label={translate('table.userTenantRoles.roleName')}
          name="roleId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select {...roleSelect} showSearch optionFilterProp="label" allowClear />
        </Form.Item>
      </Form>
    </Create>
  );
}
