import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tag } from 'antd';
import { useCallback } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getCountryActivateUrl,
  getCountryDeactivateUrl,
} from '../../shared/timci/countriesApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type CountryRecord = {
  id?: string;
  name?: string;
  isoCode?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function CountryShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('countries.update') ?? false;
  const canActivate = permData?.actionCodes?.includes('countries.activate') ?? false;
  const canDeactivate = permData?.actionCodes?.includes('countries.deactivate') ?? false;

  const { query } = useShow<CountryRecord>({ resource: 'countries' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;

  const resolveToggleUrls = useCallback(
    (id: string) => ({
      activate: getCountryActivateUrl(tenantId!, id),
      deactivate: getCountryDeactivateUrl(tenantId!, id),
    }),
    [tenantId],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'countries',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.countries',
    query,
    toggleEnabled: !!tenantId,
  });

  if (!tenantId) {
    return (
      <Show title={translate('pages.countries.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  return (
    <>
      <Show
        title={translate('pages.countries.showTitle')}
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
            toggleButtonKey="country-activate-toggle"
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
          <Descriptions.Item label={translate('table.countries.name')}>
            {record?.name ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.countries.iso')}>
            {record?.isoCode ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.countries.active')}>
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
