import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function EntityList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const columnDefs = useMemo((): TimciColumnDef<EntityRow>[] => {
    return [
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
  }, [dateFormat, timeZone, translate]);

  /** Alias evita ambigüedad TSX `<C<T>>` (Vite/esbuild puede romper el módulo y perder exports). */
  const List = TimciDataList<EntityRow>;

  return (
    <List
      resource="entities"
      rowKey="id"
      titleKey="pages.entities.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
    />
  );
}
