import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useInvalidate, usePermissions, useTranslate } from '@refinedev/core';
import { App, Alert, Button, Form, Input, Modal, Select, Tabs } from 'antd';
import { useCallback, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import { timciFetch } from '../../shared/timci/http.js';
import {
  getSellableItemActivateUrl,
  getSellableItemDeactivateUrl,
} from '../../shared/timci/sellableItemsApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
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
  createdByName?: string;
  updatedByName?: string;
};

export function SellableItemEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { message } = App.useApp();
  const invalidate = useInvalidate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canActivate = codes.includes('sellable_items.activate');
  const canDeactivate = codes.includes('sellable_items.deactivate');

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'sellable_items',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: SELLABLE_EDIT_FIELDS,
  });

  const record = query?.data?.data as SellableRecord | undefined;
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
        ? getSellableItemDeactivateUrl(tenantId, record.id)
        : getSellableItemActivateUrl(tenantId, record.id);
      await timciFetch(url, { method: 'POST' });
      message.success(
        record.isActive
          ? translate('pages.sellableItems.deactivated')
          : translate('pages.sellableItems.activated'),
      );
      await invalidate({
        resource: 'sellable_items',
        invalidates: ['list', 'detail'],
        id: record.id,
      });
      await query?.refetch?.();
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : translate('pages.sellableItems.toggleError'));
    } finally {
      setToggleLoading(false);
    }
  }, [tenantId, record?.id, record?.isActive, invalidate, message, query, translate]);

  if (!tenantId) {
    return (
      <Edit title={translate('pages.sellableItems.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  const toggleLabel = record?.isActive
    ? translate('pages.sellableItems.deactivate')
    : translate('pages.sellableItems.activate');
  const toggleConfirmTitle = record?.isActive
    ? translate('pages.sellableItems.confirmDeactivateTitle')
    : translate('pages.sellableItems.confirmActivateTitle');
  const toggleConfirmBody = record?.isActive
    ? translate('pages.sellableItems.confirmDeactivateBody')
    : translate('pages.sellableItems.confirmActivateBody');

  return (
    <>
      <Edit
        title={translate('pages.sellableItems.editTitle')}
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
                      createdByName={record.createdByName}
                      updatedByName={record.updatedByName}
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
      <Modal
        open={toggleOpen}
        title={toggleConfirmTitle}
        okText={toggleLabel}
        okButtonProps={{ danger: record?.isActive, loading: toggleLoading }}
        cancelText={translate('buttons.cancel')}
        onCancel={() => setToggleOpen(false)}
        onOk={() => void performActivateDeactivate()}
        destroyOnHidden
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
