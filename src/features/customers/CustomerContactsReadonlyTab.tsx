import { useTimciDescriptionStyles } from '../../shared/timci/descriptionLayout.js';
import { useTranslate } from '@refinedev/core';
import { Descriptions, Empty, Pagination, Tag, Typography } from 'antd';
import { useState } from 'react';

export type CustomerContactView = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  notifySales?: boolean;
  notifyCreditos?: boolean;
  notifyDebits?: boolean;
  notifyCollections?: boolean;
  notifyOverduePayments?: boolean;
};

export type CustomerContactsReadonlyTabProps = {
  contacts?: CustomerContactView[] | null;
};

function yesNo(translate: (k: string) => string, v: boolean | undefined) {
  return v ? (
    <Tag color="green">{translate('table.users.yes')}</Tag>
  ) : (
    <Tag>{translate('table.users.no')}</Tag>
  );
}

export function CustomerContactsReadonlyTab({ contacts }: CustomerContactsReadonlyTabProps) {
  const translate = useTranslate();
  const descriptionStyles = useTimciDescriptionStyles();
  const list = contacts ?? [];
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const visible = list.slice((page - 1) * pageSize, page * pageSize);

  if (list.length === 0) {
    return <Empty description={translate('pages.customers.contactsEmpty')} />;
  }

  return (
    <>
      {visible.map((c, index) => {
        const ordinal = (page - 1) * pageSize + index;
        return (
        <div
          key={c.id ?? `contact-${ordinal}`}
          style={{
            marginBottom: 16,
            padding: 16,
            border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
            borderRadius: 8,
          }}
        >
          <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
            {c.name?.trim() || translate('pages.customers.contactFallback', { n: String(ordinal + 1) })}
          </Typography.Text>
          <Descriptions
            bordered
            column={1}
            size="small"
            styles={descriptionStyles}
          >
            <Descriptions.Item label={translate('create.customer.contactName')}>
              {c.name?.trim() || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.customer.contactEmail')}>
              {c.email?.trim() || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.customer.contactPhone')}>
              {c.phone?.trim() || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.customer.notifySales')}>
              {yesNo(translate, c.notifySales)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.customer.notifyCreditos')}>
              {yesNo(translate, c.notifyCreditos)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.customer.notifyDebits')}>
              {yesNo(translate, c.notifyDebits)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.customer.notifyCollections')}>
              {yesNo(translate, c.notifyCollections)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('create.customer.notifyOverduePayments')}>
              {yesNo(translate, c.notifyOverduePayments)}
            </Descriptions.Item>
          </Descriptions>
        </div>
        );
      })}
      {list.length > pageSize ? (
        <Pagination
          current={page}
          pageSize={pageSize}
          total={list.length}
          showSizeChanger={false}
          onChange={setPage}
        />
      ) : null}
    </>
  );
}
