/** Canonical IANA ids always merged in (covers older browsers + ensures key cities). */
const FALLBACK_ZONES = [
  'UTC',
  'Europe/Madrid',
  'Europe/London',
  'America/Mexico_City',
  'America/New_York',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  /** Argentina (canonical; `America/Buenos_Aires` is deprecated and often absent from Intl lists). */
  'America/Argentina/Buenos_Aires',
  'America/Sao_Paulo',
];

export type TimeZoneOption = { label: string; value: string };

function readIntlTimeZones(): string[] {
  try {
    const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
      .supportedValuesOf;
    if (typeof supportedValuesOf !== 'function') return [];
    return supportedValuesOf.call(Intl, 'timeZone');
  } catch {
    return [];
  }
}

/**
 * Match user typing "Buenos Aires" against IANA `America/Argentina/Buenos_Aires`
 * (underscores vs spaces).
 */
export function timeZoneOptionMatchesQuery(optionLabel: string, rawInput: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/_/g, ' ').trim();
  const hay = norm(optionLabel);
  const needle = norm(rawInput);
  if (!needle) return true;
  return hay.includes(needle);
}

export function getTimeZoneSelectOptions(): TimeZoneOption[] {
  const intl = readIntlTimeZones();
  const zones =
    intl.length > 0 ? [...new Set([...FALLBACK_ZONES, ...intl])] : [...new Set(FALLBACK_ZONES)];

  return zones
    .map((z) => ({ value: z, label: z }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
