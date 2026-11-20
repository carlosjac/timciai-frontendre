/** The entity's only price list, when the unfiltered total is one. */
export function solePriceListId(
  total: number | undefined,
  rows: readonly { id: string }[],
  searching: boolean,
): string | null {
  if (searching || total !== 1 || rows.length !== 1 || !rows[0]) return null;
  return String(rows[0].id);
}
