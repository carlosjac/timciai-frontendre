import { useCreate, useInvalidate, useList, useOne, useTranslate, useUpdate } from '@refinedev/core';
import { App, Button, DatePicker, Drawer, Form, Input, Select, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { antdDatePickerLocaleEs } from '../../shared/timci/antdPickerLocaleEs.js';
import { TimciFormServerAlert } from '../../shared/timci/form/TimciFormServerAlert.js';
import { useTimciFormServerErrors } from '../../shared/timci/form/useTimciFormServerErrors.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';

const CREATE_FIELDS = ['currencyId', 'unitPriceAmount', 'validFrom', 'validTo'] as const;
const EDIT_FIELDS = ['currencyId', 'unitPriceAmount', 'validFrom', 'validTo'] as const;

export type SellableItemPriceDrawerProps = {
  open: boolean;
  onClose: () => void;
  priceListId: string;
  entityId: string;
  sellableItemId: string;
  sellableLabel?: string;
  editingId?: string | null;
};

function toApiDate(v: Dayjs | null | undefined): string | null {
  if (v == null || !v.isValid()) return null;
  return v.format('YYYY-MM-DD');
}

export function SellableItemPriceDrawer({
  open,
  onClose,
  priceListId,
  entityId,
  sellableItemId,
  sellableLabel,
  editingId,
}: SellableItemPriceDrawerProps) {
  const translate = useTranslate();
  const { message } = App.useApp();
  const { dateFormat } = useUserPreferences();
  const [form] = Form.useForm();
  const invalidate = useInvalidate();
  const isEdit = Boolean(editingId);

  const { result: record, query: oneQuery } = useOne({
    resource: 'price_list_items',
    id: editingId ?? '',
    queryOptions: { enabled: open && isEdit },
  });
  const oneLoading = oneQuery.isFetching;

  const { mutateAsync: createMut } = useCreate();
  const { mutateAsync: updateMut } = useUpdate();

  const fieldNames = isEdit ? EDIT_FIELDS : CREATE_FIELDS;
  const { generalMessages, clearServerErrors, applyServerError } = useTimciFormServerErrors({
    formFieldNames: fieldNames as unknown as readonly string[],
  });

  const { query: currenciesQuery, result: currenciesResult } = useList({
    resource: 'currencies',
    pagination: { currentPage: 1, pageSize: 500 },
    sorters: [{ field: 'name', order: 'asc' }],
    queryOptions: { enabled: open },
  });

  const currencyOptions = useMemo(
    () =>
      (currenciesResult.data ?? []).map((item) => {
        const name = typeof item.name === 'string' ? item.name.trim() : '';
        const code = typeof item.code === 'string' ? item.code.trim() : '';
        const label =
          name && code ? `${name} (${code})` : name || code || String(item.id ?? '');
        return { value: String(item.id ?? ''), label };
      }),
    [currenciesResult.data],
  );

  useEffect(() => {
    if (!open) return;
    clearServerErrors(form);
    if (isEdit && record) {
      form.setFieldsValue({
        currencyId: record.currencyId,
        unitPriceAmount: record.unitPriceAmount,
        validFrom: record.validFrom ? dayjs(String(record.validFrom).slice(0, 10)) : undefined,
        validTo: record.validTo ? dayjs(String(record.validTo).slice(0, 10)) : undefined,
      });
    }
    if (!isEdit) {
      form.resetFields();
    }
  }, [open, isEdit, record, form, clearServerErrors]);

  const pickerFormat = useMemo(() => dateFormat.replace(/yyyy/gi, 'YYYY').replace(/dd/gi, 'DD'), [dateFormat]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  const onFinish = async (values: Record<string, unknown>) => {
    const vf = values.validFrom as Dayjs | null | undefined;
    const vt = values.validTo as Dayjs | null | undefined;
    if (vf && vt && vf.isAfter(vt, 'day')) {
      message.error(translate('pages.priceListItems.validation.validRange'));
      return;
    }
    clearServerErrors(form);
    try {
      if (isEdit && editingId) {
        await updateMut({
          resource: 'price_list_items',
          id: editingId,
          values: {
            currencyId: values.currencyId,
            unitPriceAmount: String(values.unitPriceAmount ?? '').trim(),
            validFrom: toApiDate(vf),
            validTo: toApiDate(vt),
          },
        });
        message.success(translate('notifications.success'));
      } else {
        await createMut({
          resource: 'price_list_items',
          values: {
            priceListId,
            entityId,
            sellableItemId,
            currencyId: String(values.currencyId ?? ''),
            unitPriceAmount: String(values.unitPriceAmount ?? '').trim(),
            validFrom: toApiDate(vf),
            validTo: toApiDate(vt),
          },
        });
        message.success(translate('notifications.success'));
      }
      await invalidate({ resource: 'price_list_items', invalidates: ['list'] });
      handleClose();
    } catch (e) {
      applyServerError(form, e);
      throw e;
    }
  };

  const loading =
    currenciesQuery.isLoading || currenciesQuery.isFetching || (isEdit ? oneLoading : false);

  return (
    <Drawer
      title={
        isEdit
          ? translate('pages.priceListItems.drawerEditTitle')
          : translate('pages.priceListItems.drawerCreateTitle')
      }
      width={520}
      open={open}
      onClose={handleClose}
      destroyOnClose
      extra={
        <Button type="primary" loading={loading} onClick={() => form.submit()}>
          {translate('buttons.save')}
        </Button>
      }
    >
      <TimciFormServerAlert messages={generalMessages} />
      {(sellableLabel || (isEdit && record)) && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          <strong>{translate('table.sellableItems.name')}:</strong>{' '}
          {sellableLabel ?? record?.sellableItemName ?? sellableItemId}
        </Typography.Paragraph>
      )}
      <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
        {translate('pages.priceListItems.dateOpenEndedHint')}
      </Typography.Paragraph>
      <Form
        form={form}
        layout="vertical"
        onFinish={(v) => void onFinish(v as Record<string, unknown>)}
        disabled={loading}
      >
        <Form.Item
          label={translate('table.priceListItems.currency')}
          name="currencyId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={currencyOptions}
            placeholder={translate('pages.priceListItems.pickCurrency')}
          />
        </Form.Item>
        <Form.Item
          label={translate('table.priceListItems.unitPrice')}
          name="unitPriceAmount"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input inputMode="decimal" placeholder="0.00" />
        </Form.Item>
        <Form.Item label={translate('table.priceListItems.validFrom')} name="validFrom">
          <DatePicker
            style={{ width: '100%' }}
            format={pickerFormat}
            allowClear
            locale={antdDatePickerLocaleEs}
          />
        </Form.Item>
        <Form.Item label={translate('table.priceListItems.validTo')} name="validTo">
          <DatePicker
            style={{ width: '100%' }}
            format={pickerFormat}
            allowClear
            locale={antdDatePickerLocaleEs}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
