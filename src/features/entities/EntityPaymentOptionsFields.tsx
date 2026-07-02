import { Button, Form, Input, Select, Space, Typography } from 'antd';
import { useTranslate } from '@refinedev/core';
import type { FormInstance, SelectProps } from 'antd';
import {
  TimciRichTextEditor,
  TimciRichTextReadonlyField,
} from '../../shared/timci/form/index.js';
import type { PaymentOptionRow } from './entity-types.js';

type EntityPaymentOptionsFieldsProps = {
  form: FormInstance;
  currencySelect: SelectProps;
  defaultCurrencyId?: string;
  canActivatePaymentOption: boolean;
  canDeactivatePaymentOption: boolean;
  paymentToggleLoading: boolean;
  onPaymentToggleClick: (row: PaymentOptionRow) => void;
};

export function EntityPaymentOptionsFields({
  form,
  currencySelect,
  defaultCurrencyId,
  canActivatePaymentOption,
  canDeactivatePaymentOption,
  paymentToggleLoading,
  onPaymentToggleClick,
}: EntityPaymentOptionsFieldsProps) {
  const translate = useTranslate();
  const paymentOptions =
    (Form.useWatch('paymentOptions', form) as PaymentOptionRow[] | undefined) ?? [];

  return (
    <>
      <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
        {translate('create.entity.paymentOptionsSection')}
      </Typography.Text>
      <Form.List
        name="paymentOptions"
        rules={[
          {
            validator: async (_, value) => {
              if (!Array.isArray(value) || value.length < 1) {
                return Promise.reject(new Error(translate('create.entity.paymentOptionsMinOne')));
              }
              if (!value.some((row: { isActive?: boolean }) => row?.isActive !== false)) {
                return Promise.reject(
                  new Error(translate('create.entity.paymentOptionsAtLeastOneActive')),
                );
              }
              const normalized = value.map((row: { name?: string }) =>
                String(row?.name ?? '')
                  .trim()
                  .toLowerCase(),
              );
              const nonEmpty = normalized.filter((n) => n !== '');
              if (new Set(nonEmpty).size !== nonEmpty.length) {
                return Promise.reject(
                  new Error(translate('create.entity.paymentOptionsDuplicateNames')),
                );
              }
            },
          },
        ]}
      >
        {(fields, { add, remove, move }) => (
          <>
            {fields.map((field, index) => {
              const { key, name: rowName, ...restField } = field;
              const rowValues = paymentOptions[rowName as number] as PaymentOptionRow | undefined;
              const showPaymentToggle =
                !!rowValues?.id &&
                ((rowValues.isActive && canDeactivatePaymentOption) ||
                  (!rowValues.isActive && canActivatePaymentOption));
              const paymentToggleLabelRow = rowValues?.isActive
                ? translate('pages.entities.paymentOptionDeactivate')
                : translate('pages.entities.paymentOptionActivate');
              const isPersistedRow =
                typeof rowValues?.id === 'string' && rowValues.id.trim() !== '';
              const isRowInactive = rowValues?.isActive === false;
              const rowFieldsDisabled = isRowInactive;

              return (
                <div
                  key={key}
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
                    borderRadius: 8,
                    opacity: isRowInactive ? 0.85 : 1,
                  }}
                >
                  <Form.Item name={[rowName, 'id']} hidden>
                    <Input />
                  </Form.Item>
                  <Space wrap style={{ marginBottom: 12 }}>
                    <Button
                      type="default"
                      htmlType="button"
                      disabled={index === 0 || rowFieldsDisabled}
                      onClick={() => move(index, index - 1)}
                    >
                      {translate('create.entity.movePaymentOptionUp')}
                    </Button>
                    <Button
                      type="default"
                      htmlType="button"
                      disabled={index === fields.length - 1 || rowFieldsDisabled}
                      onClick={() => move(index, index + 1)}
                    >
                      {translate('create.entity.movePaymentOptionDown')}
                    </Button>
                    {!isPersistedRow && (
                      <Button
                        type="default"
                        htmlType="button"
                        danger
                        disabled={fields.length <= 1}
                        onClick={() => remove(rowName)}
                      >
                        {translate('create.entity.removePaymentOption')}
                      </Button>
                    )}
                    {showPaymentToggle && (
                      <Button
                        type={rowValues?.isActive ? 'default' : 'primary'}
                        danger={rowValues?.isActive}
                        htmlType="button"
                        loading={paymentToggleLoading}
                        onClick={() => onPaymentToggleClick(rowValues ?? {})}
                      >
                        {paymentToggleLabelRow}
                      </Button>
                    )}
                  </Space>
                  <Form.Item
                    {...restField}
                    name={[rowName, 'name']}
                    label={translate('create.entity.paymentOptionName')}
                    rules={[
                      { required: true, message: translate('form.validation.requiredField') },
                    ]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input maxLength={120} disabled={rowFieldsDisabled} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[rowName, 'details']}
                    label={translate('create.entity.paymentOptionDetails')}
                    extra={translate('create.entity.paymentOptionDetailsHint')}
                    rules={[
                      { required: true, message: translate('form.validation.requiredField') },
                    ]}
                    style={{ marginBottom: 12 }}
                  >
                    {rowFieldsDisabled ? (
                      <TimciRichTextReadonlyField minHeight={120} />
                    ) : (
                      <TimciRichTextEditor minHeight={120} />
                    )}
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[rowName, 'currencyIds']}
                    label={translate('create.entity.paymentOptionCurrencies')}
                    rules={[
                      { required: true, message: translate('form.validation.requiredField') },
                      {
                        type: 'array',
                        min: 1,
                        message: translate('create.entity.paymentOptionCurrenciesMinOne'),
                      },
                    ]}
                    style={{ marginBottom: 12 }}
                  >
                    <Select
                      {...currencySelect}
                      mode="multiple"
                      showSearch
                      disabled={rowFieldsDisabled}
                      optionFilterProp="label"
                      filterOption={(input, option) => {
                        const label = option?.label;
                        const text = typeof label === 'string' ? label : String(label ?? '');
                        return text.toLowerCase().includes(input.trim().toLowerCase());
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[rowName, 'isActive']}
                    label={translate('create.entity.paymentOptionActive')}
                  >
                    <span>
                      {rowValues?.isActive !== false
                        ? translate('table.entities.yes')
                        : translate('table.entities.no')}
                    </span>
                  </Form.Item>
                </div>
              );
            })}
            <Button
              type="dashed"
              htmlType="button"
              onClick={() =>
                add({
                  name: '',
                  details: '',
                  currencyIds: defaultCurrencyId ? [defaultCurrencyId] : [],
                  isActive: true,
                })
              }
              block
              style={{ marginBottom: 8 }}
            >
              {translate('create.entity.addPaymentOption')}
            </Button>
          </>
        )}
      </Form.List>
    </>
  );
}
