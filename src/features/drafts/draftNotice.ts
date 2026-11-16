export const DRAFT_NOTICE_ORDER = [
  { resource: 'sales', path: '/sales' },
  { resource: 'debits', path: '/debits' },
  { resource: 'credits', path: '/credits' },
  { resource: 'collections', path: '/collections' },
  { resource: 'subscriptions', path: '/subscriptions' },
] as const;

export type DraftNoticeResource = (typeof DRAFT_NOTICE_ORDER)[number]['resource'];

export type DraftNoticeItem = {
  resource: DraftNoticeResource;
  path: string;
  count: number;
  noun: string;
};

export function joinSpanishList(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;
}

/** Una clase: «Hay 2 ventas en borrador.» Varias: «Hay borradores sin registrar: 2 ventas y 1 abono.» */
export function draftNoticeMessage(items: DraftNoticeItem[]): string {
  const present = items.filter((item) => item.count > 0);
  if (present.length === 0) return '';
  if (present.length === 1) {
    const item = present[0];
    if (!item) return '';
    return `Hay ${item.count} ${item.noun} en borrador.`;
  }
  return `Hay borradores sin registrar: ${joinSpanishList(present.map((item) => `${item.count} ${item.noun}`))}.`;
}
