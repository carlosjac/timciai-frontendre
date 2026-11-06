import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelect } from '@refinedev/antd';
import { useList, useOne, useTranslate } from '@refinedev/core';
import { Button, DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { antdDatePickerLocaleEs } from '../../shared/timci/antdPickerLocaleEs.js';
import { fetchPriceListsForEntity, type PriceListRow } from '../../shared/timci/auxiliaryApi.js';
import { MonetaryPolicyDefaultSelect } from '../monetary-policies/MonetaryPolicyDefaultSelect.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';

const PERIOD_MODES = [
  'advance',
  'arrears',
  'advance_single_month',
  'arrears_single_month',
] as const;

type SellableRow = { id: string; name: string };

type Props = {
  form: FormInstance;
  tenantId: string;
  pickerDateFormat: string;
  lockIdentity: boolean;
};

export function SubscriptionFormFields({ form, tenantId, pickerDateFormat, lockIdentity }: Props) {
  const translate = useTranslate();
  const customerId = Form.useWatch('customerId', form) as string | undefined;
  const { selectProps: customerSelectRaw } = useSelect({
    resource: 'customers',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const customerSelect = stripSelectServerSearch(customerSelectRaw);
  const { result: customerRecord } = useOne<{ defaultCurrencyId?: string }>({
    resource: 'customers',
    id: customerId ?? '',
    queryOptions: { enabled: Boolean(customerId) },
    errorNotification: false,
  });
  const { result: currencyRecord } = useOne<{ code?: string }>({
    resource: 'currencies',
    id: customerRecord?.defaultCurrencyId ?? '',
    queryOptions: { enabled: Boolean(customerRecord?.defaultCurrencyId) },
    errorNotification: false,
  });
  const { result: sellableResult } = useList<SellableRow>({
    resource: 'sellable_items',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const [priceLists, setPriceLists] = useState<PriceListRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchPriceListsForEntity(tenantId, tenantId).then((rows) => {
      if (!cancelled) setPriceLists(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const dateItemProps = {
    getValueProps: (value: unknown) => ({
      value: value ? dayjs(String(value).slice(0, 10)) : undefined,
    }),
    normalize: (value: unknown) => (value ? dayjs(value as dayjs.Dayjs).format('YYYY-MM-DD') : undefined),
  };

  return (
    <>
      <Form.Item
        label={translate('table.subscriptions.customer')}
        name="customerId"
        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
      >
        <Select
          {...customerSelect}
          disabled={lockIdentity}
          showSearch
          optionFilterProp="label"
          aria-label={translate('table.subscriptions.customer')}
        />
      </Form.Item>
      <Form.Item label={translate('table.subscriptions.currency')}>
        <Input
          readOnly
          value={currencyRecord?.code ?? ''}
          aria-label={translate('table.subscriptions.currency')}
          placeholder={translate('pages.subscriptions.currencyHint')}
        />
      </Form.Item>
      <Form.Item
        label={translate('table.subscriptions.intervalMonths')}
        name="intervalMonths"
        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
      >
        <InputNumber min={1} max={60} precision={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        label={translate('table.subscriptions.startsOn')}
        name="startsOn"
        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        {...dateItemProps}
      >
        <DatePicker
          format={pickerDateFormat}
          locale={antdDatePickerLocaleEs}
          style={{ width: '100%' }}
          disabled={lockIdentity}
          aria-label={translate('table.subscriptions.startsOn')}
        />
      </Form.Item>
      <Form.Item
        label={translate('table.subscriptions.endsOn')}
        name="endsOn"
        {...dateItemProps}
      >
        <DatePicker
          format={pickerDateFormat}
          locale={antdDatePickerLocaleEs}
          style={{ width: '100%' }}
          aria-label={translate('table.subscriptions.endsOn')}
        />
      </Form.Item>
      <Form.Item
        label={translate('table.subscriptions.periodMode')}
        name="periodMode"
        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
      >
        <Select
          aria-label={translate('table.subscriptions.periodMode')}
          options={PERIOD_MODES.map((mode) => ({
            value: mode,
            label: translate(`pages.subscriptions.periodModes.${mode}`),
          }))}
        />
      </Form.Item>
      <Form.Item
        label={translate('table.subscriptions.priceList')}
        name="priceListId"
        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
      >
        <Select
          showSearch
          optionFilterProp="label"
          aria-label={translate('table.subscriptions.priceList')}
          options={priceLists.map((row) => ({ value: row.id, label: row.name }))}
        />
      </Form.Item>
      <MonetaryPolicyDefaultSelect
        tenantId={tenantId}
        entityId={tenantId}
        name="monetaryPolicyId"
        labelKey="table.subscriptions.monetaryPolicy"
      />
      <Form.List name="lines">
        {(fields, { add, remove }) => (
          <div>
            <div style={{ marginBottom: 8 }}>{translate('pages.subscriptions.lines')}</div>
            {fields.map((field) => (
              <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                <Form.Item
                  name={[field.name, 'sellableItemId']}
                  rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                  style={{ minWidth: 280, marginBottom: 0 }}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    aria-label={translate('table.subscriptions.product')}
                    options={(sellableResult?.data ?? []).map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name={[field.name, 'quantity']}
                  rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                  style={{ width: 140, marginBottom: 0 }}
                >
                  <InputNumber
                    min={0.0001}
                    stringMode
                    style={{ width: '100%' }}
                    aria-label={translate('table.subscriptions.quantity')}
                  />
                </Form.Item>
                {fields.length > 1 ? (
                  <Button
                    type="text"
                    aria-label={translate('buttons.delete')}
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(field.name)}
                  />
                ) : null}
              </Space>
            ))}
            <Button type="dashed" onClick={() => add({ quantity: '1' })} icon={<PlusOutlined />}>
              {translate('pages.subscriptions.addLine')}
            </Button>
          </div>
        )}
      </Form.List>
    </>
  );
}
