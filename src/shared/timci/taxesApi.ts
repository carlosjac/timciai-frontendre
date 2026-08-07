import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';
import { timciFetch } from './http.js';

export type TaxAttributeAppliesTo = 'issuer' | 'recipient' | 'both';

export type CountryTaxAttributeDef = {
  attributeKey: string;
  name: string;
  appliesTo: TaxAttributeAppliesTo;
  required: boolean;
  values: Array<{ valueKey: string; name: string }>;
};

export type CountryTaxLineFieldDef = {
  fieldKey: string;
  name: string;
  helpText: string | null;
  uiControl: 'select' | 'text';
  optionsSource: 'tax_categories' | 'none';
  required: boolean;
  ordinal: number;
};

export type CountryTaxLineAmountDef = {
  taxKind: string;
  name: string;
  helpText: string | null;
  ordinal: number;
};

export type CountryTaxProfileSchema = {
  countryCode: string;
  attributeDefs: CountryTaxAttributeDef[];
  lineTaxFieldDefs?: CountryTaxLineFieldDef[];
  lineTaxAmountDefs?: CountryTaxLineAmountDef[];
  taxCategories: Array<{
    categoryKey: string;
    name: string;
    defaultTaxRateKey: string;
  }>;
  taxRates: Array<{
    rateKey: string;
    kind: string;
    name: string;
    percent: string;
  }>;
};

/** AR line field key for IVA rate category (maps to taxes calculate taxCategoryKey). */
export const TAX_LINE_FIELD_IVA_RATE = 'iva_rate';

export function normalizeTaxAttributes(raw: unknown): Record<string, string> {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const k = key.trim();
    if (!k || value == null) continue;
    const v = String(value).trim();
    if (v !== '') out[k] = v;
  }
  return out;
}

/** Derive taxes BC `taxCategoryKey` from AR `taxAttributes.iva_rate`. */
export function resolveIvaRateCategoryKey(taxAttributes?: unknown): string {
  const attrs = normalizeTaxAttributes(taxAttributes);
  return attrs[TAX_LINE_FIELD_IVA_RATE] ?? '';
}

export function sortedLineTaxFieldDefs(
  schema: CountryTaxProfileSchema | null | undefined,
): CountryTaxLineFieldDef[] {
  const defs = schema?.lineTaxFieldDefs ?? [];
  return [...defs].sort((a, b) => a.ordinal - b.ordinal || a.fieldKey.localeCompare(b.fieldKey));
}

export function sortedLineTaxAmountDefs(
  schema: CountryTaxProfileSchema | null | undefined,
): CountryTaxLineAmountDef[] {
  const defs = schema?.lineTaxAmountDefs ?? [];
  return [...defs].sort((a, b) => a.ordinal - b.ordinal || a.taxKind.localeCompare(b.taxKind));
}

export type CalculateTaxesLineInput = {
  lineId: string;
  netAmount: string;
  taxCategoryKey?: string;
  taxRateKeyOverride?: string;
};

export type CalculateTaxesQuery = {
  countryCode: string;
  issuerTaxProfile: Record<string, string>;
  recipientTaxProfile: Record<string, string>;
  documentDate: string;
  lines: CalculateTaxesLineInput[];
};

export type LineTaxDto = {
  lineId: string;
  kind: string;
  taxCategoryKey: string | null;
  taxRateKey: string | null;
  taxRatePercent: string;
  netAmount: string;
  taxAmount: string;
  grossAmount: string;
};

export type CalculateTaxesResult = {
  lineTaxes: LineTaxDto[];
  documentTaxes: unknown[];
  netAmount: string;
  taxAmount: string;
  grossAmount: string;
  taxSummary: Array<{
    kind: string;
    taxRateKey: string;
    percent: string;
    taxableBase: string;
    taxAmount: string;
  }>;
};

/** lineId → kind → LineTaxDto (supports multiple tax kinds per line). */
export function indexLineTaxesByLineAndKind(
  lineTaxes: LineTaxDto[] | null | undefined,
): Map<string, Map<string, LineTaxDto>> {
  const byLine = new Map<string, Map<string, LineTaxDto>>();
  for (const row of lineTaxes ?? []) {
    let byKind = byLine.get(row.lineId);
    if (!byKind) {
      byKind = new Map();
      byLine.set(row.lineId, byKind);
    }
    byKind.set(row.kind, row);
  }
  return byLine;
}

export function taxAmountForKind(
  byKind: Map<string, LineTaxDto> | undefined,
  taxKind: string,
): string | null {
  const amount = byKind?.get(taxKind)?.taxAmount;
  if (amount == null || String(amount).trim() === '') return null;
  return String(amount);
}

