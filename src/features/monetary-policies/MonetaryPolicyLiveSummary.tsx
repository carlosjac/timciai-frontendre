import { useTranslate } from '@refinedev/core';
import { Alert, Form } from 'antd';
import { formatRelativeBandsSummary } from './MonetaryPolicyParamsSummary.js';

type BandForm = {
  fromMode?: string;
  fromValue?: number | null;
  toMode?: string;
  toValue?: number | null;
  effect?: string;
  chargeMode?: string;
  ratePercent?: number;
};

function formBoundToApi(mode: string | undefined, value: number | null | undefined): unknown {
  if (mode === 'eom' || mode === 'start_next_month') return mode;
  if (mode === 'number' && value != null && (value as unknown) !== '') return Number(value);

  return null;
}

/** Convert live form values to API-shaped params for the shared formatter. */
function formParamsToApi(
  anchor: string | undefined,
  unit: string | undefined,
  bands: BandForm[] | undefined,
): Record<string, unknown> | null {
  if (!anchor || !unit || !bands?.length) return null;

  return {
    anchor,
    bands: bands.map((b) => ({
      from: formBoundToApi(b.fromMode, b.fromValue),
      to: formBoundToApi(b.toMode, b.toValue),
      unit,
      effect: b.effect ?? 'discount',
      chargeMode: b.chargeMode ?? 'flat_percent',
      rate:
        b.effect === 'none' || b.ratePercent == null
          ? undefined
          : String(Number(b.ratePercent) / 100),
    })),
  };
}

/**
 * Live Spanish summary of relative_bands form values.
 */
export function MonetaryPolicyLiveSummary() {
  const translate = useTranslate();
  const form = Form.useFormInstance();
  const anchor = Form.useWatch(['params', 'anchor'], form) as string | undefined;
  const unit = Form.useWatch(['params', 'unit'], form) as string | undefined;
  const bands = Form.useWatch(['params', 'bands'], form) as BandForm[] | undefined;

  const apiParams = formParamsToApi(anchor, unit, bands);
  const content = formatRelativeBandsSummary(apiParams, translate);

  if (!content) {
    return (
      <Alert
        type="info"
        showIcon
        style={{ marginTop: 16 }}
        message={translate('pages.monetaryPolicies.summaryIncomplete')}
      />
    );
  }

  return (
    <Alert
      type="success"
      showIcon
      style={{ marginTop: 16 }}
      message={translate('pages.monetaryPolicies.summaryTitle')}
      description={
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {content.bandLines.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      }
    />
  );
}
