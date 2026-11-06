import type { useTranslate } from '@refinedev/core';
import {
  validateNormalizedRelativeBandsParams,
  type RelativeBandsSubmitIssue,
} from './monetaryPolicyParamsForm.js';

type Translate = ReturnType<typeof useTranslate>;

export function formatRelativeBandsSubmitIssues(
  issues: RelativeBandsSubmitIssue[],
  translate: Translate,
): string[] {
  const t = (key: string) => translate(`pages.monetaryPolicies.params.${key}`);
  return issues.map((err) => {
    if (err.code === 'bandsRequired') return t('bandsRequired');
    if (err.code === 'openFromRequired') return t('coverageOpenFrom');
    if (err.code === 'openToRequired') return t('coverageOpenTo');
    if (err.code === 'rateRequired') {
      return translate('pages.monetaryPolicies.params.rateRequired', {
        n: String(err.band),
      });
    }
    return translate('pages.monetaryPolicies.params.coverageOverlapOrGap', {
      a: String(err.a ?? ''),
      b: String(err.b ?? ''),
    });
  });
}

/** Returns Spanish messages when normalized relative_bands params are incomplete. */
export function relativeBandsSubmitErrorMessages(
  kind: string,
  normalizedParams: Record<string, unknown> | undefined,
  translate: Translate,
): string[] {
  if (!kind || kind === 'none') return [];
  const issues = validateNormalizedRelativeBandsParams(normalizedParams);
  return formatRelativeBandsSubmitIssues(issues, translate);
}
