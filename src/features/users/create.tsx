import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { useMemo } from 'react';
import { Alert, Form, Input, Radio, Select, Switch, Typography } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  getTimeZoneSelectOptions,
  timeZoneOptionMatchesQuery,
} from '../preferences/timeZones.js';
import {
  ALLOWED_DATE_FORMATS,
  DEFAULT_DATE_FORMAT,
  defaultUserPreferences,
} from '../preferences/storage.js';

const DATE_FORMAT_LABEL_KEYS: Record<(typeof ALLOWED_DATE_FORMATS)[number], string> = {
  'DD/MM/YYYY': 'pages.preferences.dateFormats.ddmmyyyy',
  'YYYY-MM-DD': 'pages.preferences.dateFormats.yyyymmdd',
  'MM/DD/YYYY': 'pages.preferences.dateFormats.mmddyyyy',
};

export function UserCreate() {
  const translate = useTranslate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { formProps, saveButtonProps, onFinish } = useForm({ resource: 'users' });

  const prefsDefaults = useMemo(() => defaultUserPreferences(), []);
  const tzOptions = useMemo(() => getTimeZoneSelectOptions(), []);
  const dateFormatOptions = useMemo(
    () =>
      ALLOWED_DATE_FORMATS.map((value) => ({
        value,
        label: translate(DATE_FORMAT_LABEL_KEYS[value], undefined, value),
      })),
    [translate],
  );

  if (!tenantId) {
    return (
      <Create title={translate('pages.users.create', 'Crear usuario')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.users.create', 'Crear usuario')} saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          isActive: true,
          timeZone: prefsDefaults.timeZone,
          dateFormat: prefsDefaults.dateFormat,
          theme: prefsDefaults.theme,
          ...formProps.initialValues,
        }}
        onFinish={async (values: Record<string, unknown>) => {
          await onFinish({
            ...values,
            tenantId,
            timeZone: typeof values.timeZone === 'string' ? values.timeZone.trim() : '',
            theme: values.theme === 'dark' ? 'dark' : 'light',
            dateFormat:
              typeof values.dateFormat === 'string' && values.dateFormat.trim() !== ''
                ? values.dateFormat.trim()
                : DEFAULT_DATE_FORMAT,
          });
        }}
      >
        <Form.Item
          label={translate('pages.login.fields.email')}
          name="email"
          rules={[
            { required: true, message: translate('form.validation.requiredField') },
            { type: 'email', message: translate('pages.login.errors.validEmail') },
          ]}
        >
          <Input type="email" autoComplete="off" />
        </Form.Item>
        <Form.Item
          label={translate('table.users.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item
          label={translate('pages.login.fields.password')}
          name="password"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          extra={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {translate('pages.changePassword.policyHint')}
            </Typography.Text>
          }
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="timeZone"
          label={translate('pages.preferences.fields.timeZone')}
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            showSearch
            options={tzOptions}
            popupMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 320 }}
            filterOption={(input, option) =>
              timeZoneOptionMatchesQuery(String(option?.label ?? ''), input)
            }
          />
        </Form.Item>
        <Form.Item
          name="dateFormat"
          label={translate('pages.preferences.fields.dateFormat')}
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select options={dateFormatOptions} />
        </Form.Item>
        <Form.Item
          name="theme"
          label={translate('pages.preferences.fields.theme')}
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Radio.Group optionType="button" buttonStyle="solid" style={{ display: 'flex', width: '100%' }}>
            <Radio.Button value="light" style={{ flex: 1, textAlign: 'center' }}>
              {translate('pages.preferences.theme.light')}
            </Radio.Button>
            <Radio.Button value="dark" style={{ flex: 1, textAlign: 'center' }}>
              {translate('pages.preferences.theme.dark')}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={translate('table.users.active')}
          name="isActive"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
}
