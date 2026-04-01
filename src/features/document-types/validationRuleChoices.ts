/**
 * Mismas claves que `frontend/.../DocumentTypeCreate.tsx` (VALIDATION_RULE_CHOICES)
 * y reglas en `backend/.../document-number-validation/validation-rules.ts`.
 *
 * Convención de claves: `{iso2}_…` (p. ej. `ar_dni` para país ISO `AR`), alineada con RULES en el backend.
 */
export const DOCUMENT_TYPE_VALIDATION_RULE_OPTIONS: { value: string; label: string }[] = [
  { value: 'ar_dni', label: 'Argentina - DNI' },
  { value: 'ar_le', label: 'Argentina - Libreta de Enrolamiento' },
  { value: 'ar_lc', label: 'Argentina - Libreta Cívica' },
  { value: 'ar_pasaporte', label: 'Argentina - Pasaporte' },
  { value: 'ar_cuil', label: 'Argentina - CUIL' },
  { value: 'ar_cuit', label: 'Argentina - CUIT' },
];

/** Opciones de regla aplicables al país según su código ISO (lista de países del tenant). */
export function documentTypeValidationRulesForCountryIso(
  isoCode: string | null | undefined,
): { value: string; label: string }[] {
  const iso = (isoCode ?? '').trim().toUpperCase();
  if (!iso) return [];
  const prefix = `${iso.toLowerCase()}_`;
  return DOCUMENT_TYPE_VALIDATION_RULE_OPTIONS.filter((o) => o.value.startsWith(prefix));
}
