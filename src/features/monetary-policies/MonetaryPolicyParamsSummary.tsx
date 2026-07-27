type TranslateFn = (key: string, params?: Record<string, string>) => string;

type ApiBand = {
  from?: unknown;
  to?: unknown;
  unit?: string;
  effect?: string;
  chargeMode?: string;
  rate?: string | number;
};

type RelativeBandsParams = {
  anchor?: string;
  bands?: ApiBand[];
};

function fractionToPercentDisplay(rate: unknown): string {
  if (rate == null || rate === '') return '…';
  const n = Number(rate);
  if (!Number.isFinite(n)) return '…';

  return String(Math.round(n * 10000) / 100);
}

function formatApiBound(
  value: unknown,
  unitKey: 'days' | 'months',
  anchorKey: 'due_date' | 'document_date',
  translate: TranslateFn,
): string {
  const anchorFragment = translate(
    `pages.monetaryPolicies.params.boundMode.numberAnchor.${anchorKey}`,
  );
  if (value === 'eom') {
    return translate('pages.monetaryPolicies.summaryBoundEom', { anchor: anchorFragment });
  }
  if (value === 'start_next_month') {
    return translate('pages.monetaryPolicies.summaryBoundStartNextMonth', {
      anchor: anchorFragment,
    });
  }
  if (value == null || value === '') {
    return translate('pages.monetaryPolicies.params.openEnded');
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return translate('pages.monetaryPolicies.params.openEnded');

  const unitFragment = translate(
    `pages.monetaryPolicies.params.boundMode.numberUnit.${unitKey}`,
  );

  return translate('pages.monetaryPolicies.summaryBoundNumber', {
    n: String(n),
    unit: unitFragment,
    anchor: anchorFragment,
  });
}

export type MonetaryPolicySummaryContent = {
  bandLines: string[];
};

/** Build human-readable lines from API `relative_bands` params. */
export function formatRelativeBandsSummary(
  params: Record<string, unknown> | undefined | null,
  translate: TranslateFn,
): MonetaryPolicySummaryContent | null {
  if (!params || typeof params !== 'object') return null;
  const p = params as RelativeBandsParams;
  const bands = Array.isArray(p.bands) ? p.bands : [];
  if (bands.length === 0) return null;

  const anchorKey = p.anchor === 'document_date' ? 'document_date' : 'due_date';
  if (p.anchor !== 'document_date' && p.anchor !== 'due_date') return null;

  const unitKey = bands[0]?.unit === 'months' ? 'months' : 'days';

  const bandLines = bands.map((b, i) => {
    const from = formatApiBound(b?.from, unitKey, anchorKey, translate);
    const to = formatApiBound(b?.to, unitKey, anchorKey, translate);
    if (b?.effect === 'none') {
      return translate('pages.monetaryPolicies.summaryBandNone', {
        n: String(i + 1),
        from,
        to,
      });
    }
    const effect = translate(
      `pages.monetaryPolicies.params.effect.${b?.effect === 'surcharge' ? 'surcharge' : 'discount'}`,
    );
    const mode =
      b?.chargeMode === 'daily_rate'
        ? translate('pages.monetaryPolicies.params.chargeModeOptions.daily_rate')
        : translate('pages.monetaryPolicies.params.chargeModeOptions.flat_percent');

    return translate('pages.monetaryPolicies.summaryBand', {
      n: String(i + 1),
      from,
      to,
      effect,
      mode,
      rate: fractionToPercentDisplay(b?.rate),
    });
  });

  return { bandLines };
}

function shortBoundToken(
  value: unknown,
  unitAbbrev: string,
  translate: TranslateFn,
): string | null {
  if (value === 'eom') return translate('pages.monetaryPolicies.shortName.boundEom');
  if (value === 'start_next_month') {
    return translate('pages.monetaryPolicies.shortName.boundStartNext');
  }
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;

  return `${n}${unitAbbrev}`;
}

function isOpenOrZero(value: unknown): boolean {
  if (value == null || value === '') return true;
  const n = Number(value);

  return Number.isFinite(n) && n === 0;
}

function shortRange(
  from: unknown,
  to: unknown,
  unitAbbrev: string,
  translate: TranslateFn,
): string {
  if (from === 'start_next_month') {
    return translate('pages.monetaryPolicies.shortName.rangeStartNext');
  }

  const fromTok = shortBoundToken(from, unitAbbrev, translate);
  const toTok = shortBoundToken(to, unitAbbrev, translate);

  if (isOpenOrZero(from) && toTok != null) {
    return translate('pages.monetaryPolicies.shortName.rangeHasta', { to: toTok });
  }
  if (fromTok != null && (to == null || to === '')) {
    return translate('pages.monetaryPolicies.shortName.rangeFrom', { from: fromTok });
  }
  if (fromTok != null && toTok != null) {
    return translate('pages.monetaryPolicies.shortName.rangeBoth', {
      from: fromTok,
      to: toTok,
    });
  }

  return '';
}

function shortEffectLabel(band: ApiBand, translate: TranslateFn): string {
  const rate = fractionToPercentDisplay(band.rate);
  const daily = band.chargeMode === 'daily_rate';
  if (band.effect === 'none') return translate('pages.monetaryPolicies.shortName.none');
  if (band.effect === 'surcharge') {
    return translate(
      daily
        ? 'pages.monetaryPolicies.shortName.dailySurcharge'
        : 'pages.monetaryPolicies.shortName.surcharge',
      { rate },
    );
  }

  return translate(
    daily
      ? 'pages.monetaryPolicies.shortName.dailyDiscount'
      : 'pages.monetaryPolicies.shortName.discount',
    { rate },
  );
}

/**
 * Compact one-line name for selects / forms (e.g. sales), derived from relative_bands.
 * Example: `Fecha de emisión - hasta 4d: -10%, 5d-9d: neutro, 10d-fin de mes: +10%, a partir de mes siguiente: +20%`
 */
export function formatRelativeBandsShortName(
  params: Record<string, unknown> | undefined | null,
  translate: TranslateFn,
): string | null {
  if (!params || typeof params !== 'object') return null;
  const p = params as RelativeBandsParams;
  const bands = Array.isArray(p.bands) ? p.bands : [];
  if (bands.length === 0) return null;
  if (p.anchor !== 'document_date' && p.anchor !== 'due_date') return null;

  const unitKey = bands[0]?.unit === 'months' ? 'months' : 'days';
  const unitAbbrev = translate(
    unitKey === 'months'
      ? 'pages.monetaryPolicies.shortName.unitMonths'
      : 'pages.monetaryPolicies.shortName.unitDays',
  );
  const sep = translate('pages.monetaryPolicies.shortName.sep');
  const prefix = translate(
    p.anchor === 'document_date'
      ? 'pages.monetaryPolicies.shortName.prefixDocument'
      : 'pages.monetaryPolicies.shortName.prefixDue',
  );

  const parts = bands.map((b) => {
    const effect = shortEffectLabel(b ?? {}, translate);
    const range = shortRange(b?.from, b?.to, unitAbbrev, translate);
    if (!range) return translate('pages.monetaryPolicies.shortName.bandNoRange', { effect });

    return translate('pages.monetaryPolicies.shortName.band', { range, effect });
  });

  return translate('pages.monetaryPolicies.shortName.header', {
    prefix,
    bands: parts.join(sep),
  });
}

type Props = {
  params?: Record<string, unknown> | null;
  kind?: string;
  translate: TranslateFn;
};

/** Read-only human-readable view of monetary policy params (for show / read-only). */
export function MonetaryPolicyParamsSummary({ params, kind, translate }: Props) {
  if (kind === 'none') return <>{translate('pages.monetaryPolicies.kindLabels.none')}</>;

  const content = formatRelativeBandsSummary(params, translate);
  if (!content) return <>—</>;

  return (
    <div>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {content.bandLines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
