import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tabs, Tag } from 'antd';
import { useCallback, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getPriceListActivateUrl,
  getPriceListDeactivateUrl,
} from '../../shared/timci/priceListsApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { PriceListItemsReadonlyTab } from './PriceListItemsReadonlyTab.js';

type PriceListRecord = {
  id?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function PriceListShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('price_lists.update') ?? false;
  const canActivate = permData?.actionCodes?.includes('price_lists.activate') ?? false;
  const canDeactivate = permData?.actionCodes?.includes('price_lists.deactivate') ?? false;

  const { query } = useShow<PriceListRecord>({ resource: 'price_lists' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;
  const [activeTab, setActiveTab] = useState('data');

  const resolveToggleUrls = useCallback(
    (id: string) => ({
      activate: getPriceListActivateUrl(tenantId!, id),
      deactivate: getPriceListDeactivateUrl(tenantId!, id),
    }),
    [tenantId],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'price_lists',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.priceLists',
    query,
    toggleEnabled: !!tenantId,
    toggleMethod: 'POST',
  });

  if (!tenantId) {
    return (
      <Show title={translate('pages.priceLists.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  return (
    <>
      <Show
        title={translate('pages.priceLists.showTitle')}
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
            toggleButtonKey="price-list-activate-toggle"
          />
        )}
      >
        <TimciFormInactiveRecordBanner isActive={record?.isActive} />
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'data',
              label: translate('pages.priceLists.tabData'),
              children: (
                <>
                  <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    styles={{ label: { width: 220, maxWidth: 280, verticalAlign: 'top' } }}
                  >
                    <Descriptions.Item label={translate('table.priceLists.name')}>
                      {record?.name ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('table.priceLists.active')}>
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
              label: translate('pages.priceLists.tabPrices'),
              children:
                tenantId && record?.id ? (
                  <PriceListItemsReadonlyTab entityId={tenantId} priceListId={record.id} />
                ) : (
                  <Alert type="info" showIcon message={translate('pages.priceLists.itemsTabWait')} />
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
