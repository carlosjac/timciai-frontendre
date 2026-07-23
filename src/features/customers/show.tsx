import { Show } from '@refinedev/antd';
import { useList, usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tabs, Tag } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getCustomerActivateUrl,
  getCustomerDeactivateUrl,
} from '../../shared/timci/customersApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { timciPersonTypeLabel } from '../../shared/timci/personTypeLabel.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import {
  CustomerContactsReadonlyTab,
  type CustomerContactView,
} from './CustomerContactsReadonlyTab.js';

type CustomerRecord = {
  id?: string;
  name?: string;
  address?: string;
  countryId?: string;
  countryName?: string;
  priceListId?: string;
  priceListName?: string;
  defaultCurrencyId?: string;
  personType?: string;
  documentTypeId?: string;
  documentTypeName?: string;
  documentNumber?: string;
  defaultOverdueNotificationPolicyKey?: string;
  defaultPaymentTermDays?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
  contacts?: CustomerContactView[];
};

export function CustomerShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('customers.update') ?? false;
  const canActivate = permData?.actionCodes?.includes('customers.activate') ?? false;
  const canDeactivate = permData?.actionCodes?.includes('customers.deactivate') ?? false;

  const { query } = useShow<CustomerRecord>({ resource: 'customers' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;
  const [activeTab, setActiveTab] = useState('data');

  const { result: currenciesResult } = useList({
    resource: 'currencies',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const currencyLabel = useMemo(() => {
    const id = record?.defaultCurrencyId;
    if (!id) return '—';
    const row = (currenciesResult.data ?? []).find((c) => String(c.id) === String(id));
    if (!row) return id;
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    const code = typeof row.code === 'string' ? row.code.trim() : '';
    if (name && code) return `${name} (${code})`;
    return name || code || id;
  }, [currenciesResult.data, record?.defaultCurrencyId]);

  const resolveToggleUrls = useCallback(
    (id: string) => ({
      activate: getCustomerActivateUrl(tenantId!, id),
      deactivate: getCustomerDeactivateUrl(tenantId!, id),
    }),
    [tenantId],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'customers',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.customers',
    query,
    toggleEnabled: !!tenantId,
    toggleMethod: 'POST',
  });

  if (!tenantId) {
    return (
      <Show title={translate('pages.customers.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  return (
    <>
      <Show
        title={translate('pages.customers.showTitle')}
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
            toggleButtonKey="customer-activate-toggle"
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
              label: translate('pages.customers.tabData'),
              children: (
                <>
                  <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    styles={{ label: { width: 220, maxWidth: 280, verticalAlign: 'top' } }}
                  >
                    <Descriptions.Item label={translate('table.customers.name')}>
                      {record?.name ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.address')}>
                      {record?.address?.trim() || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.country')}>
                      {record?.countryName?.trim() || record?.countryId || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.priceList')}>
                      {record?.priceListName?.trim() || record?.priceListId || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.defaultCurrency')}>
                      {currencyLabel}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.personType')}>
                      {timciPersonTypeLabel(translate, record?.personType)}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.documentType')}>
                      {record?.documentTypeName?.trim() || record?.documentTypeId || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.documentNumber')}>
                      {record?.documentNumber?.trim() || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.defaultOverduePolicy')}>
                      {record?.defaultOverdueNotificationPolicyKey?.trim() || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('create.customer.defaultPaymentTermDays')}>
                      {record?.defaultPaymentTermDays ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('table.customers.active')}>
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
              key: 'contacts',
              label: translate('pages.customers.tabContacts'),
              children: <CustomerContactsReadonlyTab contacts={record?.contacts} />,
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
