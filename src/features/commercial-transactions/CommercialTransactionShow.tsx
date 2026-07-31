import { DeleteButton, EditButton, ListButton, RefreshButton, Show } from '@refinedev/antd';
import { useOne, usePermissions, useShow, useTranslate } from '@refinedev/core';
import {
  Alert,
  App as AntdApp,
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Radio,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { TimciPermissionsData } from '../../shared/timci/actionCodes.js';
import { antdDatePickerLocaleEs } from '../../shared/timci/antdPickerLocaleEs.js';
import { getStoredTenantId } from '../../shared/timci/apiUrl.js';
import {
  fetchFxQuote,
  getCommercialTransactionHoldFromAutoAllocationUrl,
  getCommercialTransactionRegisterUrl,
  getCommercialTransactionVoidUrl,
  commercialResourceFromType,
  commercialTransactionShowPath,
  type CommercialTransactionResource,
  type FxQuoteDto,
  type RegisterCommercialTransactionBody,
} from '../../shared/timci/commercialTransactionsApi.js';
import { TimciFormAuditCollapse } from '../../shared/timci/form/TimciFormAuditCollapse.js';
import { formatTimciMoney } from '../../shared/timci/formatMoney.js';
import {
  formatTimciUserDateOnly,
  formatTimciUserDateTime,
} from '../../shared/timci/formatUserDateTime.js';
import { timciFetch } from '../../shared/timci/http.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { COMMERCIAL_TX_CONFIG, type CommercialTransactionRecord } from './types.js';
import { commercialStatusTagColor, commercialStatusTitleKey } from './statusLabel.js';
import { CommercialTransactionAllocationsPanel } from './CommercialTransactionAllocationsPanel.js';
import { CommercialTransactionIncomingAllocationsPanel } from './CommercialTransactionIncomingAllocationsPanel.js';
import { ReplaceAllocationsDrawer } from './ReplaceAllocationsDrawer.js';
import { commercialResourceCanHaveAllocations } from './CommercialTransactionAllocationsPanel.js';
import { unallocatedAmount } from './unallocatedAmount.js';

type Props = {
  resource: CommercialTransactionResource;
};

type FxSourceChoice = 'draft' | 'current';

type FxSnapshot = {
  fxRate: string;
  fxRateAsOf: string;
  fxRateManual: boolean;
};

function computeAmountInBase(amount: string | undefined, fxRate: string | undefined): string {
  const a = Number(amount);
  const r = Number(fxRate);
  if (!Number.isFinite(a) || !Number.isFinite(r)) return '';
  const product = a * r;
  return Number.isInteger(product) ? String(product) : product.toFixed(6).replace(/\.?0+$/, '');
}

function parseFxNumber(raw: string | null | undefined): number | null {
  if (raw == null || String(raw).trim() === '') return null;
  const n = Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function fxRatesEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = parseFxNumber(a);
  const nb = parseFxNumber(b);
  if (na == null || nb == null) return false;
  return Math.abs(na - nb) < 1e-10;
}

export function CommercialTransactionShow({ resource }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { message, modal } = AntdApp.useApp();
  const { dateFormat, timeZone } = useUserPreferences();
  const tenantId = typeof window !== 'undefined' ? getStoredTenantId() : null;
  const config = COMMERCIAL_TX_CONFIG[resource];
  const { data: permData } = usePermissions<TimciPermissionsData>({});
  const codes = permData?.actionCodes ?? [];
  const canUpdate = codes.includes(`${resource}.update`);
  const canDelete = codes.includes(`${resource}.delete`);
  const canRegister = codes.includes(`${resource}.register`);
  const canVoid = codes.includes(`${resource}.void`);

  const { query, result } = useShow<CommercialTransactionRecord>({ resource });
  const record = (result ?? query?.data?.data) as CommercialTransactionRecord | undefined;
  const isLoading = query?.isLoading ?? false;
  const status = record?.status;
  const isDraft = status === 'draft';
  const isRegistered = status === 'registered';

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerQuoteLoading, setRegisterQuoteLoading] = useState(false);
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);
  const [holdLoading, setHoldLoading] = useState(false);
  const [fxSourceChoice, setFxSourceChoice] = useState<FxSourceChoice>('current');
  const [showFxChoice, setShowFxChoice] = useState(false);
  const [draftFxSnapshot, setDraftFxSnapshot] = useState<FxSnapshot | null>(null);
  const [currentFxSnapshot, setCurrentFxSnapshot] = useState<FxSnapshot | null>(null);
  const [registerForm] = Form.useForm<RegisterCommercialTransactionBody>();
  const [replaceAllocationsOpen, setReplaceAllocationsOpen] = useState(false);

  const { result: customerResult } = useOne<{ name?: string }>({
    resource: 'customers',
    id: record?.customerId ?? '',
    queryOptions: { enabled: Boolean(record?.customerId) },
    errorNotification: false,
  });
  const { result: currencyResult } = useOne<{ name?: string; code?: string }>({
    resource: 'currencies',
    id: record?.currencyId ?? '',
    queryOptions: { enabled: Boolean(record?.currencyId) },
    errorNotification: false,
  });
  const { result: entityResult } = useOne<{ baseCurrencyId?: string }>({
    resource: 'entities',
    id: tenantId ?? '',
    queryOptions: { enabled: Boolean(tenantId) },
    errorNotification: false,
  });

  const currencyLabel = useMemo(() => {
    if (!currencyResult) return record?.currencyId ?? '—';
    const name = currencyResult.name?.trim() ?? '';
    const code = currencyResult.code?.trim() ?? '';
    if (name && code) return `${name} (${code})`;
    return name || code || record?.currencyId || '—';
  }, [currencyResult, record?.currencyId]);

  const isSameAsBaseCurrency = useMemo(() => {
    const txCurrency = record?.currencyId != null ? String(record.currencyId).trim() : '';
    const baseCurrency =
      entityResult?.baseCurrencyId != null ? String(entityResult.baseCurrencyId).trim() : '';
    return Boolean(txCurrency && baseCurrency && txCurrency === baseCurrency);
  }, [entityResult?.baseCurrencyId, record?.currencyId]);

  const applyFxSnapshotToForm = useCallback(
    (snap: FxSnapshot) => {
      registerForm.setFieldsValue({
        fxRate: snap.fxRate,
        fxRateAsOf: snap.fxRateAsOf,
        fxRateManual: snap.fxRateManual,
        amountInBase: computeAmountInBase(record?.amount, snap.fxRate),
      });
    },
    [record?.amount, registerForm],
  );

  const performRegister = useCallback(
    async (body: RegisterCommercialTransactionBody) => {
      if (!tenantId || !record?.id) return;
      setRegisterLoading(true);
      try {
        await timciFetch(
          getCommercialTransactionRegisterUrl(tenantId, resource, String(record.id)),
          {
            method: 'POST',
            body: JSON.stringify({
              fxRate: String(body.fxRate),
              fxRateAsOf: String(body.fxRateAsOf),
              fxRateManual: body.fxRateManual === true,
              amountInBase: String(body.amountInBase),
            }),
          },
        );
        message.success(translate('pages.commercialTransactions.registered'));
        setRegisterOpen(false);
        await query?.refetch?.();
      } catch {
        message.error(translate('pages.commercialTransactions.registerError'));
      } finally {
        setRegisterLoading(false);
      }
    },
    [message, query, record?.id, resource, tenantId, translate],
  );

  const confirmRegisterSimple = useCallback(
    (body: RegisterCommercialTransactionBody, contentKey: string) => {
      if (!tenantId || !record?.id) return;
      modal.confirm({
        title: translate('pages.commercialTransactions.registerConfirmTitle'),
        content: translate(contentKey),
        okText: translate('pages.commercialTransactions.register'),
        cancelText: translate('buttons.cancel'),
        onOk: () => performRegister(body),
      });
    },
    [modal, performRegister, record?.id, tenantId, translate],
  );

  const openRegisterModalWithFx = useCallback(
    (draft: FxSnapshot | null, current: FxSnapshot, withChoice: boolean) => {
      setDraftFxSnapshot(draft);
      setCurrentFxSnapshot(current);
      setShowFxChoice(withChoice);
      setFxSourceChoice('current');
      applyFxSnapshotToForm(current);
      setRegisterOpen(true);
    },
    [applyFxSnapshotToForm],
  );

  const onFxSourceChange = useCallback(
    (choice: FxSourceChoice) => {
      setFxSourceChoice(choice);
      const snap = choice === 'draft' ? draftFxSnapshot : currentFxSnapshot;
      if (snap) applyFxSnapshotToForm(snap);
    },
    [applyFxSnapshotToForm, currentFxSnapshot, draftFxSnapshot],
  );

  const onRegisterClick = useCallback(async () => {
    if (!tenantId || !record?.id) return;

    if (isSameAsBaseCurrency) {
      confirmRegisterSimple(
        {
          fxRate: '1',
          fxRateAsOf: dayjs().toISOString(),
          fxRateManual: false,
          amountInBase: String(record.amount ?? ''),
        },
        'pages.commercialTransactions.registerConfirmBodySameCurrency',
      );
      return;
    }

    const currencyId = record.currencyId != null ? String(record.currencyId).trim() : '';
    if (!currencyId) {
      message.error(translate('pages.commercialTransactions.registerFxQuoteError'));
      return;
    }

    setRegisterQuoteLoading(true);
    try {
      const quote: FxQuoteDto = await fetchFxQuote(tenantId, currencyId, tenantId);
      const current: FxSnapshot = {
        fxRate: String(quote.fxRate).trim(),
        fxRateAsOf: String(quote.fxRateAsOf).trim() || dayjs().toISOString(),
        fxRateManual: false,
      };
      const draftRate = record.fxRate?.trim() ?? '';
      const draft: FxSnapshot | null = draftRate
        ? {
            fxRate: draftRate,
            fxRateAsOf: record.fxRateAsOf?.trim() || dayjs().toISOString(),
            fxRateManual: record.fxRateManual === true,
          }
        : null;

      if (draft && fxRatesEqual(draft.fxRate, current.fxRate)) {
        confirmRegisterSimple(
          {
            fxRate: draft.fxRate,
            fxRateAsOf: draft.fxRateAsOf,
            fxRateManual: draft.fxRateManual,
            amountInBase:
              record.amountInBase?.trim() ||
              computeAmountInBase(record.amount, draft.fxRate),
          },
          'pages.commercialTransactions.registerConfirmBodyFxUnchanged',
        );
        return;
      }

      openRegisterModalWithFx(draft, current, Boolean(draft));
    } catch {
      message.error(translate('pages.commercialTransactions.registerFxQuoteError'));
    } finally {
      setRegisterQuoteLoading(false);
    }
  }, [
    confirmRegisterSimple,
    isSameAsBaseCurrency,
    message,
    openRegisterModalWithFx,
    record,
    tenantId,
    translate,
  ]);

  const submitRegisterFromModal = useCallback(async () => {
    try {
      const values = await registerForm.validateFields();
      await performRegister({
        fxRate: String(values.fxRate),
        fxRateAsOf: String(values.fxRateAsOf),
        fxRateManual: values.fxRateManual === true,
        amountInBase: String(values.amountInBase),
      });
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
    }
  }, [performRegister, registerForm]);

  const confirmVoid = useCallback(() => {
    if (!tenantId || !record?.id) return;
    modal.confirm({
      title: translate('pages.commercialTransactions.voidConfirmTitle'),
      content: translate('pages.commercialTransactions.voidConfirmBody'),
      okText: translate('pages.commercialTransactions.void'),
      okButtonProps: { danger: true },
      cancelText: translate('buttons.cancel'),
      onOk: async () => {
        setVoidLoading(true);
        setVoidError(null);
        try {
          await timciFetch(getCommercialTransactionVoidUrl(tenantId, resource, String(record.id)), {
            method: 'POST',
          });
          message.success(translate('pages.commercialTransactions.voided'));
          await query?.refetch?.();
        } catch (e: unknown) {
          const detail =
            e instanceof Error && e.message.trim() !== ''
              ? e.message.trim()
              : translate('pages.commercialTransactions.voidError');
          setVoidError(detail);
        } finally {
          setVoidLoading(false);
        }
      },
    });
  }, [message, modal, query, record?.id, resource, tenantId, translate]);

  const supportsHoldFromAutoAllocation =
    resource === 'collections' || resource === 'credits';

  const remanenteSinImputar = useMemo(() => {
    if (!supportsHoldFromAutoAllocation || !record) return null;
    return unallocatedAmount({
      type: resource === 'collections' ? 'collection' : 'credit',
      amount: record.amount,
      unallocatedAmount: record.unallocatedAmount,
      allocations: record.allocations,
    });
  }, [record, resource, supportsHoldFromAutoAllocation]);

  const onHoldFromAutoAllocationChange = useCallback(
    async (checked: boolean) => {
      if (!tenantId || !record?.id || !supportsHoldFromAutoAllocation) return;
      setHoldLoading(true);
      try {
        await timciFetch(
          getCommercialTransactionHoldFromAutoAllocationUrl(tenantId, resource, String(record.id)),
          {
            method: 'POST',
            body: JSON.stringify({ holdFromAutoAllocation: checked }),
          },
        );
        message.success(
          translate('pages.commercialTransactions.fields.holdFromAutoAllocationUpdated'),
        );
        await query?.refetch?.();
      } catch {
        message.error(
          translate('pages.commercialTransactions.fields.holdFromAutoAllocationError'),
        );
      } finally {
        setHoldLoading(false);
      }
    },
    [message, query, record?.id, resource, supportsHoldFromAutoAllocation, tenantId, translate],
  );

  if (!tenantId) {
    return (
      <Show title={translate(`${config.i18nPagesPrefix}.showTitle`)}>
        <Alert type="warning" showIcon message={translate('tenant.selectFirst')} />
      </Show>
    );
  }

  return (
    <>
      <Show
        title={translate(`${config.i18nPagesPrefix}.showTitle`)}
        isLoading={isLoading}
        canEdit={canUpdate && isDraft}
        canDelete={false}
        headerButtons={({ listButtonProps, editButtonProps, refreshButtonProps }) => (
          <Space wrap>
            {listButtonProps ? <ListButton {...listButtonProps} /> : null}
            {canUpdate && isDraft && editButtonProps ? <EditButton {...editButtonProps} /> : null}
            {refreshButtonProps ? <RefreshButton {...refreshButtonProps} /> : null}
            {canRegister && isDraft ? (
              <Button
                type="primary"
                onClick={() => void onRegisterClick()}
                loading={registerLoading || registerQuoteLoading}
              >
                {translate('pages.commercialTransactions.register')}
              </Button>
            ) : null}
            {canVoid && isRegistered && !record?.reversedByTransactionId ? (
              <Button danger loading={voidLoading} onClick={confirmVoid}>
                {translate('pages.commercialTransactions.void')}
              </Button>
            ) : null}
            {canUpdate &&
            isRegistered &&
            !record?.reversedByTransactionId &&
            commercialResourceCanHaveAllocations(resource) ? (
              <Button onClick={() => setReplaceAllocationsOpen(true)}>
                {translate('pages.commercialTransactions.replaceAllocations')}
              </Button>
            ) : null}
            {canDelete && isDraft ? (
              <DeleteButton
                resource={resource}
                recordItemId={record?.id}
                onSuccess={() => navigate(config.listPath)}
                confirmTitle={translate('pages.commercialTransactions.deleteConfirmTitle')}
              />
            ) : null}
          </Space>
        )}
      >
        {voidError ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message={voidError}
            action={
              <Button size="small" onClick={() => setVoidError(null)}>
                {translate('buttons.close')}
              </Button>
            }
          />
        ) : null}
        <Descriptions
          bordered
          column={1}
          size="middle"
          styles={{ label: { width: 220, maxWidth: 280, verticalAlign: 'top' } }}
        >
          <Descriptions.Item
            label={translate('pages.commercialTransactions.fields.entityTxnNumber')}
          >
            {record?.entityTxnNumber ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.commercialTransactions.status')}>
            <Tag color={commercialStatusTagColor(status)}>
              {translate(commercialStatusTitleKey(status))}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={translate('pages.commercialTransactions.fields.customer')}>
            {customerResult?.name?.trim() || record?.customerId || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.commercialTransactions.transactionDate')}>
            {formatTimciUserDateOnly(record?.transactionDate, { dateFormat, timeZone })}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.commercialTransactions.currency')}>
            {currencyLabel}
          </Descriptions.Item>
          <Descriptions.Item label={translate('table.commercialTransactions.amount')}>
            {formatTimciMoney(record?.amount)}
          </Descriptions.Item>
          <Descriptions.Item label={translate('pages.commercialTransactions.fields.fxRate')}>
            {record?.fxRate ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('pages.commercialTransactions.fields.fxRateAsOf')}>
            {record?.fxRateAsOf
              ? formatTimciUserDateTime(record.fxRateAsOf, { dateFormat, timeZone })
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('pages.commercialTransactions.fields.fxRateManual')}>
            {record?.fxRateManual
              ? translate('table.users.yes')
              : translate('table.users.no')}
          </Descriptions.Item>
          <Descriptions.Item label={translate('pages.commercialTransactions.fields.amountInBase')}>
            {formatTimciMoney(record?.amountInBase)}
          </Descriptions.Item>
          <Descriptions.Item label={translate('pages.commercialTransactions.fields.concept')}>
            {record?.concept?.trim() || '—'}
          </Descriptions.Item>
          {record?.dueDate ? (
            <Descriptions.Item label={translate('pages.commercialTransactions.fields.dueDate')}>
              {formatTimciUserDateOnly(record.dueDate, { dateFormat, timeZone })}
            </Descriptions.Item>
          ) : null}
          {record?.openAmount != null ? (
            <Descriptions.Item label={translate('pages.commercialTransactions.fields.openAmount')}>
              {formatTimciMoney(record.openAmount)}
            </Descriptions.Item>
          ) : null}
          {remanenteSinImputar != null ? (
            <Descriptions.Item
              label={translate('pages.commercialTransactions.fields.unallocatedAmount')}
            >
              {formatTimciMoney(remanenteSinImputar)}
            </Descriptions.Item>
          ) : null}
          {supportsHoldFromAutoAllocation ? (
            <Descriptions.Item
              label={translate('pages.commercialTransactions.fields.holdFromAutoAllocation')}
            >
              {isDraft ? (
                record?.holdFromAutoAllocation
                  ? translate('table.users.yes')
                  : translate('table.users.no')
              ) : canUpdate && isRegistered && !record?.reversedByTransactionId ? (
                <Switch
                  checked={record?.holdFromAutoAllocation === true}
                  loading={holdLoading}
                  onChange={(checked) => void onHoldFromAutoAllocationChange(checked)}
                  aria-label={translate(
                    'pages.commercialTransactions.fields.holdFromAutoAllocation',
                  )}
                />
              ) : record?.holdFromAutoAllocation ? (
                translate('table.users.yes')
              ) : (
                translate('table.users.no')
              )}
            </Descriptions.Item>
          ) : null}
          {record?.reversesTransactionId ? (
            <Descriptions.Item
              label={translate('pages.commercialTransactions.fields.reversesTransaction')}
            >
              {(() => {
                const n =
                  record.reversesEntityTxnNumber != null
                    ? String(record.reversesEntityTxnNumber)
                    : null;
                const label = n != null ? `Nº ${n}` : record.reversesTransactionId;
                const res = commercialResourceFromType(record.reversesTransactionType ?? '');
                if (res && record.reversesTransactionId) {
                  return (
                    <Button
                      type="link"
                      style={{ padding: 0, height: 'auto' }}
                      onClick={() =>
                        navigate(
                          commercialTransactionShowPath(res, String(record.reversesTransactionId)),
                        )
                      }
                    >
                      {label}
                    </Button>
                  );
                }
                return label;
              })()}
            </Descriptions.Item>
          ) : null}
        </Descriptions>

        {record?.items && record.items.length > 0 ? (
          <Table
            style={{ marginTop: 16 }}
            size="small"
            pagination={false}
            rowKey={(r) => String(r.id ?? r.ordinal)}
            dataSource={record.items}
            title={() => translate('pages.commercialTransactions.fields.items')}
            columns={[
              {
                title: translate('pages.commercialTransactions.fields.description'),
                dataIndex: 'description',
              },
              {
                title: translate('pages.commercialTransactions.fields.quantity'),
                dataIndex: 'quantity',
                render: (v: unknown) => formatTimciMoney(v),
              },
              {
                title: translate('pages.commercialTransactions.fields.unitPrice'),
                dataIndex: 'unitPriceAmount',
                render: (v: unknown) => formatTimciMoney(v),
              },
              {
                title: translate('pages.commercialTransactions.fields.discountPercent'),
                dataIndex: 'discountPercent',
                render: (v: unknown) => formatTimciMoney(v),
              },
              {
                title: translate('pages.commercialTransactions.fields.discountAmount'),
                dataIndex: 'discountAmount',
                render: (v: unknown) => formatTimciMoney(v),
              },
              {
                title: translate('pages.commercialTransactions.fields.subtotal'),
                dataIndex: 'subtotal',
                render: (v: unknown) => formatTimciMoney(v),
              },
            ]}
          />
        ) : null}

        <CommercialTransactionIncomingAllocationsPanel
          resource={resource}
          incomingAllocations={
            Array.isArray(record?.incomingAllocations) ? record.incomingAllocations : []
          }
        />

        <CommercialTransactionAllocationsPanel
          resource={resource}
          allocations={Array.isArray(record?.allocations) ? record.allocations : []}
        />

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
      </Show>

      {record && commercialResourceCanHaveAllocations(resource) ? (
        <ReplaceAllocationsDrawer
          open={replaceAllocationsOpen}
          onClose={() => setReplaceAllocationsOpen(false)}
          resource={resource}
          record={record}
          onSuccess={() => {
            void query?.refetch?.();
          }}
        />
      ) : null}

      <Modal
        open={registerOpen}
        title={translate('pages.commercialTransactions.registerConfirmTitle')}
        okText={translate('pages.commercialTransactions.register')}
        cancelText={translate('buttons.cancel')}
        confirmLoading={registerLoading}
        onCancel={() => setRegisterOpen(false)}
        onOk={() => void submitRegisterFromModal()}
        destroyOnHidden
      >
        <p>{translate('pages.commercialTransactions.registerConfirmBody')}</p>
        {showFxChoice ? (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={translate('pages.commercialTransactions.registerFxDifferHint')}
          />
        ) : null}
        <Form form={registerForm} layout="vertical">
          <Form.Item label={translate('pages.commercialTransactions.fields.currency')}>
            <Input
              readOnly
              value={currencyLabel}
              aria-label={translate('pages.commercialTransactions.fields.currency')}
            />
          </Form.Item>
          {showFxChoice && draftFxSnapshot && currentFxSnapshot ? (
            <Form.Item
              label={translate('pages.commercialTransactions.fields.fxRate')}
              required
            >
              <Radio.Group
                value={fxSourceChoice}
                onChange={(e) => onFxSourceChange(e.target.value as FxSourceChoice)}
                style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
              >
                <Radio value="current">
                  {translate('pages.commercialTransactions.registerFxChoiceCurrent')}:{' '}
                  {currentFxSnapshot.fxRate}
                  {' · '}
                  {formatTimciUserDateTime(currentFxSnapshot.fxRateAsOf, {
                    dateFormat,
                    timeZone,
                  })}
                </Radio>
                <Radio value="draft">
                  {translate('pages.commercialTransactions.registerFxChoiceDraft')}:{' '}
                  {draftFxSnapshot.fxRate}
                  {' · '}
                  {formatTimciUserDateTime(draftFxSnapshot.fxRateAsOf, {
                    dateFormat,
                    timeZone,
                  })}
                </Radio>
              </Radio.Group>
            </Form.Item>
          ) : (
            <>
              <Form.Item
                label={translate('pages.commercialTransactions.fields.fxRate')}
                name="fxRate"
                rules={[{ required: true, message: translate('form.validation.requiredField') }]}
              >
                <Input
                  inputMode="decimal"
                  onChange={(e) => {
                    registerForm.setFieldValue(
                      'amountInBase',
                      computeAmountInBase(record?.amount, e.target.value),
                    );
                  }}
                />
              </Form.Item>
              <Form.Item
                label={translate('pages.commercialTransactions.fields.fxRateAsOf')}
                name="fxRateAsOf"
                rules={[{ required: true, message: translate('form.validation.requiredField') }]}
                getValueProps={(v) => ({
                  value: v ? dayjs(String(v)).tz(timeZone) : undefined,
                })}
                normalize={(v) => (v ? dayjs(v).tz(timeZone).toISOString() : undefined)}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  format={`${dateFormat} HH:mm:ss`}
                  allowClear={false}
                  locale={antdDatePickerLocaleEs}
                  aria-label={translate('pages.commercialTransactions.fields.fxRateAsOf')}
                />
              </Form.Item>
              <Form.Item
                label={translate('pages.commercialTransactions.fields.fxRateManual')}
                name="fxRateManual"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}
          {showFxChoice ? (
            <>
              <Form.Item name="fxRate" hidden rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="fxRateAsOf" hidden rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="fxRateManual" hidden valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          ) : null}
          <Form.Item
            label={translate('pages.commercialTransactions.fields.amountInBase')}
            name="amountInBase"
            rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          >
            <Input inputMode="decimal" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
