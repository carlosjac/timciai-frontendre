import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelect } from '@refinedev/antd';
import { useList, useOne, useTranslate, type BaseRecord } from '@refinedev/core';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
} from 'antd';
import dayjs from 'dayjs';
import { antdDatePickerLocaleEs } from '../../shared/timci/antdPickerLocaleEs.js';
import { stripSelectServerSearch } from '../../shared/timci/stripSelectServerSearch.js';
import {
  fetchPriceListsForEntity,
  type PriceListRow,
} from '../../shared/timci/auxiliaryApi.js';
import { MonetaryPolicyDefaultSelect } from '../monetary-policies/MonetaryPolicyDefaultSelect.js';
import {
  fetchFxQuote,
  getCustomerCurrentAccountSettlementUrl,
  type CommercialTransactionResource,
  type CurrentAccountSettlementLine,
} from '../../shared/timci/commercialTransactionsApi.js';
import {
  fetchUnitPriceFromPriceList,
} from '../../shared/timci/priceListItemsApi.js';
import { timciFetch } from '../../shared/timci/http.js';
import {
  CollectionAllocationsTable,
  type AllocationCandidateRow,
} from './CollectionAllocationsTable.js';
import { computeSaleLineAmounts, computeSaleItemsTotal } from './saleLineAmounts.js';
import { formatTimciMoneyOrEmpty } from '../../shared/timci/formatMoney.js';
import {
  calculateTaxes,
  type CalculateTaxesResult,
  type LineTaxDto,
} from '../../shared/timci/taxesApi.js';
import { useEntityTaxContext } from '../../shared/timci/tax/useEntityTaxContext.js';
import { TaxCategorySelect } from '../../shared/timci/tax/TaxCategorySelect.js';

type PaymentOptionRow = {
  id?: string;
  name?: string;
  isActive?: boolean;
  currencyIds?: string[];
};

type EntityWithPaymentOptions = {
  id?: string;
  paymentOptions?: PaymentOptionRow[];
  defaultCurrencyId?: string;
  defaultMonetaryPolicyId?: string | null;
};

type SellableRow = BaseRecord & {
  id: string;
  name?: string;
  code?: string | null;
  taxCategoryKey?: string | null;
};

type Props = {
  resource: CommercialTransactionResource;
  tenantId: string;
  /** When editing, customer cannot change. */
  lockCustomer?: boolean;
  pickerDateFormat: string;
};

/** Same text shown in the product Select option (name, or name (code)). */
function sellableOptionLabel(row: Pick<SellableRow, 'id' | 'name' | 'code'>): string {
  const name = String(row.name ?? row.id).trim() || String(row.id);
  const code = row.code != null ? String(row.code).trim() : '';
  return code ? `${name} (${code})` : name;
}

function emptySaleItem() {
  return {
    sellableItemId: undefined,
    description: '',
    quantity: '1',
    unitPriceAmount: '',
    discountPercent: '0',
    taxCategoryKey: undefined as string | undefined,
  };
}

function SaleItemComputedAmounts({
  itemIndex,
  taxesOn,
  lineTax,
}: {
  itemIndex: number;
  taxesOn: boolean;
  lineTax?: LineTaxDto | null;
}) {
  const translate = useTranslate();
  const quantity = Form.useWatch(['items', itemIndex, 'quantity']);
  const unitPriceAmount = Form.useWatch(['items', itemIndex, 'unitPriceAmount']);
  const discountPercent = Form.useWatch(['items', itemIndex, 'discountPercent']);
  const computed = computeSaleLineAmounts({ quantity, unitPriceAmount, discountPercent });
  const netLabel = taxesOn
    ? translate('pages.commercialTransactions.fields.net')
    : translate('pages.commercialTransactions.fields.subtotal');

  return (
    <>
      <Col xs={12} sm={8} md={6} lg={4}>
        <Form.Item label={translate('pages.commercialTransactions.fields.discountAmount')}>
          <Input
            readOnly
            value={computed?.discountAmount ?? ''}
            placeholder="—"
            aria-label={translate('pages.commercialTransactions.fields.discountAmount')}
          />
        </Form.Item>
      </Col>
      <Col xs={12} sm={8} md={6} lg={4}>
        <Form.Item label={netLabel}>
          <Input
            readOnly
            value={taxesOn ? (lineTax?.netAmount ?? computed?.subtotal ?? '') : (computed?.subtotal ?? '')}
            placeholder="—"
            aria-label={netLabel}
          />
        </Form.Item>
      </Col>
      {taxesOn ? (
        <>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Form.Item label={translate('pages.commercialTransactions.fields.taxAmount')}>
              <Input
                readOnly
                value={formatTimciMoneyOrEmpty(lineTax?.taxAmount)}
                placeholder="—"
                aria-label={translate('pages.commercialTransactions.fields.taxAmount')}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Form.Item label={translate('pages.commercialTransactions.fields.gross')}>
              <Input
                readOnly
                value={formatTimciMoneyOrEmpty(lineTax?.grossAmount)}
                placeholder="—"
                aria-label={translate('pages.commercialTransactions.fields.gross')}
              />
            </Form.Item>
          </Col>
        </>
      ) : null}
    </>
  );
}

