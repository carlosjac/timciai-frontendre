import { EditButton } from '@refinedev/antd';
import { Tag } from 'antd';
import { useMemo } from 'react';
import { usePermissions, useTranslate, type BaseRecord } from '@refinedev/core';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { timciPersonTypeLabel } from '../../shared/timci/personTypeLabel.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type EntityRow = BaseRecord & {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  fantasyName?: string | null;
  documentTypeName?: string;
  documentNumber?: string | null;
  personType?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function EntityList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const canView = permData?.actionCodes?.includes('entities.view') ?? false;
  const canUpdate = permData?.actionCodes?.includes('entities.update') ?? false;

  const canOpenShow = canView || canUpdate;

  const getRowShowPath = useMemo(
    () =>
      canOpenShow
        ? (record: EntityRow) => `/entities/show/${encodeURIComponent(String(record.id))}`
        : undefined,
    [canOpenShow],
  );

  const columnDefs = useMemo((): TimciColumnDef<EntityRow>[] => {
    const editColumn: TimciColumnDef<EntityRow> = {
      key: 'actions',
      dataIndex: 'id',
      titleKey: 'table.entities.actions',
      width: 72,
      render: (_: unknown, record: EntityRow) =>
        record.isActive === false ? null : (
        <span data-timci-row-action onClick={(e) => e.stopPropagation()}>
          <EditButton
            resource="entities"
            recordItemId={record.id}
            hideText
            title={translate('table.entities.edit')}
            aria-label={translate('table.entities.edit')}
          />
        </span>
        ),
      exportValue: () => '',
    };

    const cols: TimciColumnDef<EntityRow>[] = [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.entities.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'fantasyName',
        dataIndex: 'fantasyName',
        titleKey: 'table.entities.fantasyName',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => (v != null && String(v) !== '' ? String(v) : '—'),
      },
      {
        key: 'email',
        dataIndex: 'email',
        titleKey: 'table.entities.email',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'phone',
        dataIndex: 'phone',
        titleKey: 'table.entities.phone',
        sorter: true,
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'documentNumber',
        dataIndex: 'documentNumber',
        titleKey: 'table.entities.documentNumber',
        sorter: true,
        filter: { kind: 'text' },
        render: (v: unknown) => (v != null && String(v) !== '' ? String(v) : '—'),
      },
      {
        key: 'documentTypeName',
        dataIndex: 'documentTypeName',
        titleKey: 'table.entities.documentType',
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'personType',
        dataIndex: 'personType',
        titleKey: 'table.entities.personType',
        sorter: true,
        render: (v: unknown) => timciPersonTypeLabel(translate, v),
        exportValue: (r) => timciPersonTypeLabel(translate, r.personType),
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.entities.active',
        sorter: true,
        filter: { kind: 'boolean' },
        render: (v: unknown) =>
          v ? (
            <Tag color="green">{translate('table.entities.yes')}</Tag>
          ) : (
            <Tag color="red">{translate('table.entities.no')}</Tag>
          ),
        exportValue: (r) =>
          r.isActive ? translate('table.entities.yes') : translate('table.entities.no'),
      },
      {
        key: 'address',
        dataIndex: 'address',
        titleKey: 'table.entities.address',
        sorter: true,
        defaultVisible: false,
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.entities.createdAt',
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.entities.updatedAt',
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.entities.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.entities.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];

    return canUpdate ? [editColumn, ...cols] : cols;
  }, [canUpdate, dateFormat, timeZone, translate]);

  return (
    <TimciDataList<EntityRow>
      resource="entities"
      rowKey="id"
      titleKey="pages.entities.title"
      columnDefs={columnDefs}
      requiresTenant
      includeInactive
      pickerDateFormat={dateFormat}
      getRowShowPath={getRowShowPath}
    />
  );
}
