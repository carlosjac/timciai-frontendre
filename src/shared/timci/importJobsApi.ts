import { getV1Base } from '../../config.js';
import { requireTimciPathSegment } from './pathSegment.js';
import { timciFetch, toHttpError } from './http.js';
import { buildTimciHttpErrorUserMessage } from './i18n/apiErrorTranslations.js';
import type { TimciAuditUserRef } from './auditUserRef.js';

export type TimciImportJobStatus = 'queued' | 'running' | 'completed' | 'failed';
export type TimciImportRowStatus = 'created' | 'skipped' | 'failed';

export type TimciImportJob = {
  id: string;
  resource: string;
  status: TimciImportJobStatus;
  options: Record<string, unknown>;
  fileSize: number;
  createdCount: number;
  skippedCount: number;
  failedCount: number;
  processedCount: number;
  batchError: string | null;
  createdBy: TimciAuditUserRef;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type TimciImportRowError = {
  column: string;
  code: string;
  message: string;
};

export type TimciImportJobRow = {
  jobId: string;
  rowNumber: number;
  status: TimciImportRowStatus;
  documentKey: string | null;
  resourceId: string | null;
  label: string | null;
  errors: TimciImportRowError[] | null;
};

function importJobsUrl(tenantId: string): string {
  return `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/import-jobs`;
}

export async function listTimciImportJobs(
  tenantId: string,
  resource: string,
  skip: number,
  take: number,
): Promise<{ data: TimciImportJob[]; total: number }> {
  const qs = new URLSearchParams({
    resource,
    skip: String(skip),
    take: String(take),
  });
  const { json, headers } = await timciFetch(`${importJobsUrl(tenantId)}?${qs.toString()}`);
  const data = Array.isArray(json) ? (json as TimciImportJob[]) : [];
  const range = headers.get('Content-Range');
  const totalMatch = range?.match(/\/(\d+)\s*$/);
  const total = totalMatch ? Number.parseInt(totalMatch[1], 10) : data.length;
  return { data, total };
}

export async function getTimciImportJob(tenantId: string, jobId: string): Promise<TimciImportJob> {
  const { json } = await timciFetch(
    `${importJobsUrl(tenantId)}/${requireTimciPathSegment(jobId)}`,
  );
  return json as TimciImportJob;
}

export async function listTimciImportJobRows(
  tenantId: string,
  jobId: string,
  opts: { status?: TimciImportRowStatus; skip: number; take: number },
): Promise<{ data: TimciImportJobRow[]; total: number }> {
  const qs = new URLSearchParams({
    skip: String(opts.skip),
    take: String(opts.take),
  });
  if (opts.status) qs.set('status', opts.status);
  const { json } = await timciFetch(
    `${importJobsUrl(tenantId)}/${requireTimciPathSegment(jobId)}/rows?${qs.toString()}`,
  );
  const body = json as { data?: TimciImportJobRow[]; total?: number };
  return { data: body.data ?? [], total: body.total ?? 0 };
}

export async function enqueueCustomerImport(
  tenantId: string,
  file: File,
  openingDate?: string,
): Promise<{ jobId: string }> {
  const body = new FormData();
  body.append('file', file);
  if (openingDate) body.append('openingDate', openingDate);
  const { json } = await timciFetch(
    `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/customers/import`,
    { method: 'POST', body },
  );
  return json as { jobId: string };
}

export async function downloadCustomerImportTemplate(tenantId: string): Promise<void> {
  const res = await fetch(
    `${getV1Base()}/tenants/${requireTimciPathSegment(tenantId)}/customers/import-template`,
    {
      credentials: 'include',
      headers: { Accept: '*/*', 'X-Use-Session': 'true' },
    },
  );
  if (!res.ok) {
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? (JSON.parse(text) as unknown) : null;
    } catch {
      json = null;
    }
    throw toHttpError(res.status, buildTimciHttpErrorUserMessage(json, `HTTP ${res.status}`));
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla-clientes.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
