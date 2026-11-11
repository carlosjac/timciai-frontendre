import { Create, useForm } from '@refinedev/antd';
import { useTranslate } from '@refinedev/core';
import { Alert, Form } from 'antd';
import dayjs from 'dayjs';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import type { CommercialTransactionResource } from '../../shared/timci/commercialTransactionsApi.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { CommercialTransactionFormFields } from './CommercialTransactionFormFields.js';
import { COMMERCIAL_TX_CONFIG } from './types.js';

type Props = {
  resource: CommercialTransactionResource;
};

export function CommercialTransactionCreate({ resource }: Props) {
  const translate = useTranslate();
  const { dateFormat } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const config = COMMERCIAL_TX_CONFIG[resource];
  const { formProps, saveButtonProps, onFinish, form } = useForm({
    errorNotification: false,
    resource,
    redirect: 'show',
  });
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors();

  if (!tenantId) {
    return (
      <Create title={translate(`${config.i18nPagesPrefix}.create`)}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Create>
    );
  }

  return (
    <Create title={translate(`${config.i18nPagesPrefix}.create`)} saveButtonProps={saveButtonProps}>
      <TimciFormServerAlert messages={generalMessages} />
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          transactionDate: dayjs().format('YYYY-MM-DD'),
          fxRateManual: false,
          items: resource === 'sales' ? [{ quantity: '1', discountPercent: '0' }] : undefined,
          allocations: [],
        }}
        onFinish={async (values: Record<string, unknown>) => {
          clearServerErrors(form);
          try {
            await onFinish({
              ...values,
              entityId: tenantId,
            });
          } catch (e) {
            applyServerError(form, e);
            throw e;
          }
        }}
      >
        <CommercialTransactionFormFields
          resource={resource}
          tenantId={tenantId}
          pickerDateFormat={dateFormat}
        />
      </Form>
    </Create>
  );
}
