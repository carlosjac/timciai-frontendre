import type { FormInstance } from 'antd';
import { useCallback, useState } from 'react';
import {
  normalizeValidationMessage,
  translateTimciApiErrorMessage,
} from '../i18n/apiErrorTranslations.js';
import {
  parseTimciHttpError,
  timciErrorSourceToFieldName,
  type TimciApiErrorItem,
} from './timciApiErrorParsing.js';

export type UseTimciFormServerErrorsOptions = {
  /**
   * Nombres de `Form.Item` que pueden mostrar error del API.
   * Si un `source` mapea a un nombre que no está aquí, el mensaje va al bloque general.
   * Si se omite, cualquier `source` mapeado se aplica al formulario (riesgo si el nombre no existe).
   *
   * Conviene pasar una referencia estable (p. ej. constante de módulo) para no recrear callbacks en cada render.
   */
  formFieldNames?: readonly string[];
};

function dedupeMessages(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function partitionApiErrors(
  items: TimciApiErrorItem[],
  allowedFields: Set<string>,
): { fieldEntries: { name: string; errors: string[] }[]; general: string[] } {
  const byField = new Map<string, string[]>();
  const general: string[] = [];

  for (const item of items) {
    const msg = translateTimciApiErrorMessage(item.code, item.message || '');
    const mapped = timciErrorSourceToFieldName(item.source);

    if (mapped && (allowedFields.size === 0 || allowedFields.has(mapped))) {
      const arr = byField.get(mapped) ?? [];
      arr.push(msg);
      byField.set(mapped, arr);
    } else {
      general.push(msg);
    }
  }

  const fieldEntries = [...byField.entries()].map(([name, errs]) => ({
    name,
    errors: [dedupeMessages(errs).join(' · ')],
  }));

  return { fieldEntries, general: dedupeMessages(general) };
}

const NO_FIELDS: readonly string[] = [];

export function useTimciFormServerErrors(options: UseTimciFormServerErrorsOptions = {}) {
  const names = options.formFieldNames ?? NO_FIELDS;

  const [generalMessages, setGeneralMessages] = useState<string[]>([]);

  const clearServerErrors = useCallback(
    (form: FormInstance) => {
      setGeneralMessages([]);
      if (names.length > 0) {
        form.setFields(
          names.map((name) => ({
            name,
            errors: [],
          })),
        );
      }
    },
    [names],
  );

  const applyServerError = useCallback(
    (form: FormInstance, caught: unknown) => {
      const allowed = new Set(names);
      const parsed = parseTimciHttpError(caught);
      const { fieldEntries, general } = partitionApiErrors(
        parsed.items,
        allowed,
      );

      const generalOut: string[] = [...general];

      if (parsed.items.length === 0) {
        if (parsed.topLevelMessage) {
          generalOut.push(normalizeValidationMessage(parsed.topLevelMessage));
        } else {
          generalOut.push(parsed.fallbackMessage);
        }
      } else if (
        parsed.topLevelMessage &&
        !generalOut.includes(normalizeValidationMessage(parsed.topLevelMessage))
      ) {
        generalOut.unshift(normalizeValidationMessage(parsed.topLevelMessage));
      }

      if (fieldEntries.length > 0) {
        form.setFields(fieldEntries);
      }

      setGeneralMessages(dedupeMessages(generalOut));
    },
    [names],
  );

  return {
    generalMessages,
    clearServerErrors,
    applyServerError,
  };
}
