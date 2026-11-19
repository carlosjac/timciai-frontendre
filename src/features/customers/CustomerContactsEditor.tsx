import { useTranslate } from '@refinedev/core';
import { Button, Form, Input, Pagination, Space, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  getCustomerReplaceContactsUrl,
  mapContactsForReplace,
  type CustomerContactInput,
} from '../../shared/timci/customersApi.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { timciFetch } from '../../shared/timci/http.js';
import type { CustomerContactView } from './CustomerContactsReadonlyTab.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

const CONTACT_FIELDS = [
  'name',
  'email',
  'phone',
  'notifySales',
  'notifyCreditos',
  'notifyDebits',
  'notifyCollections',
  'notifyOverduePayments',
] as const;

const emptyContactRow = (): CustomerContactInput => ({
  name: '',
  email: '',
  phone: '',
  notifySales: true,
  notifyCreditos: true,
  notifyDebits: true,
  notifyCollections: true,
  notifyOverduePayments: true,
});

export type CustomerContactsEditorProps = {
  customerId: string;
  contacts?: CustomerContactView[] | null;
  onSaved?: () => void | Promise<void>;
};

export function CustomerContactsEditor({
  customerId,
  contacts,
  onSaved,
}: CustomerContactsEditorProps) {
  const translate = useTranslate();
  const notify = useTimciNotify();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [contactPage, setContactPage] = useState(1);
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CONTACT_FIELDS,
  });

  useEffect(() => {
    const rows =
      Array.isArray(contacts) && contacts.length > 0
        ? contacts.map((c) => ({
            id: c.id,
            name: c.name ?? '',
            email: c.email ?? '',
            phone: c.phone ?? '',
            notifySales: c.notifySales === true,
            notifyCreditos: c.notifyCreditos === true,
            notifyDebits: c.notifyDebits === true,
            notifyCollections: c.notifyCollections === true,
            notifyOverduePayments: c.notifyOverduePayments === true,
          }))
        : [emptyContactRow()];
    form.setFieldsValue({ contacts: rows });
    clearServerErrors(form);
  }, [contacts, form, clearServerErrors, customerId]);

  const onSave = async () => {
    const tenantId = getStoredTenantId();
    if (!tenantId) {
      notify.warning(translate('tenant.selectFirst'));
      return;
    }
    try {
      const values = await form.validateFields();
      const stored = form.getFieldsValue(true) as { contacts?: unknown };
      clearServerErrors(form);
      setSaving(true);
      const body = { contacts: mapContactsForReplace(stored.contacts ?? values.contacts) };
      await timciFetch(getCustomerReplaceContactsUrl(tenantId, customerId), {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      notify.success(translate('notifications.success'));
      await onSaved?.();
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      applyServerError(form, e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TimciFormServerAlert messages={generalMessages} />
      <Form form={form} layout="vertical">
        <Form.List
          name="contacts"
          rules={[
            {
              validator: async (_, value) => {
                if (!Array.isArray(value) || value.length < 1) {
                  return Promise.reject(new Error(translate('create.customer.contactsMinOne')));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove, move }, { errors }) => {
            const pageSize = 25;
            const pageCount = Math.max(1, Math.ceil(fields.length / pageSize));
            const page = Math.min(contactPage, pageCount);
            const visible = fields.slice((page - 1) * pageSize, page * pageSize);
            return (
            <>
              {visible.map((field) => {
                const { key, name: rowName, ...restField } = field;
                const index = Number(rowName);
                return (
                  <div
                    key={key}
                    style={{
                      marginBottom: 16,
                      padding: 16,
                      border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
                      borderRadius: 8,
                    }}
                  >
                    <Form.Item {...restField} name={[rowName, 'id']} hidden>
                      <Input />
                    </Form.Item>
                    <Space wrap style={{ marginBottom: 12 }}>
                      <Button
                        type="default"
                        htmlType="button"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      >
                        {translate('create.customer.moveContactUp')}
                      </Button>
                      <Button
                        type="default"
                        htmlType="button"
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      >
                        {translate('create.customer.moveContactDown')}
                      </Button>
                      <Button
                        type="default"
                        htmlType="button"
                        danger
                        disabled={fields.length <= 1}
                        onClick={() => remove(rowName)}
                      >
                        {translate('create.customer.removeContact')}
                      </Button>
                    </Space>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'name']}
                      label={translate('create.customer.contactName')}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input maxLength={120} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'email']}
                      label={translate('create.customer.contactEmail')}
                      rules={[
                        { required: true, message: translate('form.validation.requiredField') },
                        { type: 'email', message: translate('pages.login.errors.validEmail') },
                      ]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input type="email" autoComplete="off" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'phone']}
                      label={translate('create.customer.contactPhone')}
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifySales']}
                      label={translate('create.customer.notifySales')}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifyCreditos']}
                      label={translate('create.customer.notifyCreditos')}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifyDebits']}
                      label={translate('create.customer.notifyDebits')}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifyCollections']}
                      label={translate('create.customer.notifyCollections')}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[rowName, 'notifyOverduePayments']}
                      label={translate('create.customer.notifyOverduePayments')}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </div>
                );
              })}
              {fields.length > pageSize ? (
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={fields.length}
                  showSizeChanger={false}
                  onChange={setContactPage}
                  style={{ marginBottom: 8 }}
                />
              ) : null}
              <Button
                type="dashed"
                htmlType="button"
                onClick={() => {
                  add(emptyContactRow());
                  setContactPage(Math.ceil((fields.length + 1) / pageSize));
                }}
                block
                style={{ marginBottom: 8 }}
              >
                {translate('create.customer.addContact')}
              </Button>
              <Form.ErrorList errors={errors} />
            </>
            );
          }}
        </Form.List>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button type="primary" loading={saving} onClick={() => void onSave()}>
            {translate('pages.customers.saveContacts')}
          </Button>
        </div>
      </Form>
    </>
  );
}
