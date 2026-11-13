import { RefreshButton, Show } from '@refinedev/antd';
import { useInvalidate, usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Alert, Button, Descriptions, Modal, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getV1Base } from '../../config.js';
import { TimciListLink } from '../../shared/timci/TimciResourceLink.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { useTimciDescriptionStyles } from '../../shared/timci/descriptionLayout.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';
import { timciPersonTypeLabel } from '../../shared/timci/personTypeLabel.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

type SignupStatus = 'pending' | 'accepted' | 'rejected';

type PaymentOption = {
  ordinal: number;
  name: string;
  details: string;
  currencyIds: string[];
  isActive: boolean;
};

type SignupDetail = {
  id: string;
  status: SignupStatus;
  entityName: string;
  fantasyName: string | null;
  countryId: string;
  address: string;
  entityEmail: string;
  phone: string;
  defaultCountryId: string;
  defaultCurrencyId: string;
  baseCurrencyId: string;
  personType: string;
  documentTypeId: string;
  documentNumber: string;
  defaultPaymentTermDays: number;
  supportedCurrencyIds: string[];
  paymentOptions: PaymentOption[];
  testNotificationEmail: string | null;
  adminName: string;
  adminEmail: string;
  createdAt: string;
  decidedAt: string | null;
};

type Catalog = {
  countries: { id: string; name: string }[];
  documentTypes: { id: string; name: string }[];
  currencies: { id: string; code: string; name: string }[];
};

function statusColor(status: string): string {
  if (status === 'accepted') return 'success';
  if (status === 'rejected') return 'error';
  return 'processing';
}

function named(
  rows: { id: string; name: string }[] | undefined,
  id: string | null | undefined,
): string {
  if (!id) return '—';
  return rows?.find((row) => row.id === id)?.name ?? id;
}

function currencyLabel(catalog: Catalog | null, id: string): string {
  const row = catalog?.currencies.find((item) => item.id === id);
  if (!row) return id || '—';
  return `${row.code} — ${row.name}`;
}

