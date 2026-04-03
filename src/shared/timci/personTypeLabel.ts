/** Muestra etiqueta legible para `physical_person` / `legal_person` (API AR). */
export function timciPersonTypeLabel(translate: (key: string) => string, value: unknown): string {
  const k = typeof value === 'string' ? value : '';
  if (k === 'physical_person') return translate('table.personTypeLabels.physical_person');
  if (k === 'legal_person') return translate('table.personTypeLabels.legal_person');
  return k || '—';
}

/** Etiqueta para `applies_to` de tipos de documento (`physical_person` / `legal_person` / `both`). */
export function timciDocumentAppliesToLabel(translate: (key: string) => string, value: unknown): string {
  const k = typeof value === 'string' ? value : '';
  if (k === 'physical_person') return translate('create.documentType.physical');
  if (k === 'legal_person') return translate('create.documentType.legal');
  if (k === 'both') return translate('create.documentType.both');
  return k || '—';
}
