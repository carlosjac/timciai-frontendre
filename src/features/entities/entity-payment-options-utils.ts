import { normalizeRichTextField } from '../../shared/timci/form/index.js';
import type { PaymentOptionRow } from './entity-types.js';

export function mapPaymentOptionsForSubmit(
  rawList: PaymentOptionRow[] | undefined,
): Array<{
  id?: string;
  ordinal: number;
  name: string;
  details: string;
  currencyIds: string[];
  isActive: boolean;
}> {
  return (rawList ?? []).map((row, index) => ({
    ...(typeof row.id === 'string' && row.id.trim() !== '' ? { id: row.id.trim() } : {}),
    ordinal: index,
    name:
      typeof row.name === 'string' && row.name.trim() !== '' ? row.name.trim() : 'Principal',
    details: normalizeRichTextField(row.details),
    currencyIds: Array.isArray(row.currencyIds)
      ? row.currencyIds.filter((id) => id != null && String(id).trim() !== '')
      : [],
    isActive: row.isActive !== false,
  }));
}
