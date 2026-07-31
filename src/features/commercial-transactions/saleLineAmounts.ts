import { formatTimciMoneyOrEmpty } from '../../shared/timci/formatMoney.js';

/** Alineado con el cálculo de dominio: bruto − (bruto × % / 100). */
export function computeSaleLineAmounts(params: {
  quantity?: unknown;
  unitPriceAmount?: unknown;
  discountPercent?: unknown;
}): { discountAmount: string; subtotal: string } | null {
  const amounts = computeSaleLineAmountNumbers(params);
  if (!amounts) return null;

  return {
    discountAmount: formatTimciMoneyOrEmpty(amounts.discountAmount),
    subtotal: formatTimciMoneyOrEmpty(amounts.subtotal),
  };
}

/** Suma de subtotales de todos los ítems (misma regla que cada línea). */
export function computeSaleItemsTotal(
  items:
    | Array<{
        quantity?: unknown;
        unitPriceAmount?: unknown;
        discountPercent?: unknown;
      }>
    | undefined
    | null,
): string {
  if (!items?.length) return '';

  let total = 0;
  let any = false;
  for (const item of items) {
    const amounts = computeSaleLineAmountNumbers(item);
    if (!amounts) continue;
    total += amounts.subtotal;
    any = true;
  }
  return any ? formatTimciMoneyOrEmpty(total) : '';
}

function computeSaleLineAmountNumbers(params: {
  quantity?: unknown;
  unitPriceAmount?: unknown;
  discountPercent?: unknown;
}): { discountAmount: number; subtotal: number } | null {
  const quantity = parseDecimal(params.quantity);
  const unitPrice = parseDecimal(params.unitPriceAmount);
  if (quantity == null || unitPrice == null) return null;

  const discountPercent = parseDecimal(params.discountPercent ?? 0) ?? 0;
  if (quantity < 0 || unitPrice < 0 || discountPercent < 0 || discountPercent > 100) {
    return null;
  }

  const lineGross = quantity * unitPrice;
  const discountAmount = (lineGross * discountPercent) / 100;
  const subtotal = lineGross - discountAmount;

  return { discountAmount, subtotal };
}

function parseDecimal(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
