import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tag } from 'antd';
import { useCallback } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getSellableItemActivateUrl,
  getSellableItemDeactivateUrl,
} from '../../shared/timci/sellableItemsApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { sellableKindTitleKey } from './kindChoices.js';

type SellableItemRecord = {
  id?: string;
  name?: string;
  kind?: string;
  code?: string | null;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function SellableItemShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('sellable_items.update') ?? false;
  const canActivate = permData?.actionCodes?.includes('sellable_items.activate') ?? false;
  const canDeactivate = permData?.actionCodes?.includes('sellable_items.deactivate') ?? false;

  const { query } = useShow<SellableItemRecord>({ resource: 'sellable_items' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;

  const resolveToggleUrls = useCallback(
    (id: string) => ({
      activate: getSellableItemActivateUrl(tenantId!, id),
      deactivate: getSellableItemDeactivateUrl(tenantId!, id),
    }),
    [tenantId],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'sellable_items',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.sellableItems',
    query,
    toggleEnabled: !!tenantId,
    toggleMethod: 'POST',
  });

  if (!tenantId) {
    return (
      <Show title={translate('pages.sellableItems.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  const codeDisplay =
    record?.code != null && String(record.code).trim() !== '' ? String(record.code) : '—';
  const descriptionDisplay =
    record?.description != null && String(record.description).trim() !== ''
      ? String(record.description)
      : '—';

  return (
    <>
      <Show
        title={translate('pages.sellableItems.showTitle')}
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
            toggleButtonKey="sellable-item-activate-toggle"
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
          <Descriptions.Item label={translate('table.sellableItems.kind')}>
            {translate(sellableKindTitleKey(record?.kind))}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.sellableItems.name')}>
            {record?.name ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.sellableItems.code')}>
            {codeDisplay}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.sellableItems.description')}>
            {descriptionDisplay}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.sellableItems.active')}>
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
