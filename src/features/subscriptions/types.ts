export type SubscriptionLineRecord = {
  id: string;
  sellableItemId: string;
  sellableItemName: string;
  quantity: string;
  description: string | null;
  discountPercent: string;
  startsOn: string | null;
  endsOn: string | null;
  includeSellableItemName: boolean;
  includeDescription: boolean;
  includePeriod: boolean;
};

export type SubscriptionGeneratedSale = {
  id: string;
  billingDate: string;
  status: string;
  concept: string | null;
  amount: string;
};

export type SubscriptionRecord = {
  id: string;
  customerId: string;
  customerName: string;
  currencyCode: string;
  intervalMonths: number;
  startsOn: string;
  endsOn: string | null;
  periodMode: string;
  status?: 'draft' | 'registered';
  priceListName: string;
  monetaryPolicyName: string;
  active: boolean;
  lastBillingError: string | null;
  lines: SubscriptionLineRecord[];
  generatedSales: SubscriptionGeneratedSale[];
  generatedSalesTotal?: number;
};
