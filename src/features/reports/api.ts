import { getV1Base } from '../../config.js';
import { timciFetch } from '../../shared/timci/http.js';

export const REPORT_KEYS = [
  'aging',
  'invoiced',
  'collected',
  'tax',
  'period',
  'allocations',
  'unallocated',
  'adjustments',
  'portfolio',
  'management',
] as const;

export type ReportKey = (typeof REPORT_KEYS)[number];

export function isReportKey(value: string | undefined): value is ReportKey {
  return REPORT_KEYS.includes(value as ReportKey);
}

export interface ReportCurrency {
  id: string;
  code: string;
  name: string;
}

export interface ReportTotal {
  currencyCode: string;
  key: string;
  amount: string;
}

export interface EntityReport {
  report: ReportKey;
  from: string;
  to: string;
  asOf: string;
  currencyId: string | null;
  currencies: ReportCurrency[];
  rows: Record<string, unknown>[];
  sections: Record<string, Record<string, unknown>[]>;
  totals: ReportTotal[];
}

export interface ReportQuery {
  tenantId: string;
  report: ReportKey;
  from: string;
  to: string;
  currencyId?: string;
  bucket?: string;
}

function reportPath(query: ReportQuery, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ from: query.from, to: query.to });
  if (query.currencyId) params.set('currencyId', query.currencyId);
  if (query.bucket) params.set('bucket', query.bucket);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) params.set(key, value);
  }

  return `${getV1Base()}/tenants/${encodeURIComponent(query.tenantId)}/reports/${query.report}?${params.toString()}`;
}

export async function fetchEntityReport(query: ReportQuery): Promise<EntityReport> {
  const { json } = await timciFetch(reportPath(query));

  return json as EntityReport;
}

export async function downloadEntityReport(query: ReportQuery, dateFormat: string): Promise<void> {
  const headers = new Headers();
  headers.set('X-Use-Session', 'true');
  const response = await fetch(reportPath(query, { format: 'xlsx', dateFormat }), {
    credentials: 'include',
    headers,
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // The body is not JSON when the gateway returns an empty error.
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `informe-${query.report}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

export function periodRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  const iso = (value: Date) => value.toISOString().slice(0, 10);

  return { from: iso(from), to: iso(to) };
}