export function lineNetFromTaxes(
  byKind: Map<string, LineTaxDto> | undefined,
  fallbackNet?: string | null,
): string | null {
  if (byKind) {
    for (const row of byKind.values()) {
      if (row.netAmount != null && String(row.netAmount).trim() !== '') {
        return String(row.netAmount);
      }
    }
  }
  if (fallbackNet != null && String(fallbackNet).trim() !== '') return String(fallbackNet);
  return null;
}

/**
 * Gross = net + Σ tax amounts for amount defs.
 * Prefer calculate grossAmount when present and there is at most one kind on the line.
 */
export function lineGrossDisplay(opts: {
  byKind: Map<string, LineTaxDto> | undefined;
  amountDefs: CountryTaxLineAmountDef[];
  net: string | null;
}): string | null {
  const amounts: string[] = [];
  for (const def of opts.amountDefs) {
    const a = taxAmountForKind(opts.byKind, def.taxKind);
    if (a != null) amounts.push(a);
  }
  if (opts.byKind && opts.byKind.size <= 1) {
    for (const row of opts.byKind.values()) {
      if (row.grossAmount != null && String(row.grossAmount).trim() !== '') {
        return String(row.grossAmount);
      }
    }
  }
  if (opts.net == null || String(opts.net).trim() === '') {
    return amounts.length === 1 ? amounts[0]! : null;
  }
  if (amounts.length === 0) return opts.net;
  let sum = Number(String(opts.net).replace(',', '.'));
  if (Number.isNaN(sum)) return opts.net;
  for (const a of amounts) {
    const n = Number(String(a).replace(',', '.'));
    if (!Number.isNaN(n)) sum += n;
  }
  return sum.toFixed(2);
}

export function documentTaxAmountForKind(
  taxResult: CalculateTaxesResult | null | undefined,
  taxKind: string,
): string | null {
  const fromSummary = taxResult?.taxSummary?.find((s) => s.kind === taxKind)?.taxAmount;
  if (fromSummary != null && String(fromSummary).trim() !== '') return String(fromSummary);
  let sum = 0;
  let found = false;
  for (const line of taxResult?.lineTaxes ?? []) {
    if (line.kind !== taxKind) continue;
    const n = Number(String(line.taxAmount).replace(',', '.'));
    if (!Number.isNaN(n)) {
      sum += n;
      found = true;
    }
  }
  return found ? sum.toFixed(2) : null;
}

export function getCountryTaxProfileSchemaUrl(tenantId: string, countryCode: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/taxes/countries/${encodeURIComponent(countryCode)}/profile-schema`;
}

export function getTaxesCalculateUrl(tenantId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/taxes/calculate`;
}

export async function fetchCountryTaxProfileSchema(
  tenantId: string,
  countryCode: string,
): Promise<CountryTaxProfileSchema | null> {
  const code = countryCode.trim().toUpperCase();
  if (!tenantId || code.length !== 2) return null;
  try {
    const { json } = await timciFetch(getCountryTaxProfileSchemaUrl(tenantId, code));
    return json as CountryTaxProfileSchema;
  } catch {
    return null;
  }
}

export async function calculateTaxes(
  tenantId: string,
  query: CalculateTaxesQuery,
): Promise<CalculateTaxesResult | null> {
  if (!tenantId) return null;
  try {
    const { json } = await timciFetch(getTaxesCalculateUrl(tenantId), {
      method: 'POST',
      body: JSON.stringify(query),
    });
    return json as CalculateTaxesResult;
  } catch {
    return null;
  }
}

export function filterAttributeDefsForRole(
  defs: CountryTaxAttributeDef[] | undefined,
  role: 'issuer' | 'recipient',
): CountryTaxAttributeDef[] {
  if (!defs?.length) return [];
  return defs.filter((d) => d.appliesTo === role || d.appliesTo === 'both');
}

/** Ant Design Form name paths for `taxProfile.<attributeKey>` fields of a role. */
export function taxProfileFormNamePaths(
  schema: CountryTaxProfileSchema | null | undefined,
  role: 'issuer' | 'recipient',
  namePrefix: string | (string | number)[] = 'taxProfile',
): Array<(string | number)[]> {
  const defs = filterAttributeDefsForRole(schema?.attributeDefs, role);
  return defs.map((def) => {
    if (typeof namePrefix === 'string') return [namePrefix, def.attributeKey];
    return [...namePrefix, def.attributeKey];
  });
}

export function normalizeTaxProfile(
  raw: unknown,
): Record<string, string> | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value == null) continue;
    const s = String(value).trim();
    if (s !== '') out[key] = s;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
