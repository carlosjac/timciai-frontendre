import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';
import { timciFetch } from './http.js';

export type CommercialTransactionResource = 'sales' | 'debits' | 'credits' | 'collections';

export type CommercialTransactionType = 'sale' | 'debit' | 'credit' | 'collection';

export const COMMERCIAL_TRANSACTION_RESOURCES: CommercialTransactionResource[] = [
  'sales',
  'debits',
  'credits',
  'collections',
];

export function isCommercialTransactionResource(
  resource: string | undefined,
): resource is CommercialTransactionResource {
  return (
    resource === 'sales' ||
    resource === 'debits' ||
    resource === 'credits' ||
    resource === 'collections'
  );
}

export function commercialTypeFromResource(
  resource: CommercialTransactionResource,
): CommercialTransactionType {
  switch (resource) {
    case 'sales':
      return 'sale';
    case 'debits':
      return 'debit';
    case 'credits':
      return 'credit';
    case 'collections':
      return 'collection';
  }
}

export function commercialResourceFromType(
  type: CommercialTransactionType | string,
): CommercialTransactionResource | null {
  switch (type) {
    case 'sale':
      return 'sales';
    case 'debit':
      return 'debits';
    case 'credit':
      return 'credits';
    case 'collection':
      return 'collections';
    default:
      return null;
  }
}

export function commercialTransactionShowPath(
  resource: CommercialTransactionResource,
  id: string,
): string {
  const segment =
    resource === 'sales'
      ? 'sales'
      : resource === 'debits'
        ? 'debits'
        : resource === 'credits'
          ? 'credits'
          : 'collections';
  return `/${segment}/show/${requireTimciPathSegment(id)}`;
}

export function getCommercialTransactionRegisterUrl(
  tenantId: string,
  resource: CommercialTransactionResource,
  id: string,
): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/${resource}/${requireTimciPathSegment(id)}/register`;
}

export function getCommercialTransactionVoidUrl(
  tenantId: string,
  resource: CommercialTransactionResource,
  id: string,
): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/${resource}/${requireTimciPathSegment(id)}/void`;
}

export function getCommercialTransactionReplaceAllocationsUrl(
  tenantId: string,
  resource: CommercialTransactionResource,
  id: string,
): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/${resource}/${requireTimciPathSegment(id)}/replace-allocations`;
}

export function getCommercialTransactionHoldFromAutoAllocationUrl(
  tenantId: string,
  resource: CommercialTransactionResource,
  id: string,
): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/${resource}/${requireTimciPathSegment(id)}/hold-from-auto-allocation`;
}

export function getCustomerCurrentAccountsUrl(tenantId: string, customerId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/customers/${requireTimciPathSegment(customerId)}/current-accounts`;
}

export function getCustomerCurrentAccountMovementsUrl(
  tenantId: string,
  customerId: string,
  currencyId: string,
): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/customers/${requireTimciPathSegment(customerId)}/current-accounts/${requireTimciPathSegment(currencyId)}/movements`;
}

export function getCustomerCurrentAccountSettlementUrl(
  tenantId: string,
  customerId: string,
  currencyId: string,
  asOf: string,
): string {
  const qs = new URLSearchParams({ asOf: asOf.slice(0, 10) });
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/customers/${requireTimciPathSegment(customerId)}/current-accounts/${requireTimciPathSegment(currencyId)}/settlement?${qs}`;
}

export function getCustomerCurrentAccountAllocationsUrl(
  tenantId: string,
  customerId: string,
  currencyId: string,
): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/customers/${requireTimciPathSegment(customerId)}/current-accounts/${requireTimciPathSegment(currencyId)}/allocations`;
}

export type CurrentAccountAllocationLinkDto = {
  amount: string;
  source: {
    id: string;
    type: string;
    entityTxnNumber: number;
    transactionDate: string;
    amount: string;
    concept: string | null;
  };
  target: {
    id: string;
    type: string;
    entityTxnNumber: number;
    transactionDate: string;
    amount: string;
    concept: string | null;
    openAmount: string | null;
  };
};

export type CurrentAccountSettlementLine = {
  id: string;
  entityTxnNumber: number;
  type: string;
  transactionDate: string;
  dueDate: string | null;
  concept: string | null;
  openAmount: string;
  effect: string;
  percent: string;
  adjustmentAmount: string;
  settlementAmount: string;
};

export type CurrentAccountSettlementDto = {
  asOf: string;
  lines: CurrentAccountSettlementLine[];
  totalOpen: string;
  totalAdjustment: string;
  totalToSettle: string;
};

export type FxQuoteDto = {
  currencyId: string;
  currencyCode: string;
  baseCurrencyId: string;
  baseCurrencyCode: string;
  fxRate: string;
  fxRateAsOf: string;
  sameAsBase: boolean;
};

