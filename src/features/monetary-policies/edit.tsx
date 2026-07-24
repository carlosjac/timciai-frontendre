import { Edit, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input } from 'antd';
import { useCallback, useEffect } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useTimciInactiveEditRedirect } from '../../shared/timci/form/useTimciInactiveEditRedirect.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import {
  hydrateMonetaryPolicyParamsForForm,
  MonetaryPolicyParamsFields,
  normalizeMonetaryPolicyParams,
} from './MonetaryPolicyParamsFields.js';

const EDIT_FIELDS = ['name', 'params'] as const;

type MonetaryPolicyRecord = {
  id?: string;
  name?: string;
  kind?: string;
  params?: Record<string, unknown>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function MonetaryPolicyEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } =
    useForm({
      resource: 'monetary_policies',
      action: 'edit',
    });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: EDIT_FIELDS,
  });

  const record = query?.data?.data as MonetaryPolicyRecord | undefined;
  const kind = record?.kind;

  const showPathForId = useCallback(
    (id: string) => `/monetary-policies/show/${encodeURIComponent(id)}`,
    [],
  );

  const isRedirectingInactive = useTimciInactiveEditRedirect({
    formLoading,
    record,
    showPathForId,
    warningMessageKey: 'pages.monetaryPolicies.inactiveCannotEdit',
  });

  useEffect(() => {
    if (!form || !record?.id || !kind) return;
    if (kind === 'none') return;
    const hydrated = hydrateMonetaryPolicyParamsForForm(kind, record.params);
    form.setFieldsValue({ params: hydrated });
  }, [form, record?.id, kind, record?.params]);

  if (!tenantId) {
    return (
      <Edit title={translate('pages.monetaryPolicies.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  if (isRedirectingInactive) {
    return <Edit title={translate('pages.monetaryPolicies.editTitle')} isLoading />;
  }

  const kindLabel =
    kind === 'none'
      ? translate('pages.monetaryPolicies.kindLabels.none')
      : kind === 'relative_bands'
        ? translate('pages.monetaryPolicies.kindLabels.relative_bands')
        : (kind ?? '—');

  return (
    <Edit
      title={translate('pages.monetaryPolicies.editTitle')}
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
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
              name: values.name,
              params: normalizeMonetaryPolicyParams(
                kind ?? '',
                values.params as Record<string, unknown> | undefined,
              ),
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <Form.Item label={translate('table.monetaryPolicies.kind')}>
          <Input value={kindLabel} disabled />
        </Form.Item>
        <Form.Item
          label={translate('table.monetaryPolicies.name')}
          name="name"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input.TextArea rows={4} maxLength={2000} showCount />
        </Form.Item>
        <MonetaryPolicyParamsFields kind={kind} disabled={kind === 'none'} />
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
