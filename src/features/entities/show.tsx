import { Show } from '@refinedev/antd';
import { useList, usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Table, Tag, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getEntityActivateUrl,
  getEntityDeactivateUrl,
} from '../../shared/timci/entitiesApi.js';
import { fetchOverduePolicyCatalog, type OverduePolicyItem } from '../../shared/timci/auxiliaryApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import {
  TimciActivateDeactivateConfirmModal,
  TimciRichTextView,
  TimciShowActivateHeaderButtons,
  useTimciActivateDeactivateToggle,
} from '../../shared/timci/form/index.js';
import { timciPersonTypeLabel } from '../../shared/timci/personTypeLabel.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { EntityAdminRedirect } from './EntityAdminRedirect.js';

type PaymentOptionRow = {
  id?: string;
  ordinal?: number;
  name?: string;
  details?: string;
  currencyIds?: string[];
  isActive?: boolean;
};

type EntityRecord = {
  id?: string;
  name?: string;
  countryId?: string;
  address?: string;
  email?: string;
  phone?: string;
  defaultCountryId?: string;
  defaultCurrencyId?: string;
  personType?: string;
  documentTypeId?: string;
  documentNumber?: string;
  documentTypeName?: string;
  defaultOverdueNotificationPolicyKey?: string;
  defaultPaymentTermDays?: number;
  availableOverduePolicyKeys?: string[];
  addAdvertisement?: boolean;
  fantasyName?: string | null;
  isActive?: boolean;
  paymentOptions?: PaymentOptionRow[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

function boolTag(translate: (key: string) => string, value: boolean | undefined) {
  return value ? (
    <Tag color="green">{translate('table.entities.yes')}</Tag>
  ) : (
    <Tag color="red">{translate('table.entities.no')}</Tag>
  );
}

export function EntityShow() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canUpdate = permData?.actionCodes?.includes('entities.update') ?? false;
  const canActivate = permData?.actionCodes?.includes('entities.activate') ?? false;
  const canDeactivate = permData?.actionCodes?.includes('entities.deactivate') ?? false;

  const { query } = useShow<EntityRecord>({ resource: 'entities' });
  const record = query?.data?.data;
  const isLoading = query?.isLoading ?? false;
  const canEditRecord = canUpdate && record?.isActive !== false;

  const [policies, setPolicies] = useState<OverduePolicyItem[]>([]);

  const resolveToggleUrls = useCallback(
    (id: string) => ({
      activate: getEntityActivateUrl(tenantId!, id),
      deactivate: getEntityDeactivateUrl(tenantId!, id),
    }),
    [tenantId],
  );

  const toggle = useTimciActivateDeactivateToggle({
    resource: 'entities',
    record,
    canActivate,
    canDeactivate,
    resolveToggleUrls,
    i18nPrefix: 'pages.entities',
    query,
    toggleEnabled: !!tenantId,
  });

  const { result: countryResult } = useList({
    resource: 'countries',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  const { result: currencyResult } = useList({
    resource: 'currencies',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });

  useEffect(() => {
    if (!tenantId) return;
    void fetchOverduePolicyCatalog(tenantId).then(setPolicies);
  }, [tenantId]);

  const countryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of countryResult.data ?? []) {
      if (row.id != null) map.set(String(row.id), String(row.name ?? row.id));
    }
    return map;
  }, [countryResult.data]);

  const currencyLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of currencyResult.data ?? []) {
      const id = row.id != null ? String(row.id) : '';
      if (!id) continue;
      const code = (row as { code?: string }).code;
      const name = (row as { name?: string }).name;
      map.set(id, code != null && code !== '' ? `${code} — ${name ?? ''}` : (name ?? id));
    }
    return map;
  }, [currencyResult.data]);

  const policyLabelByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of policies) {
      const label = p.description?.trim() ?? '';
      map.set(p.key, label !== '' ? label : p.key);
    }
    return map;
  }, [policies]);

  const resolveCountry = (id: string | undefined) =>
    id != null && id !== '' ? (countryNameById.get(id) ?? id) : '—';

  const resolvePolicy = (key: string | undefined) =>
    key != null && key !== '' ? (policyLabelByKey.get(key) ?? key) : '—';

  if (!tenantId) {
    return (
      <Show title={translate('pages.entities.showTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  const availablePolicies =
    record?.availableOverduePolicyKeys?.map((k) => resolvePolicy(k)).join(', ') ?? '—';

  return (
    <>
      <EntityAdminRedirect />
      <Show
        title={translate('pages.entities.showTitle')}
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
            toggleButtonKey="entity-activate-toggle"
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
        <Descriptions.Item label="Id">{record?.id ?? '—'}</Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.name')}>
          {record?.name ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.fantasyName')}>
          {record?.fantasyName != null && String(record.fantasyName) !== ''
            ? record.fantasyName
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('create.entity.country')}>
          {resolveCountry(record?.countryId)}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.address')}>
          {record?.address ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.email')}>
          {record?.email ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.phone')}>
          {record?.phone ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('create.entity.defaultCountry')}>
          {resolveCountry(record?.defaultCountryId)}
        </Descriptions.Item>
        <Descriptions.Item label={translate('create.entity.defaultCurrency')}>
          {record?.defaultCurrencyId != null
            ? (currencyLabelById.get(record.defaultCurrencyId) ?? record.defaultCurrencyId)
            : '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.personType')}>
          {timciPersonTypeLabel(translate, record?.personType)}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.documentType')}>
          {record?.documentTypeName ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.documentNumber')}>
          {record?.documentNumber ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('create.entity.defaultOverduePolicy')}>
          {resolvePolicy(record?.defaultOverdueNotificationPolicyKey)}
        </Descriptions.Item>
        <Descriptions.Item label={translate('create.entity.availableOverduePolicies')}>
          {availablePolicies}
        </Descriptions.Item>
        <Descriptions.Item label={translate('create.entity.defaultPaymentTermDays')}>
          {record?.defaultPaymentTermDays ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label={translate('create.entity.addAdvertisement')}>
          {boolTag(translate, record?.addAdvertisement)}
        </Descriptions.Item>
        <Descriptions.Item label={translate('table.entities.active')}>
          {boolTag(translate, record?.isActive)}
        </Descriptions.Item>
      </Descriptions>

      {(record?.paymentOptions?.length ?? 0) > 0 && (
        <>
          <Typography.Text strong style={{ display: 'block', margin: '16px 0 8px' }}>
            {translate('create.entity.paymentOptionsSection')}
          </Typography.Text>
          <Table
            size="small"
            rowKey={(row) => row.id ?? `opt-${row.ordinal}`}
            pagination={false}
            dataSource={record?.paymentOptions ?? []}
            columns={[
              {
                title: translate('create.entity.paymentOptionName'),
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: translate('create.entity.paymentOptionDetails'),
                dataIndex: 'details',
                key: 'details',
                render: (value: string | undefined) => <TimciRichTextView html={value} />,
              },
              {
                title: translate('create.entity.paymentOptionCurrencies'),
                key: 'currencyIds',
                render: (_, row) => {
                  const ids = row.currencyIds ?? [];
                  if (ids.length === 0) return '—';
                  return ids.map((id) => currencyLabelById.get(id) ?? id).join(', ');
                },
              },
              {
                title: translate('create.entity.paymentOptionActive'),
                dataIndex: 'isActive',
                key: 'isActive',
                render: (v: boolean) => boolTag(translate, v),
              },
            ]}
          />
        </>
      )}

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
