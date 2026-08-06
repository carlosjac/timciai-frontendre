import type { CommercialTransactionResource } from '../../shared/timci/commercialTransactionsApi.js';

export type CommercialTransactionItemRow = {
  id?: string;
  ordinal?: number;
  sellableItemId?: string | null;
  description?: string;
  quantity?: string;
  unitPriceAmount?: string;
  discountPercent?: string;
  discountAmount?: string;
  subtotal?: string;
};

export type AllocationRow = {
  id?: string;
  ordinal?: number;
  targetTransactionId?: string;
  amount?: string;
  targetType?: string | null;
  targetEntityTxnNumber?: number | null;
  targetTransactionDate?: string | null;
  targetConcept?: string | null;
};

export type IncomingAllocationRow = {
  sourceTransactionId: string;
  sourceType: string;
  sourceTransactionDate: string;
  sourceAmount: string;
  sourceConcept?: string | null;
  sourceEntityTxnNumber?: number | null;
  amount: string;
};

const RESOURCES_WITH_ALLOCATIONS: CommercialTransactionResource[] = [
  'debits',
  'credits',
  'collections',
];

/** Only sales carry line items today (backend rejects items on other types). */
export function commercialResourceCanHaveItems(
  resource: CommercialTransactionResource,
): boolean {
  return resource === 'sales';
}

export function commercialResourceCanHaveAllocations(
  resource: CommercialTransactionResource,
): boolean {
  return RESOURCES_WITH_ALLOCATIONS.includes(resource);
}

/** Sale and debit can receive imputaciones from credits/collections. */
export function commercialResourceCanReceiveAllocations(
  resource: CommercialTransactionResource,
): boolean {
  return resource === 'sales' || resource === 'debits';
}
