import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tag } from 'antd';
import { useCallback } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getDocumentTypeActivateUrl,
  getDocumentTypeDeactivateUrl,
} from '../../shared/timci/documentTypesApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import { timciDocumentAppliesToLabel } from '../../shared/timci/personTypeLabel.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type DocumentTypeRecord = {
  id?: string;
  name?: string;
  countryId?: string | null;
  countryName?: string;
  appliesTo?: string;
  validationRuleKey?: string | null;
  validationHint?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function DocumentTypeShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('document_types.update') ?? false;
  const canActivate = permData?.actionCodes?.includes('document_types.activate') ?? false;
  const canDeactivate = permData?.actionCodes?.includes('document_types.deactivate') ?? false;

  const { query } = useShow<DocumentTypeRecord>({ resource: 'document_types' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;

  const resolveToggleUrls = useCallback(
    (id: string) => ({
      activate: getDocumentTypeActivateUrl(tenantId!, id),
      deactivate: getDocumentTypeDeactivateUrl(tenantId!, id),
    }),
    [tenantId],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'document_types',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.documentTypes',
    query,
    toggleEnabled: !!tenantId,
  });

  if (!tenantId) {
    return (
      <Show title={translate('pages.documentTypes.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  const countryDisplay =
    typeof record?.countryName === 'string' && record.countryName !== ''
      ? record.countryName
      : '—';
  const validationRuleDisplay =
    record?.validationRuleKey != null && String(record.validationRuleKey) !== ''
      ? String(record.validationRuleKey)
      : '—';

  return (
    <>
      <Show
        title={translate('pages.documentTypes.showTitle')}
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
            toggleButtonKey="document-type-activate-toggle"
          />
        )}
      >
        <TimciFormInactiveRecordBanner isActive={record?.isActive} />
        <Descriptions
          bordered
          column={1}
          size="middle"
          styles={{ label: { width: 220, maxWidth: 280, verticalAlign: 'top' } }}
        >
          <Descriptions.Item label={translate('create.documentType.typeName')}>
            {record?.name ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('create.documentType.country')}>
            {countryDisplay}
          </Descriptions.Item>
          <Descriptions.Item label={translate('create.documentType.appliesTo')}>
            {timciDocumentAppliesToLabel(translate, record?.appliesTo)}
          </Descriptions.Item>
          <Descriptions.Item label={translate('create.documentType.validationRuleNumber')}>
            {validationRuleDisplay}
            {record?.validationHint != null && String(record.validationHint).trim() !== '' ? (
              <div style={{ marginTop: 4, color: 'rgba(0, 0, 0, 0.45)' }}>
                {String(record.validationHint)}
              </div>
            ) : null}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.documentTypes.active')}>
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
