type BoundMode = 'number' | 'eom' | 'start_next_month' | 'open';
const BOUND_SYMBOLS = ['eom', 'start_next_month'] as const;
type BoundSymbol = (typeof BOUND_SYMBOLS)[number];

function isBoundSymbol(value: unknown): value is BoundSymbol {
  return typeof value === 'string' && (BOUND_SYMBOLS as readonly string[]).includes(value);
}

export { isBoundSymbol };

/** API bound value → UI (mode + numeric value). */
export function boundToMode(value: unknown): { mode: BoundMode; value: number | null } {
  if (value == null) return { mode: 'open', value: null };
  if (isBoundSymbol(value)) return { mode: value, value: null };
  const n = Number(value);

  return { mode: 'number', value: Number.isFinite(n) ? n : null };
}

/** UI (mode + numeric value) → API bound value. */
export function modeToBound(mode: unknown, value: unknown): number | BoundSymbol | null {
  if (mode === 'eom' || mode === 'start_next_month') return mode;
  if (mode === 'open') return null;
  if (value == null || value === '') return null;
  const n = Number(value);

  return Number.isFinite(n) ? n : null;
}

function fractionToPercent(rate: unknown): number | undefined {
  if (rate == null || rate === '') return undefined;
  const n = Number(rate);
  if (!Number.isFinite(n)) return undefined;

  return Math.round(n * 10000) / 100; // 0.001 → 0.1
}

function percentToFraction(percent: unknown): string | undefined {
  if (percent == null || percent === '') return undefined;
  const n = Number(percent);
  if (!Number.isFinite(n)) return undefined;

  return String(n / 100);
}

/** Convert API params (fractions) into form values (percent + UI helpers). */
export function hydrateMonetaryPolicyParamsForForm(
  kind: string,
  params: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!kind || kind === 'none' || !params) return {};
  const bandsRaw = Array.isArray(params.bands) ? params.bands : [];
  const unit =
    bandsRaw.length > 0 &&
    typeof bandsRaw[0] === 'object' &&
    bandsRaw[0] != null &&
    (bandsRaw[0] as { unit?: string }).unit === 'months'
      ? 'months'
      : 'days';

  return {
    anchor: params.anchor ?? 'due_date',
    unit,
    bands: bandsRaw.map((band) => {
      if (!band || typeof band !== 'object') return band;
      const b = band as Record<string, unknown>;
      const from = boundToMode(b.from);
      const to = boundToMode(b.to);

      return {
        fromMode: from.mode,
        fromValue: from.value,
        toMode: to.mode,
        toValue: to.value,
        effect: b.effect ?? 'discount',
        chargeMode: b.chargeMode ?? 'flat_percent',
        ratePercent: fractionToPercent(b.rate),
      };
    }),
  };
}

/** Normalize form values before API submit. */
export function normalizeMonetaryPolicyParams(
  kind: string,
  params: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!kind || kind === 'none') return {};
  const p = params && typeof params === 'object' ? { ...params } : {};
  const unit = p.unit === 'months' ? 'months' : 'days';
  const anchor = p.anchor === 'document_date' ? 'document_date' : 'due_date';
  const bandsRaw = Array.isArray(p.bands) ? p.bands : [];

  const bands = bandsRaw.map((band) => {
    if (!band || typeof band !== 'object') return band;
    const b = band as Record<string, unknown>;
    const effect = b.effect === 'surcharge' || b.effect === 'none' ? b.effect : 'discount';
    let chargeMode =
      b.chargeMode === 'daily_rate' ? 'daily_rate' : ('flat_percent' as const);
    if (unit === 'months') chargeMode = 'flat_percent';

    let from = modeToBound(b.fromMode, b.fromValue);
    let to = modeToBound(b.toMode, b.toValue);
    if (unit === 'months') {
      if (typeof from !== 'number') from = null;
      if (typeof to !== 'number') to = null;
    }

    const out: Record<string, unknown> = {
      from,
      to,
      unit,
      effect,
      chargeMode,
    };
    if (effect !== 'none') {
      out.rate = percentToFraction(b.ratePercent);
    }

    return out;
  });

  return { anchor, bands };
}
