import { Edit, SaveButton, useForm } from '@refinedev/antd';
import { useInvalidate, usePermissions, useTranslate } from '@refinedev/core';
import { App, Button, Form, Input, Modal } from 'antd';
import { useCallback, useState } from 'react';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import {
  GLOBAL_TENANT_ID,
  getTenantActivateUrl,
  getTenantDeactivateUrl,
} from '../../shared/timci/tenantsApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { TimciFormInactiveRecordBanner } from '../../shared/timci/form/TimciFormInactiveRecordBanner.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

const TENANT_EDIT_FIELDS = ['name'] as const;

type TenantRecord = {
  id?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export function TenantEdit() {
  const translate = useTranslate();
  const { dateFormat, timeZone } = useUserPreferences();
  const { message } = App.useApp();
  const invalidate = useInvalidate();
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canActivate = codes.includes('tenants.activate');
  const canDeactivate = codes.includes('tenants.deactivate');

  const { formProps, saveButtonProps, onFinish: submitRecord, form, query, formLoading } = useForm({
    resource: 'tenants',
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: TENANT_EDIT_FIELDS,
  });

  const record = query?.data?.data as TenantRecord | undefined;
  const isGlobalTenant = record?.id === GLOBAL_TENANT_ID;

  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const showToggle =
    !!record?.id &&
    !isGlobalTenant &&
    ((record.isActive && canDeactivate) || (!record.isActive && canActivate));

  const performActivateDeactivate = useCallback(async () => {
    if (!record?.id) return;
    setToggleLoading(true);
    setToggleOpen(false);
    try {
      const url = record.isActive
        ? getTenantDeactivateUrl(record.id)
        : getTenantActivateUrl(record.id);
      await timciFetch(url, { method: 'PATCH' });
      message.success(
        record.isActive
          ? translate('pages.tenants.deactivated')
          : translate('pages.tenants.activated'),
      );
      await invalidate({
        resource: 'tenants',
        invalidates: ['list', 'detail'],
        id: record.id,
      });
      await query?.refetch?.();
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : translate('pages.tenants.toggleError'));
    } finally {
      setToggleLoading(false);
    }
  }, [record?.id, record?.isActive, invalidate, message, query, translate]);

  const toggleLabel = record?.isActive
    ? translate('pages.tenants.deactivate')
    : translate('pages.tenants.activate');
  const toggleConfirmTitle = record?.isActive
    ? translate('pages.tenants.confirmDeactivateTitle')
    : translate('pages.tenants.confirmActivateTitle');
  const toggleConfirmBody = record?.isActive
    ? translate('pages.tenants.confirmDeactivateBody')
    : translate('pages.tenants.confirmActivateBody');

  return (
    <>
      <Edit
        title={translate('pages.tenants.editTitle')}
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
              await submitRecord(values);
            } catch (e) {
              applyServerError(form, e);
              throw e;
            }
          }}
        >
          <Form.Item
            label={translate('table.tenants.name')}
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
