import type { HttpError } from '@refinedev/core';
import { buildTimciHttpErrorUserMessage } from './i18n/apiErrorTranslations.js';

function parseApiMessage(json: unknown, fallback: string): string {
  return buildTimciHttpErrorUserMessage(json, fallback);
}

export type TimciHttpResult = {
  json: unknown;
  headers: Headers;
  status: number;
};

/**
 * Fetch against Timci API: session cookie + X-Use-Session (same as timci-admin).
 */
export async function timciFetch(url: string, init: RequestInit = {}): Promise<TimciHttpResult> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Use-Session', 'true');
  if (init.body != null && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const fallback = res.status === 400 ? 'Validation error' : `HTTP ${res.status}`;
    const message = parseApiMessage(json, fallback);
    const err = new Error(message);
    const httpErr = err as unknown as HttpError;
    httpErr.statusCode = res.status;
    httpErr.errors = json as HttpError['errors'];
    throw httpErr;
  }

  return { json, headers: res.headers, status: res.status };
}

export function toHttpError(status: number, message: string): HttpError {
  return { message, statusCode: status };
}
