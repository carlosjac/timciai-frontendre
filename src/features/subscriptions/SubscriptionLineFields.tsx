import { MinusCircleOutlined } from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';
import { Button, Card, Checkbox, DatePicker, Form, Input, InputNumber, Select, Typography, theme } from 'antd';
import type { FormInstance } from 'antd';
import type { FormListFieldData } from 'antd/es/form';
import dayjs from 'dayjs';
import { useState } from 'react';
import { antdDatePickerLocaleEs } from '../../shared/timci/antdPickerLocaleEs.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import { formatTimciUserDateOnly } from '../../shared/timci/formatUserDateTime.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import {
  lineBillingPreview,
  lineExtrasDiffer,
  subscriptionAnchorInMonth,
} from './subscriptionLineSchedule.js';

type SellableRow = { id: string; name: string };

type Props = {
  field: FormListFieldData;
  form: FormInstance;
  sellableItems: SellableRow[];
  pickerDateFormat: string;
  canRemove: boolean;
  onRemove: () => void;
};

function yesNo(
  value: boolean | undefined,
  translate: (key: string) => string,
): string {
  return value === false ? translate('table.users.no') : translate('table.users.yes');
}

export function SubscriptionLineFields({
  field,
  form,
  sellableItems,
  pickerDateFormat,
  canRemove,
  onRemove,
}: Props) {
  const translate = useTranslate();
  const { token } = theme.useToken();
  const { timeZone } = useUserPreferences();
  const startsOn = Form.useWatch('startsOn', form) as string | undefined;
  const endsOn = Form.useWatch('endsOn', form) as string | null | undefined;
  const intervalMonths = Form.useWatch('intervalMonths', form) as number | undefined;
  const line = Form.useWatch(['lines', field.name], form) as
    | {
        description?: string | null;
        discountPercent?: string | number | null;
        startsOn?: string | null;
        endsOn?: string | null;
        includeSellableItemName?: boolean;
        includeDescription?: boolean;
        includePeriod?: boolean;
      }
    | undefined;
  const [open, setOpen] = useState(false);
  const expanded = open || lineExtrasDiffer(line);

  const dateItemProps = {
    getValueProps: (value: unknown) => ({
      value: value ? dayjs(String(value).slice(0, 10)) : undefined,
    }),
    normalize: (value: unknown) => {
      if (!value) return undefined;
      const anchor = subscriptionAnchorInMonth(
        startsOn,
        Number(intervalMonths),
        endsOn,
        dayjs(value as dayjs.Dayjs),
      );

      return anchor ?? undefined;
    },
  };

  const preview = lineBillingPreview({
    startsOn,
    intervalMonths: intervalMonths == null ? undefined : Number(intervalMonths),
    endsOn,
    lineStartsOn: line?.startsOn,
    lineEndsOn: line?.endsOn,
  });
  const previewDates = preview.dates
    .map((date) => formatTimciUserDateOnly(date, { dateFormat: pickerDateFormat, timeZone }))
    .join(', ');
  const previewText = !startsOn
    ? translate('pages.subscriptions.lineBillingNeedsStart')
    : preview.dates.length === 0
      ? translate('pages.subscriptions.lineBillingNone')
      : preview.continues
        ? translate('pages.subscriptions.lineBillingContinues', { dates: previewDates })
        : translate('pages.subscriptions.lineBillingDates', { dates: previewDates });

  const untilLabel = line?.endsOn
    ? formatTimciUserDateOnly(line.endsOn, { dateFormat: pickerDateFormat, timeZone })
    : endsOn
      ? translate('pages.subscriptions.untilSubscriptionEnd')
      : translate('pages.subscriptions.noEndLine');
  const fromLabel = line?.startsOn
    ? formatTimciUserDateOnly(line.startsOn, { dateFormat: pickerDateFormat, timeZone })
    : translate('pages.subscriptions.firstBilling');
  const discountRaw =
    line?.discountPercent == null || String(line.discountPercent).trim() === ''
      ? 0
      : line.discountPercent;
  const discountFormatted = formatTimciMoney(discountRaw);
  const discountLabel = discountFormatted === '—' ? '—' : `${discountFormatted}%`;

  const summary: Array<[string, string]> = [
    ['pages.subscriptions.lineDescription', (line?.description ?? '').trim() || '—'],
    ['pages.subscriptions.lineDiscount', discountLabel],
    ['pages.subscriptions.lineStartsOn', fromLabel],
    ['pages.subscriptions.lineEndsOn', untilLabel],
    [
      'pages.subscriptions.includeSellableItemName',
      yesNo(line?.includeSellableItemName, translate),
    ],
    ['pages.subscriptions.includeDescription', yesNo(line?.includeDescription, translate)],
    ['pages.subscriptions.includePeriod', yesNo(line?.includePeriod, translate)],
  ];

  return (
    <Card
      size="small"
      title={translate('pages.subscriptions.lineN', { n: String(field.name + 1) })}
      style={{ marginBottom: 12, background: token.colorBgContainer }}
      styles={{
        header: { background: token.colorBgContainer },
        body: { background: token.colorBgContainer },
      }}
      extra={
        canRemove ? (
          <Button
            type="text"
            aria-label={translate('buttons.delete')}
            icon={<MinusCircleOutlined />}
            onClick={onRemove}
          />
        ) : null
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%' }}>
        <Form.Item
          name={[field.name, 'quantity']}
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          style={{ flex: '0 0 120px', width: 120, marginBottom: 0 }}
        >
          <InputNumber
            min={0.0001}
            stringMode
            style={{ width: '100%' }}
            aria-label={translate('table.subscriptions.quantity')}
          />
        </Form.Item>
        <Form.Item
          name={[field.name, 'sellableItemId']}
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          style={{ flex: '1 1 auto', minWidth: 0, marginBottom: 0 }}
        >
          <Select
            showSearch
            optionFilterProp="label"
            style={{ width: '100%' }}
            aria-label={translate('table.subscriptions.product')}
            options={sellableItems.map((item) => ({ value: item.id, label: item.name }))}
          />
        </Form.Item>
      </div>
      {expanded ? null : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: '4px 16px',
            marginTop: 8,
          }}
        >
          {summary.map(([labelKey, value]) => (
            <span key={labelKey}>
              <Typography.Text type="secondary">{translate(labelKey)}</Typography.Text>
              {': '}
              <Typography.Text>{value}</Typography.Text>
            </span>
          ))}
          <Button type="link" onClick={() => setOpen(true)} style={{ paddingInline: 0, height: 'auto' }}>
            {translate('pages.subscriptions.changeLineOptions')}
          </Button>
        </div>
      )}
      <div hidden={!expanded}>
        <Form.Item
          label={translate('pages.subscriptions.lineDescription')}
          name={[field.name, 'description']}
          style={{ marginTop: 8 }}
        >
          <Input maxLength={500} aria-label={translate('pages.subscriptions.lineDescription')} />
        </Form.Item>
        <Form.Item
          label={translate('pages.subscriptions.lineDiscount')}
          name={[field.name, 'discountPercent']}
          rules={[
            {
              validator: async (_, value: unknown) => {
                if (value == null || String(value).trim() === '') return;
                const n = Number(String(value).trim().replace(',', '.'));
                if (!Number.isFinite(n) || n < 0 || n > 100) {
                  throw new Error(translate('pages.subscriptions.lineDiscountRange'));
                }
              },
            },
          ]}
        >
          <InputNumber
            min={0}
            max={100}
            stringMode
            style={{ width: '100%' }}
            aria-label={translate('pages.subscriptions.lineDiscount')}
          />
        </Form.Item>
        <Form.Item
          label={translate('pages.subscriptions.lineStartsOn')}
          name={[field.name, 'startsOn']}
          {...dateItemProps}
        >
          <DatePicker
            picker="month"
            format={pickerDateFormat}
            locale={antdDatePickerLocaleEs}
            style={{ width: '100%' }}
            aria-label={translate('pages.subscriptions.lineStartsOn')}
            disabledDate={(current) =>
              !current || !subscriptionAnchorInMonth(startsOn, Number(intervalMonths), endsOn, current)
            }
          />
        </Form.Item>
        <Form.Item
          label={translate('pages.subscriptions.lineEndsOn')}
          name={[field.name, 'endsOn']}
          {...dateItemProps}
        >
          <DatePicker
            picker="month"
            format={pickerDateFormat}
            locale={antdDatePickerLocaleEs}
            style={{ width: '100%' }}
            aria-label={translate('pages.subscriptions.lineEndsOn')}
            disabledDate={(current) =>
              !current || !subscriptionAnchorInMonth(startsOn, Number(intervalMonths), endsOn, current)
            }
          />
        </Form.Item>
        <Form.Item
          name={[field.name, 'includeSellableItemName']}
          valuePropName="checked"
          style={{ marginBottom: 8 }}
        >
          <Checkbox>{translate('pages.subscriptions.includeSellableItemName')}</Checkbox>
        </Form.Item>
        <Form.Item
          name={[field.name, 'includeDescription']}
          valuePropName="checked"
          style={{ marginBottom: 8 }}
        >
          <Checkbox>{translate('pages.subscriptions.includeDescription')}</Checkbox>
        </Form.Item>
        <Form.Item name={[field.name, 'includePeriod']} valuePropName="checked" style={{ marginBottom: 8 }}>
          <Checkbox>{translate('pages.subscriptions.includePeriod')}</Checkbox>
        </Form.Item>
      </div>
      <Typography.Text type="secondary">{previewText}</Typography.Text>
    </Card>
  );
}