function SaleItemsTotal({
  taxesOn,
  taxResult,
}: {
  taxesOn: boolean;
  taxResult: CalculateTaxesResult | null;
}) {
  const translate = useTranslate();
  const items = Form.useWatch('items') as
    | Array<{
        quantity?: unknown;
        unitPriceAmount?: unknown;
        discountPercent?: unknown;
      }>
    | undefined;
  const total = taxesOn
    ? formatTimciMoneyOrEmpty(taxResult?.grossAmount) ||
      formatTimciMoneyOrEmpty(taxResult?.netAmount) ||
      computeSaleItemsTotal(items)
    : computeSaleItemsTotal(items);
  const totalLabel = taxesOn
    ? translate('pages.commercialTransactions.fields.gross')
    : translate('pages.commercialTransactions.fields.total');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: 16,
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {taxesOn ? (
        <>
          <Form.Item
            label={<span style={{ fontWeight: 600 }}>{translate('tax.net')}</span>}
            style={{ marginBottom: 0, minWidth: 140 }}
          >
            <Input
              readOnly
              value={formatTimciMoneyOrEmpty(taxResult?.netAmount)}
              placeholder="—"
              aria-label={translate('tax.net')}
              style={{ textAlign: 'right' }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 600 }}>{translate('tax.taxAmount')}</span>}
            style={{ marginBottom: 0, minWidth: 140 }}
          >
            <Input
              readOnly
              value={formatTimciMoneyOrEmpty(taxResult?.taxAmount)}
              placeholder="—"
              aria-label={translate('tax.taxAmount')}
              style={{ textAlign: 'right' }}
            />
          </Form.Item>
        </>
      ) : null}
      <Form.Item
        label={<span style={{ fontWeight: 600 }}>{totalLabel}</span>}
        style={{ marginBottom: 0, minWidth: 200 }}
        labelCol={{ style: { textAlign: 'right' } }}
      >
        <Input
          readOnly
          value={total}
          placeholder="—"
          aria-label={totalLabel}
          style={{
            textAlign: 'right',
            fontWeight: 700,
            fontSize: 18,
            background: 'rgba(0, 0, 0, 0.02)',
          }}
        />
      </Form.Item>
    </div>
  );
}

