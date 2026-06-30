import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Form, Input, Radio, Select } from 'antd';
import { useCallback, useMemo } from 'react';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useTimciInactiveEditRedirect } from '../../shared/timci/form/useTimciInactiveEditRedirect.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import {
  getTimeZoneSelectOptions,
  timeZoneOptionMatchesQuery,
} from '../preferences/timeZones.js';
import {
  ALLOWED_DATE_FORMATS,
  DEFAULT_DATE_FORMAT,
} from '../preferences/storage.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

const USER_EDIT_FIELDS = ['email', 'name', 'timeZone', 'dateFormat', 'theme'] as const;

const DATE_FORMAT_LABEL_KEYS: Record<(typeof ALLOWED_DATE_FORMATS)[number], string> = {
  'DD/MM/YYYY': 'pages.preferences.dateFormats.ddmmyyyy',
  'YYYY-MM-DD': 'pages.preferences.dateFormats.yyyymmdd',
  'MM/DD/YYYY': 'pages.preferences.dateFormats.mmddyyyy',
};

type UserRecord = {
  id?: string;
  email?: string;
  name?: string;
  isActive?: boolean;
  timeZone?: string;
  theme?: string;
  dateFormat?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function UserEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'users',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: USER_EDIT_FIELDS,
  });

  const record = query?.data?.data as UserRecord | undefined;
  const tzOptions = useMemo(() => getTimeZoneSelectOptions(), []);
  const dateFormatOptions = useMemo(
    () =>
      ALLOWED_DATE_FORMATS.map((value) => ({
        value,
        label: translate(DATE_FORMAT_LABEL_KEYS[value], undefined, value),
      })),
    [translate],
  );

  const showPathForId = useCallback(
    (id: string) => `/users/show/${encodeURIComponent(id)}`,
    [],
  );

  const isRedirectingInactive = useTimciInactiveEditRedirect({
    formLoading,
    record,
    showPathForId,
    warningMessageKey: 'pages.users.inactiveCannotEdit',
  });

  if (isRedirectingInactive) {
    return <Edit title={translate('pages.users.editTitle')} isLoading />;
  }

  return (
    <Edit
      title={translate('pages.users.editTitle')}
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
              timeZone: typeof values.timeZone === 'string' ? values.timeZone.trim() : '',
              theme: values.theme === 'dark' ? 'dark' : 'light',
              dateFormat:
                typeof values.dateFormat === 'string' && values.dateFormat.trim() !== ''
                  ? values.dateFormat.trim()
                  : DEFAULT_DATE_FORMAT,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
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
