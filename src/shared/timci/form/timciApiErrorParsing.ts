import type { HttpError } from '@refinedev/core';

export type TimciApiErrorItem = {
  message: string;
  source?: string;
  code?: string;
};

type ErrorBody = {
  errors?: unknown;
  message?: string;
};

function asErrorBody(errorsField: unknown): ErrorBody | null {
  if (errorsField != null && typeof errorsField === 'object') {
    return errorsField as ErrorBody;
  }
  return null;
}

function normalizeItem(raw: unknown): TimciApiErrorItem | null {
  if (raw == null || typeof raw !== 'object' || !('message' in raw)) return null;
  const o = raw as Record<string, unknown>;
  return {
    message: String(o.message ?? '').trim() || 'Error',
    source: typeof o.source === 'string' ? o.source : undefined,
    code: typeof o.code === 'string' ? o.code : undefined,
  };
}

/**
 * Convierte `source` del API (p. ej. `body/currentPassword`, `entity.name`) al `name` del campo en Ant Form.
 * `*` o vacío → no hay campo asociado (solo bloque general).
 */
export function timciErrorSourceToFieldName(source: string | undefined | null): string | null {
  if (source == null) return null;
  const s = String(source).trim();
  if (s === '' || s === '*') return null;
  if (s.includes('/')) {
    const seg = s.split('/').filter(Boolean);
    return seg.length ? seg[seg.length - 1]! : null;
  }
  if (s.includes('.')) {
    const seg = s.split('.').filter(Boolean);
    return seg.length ? seg[seg.length - 1]! : null;
  }
  return s;
}

export type ParsedTimciHttpError = {
  items: TimciApiErrorItem[];
  topLevelMessage?: string;
  fallbackMessage: string;
};

/**
 * Extrae la lista de errores del cuerpo que `timciFetch` guarda en `HttpError.errors` (JSON completo de la respuesta).
 */
export function parseTimciHttpError(error: unknown): ParsedTimciHttpError {
  const fallbackMessage =
    error instanceof Error && error.message ? error.message : 'Error';

  if (error == null || typeof error !== 'object') {
    return { items: [], fallbackMessage };
  }

  const httpErr = error as HttpError;
  const body = asErrorBody(httpErr.errors);
  const rawList = body?.errors;

  const items: TimciApiErrorItem[] = [];
  if (Array.isArray(rawList)) {
    for (const r of rawList) {
      const n = normalizeItem(r);
      if (n) items.push(n);
    }
  }

  const topLevelMessage =
    body?.message != null && String(body.message).trim() !== ''
      ? String(body.message).trim()
      : undefined;

  return { items, topLevelMessage, fallbackMessage };
}
