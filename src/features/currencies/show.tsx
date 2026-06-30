import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tag } from 'antd';
import { useCallback } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getCurrencyActivateUrl,
  getCurrencyDeactivateUrl,
} from '../../shared/timci/currenciesApi.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciFormAuditCollapse,
  TimciFormInactiveRecordBanner,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

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

export function CurrencyShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('currencies.update') ?? false;
  const canActivate = permData?.actionCodes?.includes('currencies.activate') ?? false;
  const canDeactivate = permData?.actionCodes?.includes('currencies.deactivate') ?? false;

  const { query } = useShow<CurrencyRecord>({ resource: 'currencies' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;

  const resolveToggleUrls = useCallback(
    (id: string) => ({
      activate: getCurrencyActivateUrl(tenantId!, id),
      deactivate: getCurrencyDeactivateUrl(tenantId!, id),
    }),
    [tenantId],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'currencies',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.currencies',
    query,
    toggleEnabled: !!tenantId,
  });

  if (!tenantId) {
    return (
      <Show title={translate('pages.currencies.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  return (
    <>
      <Show
        title={translate('pages.currencies.showTitle')}
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
            toggleButtonKey="currency-activate-toggle"
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
          <Descriptions.Item label={translate('table.currencies.code')}>
            {record?.code ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.currencies.name')}>
            {record?.name ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.currencies.active')}>
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
