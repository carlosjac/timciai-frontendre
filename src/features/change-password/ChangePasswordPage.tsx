import { List } from '@refinedev/antd';
import { useLogout, useTranslate } from '@refinedev/core';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { getV1Base } from '../../config.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { timciFetch } from '../../shared/timci/http.js';
import { isTimciPasswordPolicyValid } from '../../shared/timci/passwordPolicy.js';

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/** Referencia estable para el hook de errores de servidor */
const CHANGE_PW_FIELD_NAMES: readonly string[] = [
  'currentPassword',
  'newPassword',
  'confirmPassword',
];

export function ChangePasswordPage() {
  const translate = useTranslate();
  const { message } = App.useApp();
  const { mutate: logout } = useLogout();
  const [form] = Form.useForm<ChangePasswordForm>();
  const [submitting, setSubmitting] = useState(false);
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CHANGE_PW_FIELD_NAMES,
  });

  const onFinish = async (values: ChangePasswordForm) => {
    clearServerErrors(form);
    setSubmitting(true);
    try {
      await timciFetch(`${getV1Base()}/auth/me/password`, {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      message.success(translate('pages.changePassword.success'));
      form.resetFields();
      logout();
    } catch (e: unknown) {
      applyServerError(form, e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <List title={translate('pages.changePassword.title')}>
      <Card style={{ maxWidth: 480, width: '100%' }}>
        <Typography.Paragraph
          id="timci-change-password-policy-hint"
          type="secondary"
          style={{ marginBottom: 16 }}
        >
          {translate('pages.changePassword.policyHint')}
        </Typography.Paragraph>
        <Form<ChangePasswordForm>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={() => clearServerErrors(form)}
        >
          <TimciFormServerAlert messages={generalMessages} />
          <Form.Item
            name="currentPassword"
            label={translate('pages.changePassword.fields.current')}
            rules={[
              { required: true, message: translate('pages.changePassword.validation.currentRequired') },
            ]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={translate('pages.changePassword.fields.new')}
            rules={[
              { required: true, message: translate('pages.changePassword.validation.newRequired') },
              {
                validator: (_, v) => {
                  const s = typeof v === 'string' ? v : '';
                  if (isTimciPasswordPolicyValid(s)) return Promise.resolve();
                  return Promise.reject(new Error(translate('pages.changePassword.validation.policy')));
                },
              },
            ]}
            hasFeedback
          >
            <Input.Password
              autoComplete="new-password"
              aria-describedby="timci-change-password-policy-hint"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={translate('pages.changePassword.fields.confirm')}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: translate('pages.changePassword.validation.confirmRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(translate('pages.changePassword.validation.mismatch')));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {translate('pages.changePassword.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </List>
  );
}
