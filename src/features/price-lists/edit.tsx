import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useInvalidate, usePermissions, useTranslate } from '@refinedev/core';
import { App, Alert, Button, Form, Input, Modal, Tabs } from 'antd';
import { useCallback, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';
import {
  getPriceListActivateUrl,
  getPriceListDeactivateUrl,
} from '../../shared/timci/priceListsApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { PriceListItemsReadonlyTab } from './PriceListItemsReadonlyTab.js';

const PRICE_LIST_EDIT_FIELDS = ['name'] as const;

type PriceListRecord = {
  id?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdByName?: string;
  updatedByName?: string;
};

export function PriceListEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { message } = App.useApp();
  const invalidate = useInvalidate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canActivate = codes.includes('price_lists.activate');
  const canDeactivate = codes.includes('price_lists.deactivate');

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'price_lists',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: PRICE_LIST_EDIT_FIELDS,
  });

  const record = query?.data?.data as PriceListRecord | undefined;
  const [activeTab, setActiveTab] = useState('data');
  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const showToggle =
    !!record?.id &&
    ((record.isActive && canDeactivate) || (!record.isActive && canActivate));

  const performActivateDeactivate = useCallback(async () => {
    if (!tenantId || !record?.id) return;
    setToggleLoading(true);
    setToggleOpen(false);
    try {
      const url = record.isActive
        ? getPriceListDeactivateUrl(tenantId, record.id)
        : getPriceListActivateUrl(tenantId, record.id);
      await timciFetch(url, { method: 'POST' });
      message.success(
        record.isActive
          ? translate('pages.priceLists.deactivated')
          : translate('pages.priceLists.activated'),
      );
      await invalidate({
        resource: 'price_lists',
        invalidates: ['list', 'detail'],
        id: record.id,
      });
      await query?.refetch?.();
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : translate('pages.priceLists.toggleError'));
    } finally {
      setToggleLoading(false);
    }
  }, [tenantId, record?.id, record?.isActive, invalidate, message, query, translate]);

  if (!tenantId) {
    return (
      <Edit title={translate('pages.priceLists.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  const toggleLabel = record?.isActive
    ? translate('pages.priceLists.deactivate')
    : translate('pages.priceLists.activate');
  const toggleConfirmTitle = record?.isActive
    ? translate('pages.priceLists.confirmDeactivateTitle')
    : translate('pages.priceLists.confirmActivateTitle');
  const toggleConfirmBody = record?.isActive
    ? translate('pages.priceLists.confirmDeactivateBody')
    : translate('pages.priceLists.confirmActivateBody');

  return (
    <>
      <Edit
        title={translate('pages.priceLists.editTitle')}
        isLoading={formLoading}
        saveButtonProps={saveButtonProps}
        footerButtons={
          activeTab === 'data'
            ? ({ saveButtonProps: refineSaveProps }) => (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    width: '100%',
                    columnGap: 24,
                    rowGap: 12,
                  }}
                >
                  {showToggle && (
                    <Button
                      type={record?.isActive ? 'default' : 'primary'}
                      danger={record?.isActive}
                      loading={toggleLoading}
                      onClick={() => setToggleOpen(true)}
                      style={{ marginRight: 'auto' }}
                    >
                      {toggleLabel}
                    </Button>
                  )}
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
                      createdByName={record.createdByName}
                      updatedByName={record.updatedByName}
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
      <Modal
        open={toggleOpen}
        title={toggleConfirmTitle}
        okText={toggleLabel}
        okButtonProps={{ danger: record?.isActive, loading: toggleLoading }}
        cancelText={translate('buttons.cancel')}
        onCancel={() => setToggleOpen(false)}
        onOk={() => void performActivateDeactivate()}
        destroyOnClose
      >
        <p>
          {record?.name != null && record.name !== '' ? (
            <>
              <strong>«{record.name}»</strong>
              <br />
            </>
          ) : null}
          {toggleConfirmBody}
        </p>
      </Modal>
    </>
  );
}
