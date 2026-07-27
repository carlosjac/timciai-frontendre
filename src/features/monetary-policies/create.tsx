import { Create, useForm } from '@refinedev/antd';
import { usePermissions, useTranslate } from '@refinedev/core';
import { Alert, Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import {
  canManageAllEntities,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { GLOBAL_TENANT_ID, fetchActiveTenantsForSelect } from '../../shared/timci/tenantsApi.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import {
  MonetaryPolicyParamsFields,
  normalizeMonetaryPolicyParams,
} from './MonetaryPolicyParamsFields.js';
import { MonetaryPolicyNameField } from './MonetaryPolicyNameField.js';

const CREATE_KIND = 'relative_bands';
const CREATE_FIELDS = ['name', 'params', 'entityId'] as const;

export function MonetaryPolicyCreate() {
  const translate = useTranslate();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canPickOrg = canManageAllEntities(codes);
  const headerTenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const defaultEntityId =
    headerTenantId && headerTenantId !== GLOBAL_TENANT_ID ? headerTenantId : undefined;

  const { formProps, saveButtonProps, onFinish, form } = useForm({
    resource: 'monetary_policies',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CREATE_FIELDS,
  });

  const [orgOptions, setOrgOptions] = useState<{ value: string; label: string }[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);

  useEffect(() => {
    if (!canPickOrg) return;
    let cancelled = false;
    setOrgsLoading(true);
    void fetchActiveTenantsForSelect()
      .then((rows) => {
        if (cancelled) return;
        setOrgOptions(rows.map((t) => ({ value: t.id, label: t.name })));
      })
      .catch(() => {
        if (!cancelled) setOrgOptions([]);
      })
      .finally(() => {
        if (!cancelled) setOrgsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canPickOrg]);

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
          try {
            await onFinish({
              kind: CREATE_KIND,
              name: values.name,
              params: normalizeMonetaryPolicyParams(
                CREATE_KIND,
                values.params as Record<string, unknown> | undefined,
              ),
              entityId,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        {canPickOrg ? (
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
              showSearch
              optionFilterProp="label"
              loading={orgsLoading}
              options={orgOptions}
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
