import { PlusOutlined } from '@ant-design/icons';
import { useSelect } from '@refinedev/antd';
import { useList, useOne, useTranslate } from '@refinedev/core';
import { Button, Card, Col, DatePicker, Form, InputNumber, Row, Select, theme } from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { antdDatePickerLocaleEs } from '../../shared/timci/antdPickerLocaleEs.js';
import { fetchPriceListsForEntity, type PriceListRow } from '../../shared/timci/auxiliaryApi.js';
import { useEntitySupportedCurrencySelect } from '../../shared/timci/useEntitySupportedCurrencySelect.js';
import { MonetaryPolicyDefaultSelect } from '../monetary-policies/MonetaryPolicyDefaultSelect.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import { SubscriptionLineFields } from './SubscriptionLineFields.js';
import { emptySubscriptionLine } from './subscriptionLineSchedule.js';

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
  const { token } = theme.useToken();
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
  const { selectProps: currencySelect, options: currencyOptions } =
    useEntitySupportedCurrencySelect(tenantId);
  const proposedCurrency = useRef<string | null>(null);
  const { result: sellableResult } = useList<SellableRow>({
    resource: 'sellable_items',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const [priceLists, setPriceLists] = useState<PriceListRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchPriceListsForEntity(tenantId, tenantId).then((rows) => {
      if (cancelled) return;
      setPriceLists(rows);
      const current = form.getFieldValue('priceListId');
      const unset = current == null || String(current).trim() === '';
      if (unset && rows.length === 1) {
        form.setFieldValue('priceListId', rows[0]?.id);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [form, tenantId]);

  useEffect(() => {
    if (lockIdentity) return;
    if (currencyOptions.length === 1) {
      const only = currencyOptions[0]?.value;
      if (only) form.setFieldValue('currencyId', only);
      return;
    }
    const customerCurrency = customerRecord?.defaultCurrencyId?.trim();
    if (!customerCurrency) return;
    const current = form.getFieldValue('currencyId');
    const currentText = current == null ? '' : String(current).trim();
    if (currentText === '' || currentText === proposedCurrency.current) {
      form.setFieldValue('currencyId', customerCurrency);
      proposedCurrency.current = customerCurrency;
    }
  }, [currencyOptions, customerRecord?.defaultCurrencyId, form, lockIdentity]);

  const dateItemProps = {
    getValueProps: (value: unknown) => ({
      value: value ? dayjs(String(value).slice(0, 10)) : undefined,
    }),
    normalize: (value: unknown) => (value ? dayjs(value as dayjs.Dayjs).format('YYYY-MM-DD') : undefined),
  };

  return (
    <>
      <Card
        size="small"
        title={translate('pages.subscriptions.header')}
        style={{ marginBottom: 16 }}
        styles={{
          header: {
            background: token.colorFillAlter,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          },
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
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
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={translate('table.subscriptions.currency')}
              name="currencyId"
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Select
                {...currencySelect}
                disabled={lockIdentity || currencyOptions.length === 1}
                aria-label={translate('table.subscriptions.currency')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={translate('table.subscriptions.intervalMonths')}
              name="intervalMonths"
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <InputNumber
                min={1}
                max={60}
                precision={0}
                disabled={lockIdentity}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={translate('table.subscriptions.periodMode')}
              name="periodMode"
              rules={[{ required: true, message: translate('form.validation.requiredField') }]}
            >
              <Select
                disabled={lockIdentity}
                aria-label={translate('table.subscriptions.periodMode')}
                options={PERIOD_MODES.map((mode) => ({
                  value: mode,
                  label: translate(`pages.subscriptions.periodModes.${mode}`),
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
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
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={translate('table.subscriptions.endsOn')} name="endsOn" {...dateItemProps}>
              <DatePicker
                format={pickerDateFormat}
                locale={antdDatePickerLocaleEs}
                style={{ width: '100%' }}
                aria-label={translate('table.subscriptions.endsOn')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
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
          </Col>
          <Col xs={24} md={12}>
            <MonetaryPolicyDefaultSelect
              tenantId={tenantId}
              entityId={tenantId}
              name="monetaryPolicyId"
              labelKey="table.subscriptions.monetaryPolicy"
            />
          </Col>
        </Row>
      </Card>
      <Card
        size="small"
        title={translate('pages.subscriptions.lines')}
        styles={{
          header: {
            background: token.colorPrimaryBg,
            borderBottom: `1px solid ${token.colorPrimaryBorder}`,
          },
          body: { background: token.colorPrimaryBg },
        }}
      >
        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <div>
              {fields.map((field) => (
                <SubscriptionLineFields
                  key={field.key}
                  field={field}
                  form={form}
                  sellableItems={sellableResult?.data ?? []}
                  pickerDateFormat={pickerDateFormat}
                  canRemove={fields.length > 1}
                  onRemove={() => remove(field.name)}
                />
              ))}
              <Button
                type="dashed"
                onClick={() => add({ ...emptySubscriptionLine })}
                icon={<PlusOutlined />}
                block
              >
                {translate('pages.subscriptions.addLine')}
              </Button>
            </div>
          )}
        </Form.List>
      </Card>
    </>
  );
}
