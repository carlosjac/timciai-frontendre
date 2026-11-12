import { useTimciDescriptionStyles } from '../../shared/timci/descriptionLayout.js';
import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tag } from 'antd';
import { useCallback } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  canManageAllEntities,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';
import {
  getMonetaryPolicyActivateUrl,
  getMonetaryPolicyDeactivateUrl,
} from '../../shared/timci/monetaryPoliciesApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { MonetaryPolicyParamsSummary } from './MonetaryPolicyParamsSummary.js';

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

export function MonetaryPolicyShow() {
  const translate = useTranslate();
  const descriptionStyles = useTimciDescriptionStyles();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const showOrg = canManageAllEntities(codes);
  const canUpdate = codes.includes('monetary_policies.update');
  const canActivate = codes.includes('monetary_policies.activate');
  const canDeactivate = codes.includes('monetary_policies.deactivate');

  const { query } = useShow<MonetaryPolicyRecord>({ resource: 'monetary_policies' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;
  const organizationLabel =
    record?.entityName != null && String(record.entityName).trim() !== ''
      ? String(record.entityName)
      : (record?.entityId ?? '—');

  const resolveToggleUrls = useCallback(
    (id: string) => {
      const scopeId = record?.entityId ?? tenantId!;
      return {
        activate: getMonetaryPolicyActivateUrl(scopeId, scopeId, id),
        deactivate: getMonetaryPolicyDeactivateUrl(scopeId, scopeId, id),
      };
    },
    [record?.entityId, tenantId],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'monetary_policies',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.monetaryPolicies',
    query,
    toggleEnabled: !!tenantId,
    toggleMethod: 'POST',
  });

  if (!tenantId) {
    return (
      <Show title={translate('pages.monetaryPolicies.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  return (
    <>
      <Show
        title={translate('pages.monetaryPolicies.showTitle')}
        isLoading={isLoading}
        canEdit={canEditRecord}
        canDelete={false}
        headerButtons={({ listButtonProps, editButtonProps, refreshButtonProps }) => (
          <TimciShowActivateHeaderButtons
            listButtonProps={listButtonProps}
            editButtonProps={editButtonProps}
            refreshButtonProps={refreshButtonProps}
            showToggle={toggle.showToggle}
            isActive={toggle.isActive}
            toggleLoading={toggle.toggleLoading}
            toggleLabel={toggle.toggleLabel}
            onToggleClick={() => toggle.setToggleOpen(true)}
            toggleButtonKey="monetary-policy-activate-toggle"
          />
        )}
      >
        <TimciFormInactiveRecordBanner isActive={record?.isActive} />
        <Descriptions
          bordered
          column={1}
          size="middle"
          styles={descriptionStyles}
        >
          {showOrg ? (
            <Descriptions.Item label={translate('table.monetaryPolicies.organization')}>
              <span style={{ whiteSpace: 'pre-wrap' }}>{organizationLabel}</span>
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label={translate('table.monetaryPolicies.name')}>
            <span style={{ whiteSpace: 'pre-wrap' }}>{record?.name ?? '—'}</span>
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.monetaryPolicies.kind')}>
            {record?.kind === 'none'
              ? translate('pages.monetaryPolicies.kindLabels.none')
              : record?.kind === 'relative_bands'
                ? translate('pages.monetaryPolicies.kindLabels.relative_bands')
                : (record?.kind ?? '—')}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.monetaryPolicies.params')}>
            <MonetaryPolicyParamsSummary
              kind={record?.kind}
              params={record?.params}
              translate={translate}
            />
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.monetaryPolicies.active')}>
            {record?.isActive ? (
              <Tag color="green">{translate('table.users.yes')}</Tag>
            ) : (
              <Tag color="red">{translate('table.users.no')}</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
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
      </Show>
      <TimciActivateDeactivateConfirmModal
        open={toggle.toggleOpen}
        title={toggle.toggleConfirmTitle}
        okText={toggle.toggleLabel}
        body={toggle.toggleConfirmBody}
        recordName={toggle.recordName}
        isActive={toggle.isActive}
        loading={toggle.toggleLoading}
        onCancel={() => toggle.setToggleOpen(false)}
        onConfirm={() => void toggle.performActivateDeactivate()}
      />
    </>
  );
}
