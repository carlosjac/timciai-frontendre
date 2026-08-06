import {
  formatRelativeBandsSummary,
} from './monetaryPolicySummaryFormat.js';

type TranslateFn = (key: string, params?: Record<string, string>) => string;

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
