import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input, Select, Tabs } from 'antd';
import { useCallback, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useTimciInactiveEditRedirect } from '../../shared/timci/form/useTimciInactiveEditRedirect.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { SELLABLE_ITEM_KINDS } from './kindChoices.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { SellableItemPricesTab } from './SellableItemPricesTab.js';

const SELLABLE_EDIT_FIELDS = ['kind', 'name', 'code', 'description'] as const;

type SellableRecord = {
  id?: string;
  name?: string;
  kind?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function SellableItemEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'sellable_items',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: SELLABLE_EDIT_FIELDS,
  });

  const record = query?.data?.data as SellableRecord | undefined;
  const [activeTab, setActiveTab] = useState('data');

  const showPathForId = useCallback(
    (id: string) => `/sellable-items/show/${encodeURIComponent(id)}`,
    [],
  );

  const isRedirectingInactive = useTimciInactiveEditRedirect({
    formLoading,
    record,
    showPathForId,
    warningMessageKey: 'pages.sellableItems.inactiveCannotEdit',
  });

  if (!tenantId) {
    return (
      <Edit title={translate('pages.sellableItems.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  if (isRedirectingInactive) {
    return <Edit title={translate('pages.sellableItems.editTitle')} isLoading />;
  }

  return (
    <Edit
      title={translate('pages.sellableItems.editTitle')}
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      footerButtons={
        activeTab === 'data'
          ? ({ saveButtonProps: refineSaveProps }) => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <SaveButton {...refineSaveProps} />
              </div>
            )
          : () => null
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'data',
            label: translate('pages.sellableItems.tabData'),
            children: (
              <>
                <TimciFormServerAlert messages={generalMessages} />
                <TimciFormInactiveRecordBanner isActive={record?.isActive} />
                <Form
                  {...formProps}
                  layout="vertical"
                  onFinish={async (values: Record<string, unknown>) => {
                    clearServerErrors(form);
                    try {
                      await submitRecord({
                        ...values,
                        kind: values.kind === 'Service' ? 'Service' : 'Product',
                      });
                    } catch (e) {
                      applyServerError(form, e);
                      throw e;
                    }
                  }}
                >
                  <Form.Item
                    label={translate('table.sellableItems.kind')}
                    name="kind"
                    rules={[
                      { required: true, message: translate('form.validation.requiredField') },
                    ]}
                  >
                    <Select
                      options={SELLABLE_ITEM_KINDS.map((k) => ({
                        value: k.value,
                        label: translate(k.titleKey),
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    label={translate('table.sellableItems.name')}
                    name="name"
                    rules={[
                      { required: true, message: translate('form.validation.requiredField') },
                    ]}
                  >
                    <Input maxLength={255} showCount />
                  </Form.Item>
                  <Form.Item label={translate('table.sellableItems.code')} name="code">
                    <Input maxLength={64} showCount />
                  </Form.Item>
                  <Form.Item label={translate('table.sellableItems.description')} name="description">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Form>
                {record && (
                  <TimciFormAuditCollapse
                    dateFormat={dateFormat}
                    timeZone={timeZone}
                    createdAt={record.createdAt}
                    updatedAt={record.updatedAt}
                    createdBy={record.createdBy}
                    updatedBy={record.updatedBy}
                  />
                )}
              </>
            ),
          },
          {
            key: 'prices',
            label: translate('pages.sellableItems.tabPrices'),
            children:
              tenantId && record?.id ? (
                <SellableItemPricesTab
                  entityId={tenantId}
                  sellableItemId={record.id}
                  sellableName={record.name}
                />
              ) : (
                <Alert type="info" showIcon message={translate('pages.sellableItems.pricesTabWait')} />
              ),
          },
        ]}
      />
    </Edit>
  );
}
