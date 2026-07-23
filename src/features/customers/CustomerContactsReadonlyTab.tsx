import { useTranslate } from '@refinedev/core';
import { Descriptions, Empty, Tag, Typography } from 'antd';

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
  const list = contacts ?? [];

  if (list.length === 0) {
    return <Empty description={translate('pages.customers.contactsEmpty')} />;
  }

  return (
    <>
      {list.map((c, index) => (
        <div
          key={c.id ?? `contact-${index}`}
          style={{
            marginBottom: 16,
            padding: 16,
            border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
            borderRadius: 8,
          }}
        >
          <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
            {c.name?.trim() || translate('pages.customers.contactFallback', { n: String(index + 1) })}
          </Typography.Text>
          <Descriptions
            bordered
            column={1}
            size="small"
            styles={{ label: { width: 220, maxWidth: 280, verticalAlign: 'top' } }}
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
      ))}
    </>
  );
}
