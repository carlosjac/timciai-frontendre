import { Edit, useForm } from '@refinedev/antd';
import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, Form, Input } from 'antd';
import { useCallback, useEffect } from 'react';
import {
  canManageAllEntities,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';
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
  normalizeMonetaryPolicyParams,
} from './monetaryPolicyParamsForm.js';
import { relativeBandsSubmitErrorMessages } from './relativeBandsSubmitValidation.js';
import { MonetaryPolicyNameField } from './MonetaryPolicyNameField.js';
import { MonetaryPolicyParamsFields } from './MonetaryPolicyParamsFields.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

const EDIT_FIELDS = ['name', 'params'] as const;

type MonetaryPolicyRecord = {
  id?: string;
  name?: string;
  kind?: string;
  entityId?: string;
  entityName?: string | null;
  params?: Record<string, unknown>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function MonetaryPolicyEdit() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const showOrg = canManageAllEntities(permData?.actionCodes ?? []);
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } =
    useForm({
    errorNotification: false,
      resource: 'monetary_policies',
      action: 'edit',
    });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: EDIT_FIELDS,
  });

  const record = query?.data?.data as MonetaryPolicyRecord | undefined;
  const kind = record?.kind;
  const organizationLabel =
    record?.entityName != null && String(record.entityName).trim() !== ''
      ? String(record.entityName)
      : (record?.entityId ?? '—');

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
          const params = normalizeMonetaryPolicyParams(
            kind ?? '',
            values.params as Record<string, unknown> | undefined,
          );
          const coverageMessages = relativeBandsSubmitErrorMessages(kind ?? '', params, translate);
          if (coverageMessages.length > 0) {
            form?.setFields([
              {
                name: ['params', 'bands'],
                errors: coverageMessages,
              },
            ]);
            notify.error(
              coverageMessages[0] ??
                translate('pages.monetaryPolicies.params.incompleteCoverageTitle'),
            );
            return;
          }
          try {
            await submitRecord({
              name: values.name,
              params,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        {showOrg ? (
          <Form.Item label={translate('pages.monetaryPolicies.organization')}>
            <Input
              value={organizationLabel}
              disabled
              readOnly
              aria-label={translate('pages.monetaryPolicies.organization')}
            />
          </Form.Item>
        ) : null}
        <MonetaryPolicyParamsFields kind={kind} disabled={kind === 'none'} />
        <MonetaryPolicyNameField kind={kind} disabled={kind === 'none'} />
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
