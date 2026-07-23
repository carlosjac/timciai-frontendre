import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form, Input, Tabs } from 'antd';
import { useCallback, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useTimciInactiveEditRedirect } from '../../shared/timci/form/useTimciInactiveEditRedirect.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { PriceListItemsReadonlyTab } from './PriceListItemsReadonlyTab.js';

const PRICE_LIST_EDIT_FIELDS = ['name'] as const;

type PriceListRecord = {
  id?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function PriceListEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'price_lists',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: PRICE_LIST_EDIT_FIELDS,
  });

  const record = query?.data?.data as PriceListRecord | undefined;
  const [activeTab, setActiveTab] = useState('data');

  const showPathForId = useCallback(
    (id: string) => `/price-lists/show/${encodeURIComponent(id)}`,
    [],
  );

  const isRedirectingInactive = useTimciInactiveEditRedirect({
    formLoading,
    record,
    showPathForId,
    warningMessageKey: 'pages.priceLists.inactiveCannotEdit',
  });

  if (!tenantId) {
    return (
      <Edit title={translate('pages.priceLists.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  if (isRedirectingInactive) {
    return <Edit title={translate('pages.priceLists.editTitle')} isLoading />;
  }

  return (
    <Edit
      title={translate('pages.priceLists.editTitle')}
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
              label: translate('pages.priceLists.tabData'),
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
                        await submitRecord(values);
                      } catch (e) {
                        applyServerError(form, e);
                        throw e;
                      }
                    }}
                  >
                    <Form.Item
                      label={translate('table.priceLists.name')}
                      name="name"
                      rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                    >
                      <Input maxLength={255} showCount />
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
              label: translate('pages.priceLists.tabPrices'),
              children:
                tenantId && record?.id ? (
                  <PriceListItemsReadonlyTab entityId={tenantId} priceListId={record.id} />
                ) : (
                  <Alert type="info" showIcon message={translate('pages.priceLists.itemsTabWait')} />
                ),
            },
          ]}
        />
    </Edit>
  );
}
