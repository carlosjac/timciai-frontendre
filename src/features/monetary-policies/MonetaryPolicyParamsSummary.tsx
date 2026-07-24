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

function formatApiBound(value: unknown, unitLabel: string, translate: TranslateFn): string {
  if (value === 'eom') return translate('pages.monetaryPolicies.params.boundMode.eom');
  if (value === 'start_next_month') {
    return translate('pages.monetaryPolicies.params.boundMode.start_next_month');
  }
  if (value == null || value === '') {
    return translate('pages.monetaryPolicies.params.openEnded');
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return translate('pages.monetaryPolicies.params.openEnded');

  return `${n} ${unitLabel}`;
}

export type MonetaryPolicySummaryContent = {
  anchorLine: string;
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

  const anchorLabel =
    p.anchor === 'document_date'
      ? translate('pages.monetaryPolicies.anchor.document_date')
      : p.anchor === 'due_date'
        ? translate('pages.monetaryPolicies.anchor.due_date')
        : null;
  if (!anchorLabel) return null;

  const unit = bands[0]?.unit === 'months' ? 'months' : 'days';
  const unitLabel =
    unit === 'months'
      ? translate('pages.monetaryPolicies.unit.months')
      : translate('pages.monetaryPolicies.unit.days');

  const bandLines = bands.map((b, i) => {
    const from = formatApiBound(b?.from, unitLabel, translate);
    const to = formatApiBound(b?.to, unitLabel, translate);
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

  return {
    anchorLine: translate('pages.monetaryPolicies.summaryAnchor', { anchor: anchorLabel }),
    bandLines,
  };
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
      <div>{content.anchorLine}</div>
      <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
        {content.bandLines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
