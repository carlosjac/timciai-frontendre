import {
  documentTaxAmountForKind,
  sortedLineTaxAmountDefs,
  sortedLineTaxFieldDefs,
  TAX_LINE_FIELD_IVA_RATE,
  type CountryTaxProfileSchema,
} from '../../shared/timci/taxesApi.js';
import type { CommercialTransactionItemRow } from './commercialTransactionPanels.js';
import type { CommercialTransactionRecord } from './types.js';

export type TaxAmountDisplayRow = {
  key: string;
  label: string;
  amount: string | null;
};

export type TaxAttributeDisplayRow = {
  key: string;
  label: string;
  value: string;
};

/** Document-level tax amount rows from catalog defs + taxSummary (fallback: single i18n IVA). */
export function documentTaxAmountDisplayRows(opts: {
  schema: CountryTaxProfileSchema | null | undefined;
  record: Pick<CommercialTransactionRecord, 'taxAmount' | 'taxSummary'> | null | undefined;
  fallbackTaxLabel: string;
}): TaxAmountDisplayRow[] {
  const defs = sortedLineTaxAmountDefs(opts.schema);
  if (defs.length > 0) {
    return defs.map((def) => {
      const fromSummary = documentTaxAmountForKind(
        {
          lineTaxes: [],
          documentTaxes: [],
          netAmount: '',
          taxAmount: opts.record?.taxAmount ?? '',
          grossAmount: '',
          taxSummary: opts.record?.taxSummary ?? [],
        },
        def.taxKind,
      );
      return {
        key: def.taxKind,
        label: def.name,
        amount:
          fromSummary ??
          (defs.length === 1 ? (opts.record?.taxAmount ?? null) : null),
      };
    });
  }

  return [
    {
      key: 'legacy',
      label: opts.fallbackTaxLabel,
      amount: opts.record?.taxAmount ?? null,
    },
  ];
}

/** Column defs for item tax amounts: one per catalog amount def (or legacy IVA). */
export function itemTaxAmountColumnDefs(opts: {
  schema: CountryTaxProfileSchema | null | undefined;
  fallbackTaxLabel: string;
}): Array<{ key: string; label: string; taxKind: string | null }> {
  const defs = sortedLineTaxAmountDefs(opts.schema);
  if (defs.length > 0) {
    return defs.map((d) => ({ key: d.taxKind, label: d.name, taxKind: d.taxKind }));
  }
  return [{ key: 'legacy', label: opts.fallbackTaxLabel, taxKind: null }];
}

export function itemTaxAmountForKind(
  row: CommercialTransactionItemRow,
  taxKind: string | null,
): string | null {
  const lineTaxes = row.lineTaxes ?? [];
  if (taxKind != null) {
    const hit = lineTaxes.find((t) => t.kind === taxKind);
    if (hit?.taxAmount != null && String(hit.taxAmount).trim() !== '') {
      return String(hit.taxAmount);
    }
    // Single-kind legacy row without lineTaxes populated.
    if (lineTaxes.length === 0 && row.taxAmount != null && String(row.taxAmount).trim() !== '') {
      return String(row.taxAmount);
    }
    return null;
  }
  if (lineTaxes.length === 1 && lineTaxes[0]!.taxAmount != null) {
    return String(lineTaxes[0]!.taxAmount);
  }
  if (row.taxAmount != null && String(row.taxAmount).trim() !== '') {
    return String(row.taxAmount);
  }
  return null;
}

/** Resolve stored taxAttributes keys to catalog labels + human values. */
export function taxAttributeDisplayRows(opts: {
  schema: CountryTaxProfileSchema | null | undefined;
  taxAttributes: Record<string, string> | null | undefined;
  fallbackCategoryLabel: string;
}): TaxAttributeDisplayRow[] {
  const attrs = opts.taxAttributes ?? {};
  const keys = Object.keys(attrs).filter((k) => attrs[k]?.trim());
  if (keys.length === 0) return [];

  const fieldDefs = sortedLineTaxFieldDefs(opts.schema);
  const categories = opts.schema?.taxCategories ?? [];
  const categoryName = (valueKey: string) =>
    categories.find((c) => c.categoryKey === valueKey)?.name ?? valueKey;

  if (fieldDefs.length > 0) {
    const rows: TaxAttributeDisplayRow[] = [];
    for (const def of fieldDefs) {
      const raw = attrs[def.fieldKey];
      if (raw == null || String(raw).trim() === '') continue;
      const value =
        def.optionsSource === 'tax_categories' ? categoryName(String(raw)) : String(raw);
      rows.push({ key: def.fieldKey, label: def.name, value });
    }
    for (const key of keys) {
      if (rows.some((r) => r.key === key)) continue;
      rows.push({ key, label: key, value: String(attrs[key]) });
    }
    return rows;
  }

  const iva = attrs[TAX_LINE_FIELD_IVA_RATE];
  if (iva != null && String(iva).trim() !== '') {
    return [
      {
        key: TAX_LINE_FIELD_IVA_RATE,
        label: opts.fallbackCategoryLabel,
        value: categoryName(String(iva)),
      },
    ];
  }

  return keys.map((key) => ({ key, label: key, value: String(attrs[key]) }));
}
