import { EditButton } from '@refinedev/antd';
import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type MonetaryPolicyRow = BaseRecord & {
  name: string;
  kind?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function MonetaryPolicyList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const canView = permData?.actionCodes?.includes('monetary_policies.view') ?? false;
  const canUpdate = permData?.actionCodes?.includes('monetary_policies.update') ?? false;

  const listMeta = useMemo(
    () => (tenantId ? { entityId: tenantId } : undefined),
    [tenantId],
  );

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: MonetaryPolicyRow) =>
            `/monetary-policies/show/${encodeURIComponent(String(record.id))}`
        : undefined,
    [canView],
  );

  const columnDefs = useMemo((): TimciColumnDef<MonetaryPolicyRow>[] => {
    const editColumn: TimciColumnDef<MonetaryPolicyRow> = {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.monetaryPolicies.actions',
      width: 72,
      render: (_: unknown, record: MonetaryPolicyRow) =>
        record.isActive === false ? null : (
          <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
            <EditButton
              resource="monetary_policies"
              recordItemId={record.id}
              hideText
              title={translate('table.monetaryPolicies.edit')}
              aria-label={translate('table.monetaryPolicies.edit')}
            />
          </span>
        ),
      exportValue: () => '',
    };

    const cols: TimciColumnDef<MonetaryPolicyRow>[] = [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.monetaryPolicies.name',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => (
          <span style={{ whiteSpace: 'pre-wrap' }}>{v != null ? String(v) : '—'}</span>
        ),
      },
      {
        key: 'kind',
        dataIndex: 'kind',
        titleKey: 'table.monetaryPolicies.kind',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => {
          if (v === 'none') return translate('pages.monetaryPolicies.kindLabels.none');
          if (v === 'relative_bands')
            return translate('pages.monetaryPolicies.kindLabels.relative_bands');
          return v != null ? String(v) : '—';
        },
        exportValue: (r) => {
          if (r.kind === 'none') return translate('pages.monetaryPolicies.kindLabels.none');
          if (r.kind === 'relative_bands')
            return translate('pages.monetaryPolicies.kindLabels.relative_bands');
          return r.kind ?? '';
        },
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.monetaryPolicies.active',
        sorter: true,
        filter: { kind: 'boolean' },
        render: (v: unknown) =>
          v ? (
            <Tag color="green">{translate('table.users.yes')}</Tag>
          ) : (
            <Tag color="red">{translate('table.users.no')}</Tag>
          ),
        exportValue: (r) => (r.isActive ? translate('table.users.yes') : translate('table.users.no')),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.monetaryPolicies.createdAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.monetaryPolicies.updatedAt',
        sorter: true,
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.monetaryPolicies.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.monetaryPolicies.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];

    return canUpdate ? [editColumn, ...cols] : cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<MonetaryPolicyRow>
      resource="monetary_policies"
      rowKey="id"
      titleKey="pages.monetaryPolicies.title"
      columnDefs={columnDefs}
      requiresTenant
      includeInactive
      meta={listMeta}
      pickerDateFormat={dateFormat}
      getRowShowPath={getRowShowPath}
    />
  );
}