export function getFxQuoteUrl(
  tenantId: string,
  currencyId: string,
  entityId?: string,
): string {
  const qs = new URLSearchParams({ currencyId });
  if (entityId) qs.set('entityId', entityId);
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/fx-quote?${qs}`;
}

/** Cotización TX→base vigente (1 unidad de la moneda de la TX = fxRate en moneda base). */
export async function fetchFxQuote(
  tenantId: string,
  currencyId: string,
  entityId?: string,
): Promise<FxQuoteDto> {
  const { json } = await timciFetch(getFxQuoteUrl(tenantId, currencyId, entityId));
  return json as FxQuoteDto;
}

export type RegisterCommercialTransactionBody = {
  fxRate: string;
  fxRateAsOf: string;
  fxRateManual: boolean;
  amountInBase: string;
};

export function buildCommercialTransactionWriteBody(
  variables: Record<string, unknown>,
  opts?: { includeCustomerId?: boolean },
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (opts?.includeCustomerId && variables.customerId !== undefined) {
    payload.customerId = String(variables.customerId);
  }
  if (variables.entityId !== undefined) payload.entityId = String(variables.entityId);
  if (variables.transactionDate !== undefined) {
    payload.transactionDate = String(variables.transactionDate).slice(0, 10);
  }
  if (variables.currencyId !== undefined) payload.currencyId = String(variables.currencyId);
  if (variables.amount !== undefined && variables.amount !== null && variables.amount !== '') {
    payload.amount = String(variables.amount);
  }
  if (variables.fxRate !== undefined) {
    payload.fxRate =
      variables.fxRate != null && String(variables.fxRate).trim() !== ''
        ? String(variables.fxRate).trim()
        : null;
  }
  if (variables.fxRateAsOf !== undefined) {
    payload.fxRateAsOf =
      variables.fxRateAsOf != null && String(variables.fxRateAsOf).trim() !== ''
        ? String(variables.fxRateAsOf).trim()
        : null;
  }
  if (variables.fxRateManual !== undefined) {
    payload.fxRateManual = variables.fxRateManual === true;
  }
  if (variables.concept !== undefined) {
    payload.concept =
      variables.concept != null && String(variables.concept).trim() !== ''
        ? String(variables.concept).trim()
        : null;
  }
  if (variables.holdFromAutoAllocation !== undefined) {
    payload.holdFromAutoAllocation = variables.holdFromAutoAllocation === true;
  }
  if (variables.dueDate !== undefined) {
    payload.dueDate =
      variables.dueDate != null && String(variables.dueDate).trim() !== ''
        ? String(variables.dueDate).slice(0, 10)
        : null;
  }
  if (variables.priceListId !== undefined) {
    payload.priceListId =
      variables.priceListId != null && String(variables.priceListId).trim() !== ''
        ? String(variables.priceListId)
        : null;
  }
  if (variables.paymentOptionId !== undefined) {
    payload.paymentOptionId =
      variables.paymentOptionId != null && String(variables.paymentOptionId).trim() !== ''
        ? String(variables.paymentOptionId)
        : null;
  }
  if (variables.monetaryPolicyId !== undefined) {
    payload.monetaryPolicyId =
      variables.monetaryPolicyId != null && String(variables.monetaryPolicyId).trim() !== ''
        ? String(variables.monetaryPolicyId)
        : null;
  }
  if (variables.taxCategoryKey !== undefined) {
    payload.taxCategoryKey =
      variables.taxCategoryKey != null && String(variables.taxCategoryKey).trim() !== ''
        ? String(variables.taxCategoryKey).trim()
        : null;
  }
  if (variables.items !== undefined) {
    payload.items = mapSaleItems(variables.items);
  }
  if (variables.allocations !== undefined) {
    payload.allocations = mapAllocations(variables.allocations);
  }

  return payload;
}

function mapSaleItems(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = row as Record<string, unknown>;
    const item: Record<string, unknown> = {
      sellableItemId:
        r.sellableItemId != null && String(r.sellableItemId).trim() !== ''
          ? String(r.sellableItemId)
          : null,
      description: String(r.description ?? '').trim(),
      quantity: String(r.quantity ?? ''),
      unitPriceAmount: String(r.unitPriceAmount ?? ''),
      discountPercent:
        r.discountPercent != null && String(r.discountPercent).trim() !== ''
          ? String(r.discountPercent)
          : '0',
    };
    if (r.taxCategoryKey != null && String(r.taxCategoryKey).trim() !== '') {
      item.taxCategoryKey = String(r.taxCategoryKey).trim();
    }
    return item;
  });
}

function mapAllocations(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      targetTransactionId: String(r.targetTransactionId ?? '').trim(),
      amount: String(r.amount ?? ''),
    };
  });
}
