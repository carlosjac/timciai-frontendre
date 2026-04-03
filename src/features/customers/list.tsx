import { useMemo } from 'react';
import { useTranslate, type BaseRecord } from '@refinedev/core';
import { Tag } from 'antd';
import { TimciDataList } from '../../shared/timci/list/ui/TimciDataList.js';
import type { TimciColumnDef } from '../../shared/timci/list/domain/timci-column-def.js';
import { TIMCI_LIST_SORT_BY_AUDIT_USER_NAME } from '../../shared/timci/list/domain/timci-audit-list-sort-fields.js';
import { timciPersonTypeLabel } from '../../shared/timci/personTypeLabel.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { formatTimciUserDateTime } from '../../shared/timci/formatUserDateTime.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

type CustomerRow = BaseRecord & {
  name: string;
  documentNumber: string;
  isActive?: boolean;
  countryName?: string;
  documentTypeName?: string;
  personType?: string;
  priceListName?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function CustomerList() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();

  const columnDefs = useMemo((): TimciColumnDef<CustomerRow>[] => {
    return [
      {
        key: 'name',
        dataIndex: 'name',
        titleKey: 'table.customers.name',
        sorter: true,
        filter: { kind: 'text' },
      },
      {
        key: 'documentNumber',
        dataIndex: 'documentNumber',
        titleKey: 'table.customers.document',
        sorter: true,
      },
      {
        key: 'documentTypeName',
        dataIndex: 'documentTypeName',
        titleKey: 'table.customers.documentType',
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'countryName',
        dataIndex: 'countryName',
        titleKey: 'table.customers.country',
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'personType',
        dataIndex: 'personType',
        titleKey: 'table.customers.personType',
        sorter: true,
        render: (v: unknown) => timciPersonTypeLabel(translate, v),
        exportValue: (r) => timciPersonTypeLabel(translate, r.personType),
      },
      {
        key: 'priceListName',
        dataIndex: 'priceListName',
        titleKey: 'table.customers.priceList',
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'address',
        dataIndex: 'address',
        titleKey: 'table.customers.address',
        sorter: true,
        defaultVisible: false,
        render: (v: unknown) => (typeof v === 'string' && v ? v : '—'),
      },
      {
        key: 'isActive',
        dataIndex: 'isActive',
        titleKey: 'table.customers.active',
        filter: { kind: 'boolean' },
        render: (v: unknown) =>
          v ? (
            <Tag color="green">{translate('table.users.yes')}</Tag>
          ) : (
            <Tag>{translate('table.users.no')}</Tag>
          ),
        exportValue: (r) => (r.isActive ? translate('table.users.yes') : translate('table.users.no')),
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        titleKey: 'table.customers.createdAt',
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        titleKey: 'table.customers.updatedAt',
        filter: { kind: 'date' },
        defaultVisible: false,
        render: (v: unknown) => formatTimciUserDateTime(v, { dateFormat, timeZone }),
      },
      {
        key: 'createdBy',
        dataIndex: 'createdBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.createdBy,
        titleKey: 'table.customers.createdByName',
        sorter: true,
        defaultVisible: false,
      },
      {
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        sortField: TIMCI_LIST_SORT_BY_AUDIT_USER_NAME.updatedBy,
        titleKey: 'table.customers.updatedByName',
        sorter: true,
        defaultVisible: false,
      },
    ];
  }, [dateFormat, timeZone, translate]);

  return (
    <TimciDataList<CustomerRow>
      resource="customers"
      rowKey="id"
      titleKey="pages.customers.title"
      columnDefs={columnDefs}
      requiresTenant
      pickerDateFormat={dateFormat}
    />
  );
}
