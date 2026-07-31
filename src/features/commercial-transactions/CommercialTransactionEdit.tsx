import { Edit, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form } from 'antd';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { App as AntdApp } from 'antd';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  commercialTransactionShowPath,
  type CommercialTransactionResource,
} from '../../shared/timci/commercialTransactionsApi.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { CommercialTransactionFormFields } from './CommercialTransactionFormFields.js';
import { COMMERCIAL_TX_CONFIG, type CommercialTransactionRecord } from './types.js';

type Props = {
  resource: CommercialTransactionResource;
};

export function CommercialTransactionEdit({ resource }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const { dateFormat } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const config = COMMERCIAL_TX_CONFIG[resource];

  const { formProps, saveButtonProps, onFinish, form, query, formLoading } = useForm({
    resource,
    action: 'edit',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors();
  const record = query?.data?.data as CommercialTransactionRecord | undefined;

  const showPathForId = useCallback(
    (id: string) => commercialTransactionShowPath(resource, id),
    [resource],
  );

  useEffect(() => {
    if (formLoading || !record?.id) return;
    if (record.status === 'draft') return;
    message.warning(translate('pages.commercialTransactions.onlyDraftCanEdit'));
    navigate(showPathForId(String(record.id)), { replace: true });
  }, [formLoading, message, navigate, record, showPathForId, translate]);

  if (!tenantId) {
    return (
      <Edit title={translate(`${config.i18nPagesPrefix}.editTitle`)}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Edit>
    );
  }

  if (record && record.status !== 'draft') {
    return <Edit title={translate(`${config.i18nPagesPrefix}.editTitle`)} isLoading />;
  }

  return (
    <Edit
      title={translate(`${config.i18nPagesPrefix}.editTitle`)}
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
    >
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await onFinish(values);
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <CommercialTransactionFormFields
          resource={resource}
          tenantId={tenantId}
          lockCustomer
          pickerDateFormat={dateFormat}
        />
      </Form>
    </Edit>
  );
}