export function CommercialTransactionFormFields({
  resource,
  tenantId,
  lockCustomer = false,
  pickerDateFormat,
}: Props) {
  const translate = useTranslate();
  const form = Form.useFormInstance();
  const customerId = Form.useWatch('customerId', form) as string | undefined;
  const currencyId = Form.useWatch('currencyId', form) as string | undefined;
  const priceListId = Form.useWatch('priceListId', form) as string | undefined;
  const transactionDate = Form.useWatch('transactionDate', form) as string | undefined;
  const fxRateManual = Form.useWatch('fxRateManual', form) as boolean | undefined;
  const entityTxnNumber = Form.useWatch('entityTxnNumber', form) as number | undefined;
  const amountWatch = Form.useWatch('amount', form);
  const taxCategoryKeyWatch = Form.useWatch('taxCategoryKey', form) as string | undefined;
  const itemsWatch = Form.useWatch('items', form);
  const [priceLists, setPriceLists] = useState<PriceListRow[]>([]);
  const [taxResult, setTaxResult] = useState<CalculateTaxesResult | null>(null);

  const isSale = resource === 'sales';
  const isDebit = resource === 'debits';
  const isCredit = resource === 'credits';
  const isCollection = resource === 'collections';
  const needsMonetaryPolicy = isSale || isDebit;
  const needsAllocations = isCredit || isCollection || isDebit;

  const entityTax = useEntityTaxContext(tenantId, tenantId);
  const taxesOn = entityTax.taxManagementEnabled && !isCollection;

  const { selectProps: customerSelectRaw } = useSelect({
    resource: 'customers',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const customerSelect = stripSelectServerSearch(customerSelectRaw);

  const { selectProps: currencySelectRaw } = useSelect({
    resource: 'currencies',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: !!tenantId },
  });
  const currencySelect = stripSelectServerSearch(currencySelectRaw);

  const { result: entityRecord } = useOne<EntityWithPaymentOptions>({
    resource: 'entities',
    id: tenantId,
    queryOptions: { enabled: Boolean(tenantId) },
    errorNotification: false,
  });

  const { result: customerRecord } = useOne<{
    priceListId?: string;
    defaultCurrencyId?: string;
    defaultMonetaryPolicyId?: string | null;
    defaultPaymentTermDays?: number;
    taxProfile?: Record<string, string> | null;
  }>({
    resource: 'customers',
    id: customerId ?? '',
    queryOptions: { enabled: Boolean(customerId) },
    errorNotification: false,
  });

  const { result: sellableResult } = useList<SellableRow>({
    resource: 'sellable_items',
    pagination: { currentPage: 1, pageSize: 500 },
    queryOptions: { enabled: isSale && !!tenantId },
  });

  const { result: salesResult, query: salesQuery } = useList({
    resource: 'sales',
    pagination: { currentPage: 1, pageSize: 200 },
    queryOptions: { enabled: needsAllocations && !!tenantId && !!customerId },
  });
  const { result: debitsResult, query: debitsQuery } = useList({
    resource: 'debits',
    pagination: { currentPage: 1, pageSize: 200 },
    queryOptions: { enabled: needsAllocations && !!tenantId && !!customerId },
  });
  const allocationsCandidatesLoading =
    (salesQuery?.isFetching ?? false) || (debitsQuery?.isFetching ?? false);

  useEffect(() => {
    let cancelled = false;
    void fetchPriceListsForEntity(tenantId, tenantId).then((rows) => {
      if (!cancelled) setPriceLists(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  useEffect(() => {
    if (!customerRecord || lockCustomer) return;
    const patch: Record<string, unknown> = {};
    if (
      customerRecord.defaultCurrencyId &&
      (form.getFieldValue('currencyId') == null || form.getFieldValue('currencyId') === '')
    ) {
      patch.currencyId = customerRecord.defaultCurrencyId;
    }
    if (
      isSale &&
      customerRecord.priceListId &&
      (form.getFieldValue('priceListId') == null || form.getFieldValue('priceListId') === '')
    ) {
      patch.priceListId = customerRecord.priceListId;
    }
    if (
      needsMonetaryPolicy &&
      customerRecord.defaultMonetaryPolicyId &&
      (form.getFieldValue('monetaryPolicyId') == null ||
        form.getFieldValue('monetaryPolicyId') === '')
    ) {
      patch.monetaryPolicyId = customerRecord.defaultMonetaryPolicyId;
    }
    if (
      needsMonetaryPolicy &&
      (form.getFieldValue('dueDate') == null || form.getFieldValue('dueDate') === '')
    ) {
      const term =
        typeof customerRecord.defaultPaymentTermDays === 'number'
          ? customerRecord.defaultPaymentTermDays
          : 0;
      const base = form.getFieldValue('transactionDate')
        ? dayjs(String(form.getFieldValue('transactionDate')).slice(0, 10))
        : dayjs();
      patch.dueDate = base.add(term, 'day').format('YYYY-MM-DD');
    }
    if (Object.keys(patch).length) form.setFieldsValue(patch);
  }, [customerRecord, form, isSale, lockCustomer, needsMonetaryPolicy]);

  useEffect(() => {
    if (!tenantId || !currencyId || fxRateManual === true) return;
    let cancelled = false;
    void fetchFxQuote(tenantId, currencyId, tenantId)
      .then((quote) => {
        if (cancelled) return;
        form.setFieldsValue({
          fxRate: quote.fxRate,
          fxRateAsOf: quote.fxRateAsOf,
        });
      })
      .catch(() => {
        /* cotización opcional en borrador; el usuario puede cargar a mano */
      });
    return () => {
      cancelled = true;
    };
  }, [currencyId, form, fxRateManual, tenantId]);

  const setItemUnitPrice = useCallback(
    (itemIndex: number, unitPrice: string) => {
      form.setFieldValue(['items', itemIndex, 'unitPriceAmount'], unitPrice);
    },
    [form],
  );

  const applyListPriceToItem = useCallback(
    async (
      itemIndex: number,
      sellableItemId: string,
      overrides?: { priceListId?: string; currencyId?: string },
    ) => {
      const listId = overrides?.priceListId ?? priceListId;
      const curId = overrides?.currencyId ?? currencyId;
      if (!tenantId || !listId || !curId || !sellableItemId) return;

      try {
        const unitPrice = await fetchUnitPriceFromPriceList({
          tenantId,
          priceListId: listId,
          sellableItemId,
          currencyId: curId,
          validAt: transactionDate,
        });
        if (unitPrice != null) {
          setItemUnitPrice(itemIndex, unitPrice);
        }
      } catch {
        /* sin precio en lista: el usuario completa a mano */
      }
    },
    [currencyId, priceListId, setItemUnitPrice, tenantId, transactionDate],
  );

  /** label → row; used by the combined product/description AutoComplete. */
  const sellableByLabel = useMemo(() => {
    const map = new Map<string, SellableRow>();
    for (const r of sellableResult.data ?? []) {
      if (r.isActive === false) continue;
      map.set(sellableOptionLabel(r), r);
    }
    return map;
  }, [sellableResult.data]);

  const sellableAutoOptions = useMemo(
    () => [...sellableByLabel.keys()].map((label) => ({ value: label })),
    [sellableByLabel],
  );

  const syncSellableIdFromText = useCallback(
    (itemIndex: number, text: string) => {
      const row = sellableByLabel.get(text) ?? sellableByLabel.get(text.trim());
      form.setFieldValue(
        ['items', itemIndex, 'sellableItemId'],
        row ? String(row.id) : undefined,
      );
      if (taxesOn && row?.taxCategoryKey) {
        form.setFieldValue(['items', itemIndex, 'taxCategoryKey'], String(row.taxCategoryKey));
      }
    },
    [form, sellableByLabel, taxesOn],
  );

  const onSellableLineSelect = useCallback(
    (itemIndex: number, label: string) => {
      const row = sellableByLabel.get(label);
      if (!row) {
        form.setFieldValue(['items', itemIndex, 'sellableItemId'], undefined);
        return;
      }
      form.setFieldValue(['items', itemIndex, 'sellableItemId'], String(row.id));
      if (taxesOn && row.taxCategoryKey) {
        form.setFieldValue(['items', itemIndex, 'taxCategoryKey'], String(row.taxCategoryKey));
      }
      void applyListPriceToItem(itemIndex, String(row.id));
    },
    [applyListPriceToItem, form, sellableByLabel, taxesOn],
  );

  /** Recalculate taxes for sale lines or debit/credit net amount. */
  useEffect(() => {
    if (!taxesOn || !tenantId || !entityTax.countryCode) {
      setTaxResult(null);
      return;
    }
    const documentDate =
      transactionDate != null && String(transactionDate).trim() !== ''
        ? String(transactionDate).slice(0, 10)
        : undefined;
    if (!documentDate) {
      setTaxResult(null);
      return;
    }

    const issuerTaxProfile = entityTax.taxProfile ?? {};
    const recipientTaxProfile =
      customerRecord?.taxProfile && typeof customerRecord.taxProfile === 'object'
        ? customerRecord.taxProfile
        : {};

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        if (isSale) {
          const items = (Array.isArray(itemsWatch) ? itemsWatch : []) as Array<{
            quantity?: unknown;
            unitPriceAmount?: unknown;
            discountPercent?: unknown;
            taxCategoryKey?: string | null;
          }>;
          const lines = items
            .map((item, index) => {
              const amounts = computeSaleLineAmounts({
                quantity: item.quantity,
                unitPriceAmount: item.unitPriceAmount,
                discountPercent: item.discountPercent,
              });
              if (!amounts?.subtotal) return null;
              const category =
                item.taxCategoryKey != null && String(item.taxCategoryKey).trim() !== ''
                  ? String(item.taxCategoryKey).trim()
                  : undefined;
              return {
                lineId: String(index),
                netAmount: amounts.subtotal,
                taxCategoryKey: category,
              };
            })
            .filter((l): l is NonNullable<typeof l> => l != null);
          if (!lines.length) {
            if (!cancelled) setTaxResult(null);
            return;
          }
          const result = await calculateTaxes(tenantId, {
            countryCode: entityTax.countryCode!,
            issuerTaxProfile,
            recipientTaxProfile,
            documentDate,
            lines,
          });
          if (!cancelled) setTaxResult(result);
          return;
        }

        if (isDebit || isCredit) {
          const net =
            amountWatch != null && String(amountWatch).trim() !== ''
              ? String(amountWatch).trim().replace(',', '.')
              : '';
          const category =
            taxCategoryKeyWatch != null && String(taxCategoryKeyWatch).trim() !== ''
              ? String(taxCategoryKeyWatch).trim()
              : undefined;
          if (!net || Number.isNaN(Number(net)) || !category) {
            if (!cancelled) setTaxResult(null);
            return;
          }
          const result = await calculateTaxes(tenantId, {
            countryCode: entityTax.countryCode!,
            issuerTaxProfile,
            recipientTaxProfile,
            documentDate,
            lines: [{ lineId: '0', netAmount: net, taxCategoryKey: category }],
          });
          if (!cancelled) setTaxResult(result);
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    amountWatch,
    customerRecord?.taxProfile,
    entityTax.countryCode,
    entityTax.taxProfile,
    isCredit,
    isDebit,
    isSale,
    itemsWatch,
    taxCategoryKeyWatch,
    taxesOn,
    tenantId,
    transactionDate,
  ]);

  const lineTaxByIndex = useMemo(() => {
    const map = new Map<number, LineTaxDto>();
    for (const line of taxResult?.lineTaxes ?? []) {
      const idx = Number(line.lineId);
      if (Number.isFinite(idx)) map.set(idx, line);
    }
    return map;
  }, [taxResult]);

  const paymentOptionOptions = useMemo(() => {
    const rows = entityRecord?.paymentOptions ?? [];
    return rows
      .filter((p) => p.isActive !== false && p.id)
      .filter((p) => {
        if (!currencyId || !p.currencyIds?.length) return true;
        return p.currencyIds.includes(currencyId);
      })
      .map((p) => ({ value: String(p.id), label: p.name?.trim() || String(p.id) }));
  }, [currencyId, entityRecord?.paymentOptions]);

  const [settlementByTargetId, setSettlementByTargetId] = useState<
    Map<string, CurrentAccountSettlementLine>
  >(() => new Map());
  const [settlementLoading, setSettlementLoading] = useState(false);

  /** Settlement as-of date (discounts/surcharges) for allocation candidates (cobro/crédito). */
  useEffect(() => {
    if ((!isCollection && !isCredit) || !tenantId || !customerId || !currencyId) {
      setSettlementByTargetId(new Map());
      return;
    }
    const asOf =
      transactionDate != null && String(transactionDate).trim() !== ''
        ? String(transactionDate).slice(0, 10)
        : dayjs().format('YYYY-MM-DD');
    let cancelled = false;
    setSettlementLoading(true);
    void timciFetch(
      getCustomerCurrentAccountSettlementUrl(tenantId, customerId, currencyId, asOf),
    )
      .then(({ json }) => {
        if (cancelled) return;
        const lines = (json as { lines?: CurrentAccountSettlementLine[] })?.lines ?? [];
        const map = new Map<string, CurrentAccountSettlementLine>();
        for (const line of lines) {
          if (line?.id) map.set(String(line.id), line);
        }
        setSettlementByTargetId(map);
      })
      .catch(() => {
        if (!cancelled) setSettlementByTargetId(new Map());
      })
      .finally(() => {
        if (!cancelled) setSettlementLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currencyId, customerId, isCollection, isCredit, tenantId, transactionDate]);

  /** Registered sales/debits of the customer with open balance (same currency when set). */
  const allocationCandidates = useMemo((): AllocationCandidateRow[] => {
    if (!customerId) return [];
    const rows = [...(salesResult.data ?? []), ...(debitsResult.data ?? [])].filter((r) => {
      if (String(r.customerId ?? '') !== String(customerId)) return false;
      if (r.status !== 'registered') return false;
      if (currencyId && String(r.currencyId ?? '') !== String(currencyId)) return false;
      const open = r.openAmount != null ? Number(r.openAmount) : Number(r.amount);
      return Number.isFinite(open) ? open > 0 : true;
    });
    rows.sort((a, b) => {
      const da = String(a.transactionDate ?? '');
      const db = String(b.transactionDate ?? '');
      return da.localeCompare(db);
    });
    return rows.map((r) => {
      const id = String(r.id);
      const settlement = settlementByTargetId.get(id);
      return {
        id,
        entityTxnNumber:
          r.entityTxnNumber != null ? Number(r.entityTxnNumber) : undefined,
        type: String(r.type ?? 'sale'),
        transactionDate: r.transactionDate != null ? String(r.transactionDate) : undefined,
        amount: r.amount != null ? String(r.amount) : undefined,
        openAmount: r.openAmount != null ? String(r.openAmount) : undefined,
        concept: typeof r.concept === 'string' ? r.concept : null,
        adjustmentAmount: settlement?.adjustmentAmount,
        settlementAmount: settlement?.settlementAmount,
      };
    });
  }, [currencyId, customerId, debitsResult.data, salesResult.data, settlementByTargetId]);

  const allocationsWatch = Form.useWatch('allocations', form) as
    | Array<{ targetTransactionId?: string; amount?: string }>
    | undefined;

  /**
   * Keep collection amount ≥ cash needed by allocations (settlement).
   * Never reduce amount: remanente (anticipo) is valid when amount > Σ a pagar.
   */
  useEffect(() => {
    if (!isCollection) return;
    const allocations = allocationsWatch ?? [];
    if (allocations.length === 0) return;
    let cash = 0;
    let any = false;
    for (const row of allocations) {
      const targetId = row?.targetTransactionId != null ? String(row.targetTransactionId) : '';
      if (!targetId) continue;
      const allocated = Number(String(row.amount ?? '').replace(',', '.'));
      if (!Number.isFinite(allocated) || allocated <= 0) continue;
      const candidate = allocationCandidates.find((c) => c.id === targetId);
      const open = Number(
        String(candidate?.openAmount ?? candidate?.amount ?? '').replace(',', '.'),
      );
      const settlement = Number(
        String(candidate?.settlementAmount ?? candidate?.openAmount ?? candidate?.amount ?? '').replace(
          ',',
          '.',
        ),
      );
      if (!Number.isFinite(open) || open <= 0 || !Number.isFinite(settlement)) {
        cash += allocated;
      } else {
        cash += (allocated / open) * settlement;
      }
      any = true;
    }
    if (!any) return;
    const needed = Math.round(cash * 100) / 100;
    const currentRaw = form.getFieldValue('amount');
    const current =
      currentRaw === null || currentRaw === undefined || currentRaw === ''
        ? null
        : Number(String(currentRaw).replace(',', '.'));
    if (current != null && Number.isFinite(current) && current >= needed) return;
    const next = needed.toFixed(2);
    if (String(currentRaw ?? '') !== next) {
      form.setFieldValue('amount', next);
    }
  }, [allocationCandidates, allocationsWatch, form, isCollection]);

  const allocationsEmptyHint = !customerId
    ? translate('pages.commercialTransactions.fields.allocationsSelectCustomer')
    : !currencyId
      ? translate('pages.commercialTransactions.fields.allocationsSelectCurrency')
      : translate('pages.commercialTransactions.fields.allocationsEmpty');

  return (
    <>
      {entityTxnNumber != null ? (
        <Form.Item label={translate('pages.commercialTransactions.fields.entityTxnNumber')}>
          <Input
            value={String(entityTxnNumber)}
            disabled
            aria-label={translate('pages.commercialTransactions.fields.entityTxnNumber')}
          />
        </Form.Item>
      ) : null}

      <Form.Item
        label={translate('pages.commercialTransactions.fields.customer')}
        name="customerId"
        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
      >
        <Select
          {...customerSelect}
          showSearch
          optionFilterProp="label"
          disabled={lockCustomer}
          placeholder={translate('pages.commercialTransactions.fields.customerPlaceholder')}
          aria-label={translate('pages.commercialTransactions.fields.customer')}
        />
      </Form.Item>

      <Form.Item
        label={translate('pages.commercialTransactions.fields.transactionDate')}
        name="transactionDate"
        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        getValueProps={(v) => ({
          value: v ? dayjs(String(v).slice(0, 10)) : undefined,
        })}
        normalize={(v) => (v ? dayjs(v).format('YYYY-MM-DD') : undefined)}
        initialValue={dayjs().format('YYYY-MM-DD')}
      >
        <DatePicker
          style={{ width: '100%' }}
          format={pickerDateFormat}
          allowClear={false}
          locale={antdDatePickerLocaleEs}
        />
      </Form.Item>

      {needsMonetaryPolicy && (
        <Form.Item
          label={translate('pages.commercialTransactions.fields.dueDate')}
          name="dueDate"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          getValueProps={(v) => ({
            value: v ? dayjs(String(v).slice(0, 10)) : undefined,
          })}
          normalize={(v) => (v ? dayjs(v).format('YYYY-MM-DD') : undefined)}
        >
          <DatePicker
            style={{ width: '100%' }}
            format={pickerDateFormat}
            allowClear={false}
            locale={antdDatePickerLocaleEs}
            aria-label={translate('pages.commercialTransactions.fields.dueDate')}
          />
        </Form.Item>
      )}

      <Form.Item
        label={translate('pages.commercialTransactions.fields.currency')}
        name="currencyId"
        rules={[{ required: true, message: translate('form.validation.requiredField') }]}
      >
        <Select
          {...currencySelect}
          showSearch
          optionFilterProp="label"
          placeholder={translate('pages.commercialTransactions.fields.currencyPlaceholder')}
          aria-label={translate('pages.commercialTransactions.fields.currency')}
          onChange={(value) => {
            if (!isSale || !priceListId || !value) return;
            const items =
              (form.getFieldValue('items') as Array<{ sellableItemId?: string }>) ?? [];
            items.forEach((item, index) => {
              if (item?.sellableItemId) {
                void applyListPriceToItem(index, String(item.sellableItemId), {
                  currencyId: String(value),
                });
              }
            });
          }}
        />
      </Form.Item>

      <Form.Item name="fxRateAsOf" hidden>
        <Input />
      </Form.Item>

      <Form.Item label={translate('pages.commercialTransactions.fields.fxRate')} name="fxRate">
        <Input
          inputMode="decimal"
          placeholder="1"
          onChange={() => {
            if (fxRateManual !== true) {
              form.setFieldValue('fxRateManual', true);
            }
          }}
        />
      </Form.Item>

      <Form.Item
        label={translate('pages.commercialTransactions.fields.fxRateManual')}
        name="fxRateManual"
        valuePropName="checked"
        initialValue={false}
      >
        <Switch />
      </Form.Item>

      {!isSale && (
        <Form.Item
          label={
            taxesOn && (isDebit || isCredit)
              ? translate('pages.commercialTransactions.fields.amountNet')
              : translate('pages.commercialTransactions.fields.amount')
          }
          name="amount"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
          extra={
            isCollection
              ? translate('pages.commercialTransactions.fields.collectionAmountSettlementHint')
              : undefined
          }
        >
          <InputNumber style={{ width: '100%' }} min={0} stringMode />
        </Form.Item>
      )}

      {taxesOn && (isDebit || isCredit) ? (
        <>
          <TaxCategorySelect
            schema={entityTax.schema}
            name="taxCategoryKey"
            required
            disabled={entityTax.schemaLoading}
            labelKey="pages.commercialTransactions.fields.taxCategory"
          />
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label={translate('pages.commercialTransactions.fields.taxAmount')}>
                <Input
                  readOnly
                  value={formatTimciMoneyOrEmpty(taxResult?.taxAmount)}
                  placeholder="—"
                  aria-label={translate('pages.commercialTransactions.fields.taxAmount')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={translate('pages.commercialTransactions.fields.gross')}>
                <Input
                  readOnly
                  value={formatTimciMoneyOrEmpty(taxResult?.grossAmount)}
                  placeholder="—"
                  aria-label={translate('pages.commercialTransactions.fields.gross')}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ) : null}

      {(isDebit || isCredit) && (
        <Form.Item
          label={translate('pages.commercialTransactions.fields.concept')}
          name="concept"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Input.TextArea rows={2} maxLength={500} showCount />
        </Form.Item>
      )}

      {(isCollection || isCredit) && (
        <Form.Item
          label={translate('pages.commercialTransactions.fields.holdFromAutoAllocation')}
          name="holdFromAutoAllocation"
          valuePropName="checked"
          initialValue={false}
          extra={translate('pages.commercialTransactions.fields.holdFromAutoAllocationHint')}
        >
          <Switch
            aria-label={translate('pages.commercialTransactions.fields.holdFromAutoAllocation')}
          />
        </Form.Item>
      )}

      {isSale && (
        <Form.Item
          label={translate('pages.commercialTransactions.fields.priceList')}
          name="priceListId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={priceLists.map((p) => ({ value: p.id, label: p.name }))}
            placeholder={translate('pages.commercialTransactions.fields.priceListPlaceholder')}
            onChange={(value) => {
              if (!currencyId || !value) return;
              const items =
                (form.getFieldValue('items') as Array<{ sellableItemId?: string }>) ?? [];
              items.forEach((item, index) => {
                if (item?.sellableItemId) {
                  void applyListPriceToItem(index, String(item.sellableItemId), {
                    priceListId: String(value),
                  });
                }
              });
            }}
          />
        </Form.Item>
      )}

      {needsMonetaryPolicy && (
        <MonetaryPolicyDefaultSelect
          entityId={tenantId}
          tenantId={tenantId}
          name="monetaryPolicyId"
          labelKey="pages.commercialTransactions.fields.monetaryPolicy"
        />
      )}

      {isCollection && (
        <Form.Item
          label={translate('pages.commercialTransactions.fields.paymentOption')}
          name="paymentOptionId"
          rules={[{ required: true, message: translate('form.validation.requiredField') }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={paymentOptionOptions}
            placeholder={translate('pages.commercialTransactions.fields.paymentOptionPlaceholder')}
          />
        </Form.Item>
      )}

      {isSale && (
        <Card
          size="small"
          title={translate('pages.commercialTransactions.fields.items')}
          style={{ marginBottom: 16 }}
        >
          <Form.List
            name="items"
            rules={[
              {
                validator: async (_, items) => {
                  if (!items?.length) {
                    return Promise.reject(
                      new Error(translate('pages.commercialTransactions.fields.itemsMinOne')),
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    type="inner"
                    size="small"
                    style={{ marginBottom: 8 }}
                    title={translate('pages.commercialTransactions.fields.itemN', {
                      n: String(name + 1),
                    })}
                    extra={
                      fields.length > 1 ? (
                        <Button
                          type="link"
                          danger
                          onClick={() => remove(name)}
                          aria-label={translate('pages.commercialTransactions.fields.removeItem')}
                        >
                          {translate('pages.commercialTransactions.fields.removeItem')}
                        </Button>
                      ) : null
                    }
                  >
                    <Form.Item {...restField} name={[name, 'sellableItemId']} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label={translate('pages.commercialTransactions.fields.sellableItem')}
                      name={[name, 'description']}
                      rules={[
                        { required: true, message: translate('form.validation.requiredField') },
                      ]}
                    >
                      <AutoComplete
                        allowClear
                        options={sellableAutoOptions}
                        placeholder={translate(
                          'pages.commercialTransactions.fields.sellableItemPlaceholder',
                        )}
                        filterOption={(input, option) =>
                          String(option?.value ?? '')
                            .toLowerCase()
                            .includes(input.trim().toLowerCase())
                        }
                        onSelect={(value) => {
                          onSellableLineSelect(name, String(value ?? ''));
                        }}
                        onChange={(value) => {
                          syncSellableIdFromText(name, String(value ?? ''));
                        }}
                        aria-label={translate('pages.commercialTransactions.fields.sellableItem')}
                      />
                    </Form.Item>
                    {taxesOn ? (
                      <Form.Item noStyle shouldUpdate>
                        {() => {
                          const sellableId = form.getFieldValue([
                            'items',
                            name,
                            'sellableItemId',
                          ]) as string | undefined;
                          const requireCategory = !sellableId;
                          return (
                            <TaxCategorySelect
                              schema={entityTax.schema}
                              name={[name, 'taxCategoryKey']}
                              required={requireCategory}
                              disabled={entityTax.schemaLoading}
                              labelKey="pages.commercialTransactions.fields.taxCategory"
                              formItemProps={restField}
                            />
                          );
                        }}
                      </Form.Item>
                    ) : null}
                    <Row gutter={[16, 0]}>
                      <Col xs={12} sm={8} md={6} lg={4}>
                        <Form.Item
                          {...restField}
                          label={translate('pages.commercialTransactions.fields.quantity')}
                          name={[name, 'quantity']}
                          rules={[
                            { required: true, message: translate('form.validation.requiredField') },
                          ]}
                        >
                          <InputNumber min={0} stringMode style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={8} md={6} lg={4}>
                        <Form.Item
                          {...restField}
                          label={translate('pages.commercialTransactions.fields.unitPrice')}
                          name={[name, 'unitPriceAmount']}
                          rules={[
                            { required: true, message: translate('form.validation.requiredField') },
                          ]}
                        >
                          <InputNumber min={0} stringMode style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={8} md={6} lg={4}>
                        <Form.Item
                          {...restField}
                          label={translate('pages.commercialTransactions.fields.discountPercent')}
                          name={[name, 'discountPercent']}
                        >
                          <InputNumber min={0} max={100} stringMode style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <SaleItemComputedAmounts
                        itemIndex={name}
                        taxesOn={taxesOn}
                        lineTax={lineTaxByIndex.get(name)}
                      />
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add(emptySaleItem())} block>
                  {translate('pages.commercialTransactions.fields.addItem')}
                </Button>
                <Form.ErrorList errors={errors} />
                <SaleItemsTotal taxesOn={taxesOn} taxResult={taxResult} />
              </>
            )}
          </Form.List>
        </Card>
      )}

      {needsAllocations && (
        <Card
          size="small"
          title={translate('pages.commercialTransactions.fields.allocations')}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="allocations" noStyle>
            <CollectionAllocationsTable
              candidates={allocationCandidates}
              disabled={!customerId || !currencyId}
              loading={
                Boolean(customerId) && (allocationsCandidatesLoading || settlementLoading)
              }
              emptyHint={allocationsEmptyHint}
            />
          </Form.Item>
        </Card>
      )}
    </>
  );
}
