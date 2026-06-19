import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tag } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
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

  const { query } = useShow<CurrencyRecord>({ resource: 'currencies' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;

  if (!tenantId) {
    return (
      <Show title={translate('pages.currencies.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  return (
    <Show
      title={translate('pages.currencies.showTitle')}
      isLoading={isLoading}
      canEdit={canUpdate}
      canDelete={false}
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
  );
}
