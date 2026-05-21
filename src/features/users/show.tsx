import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Descriptions, Tag } from 'antd';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { translateUserDateFormat, translateUserTheme } from './userPreferenceLabels.js';

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

export function UserShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('users.update') ?? false;

  const { query } = useShow<UserRecord>({ resource: 'users' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;

  return (
    <Show
      title={translate('pages.users.showTitle')}
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
        <Descriptions.Item label={translate('pages.login.fields.email')}>
          {record?.email ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.users.name')}>
          {record?.name ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.users.timeZone')}>
          {typeof record?.timeZone === 'string' && record.timeZone ? record.timeZone : '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.users.dateFormat')}>
          {translateUserDateFormat(translate, record?.dateFormat)}
        </Descriptions.Item>
        <Descriptions.Item label={translate('pages.preferences.fields.theme')}>
          {translateUserTheme(translate, record?.theme)}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.users.active')}>
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
