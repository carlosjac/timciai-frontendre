import { Show } from '@refinedev/antd';
import { usePermissions, useShow, useTranslate } from '@refinedev/core';
import { Button, Descriptions, Tag, Typography } from 'antd';
import { Link } from 'react-router';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type AlertRecord = {
  id: string;
  kind: string;
  severity: string;
  title: string;
  summary: string;
  linkPath?: string | null;
  customerId?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
};

export function AlertShow() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canAcknowledge =
    permData?.actionCodes?.includes('alerts.acknowledge') ?? false;
  const { query } = useShow<AlertRecord>({ resource: 'alerts' });
  const record = query.data?.data;

  const acknowledge = async () => {
    if (!record) return;
    const base = getResourceApiBase('alerts');
    if (!base) return;
    try {
      await timciFetch(`${base}/${encodeURIComponent(record.id)}/acknowledge`, {
        method: 'POST',
      });
      notify.success(translate('pages.alerts.acknowledged'));
      await query.refetch();
    } catch {
      notify.error(translate('pages.alerts.acknowledgeError'));
    }
  };

  return (
    <Show
      isLoading={query.isLoading}
      title={record?.title || translate('pages.alerts.showTitle')}
      canEdit={false}
      canDelete={false}
      headerButtons={() =>
        record && canAcknowledge && !record.resolvedAt ? (
          <Button type="primary" onClick={() => void acknowledge()}>
            {translate('table.alerts.acknowledge')}
          </Button>
        ) : null
      }
    >
      {record ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={translate('table.alerts.severity')}>
            <Tag color={record.severity === 'critical' || record.severity === 'error' ? 'error' : 'warning'}>
              {translate(`pages.alerts.severities.${record.severity}`, record.severity)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.alerts.kind')}>
            {record.kind}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.alerts.summary')}>
            <Typography.Text>{record.summary}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.alerts.createdAt')}>
            {formatTimciUserDateTime(record.createdAt, { dateFormat, timeZone })}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.alerts.resolvedAt')}>
            {record.resolvedAt
              ? formatTimciUserDateTime(record.resolvedAt, { dateFormat, timeZone })
              : translate('pages.alerts.unresolved')}
          </Descriptions.Item>
          {record.linkPath ? (
            <Descriptions.Item label={translate('table.alerts.link')}>
              <Link to={record.linkPath}>{translate('pages.alerts.openRelated')}</Link>
            </Descriptions.Item>
          ) : null}
          {record.customerId ? (
            <Descriptions.Item label={translate('table.alerts.customer')}>
              <Link to={`/customers/edit/${encodeURIComponent(record.customerId)}`}>
                {translate('pages.alerts.openCustomer')}
              </Link>
            </Descriptions.Item>
          ) : null}
        </Descriptions>
      ) : null}
    </Show>
  );
}
