/** Primeros pasos step key → help article id. Kept out of the markdown catalog. */
const SETUP_STEP_ARTICLE_ID: Record<string, string> = {
  settings: 'entity-settings',
  priceLists: 'price-lists',
  products: 'sellable-items',
  monetary: 'monetary-policies',
  customers: 'customers',
  subscriptions: 'subscriptions',
  sales: 'sales',
  collections: 'collections',
};

export function helpArticleIdForSetupStep(stepKey: string): string | null {
  return SETUP_STEP_ARTICLE_ID[stepKey] ?? null;
}
