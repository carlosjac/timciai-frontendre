import { Show } from '@refinedev/antd';
import { useShow, useTranslate } from '@refinedev/core';
import { Alert, Descriptions, Tag } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { Link } from 'react-router';

type EmailBounce = {
  id: string;
  email: string;
  bounceType: string;
  bounceSubtype?: string | null;
  diagnosticCode?: string | null;
  customerId?: string | null;
  occurredAt?: string;
  acknowledgedAt?: string | null;
  createdAt?: string;
};

export function EmailBounceShow() {
  const translate = useTranslate();
  const tenantId = getStoredTenantId();
  const { dateFormat, timeZone } = useUserPreferences();
  const { query } = useShow<EmailBounce>({ resource: 'emailBounces' });
  const record = query.data?.data;

  if (!tenantId) {
    return <Alert type="warning" showIcon message={translate('tenant.required')} />;
  }

  return (
    <Show isLoading={query.isLoading} title={translate('pages.emailBounces.showTitle')}>
      {record ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={translate('table.emailBounces.email')}>
            {record.email}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.emailBounces.bounceType')}>
            <Tag color={record.bounceType === 'soft' ? 'warning' : 'error'}>
              {record.bounceType}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.emailBounces.subtype')}>
            {record.bounceSubtype || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.emailBounces.diagnostic')}>
            {record.diagnosticCode || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.emailBounces.occurredAt')}>
            {record.occurredAt
              ? formatTimciUserDateTime(record.occurredAt, { dateFormat, timeZone })
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.emailBounces.acknowledgedAt')}>
            {record.acknowledgedAt
              ? formatTimciUserDateTime(record.acknowledgedAt, { dateFormat, timeZone })
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.emailBounces.customer')}>
            {record.customerId ? (
              <Link to={`/customers/edit/${encodeURIComponent(record.customerId)}`}>
                {translate('pages.emailBounces.fixCustomer')}
              </Link>
            ) : (
              '—'
            )}
          </Descriptions.Item>
        </Descriptions>
      ) : null}
    </Show>
  );
}
