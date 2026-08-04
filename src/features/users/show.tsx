import { Show } from '@refinedev/antd';
import {
  useGetIdentity,
  useNotification,
  usePermissions,
  useShow,
  useTranslate,
} from '@refinedev/core';
import { Button, Descriptions, Modal, Tag } from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import {
  canManageAllEntities,
  invalidateTimciActionCodes,
  type TimciPermissionsData,
} from '../../shared/timci/actionCodes.js';
import {
  getUserActivateUrl,
  getUserDeactivateUrl,
} from '../../shared/timci/usersApi.js';
import { startImpersonation } from '../../shared/timci/impersonationApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { translateUserDateFormat, translateUserTheme } from './userPreferenceLabels.js';
import type { TimciIdentity } from '../../app-shell/ImpersonationBanner.js';

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
  const { open: openNotification } = useNotification();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const { data: identity } = useGetIdentity<TimciIdentity>();
  const canUpdate = permData?.actionCodes?.includes('users.update') ?? false;
  const canActivate = permData?.actionCodes?.includes('users.activate') ?? false;
  const canDeactivate = permData?.actionCodes?.includes('users.deactivate') ?? false;
  const isPlatformRoot =
    canManageAllEntities(permData?.actionCodes ?? []) && !identity?.impersonation?.active;

  const { query } = useShow<UserRecord>({ resource: 'users' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;

  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [impersonateLoading, setImpersonateLoading] = useState(false);

  const canImpersonate =
    isPlatformRoot &&
    !!record?.id &&
    record.isActive !== false &&
    String(record.id) !== String(identity?.id);

  const resolveToggleUrls = useCallback(
    (id: string) => ({
      activate: getUserActivateUrl(id),
      deactivate: getUserDeactivateUrl(id),
    }),
    [],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'users',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.users',
    query,
  });

  const performImpersonate = async () => {
    if (!record?.id) return;
    setImpersonateLoading(true);
    try {
      await startImpersonation(String(record.id));
      invalidateTimciActionCodes();
      window.location.assign('/');
    } catch (e: unknown) {
      setImpersonateLoading(false);
      setImpersonateOpen(false);
      const message =
        e instanceof Error ? e.message : translate('pages.users.impersonateError');
      openNotification?.({
        type: 'error',
        message: translate('pages.users.impersonateError'),
        description: message,
      });
    }
  };

  return (
    <>
      <Show
        title={translate('pages.users.showTitle')}
        isLoading={isLoading}
        canEdit={canEditRecord}
        canDelete={false}
        headerButtons={({ listButtonProps, editButtonProps, refreshButtonProps }) => (
          <>
            {canImpersonate ? (
              <Button
                icon={<UserSwitchOutlined />}
                onClick={() => setImpersonateOpen(true)}
                aria-label={translate('pages.users.impersonate')}
              >
                {translate('pages.users.impersonate')}
              </Button>
            ) : null}
            <TimciShowActivateHeaderButtons
              listButtonProps={listButtonProps}
              editButtonProps={editButtonProps}
              refreshButtonProps={refreshButtonProps}
              showToggle={toggle.showToggle}
              isActive={toggle.isActive}
              toggleLoading={toggle.toggleLoading}
              toggleLabel={toggle.toggleLabel}
              onToggleClick={() => toggle.setToggleOpen(true)}
              toggleButtonKey="user-activate-toggle"
            />
          </>
        )}
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
      <Modal
        open={impersonateOpen}
        title={translate('pages.users.confirmImpersonateTitle')}
        okText={translate('pages.users.impersonate')}
        cancelText={translate('buttons.cancel')}
        confirmLoading={impersonateLoading}
        onCancel={() => setImpersonateOpen(false)}
        onOk={() => void performImpersonate()}
      >
        <p>{translate('pages.users.confirmImpersonateBody')}</p>
        <p>
          <strong>{record?.name ?? record?.email}</strong>
        </p>
      </Modal>
    </>
  );
}
