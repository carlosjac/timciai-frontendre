/** Alineado con `frontend/src/accounts-receivable/sellableItems/domain`. */
export type SellableItemKind = 'Product' | 'Service';

export const SELLABLE_ITEM_KINDS: { value: SellableItemKind; titleKey: string }[] = [
  { value: 'Product', titleKey: 'table.sellableItems.kindProduct' },
  { value: 'Service', titleKey: 'table.sellableItems.kindService' },
];

export function sellableKindTitleKey(kind: string | undefined): string {
  return kind === 'Service' ? 'table.sellableItems.kindService' : 'table.sellableItems.kindProduct';
}
