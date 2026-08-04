import type { CommercialTransactionResource } from '../../shared/timci/commercialTransactionsApi.js';
import type { TimciAuditUserRef } from '../../shared/timci/auditUserRef.js';

export type CommercialTransactionStatus = 'draft' | 'registered' | 'voided';

export type CommercialTransactionConfig = {
  resource: CommercialTransactionResource;
  listPath: string;
  i18nPagesPrefix: string;
};

export type SaleItemFormRow = {
  sellableItemId?: string | null;
  description?: string;
  quantity?: string | number;
  unitPriceAmount?: string | number;
  discountPercent?: string | number;
  taxCategoryKey?: string | null;
};

export type AllocationFormRow = {
  targetTransactionId?: string;
  amount?: string | number;
};

export type CommercialTransactionRecord = {
  id?: string;
  entityTxnNumber?: number | null;
  entityId?: string;
  customerId?: string;
  type?: string;
  status?: CommercialTransactionStatus | string;
  transactionDate?: string;
  currencyId?: string;
  amount?: string;
  fxRate?: string | null;
  fxRateAsOf?: string | null;
  amountInBase?: string | null;
  fxRateManual?: boolean;
  openAmount?: string | null;
  unallocatedAmount?: string | null;
  concept?: string | null;
  holdFromAutoAllocation?: boolean;
  dueDate?: string | null;
  monetaryPolicyKind?: string | null;
  monetaryPolicyParams?: Record<string, unknown> | null;
  priceListId?: string | null;
  paymentOptionId?: string | null;
  monetaryPolicyId?: string | null;
  taxCategoryKey?: string | null;
  netAmount?: string | null;
  taxAmount?: string | null;
  grossAmount?: string | null;
  reversesTransactionId?: string | null;
  reversesEntityTxnNumber?: number | null;
  reversesTransactionType?: string | null;
  reversedByTransactionId?: string | null;
  originTransactionId?: string | null;
  triggeredByCollectionId?: string | null;
  registeredAt?: string | null;
  voidedAt?: string | null;
  items?: Array<{
    id?: string;
    ordinal?: number;
    sellableItemId?: string | null;
    description?: string;
    quantity?: string;
    unitPriceAmount?: string;
    discountPercent?: string;
    discountAmount?: string;
    subtotal?: string;
    taxCategoryKey?: string | null;
    netAmount?: string | null;
    taxAmount?: string | null;
    grossAmount?: string | null;
  }>;
  allocations?: Array<{
    id?: string;
    ordinal?: number;
    targetTransactionId?: string;
    amount?: string;
    targetType?: string | null;
    targetEntityTxnNumber?: number | null;
    targetTransactionDate?: string | null;
    targetConcept?: string | null;
  }>;
  incomingAllocations?: Array<{
    sourceTransactionId: string;
    sourceType: string;
    sourceTransactionDate: string;
    sourceAmount: string;
    sourceConcept?: string | null;
    sourceEntityTxnNumber?: number | null;
    amount: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TimciAuditUserRef;
  updatedBy?: TimciAuditUserRef;
};

export const COMMERCIAL_TX_CONFIG: Record<CommercialTransactionResource, CommercialTransactionConfig> =
  {
    sales: {
      resource: 'sales',
      listPath: '/sales',
      i18nPagesPrefix: 'pages.sales',
    },
    debits: {
      resource: 'debits',
      listPath: '/debits',
      i18nPagesPrefix: 'pages.debits',
    },
    credits: {
      resource: 'credits',
      listPath: '/credits',
      i18nPagesPrefix: 'pages.credits',
    },
    collections: {
      resource: 'collections',
      listPath: '/collections',
      i18nPagesPrefix: 'pages.collections',
    },
  };
