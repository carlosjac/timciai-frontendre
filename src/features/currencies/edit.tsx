import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input } from 'antd';
import { useCallback } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useTimciInactiveEditRedirect } from '../../shared/timci/form/useTimciInactiveEditRedirect.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

const CURRENCY_EDIT_FIELDS = ['code', 'name'] as const;

type CurrencyRecord = {
  id?: string;
  code?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function CurrencyEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'currencies',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CURRENCY_EDIT_FIELDS,
  });

  const record = query?.data?.data as CurrencyRecord | undefined;

  const showPathForId = useCallback(
    (id: string) => `/currencies/show/${encodeURIComponent(id)}`,
    [],
  );

  const isRedirectingInactive = useTimciInactiveEditRedirect({
    formLoading,
    record,
    showPathForId,
    warningMessageKey: 'pages.currencies.inactiveCannotEdit',
  });

  if (!tenantId) {
    return (
      <Edit title={translate('pages.currencies.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  if (isRedirectingInactive) {
    return <Edit title={translate('pages.currencies.editTitle')} isLoading />;
  }

  return (
    <Edit
      title={translate('pages.currencies.editTitle')}
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      footerButtons={({ saveButtonProps: refineSaveProps }) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <SaveButton {...refineSaveProps} />
        </div>
      )}
    >
      <TimciFormServerAlert messages={generalMessages} />
      <TimciFormInactiveRecordBanner isActive={record?.isActive} />
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await submitRecord({
              ...values,
              code: typeof values.code === 'string' ? values.code.trim() : values.code,
              name: typeof values.name === 'string' ? values.name.trim() : values.name,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <Form.Item
          label={translate('table.currencies.code')}
          name="code"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={3} />
        </Form.Item>
        <Form.Item
          label={translate('table.currencies.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input maxLength={100} />
        </Form.Item>
      </Form>
      {record && (
        <TimciFormAuditCollapse
          dateFormat={dateFormat}
          timeZone={timeZone}
          createdAt={record.createdAt}
          updatedAt={record.updatedAt}
          createdBy={record.createdBy}
          updatedBy={record.updatedBy}
        />
      )}
    </Edit>
  );
}
