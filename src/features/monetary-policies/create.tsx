import { Create, useForm, useSelect } from '@refinedev/antd';
import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, Form, Select } from 'antd';
import {
  canManageAllEntities,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { GLOBAL_TENANT_ID } from '../../shared/timci/tenantsApi.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { MonetaryPolicyParamsFields } from './MonetaryPolicyParamsFields.js';
import { normalizeMonetaryPolicyParams } from './monetaryPolicyParamsForm.js';
import { relativeBandsSubmitErrorMessages } from './relativeBandsSubmitValidation.js';
import { MonetaryPolicyNameField } from './MonetaryPolicyNameField.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

const CREATE_KIND = 'relative_bands';
const CREATE_FIELDS = ['name', 'params', 'entityId'] as const;

export function MonetaryPolicyCreate() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canPickOrg = canManageAllEntities(codes);
  const canListTenants = codes.includes('tenants.list');
  const headerTenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const defaultEntityId =
    headerTenantId && headerTenantId !== GLOBAL_TENANT_ID ? headerTenantId : undefined;

  const { formProps, saveButtonProps, onFinish, form } = useForm({
    errorNotification: false,
    resource: 'monetary_policies',
  });
  const { selectProps: orgSelect } = useSelect({
    resource: 'tenants',
    optionLabel: 'name',
    optionValue: 'id',
    filters: [{ field: 'isActive', operator: 'eq', value: true }],
    pagination: { currentPage: 1, pageSize: 20 },
    sorters: [{ field: 'name', order: 'asc' }],
    onSearch: (value) => {
      const term = value.trim();
      if (!term) return [];
      return [{ field: 'name', operator: 'contains' as const, value: term }];
    },
    queryOptions: { enabled: canPickOrg && canListTenants },
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CREATE_FIELDS,
  });

  if (!headerTenantId && !canPickOrg) {
    return (
      <Create title={translate('pages.monetaryPolicies.create')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate('pages.monetaryPolicies.create')} saveButtonProps={saveButtonProps}>
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          entityId: canPickOrg ? defaultEntityId : headerTenantId ?? undefined,
          params: {
            anchor: 'due_date',
            unit: 'days',
            bands: [
              {
                fromMode: 'open',
                fromValue: null,
                toMode: 'open',
                toValue: null,
                effect: 'none',
                chargeMode: 'flat_percent',
              },
            ],
          },
        }}
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          const entityId = canPickOrg
            ? String(values.entityId ?? '').trim()
            : (headerTenantId ?? '');
          if (!entityId) {
            form?.setFields([
              {
                name: 'entityId',
                errors: [translate('pages.monetaryPolicies.organizationRequired')],
              },
            ]);
            return;
          }
          const params = normalizeMonetaryPolicyParams(
            CREATE_KIND,
            values.params as Record<string, unknown> | undefined,
          );
          const coverageMessages = relativeBandsSubmitErrorMessages(
            CREATE_KIND,
            params,
            translate,
          );
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
            await onFinish({
              kind: CREATE_KIND,
              name: values.name,
              params,
              entityId,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        {canPickOrg && canListTenants ? (
          <Form.Item
            name="entityId"
            label={translate('pages.monetaryPolicies.organization')}
            rules={[
              {
                required: true,
                message: translate('pages.monetaryPolicies.organizationRequired'),
              },
            ]}
          >
            <Select
              {...orgSelect}
              options={(orgSelect.options ?? []).filter(
                (option) => option.value !== GLOBAL_TENANT_ID,
              )}
              placeholder={translate('pages.monetaryPolicies.organizationPlaceholder')}
              aria-label={translate('pages.monetaryPolicies.organization')}
            />
          </Form.Item>
        ) : null}
        <MonetaryPolicyParamsFields kind={CREATE_KIND} />
        <MonetaryPolicyNameField kind={CREATE_KIND} />
      </Form>
    </Create>
  );
}
