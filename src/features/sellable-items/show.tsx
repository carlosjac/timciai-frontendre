import { useTimciDescriptionStyles } from '../../shared/timci/descriptionLayout.js';
import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tabs, Tag } from 'antd';
import { useCallback, useState } from 'react';
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
import { SellableItemPricesTab } from './SellableItemPricesTab.js';

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
  const descriptionStyles = useTimciDescriptionStyles();
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
  const [activeTab, setActiveTab] = useState('data');

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
        <Tabs
          aria-label={translate('tabs.group')}
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'data',
              label: translate('pages.sellableItems.tabData'),
              children: (
                <>
                  <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    styles={descriptionStyles}
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
                </>
              ),
            },
            {
              key: 'prices',
              label: translate('pages.sellableItems.tabPrices'),
              children:
                tenantId && record?.id ? (
                  <SellableItemPricesTab
                    entityId={tenantId}
                    sellableItemId={record.id}
                    sellableName={record.name}
                    readOnly
                  />
                ) : (
                  <Alert type="info" showIcon message={translate('pages.sellableItems.pricesTabWait')} />
                ),
            },
          ]}
        />
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