export function EntitySignupShow() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const invalidate = useInvalidate();
  const descriptionStyles = useTimciDescriptionStyles();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canReview = permData?.actionCodes?.includes('entity_signups.review') ?? false;
  const { query } = useShow<SignupDetail>({ resource: 'entitySignups' });
  const record = query.data?.data;
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState<'confirm' | 'reject' | null>(null);

  useEffect(() => {
    let cancelled = false;
    void timciFetch(`${getV1Base()}/public/entity-signups/catalog`)
      .then((result) => {
        if (!cancelled) setCatalog(result.json as Catalog);
      })
      .catch(() => {
        if (!cancelled) setCatalog(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const decide = async (action: 'confirm' | 'reject') => {
    if (!record) return;
    setBusy(true);
    try {
      await timciFetch(`${getV1Base()}/entity-signups/${encodeURIComponent(record.id)}/${action}`, {
        method: 'POST',
      });
      notify.success(
        translate(action === 'confirm' ? 'pages.entityRequests.approved' : 'pages.entityRequests.rejectedOk'),
      );
      setPendingAction(null);
      await invalidate({
        resource: 'entitySignups',
        invalidates: ['list', 'detail'],
        id: record.id,
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : translate('pages.entityRequests.actionError');
      notify.error(message);
    } finally {
      setBusy(false);
    }
  };

  const approving = pendingAction === 'confirm';
  const pending = record?.status === 'pending';

  return (
    <Show
      isLoading={query.isLoading}
      title={record?.entityName || translate('pages.entityRequests.showTitle')}
      canEdit={false}
      canDelete={false}
      headerButtons={({ refreshButtonProps }) => (
        <Space wrap>
          {pending && canReview ? (
            <Button type="primary" htmlType="button" disabled={busy} onClick={() => setPendingAction('confirm')}>
              {translate('pages.entityRequests.approve')}
            </Button>
          ) : null}
          {pending && canReview ? (
            <Button danger htmlType="button" disabled={busy} onClick={() => setPendingAction('reject')}>
              {translate('pages.entityRequests.reject')}
            </Button>
          ) : null}
          <TimciListLink resource="entitySignups" label={translate('buttons.list')} />
          {refreshButtonProps ? <RefreshButton {...refreshButtonProps} /> : null}
        </Space>
      )}
    >
      {record ? (
        <>
          {pending ? (
            <Alert
              type="info"
              showIcon
              message={translate('pages.entityRequests.intro')}
              style={{ marginBottom: 16 }}
            />
          ) : null}
          <Descriptions bordered column={1} size="middle" styles={descriptionStyles}>
            <Descriptions.Item label={translate('table.entitySignups.status')}>
              <Tag color={statusColor(record.status)}>
                {translate(`pages.entityRequests.status.${record.status}`)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.entitySignups.entityName')}>
              {record.entityName}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.fantasyName')}>
              {record.fantasyName || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.country')}>
              {named(catalog?.countries, record.countryId)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.personType')}>
              {timciPersonTypeLabel(translate, record.personType)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.documentType')}>
              {named(catalog?.documentTypes, record.documentTypeId)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.documentNumber')}>
              {record.documentNumber}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.address')}>
              {record.address}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.entitySignups.entityEmail')}>
              {record.entityEmail}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.phone')}>
              {record.phone}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.defaultCountry')}>
              {named(catalog?.countries, record.defaultCountryId)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.supportedCurrencies')}>
              {record.supportedCurrencyIds.map((id) => currencyLabel(catalog, id)).join(', ') || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.defaultCurrency')}>
              {currencyLabel(catalog, record.defaultCurrencyId)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.baseCurrency')}>
              {currencyLabel(catalog, record.baseCurrencyId)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.defaultPaymentTermDays')}>
              {record.defaultPaymentTermDays}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.testNotificationEmail')}>
              {record.testNotificationEmail || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.entity.paymentOptionsSection')}>
              <div style={{ display: 'grid', gap: 8 }}>
                {record.paymentOptions.map((option) => (
                  <div key={`${option.ordinal}-${option.name}`}>
                    <Typography.Text strong>{option.name}</Typography.Text>
                    {option.isActive ? null : (
                      <Tag style={{ marginInlineStart: 8 }}>
                        {translate('pages.entityRequests.inactiveOption')}
                      </Tag>
                    )}
                    {option.details && option.details !== '-' ? (
                      <div>{option.details}</div>
                    ) : null}
                    <div>{option.currencyIds.map((id) => currencyLabel(catalog, id)).join(', ')}</div>
                  </div>
                ))}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.entitySignups.adminName')}>
              {record.adminName}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.entitySignups.adminEmail')}>
              {record.adminEmail}
            </Descriptions.Item>
            <Descriptions.Item label={translate('table.entitySignups.createdAt')}>
              {formatTimciUserDateTime(record.createdAt, { dateFormat, timeZone })}
            </Descriptions.Item>
            <Descriptions.Item label={translate('pages.entityRequests.decidedAt')}>
              {record.decidedAt
                ? formatTimciUserDateTime(record.decidedAt, { dateFormat, timeZone })
                : '—'}
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : null}
      <Modal
        open={pendingAction != null}
        title={translate(
          approving ? 'pages.entityRequests.confirmApproveTitle' : 'pages.entityRequests.confirmRejectTitle',
        )}
        okText={translate(approving ? 'pages.entityRequests.approve' : 'pages.entityRequests.reject')}
        okButtonProps={{ danger: pendingAction === 'reject' }}
        cancelText={translate('buttons.cancel')}
        confirmLoading={busy}
        destroyOnHidden
        onCancel={() => {
          if (!busy) setPendingAction(null);
        }}
        onOk={() => {
          if (pendingAction) void decide(pendingAction);
        }}
      >
        <p>
          {translate(
            approving ? 'pages.entityRequests.confirmApproveBody' : 'pages.entityRequests.confirmRejectBody',
          )}
        </p>
      </Modal>
    </Show>
  );
}
