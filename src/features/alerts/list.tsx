import { useCallback, useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Button, Tag } from 'antd';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type AlertRow = BaseRecord & {
  id: string;
  kind: string;
  severity: string;
  title: string;
  summary: string;
  createdAt: string;
  resolvedAt?: string | null;
};

function severityColor(severity: string): string {
  if (severity === 'critical' || severity === 'error') return 'error';
  if (severity === 'warning') return 'warning';
  if (severity === 'info') return 'processing';
  return 'default';
}

export function AlertList() {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canView = codes.includes('alerts.view');
  const canAcknowledge = codes.includes('alerts.acknowledge');

  const acknowledge = useCallback(
    async (id: string) => {
      const base = getResourceApiBase('alerts');
      if (!base) return;
      try {
        await timciFetch(`${base}/${encodeURIComponent(id)}/acknowledge`, { method: 'POST' });
        notify.success(translate('pages.alerts.acknowledged'));
        window.location.reload();
      } catch {
        notify.error(translate('pages.alerts.acknowledgeError'));
      }
    },
    [notify, translate],
  );

  const columnDefs = useMemo((): TimciColumnDef<AlertRow>[] => [
    {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.alerts.actions',
      width: 120,
      render: (_value, record) =>
        canAcknowledge && !record.resolvedAt ? (
          <span data-timci-row-action onClick={(event) => event.stopPropagation()}>
            <Button size="small" onClick={() => void acknowledge(record.id)}>
              {translate('table.alerts.acknowledge')}
            </Button>
          </span>
        ) : null,
      exportValue: () => '',
    },
    {
      key: 'kind',
      dataIndex: 'kind',
      titleKey: 'table.alerts.kind',
      filter: { kind: 'text' },
    },
    {
      key: 'severity',
      dataIndex: 'severity',
      titleKey: 'table.alerts.severity',
      render: (value) => (
        <Tag color={severityColor(String(value))}>
          {translate(`pages.alerts.severities.${String(value)}`, String(value ?? ''))}
        </Tag>
      ),
    },
    {
      key: 'title',
      dataIndex: 'title',
      titleKey: 'table.alerts.title',
    },
    {
      key: 'summary',
      dataIndex: 'summary',
      titleKey: 'table.alerts.summary',
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      titleKey: 'table.alerts.createdAt',
      sorter: true,
      filter: { kind: 'date' },
      render: (value) => formatTimciUserDateTime(value, { dateFormat, timeZone }),
      exportValue: (record) =>
        formatTimciUserDateTime(record.createdAt, { dateFormat, timeZone }) || '',
    },
  ], [acknowledge, canAcknowledge, dateFormat, timeZone, translate]);

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: AlertRow) => `/alerts/show/${encodeURIComponent(record.id)}`
        : undefined,
    [canView],
  );

  return (
    <TimciDataList<AlertRow>
      resource="alerts"
      rowKey="id"
      titleKey="pages.alerts.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
      initialSorters={[{ field: 'createdAt', order: 'desc' }]}
      getRowShowPath={getRowShowPath}
      listCreateButtonProps={{ hidden: true }}
    />
  );
}
