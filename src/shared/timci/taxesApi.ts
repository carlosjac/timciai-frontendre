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

export type CountryTaxProfileSchema = {
  countryCode: string;
  attributeDefs: CountryTaxAttributeDef[];
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
