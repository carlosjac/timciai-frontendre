import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useInvalidate, usePermissions, useTranslate } from '@refinedev/core';
import { App, Alert, Button, Form, Input, Modal } from 'antd';
import { useCallback, useState } from 'react';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  getCurrencyActivateUrl,
  getCurrencyDeactivateUrl,
} from '../../shared/timci/currenciesApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

const CURRENCY_EDIT_FIELDS = ['code', 'name'] as const;

type CurrencyRecord = {
  id?: string;
  code?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function CurrencyEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { message } = App.useApp();
  const invalidate = useInvalidate();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canActivate = codes.includes('currencies.activate');
  const canDeactivate = codes.includes('currencies.deactivate');

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'currencies',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: CURRENCY_EDIT_FIELDS,
  });

  const record = query?.data?.data as CurrencyRecord | undefined;
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
        ? getCurrencyDeactivateUrl(tenantId, record.id)
        : getCurrencyActivateUrl(tenantId, record.id);
      await timciFetch(url, { method: 'PATCH' });
      message.success(
        record.isActive
          ? translate('pages.currencies.deactivated')
          : translate('pages.currencies.activated'),
      );
      await invalidate({
        resource: 'currencies',
        invalidates: ['list', 'detail'],
        id: record.id,
      });
      await query?.refetch?.();
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : translate('pages.currencies.toggleError'));
    } finally {
      setToggleLoading(false);
    }
  }, [tenantId, record?.id, record?.isActive, invalidate, message, query, translate]);

  if (!tenantId) {
    return (
      <Edit title={translate('pages.currencies.editTitle')}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  const toggleLabel = record?.isActive
    ? translate('pages.currencies.deactivate')
    : translate('pages.currencies.activate');
  const toggleConfirmTitle = record?.isActive
    ? translate('pages.currencies.confirmDeactivateTitle')
    : translate('pages.currencies.confirmActivateTitle');
  const toggleConfirmBody = record?.isActive
    ? translate('pages.currencies.confirmDeactivateBody')
    : translate('pages.currencies.confirmActivateBody');

  return (
    <>
      <Edit
        title={translate('pages.currencies.editTitle')}
        isLoading={formLoading}
        saveButtonProps={saveButtonProps}
        footerButtons={({ saveButtonProps: refineSaveProps }) => (
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
        )}
      >
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
                code: typeof values.code === 'string' ? values.code.trim() : values.code,
                name: typeof values.name === 'string' ? values.name.trim() : values.name,
              });
            } catch (e) {
              applyServerError(form, e);
              throw e;
            }
          }}
        >
          <Form.Item
            label={translate('table.currencies.code')}
            name="code"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input maxLength={3} />
          </Form.Item>
          <Form.Item
            label={translate('table.currencies.name')}
            name="name"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input maxLength={100} />
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
