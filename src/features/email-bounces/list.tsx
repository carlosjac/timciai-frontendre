import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Button, Space, Tag, message } from 'antd';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { getResourceApiBase } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';

type EmailBounceRow = BaseRecord & {
  email: string;
  bounceType?: string;
  bounceSubtype?: string | null;
  diagnosticCode?: string | null;
  customerId?: string | null;
  occurredAt?: string;
  acknowledgedAt?: string | null;
  createdAt?: string;
};

export function EmailBounceList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canAck = permData?.actionCodes?.includes('emailBounces.acknowledge') ?? false;
  const canView = permData?.actionCodes?.includes('emailBounces.view') ?? false;

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: EmailBounceRow) =>
            `/email-bounces/show/${encodeURIComponent(String(record.id))}`
        : undefined,
    [canView],
  );

  const acknowledge = async (id: string) => {
    const base = getResourceApiBase('emailBounces');
    if (!base) return;
    try {
      await timciFetch(`${base}/${encodeURIComponent(id)}/acknowledge`, { method: 'POST' });
      message.success(translate('pages.emailBounces.acknowledged'));
      window.location.reload();
    } catch {
      message.error(translate('pages.emailBounces.acknowledgeError'));
    }
  };

  const columnDefs = useMemo((): TimciColumnDef<EmailBounceRow>[] => {
    const cols: TimciColumnDef<EmailBounceRow>[] = [
      {
        key: 'actions',
        dataIndex: 'id',
        titleKey: 'table.emailBounces.actions',
        width: 120,
        render: (_: unknown, record: EmailBounceRow) =>
          !canAck || record.acknowledgedAt ? null : (
            <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
              <Button size="small" onClick={() => void acknowledge(String(record.id))}>
                {translate('table.emailBounces.acknowledge')}
              </Button>
            </span>
          ),
        exportValue: () => '',
      },
      {
        key: 'email',
        dataIndex: 'email',
        titleKey: 'table.emailBounces.email',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'bounceType',
        dataIndex: 'bounceType',
        titleKey: 'table.emailBounces.bounceType',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => {
          const t = String(v ?? '');
          const color = t === 'hard' || t === 'complaint' ? 'error' : 'warning';

          return <Tag color={color}>{t || '—'}</Tag>;
        },
      },
      {
        key: 'bounceSubtype',
        dataIndex: 'bounceSubtype',
        titleKey: 'table.emailBounces.subtype',
        filter: { kind: 'text' },
      },
      {
        key: 'diagnosticCode',
        dataIndex: 'diagnosticCode',
        titleKey: 'table.emailBounces.diagnostic',
        filter: { kind: 'text' },
      },
      {
        key: 'occurredAt',
        dataIndex: 'occurredAt',
        titleKey: 'table.emailBounces.occurredAt',
        sorter: true,
        filter: { kind: 'date' },
        render: (v: unknown) =>
          v ? formatTimciUserDateTime(String(v), { dateFormat, timeZone }) : '—',
        exportValue: (r) =>
          r.occurredAt
            ? formatTimciUserDateTime(r.occurredAt, { dateFormat, timeZone })
            : '',
      },
      {
        key: 'acknowledgedAt',
        dataIndex: 'acknowledgedAt',
        titleKey: 'table.emailBounces.acknowledgedAt',
        render: (v: unknown) =>
          v ? formatTimciUserDateTime(String(v), { dateFormat, timeZone }) : '—',
      },
    ];

    return cols;
  }, [canAck, dateFormat, timeZone, translate]);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <TimciDataList<EmailBounceRow>
        resource="emailBounces"
        rowKey="id"
        titleKey="pages.emailBounces.title"
        columnDefs={columnDefs}
        requiresTenant
        pickerDateFormat={dateFormat}
        getRowShowPath={getRowShowPath}
      />
    </Space>
  );
}
