import { EditButton } from '@refinedev/antd';
import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { timciDocumentAppliesToLabel } from '../../shared/timci/personTypeLabel.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type DocTypeRow = BaseRecord & {
  name: string;
  countryName?: string;
  appliesTo?: string;
  isActive?: boolean;
  validationRuleKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function DocumentTypeList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = permData?.actionCodes?.includes('document_types.view') ?? false;
  const canUpdate = permData?.actionCodes?.includes('document_types.update') ?? false;

  const listMeta = useMemo(() => ({ includeInactive: true }), []);

  const getRowShowPath = useMemo(
    () =>
      canView
        ? (record: DocTypeRow) =>
            `/document-types/show/${encodeURIComponent(String(record.id))}`
        : undefined,
    [canView],
  );

  const columnDefs = useMemo((): TimciColumnDef<DocTypeRow>[] => {
    const cols: TimciColumnDef<DocTypeRow>[] = [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.documentTypes.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'countryName',
        dataIndex: 'countryName',
        titleKey: 'table.documentTypes.country',
        sorter: true,
        sortField: 'countryName',
        filter: { kind: 'text' },
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'appliesTo',
        dataIndex: 'appliesTo',
        titleKey: 'table.documentTypes.appliesTo',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => timciDocumentAppliesToLabel(translate, v),
        exportValue: (r) => timciDocumentAppliesToLabel(translate, r.appliesTo),
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.documentTypes.active',
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
        key: 'validationRuleKey',
        dataIndex: 'validationRuleKey',
        titleKey: 'table.documentTypes.validationRule',
        sorter: true,
        defaultVisible: false,
        render: (v: unknown) => (v != null && String(v) !== '' ? String(v) : '—'),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.documentTypes.createdAt',
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.documentTypes.updatedAt',
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.documentTypes.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.documentTypes.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];

    if (canUpdate) {
      cols.push({
        key: 'actions',
        dataIndex: 'id',
        titleKey: 'table.documentTypes.actions',
        width: 72,
        render: (_: unknown, record: DocTypeRow) => (
          <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
            <EditButton
              resource="document_types"
              recordItemId={record.id}
              hideText
              title={translate('table.documentTypes.edit')}
              aria-label={translate('table.documentTypes.edit')}
            />
          </span>
        ),
        exportValue: () => '',
      });
    }

    return cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<DocTypeRow>
      resource="document_types"
      rowKey="id"
      titleKey="pages.documentTypes.title"
      columnDefs={columnDefs}
      requiresTenant
      meta={listMeta}
      pickerDateFormat={dateFormat}
      getRowShowPath={getRowShowPath}
    />
  );
}
